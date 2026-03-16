import { evaluateHeuristic } from './heuristics'
import type {
  AlgorithmType,
  HeuristicType,
  Move,
  PuzzleState,
  SearchMetrics,
  SearchNode,
  SearchResult,
  Side,
  Transportable,
} from '../types/puzzle'

const START_STATE: PuzzleState = {
  farmer: 'L',
  wolf: 'L',
  goat: 'L',
  cabbage: 'L',
}

const ITEMS: Transportable[] = ['wolf', 'goat', 'cabbage']

interface SearchContext {
  algorithm: AlgorithmType
  heuristic: HeuristicType | null
  nodes: SearchNode[]
  expansionOrder: string[]
  nextNodeId: number
  generated: number
  expanded: number
  maxFrontier: number
  bestCostByState: Map<string, number>
}

const createStateKey = (state: PuzzleState): string => {
  return `${state.farmer}${state.wolf}${state.goat}${state.cabbage}`
}

export const parseStateKey = (stateKey: string): PuzzleState => {
  const [farmer, wolf, goat, cabbage] = stateKey.split('') as Side[]
  return { farmer, wolf, goat, cabbage }
}

export const isGoalState = (state: PuzzleState): boolean => {
  return state.farmer === 'R' && state.wolf === 'R' && state.goat === 'R' && state.cabbage === 'R'
}

export const getInvalidReason = (state: PuzzleState): string | null => {
  if (state.wolf === state.goat && state.farmer !== state.goat) {
    return 'Sói sẽ ăn dê khi nông dân vắng mặt.'
  }

  if (state.goat === state.cabbage && state.farmer !== state.goat) {
    return 'Dê sẽ ăn bắp cải khi nông dân vắng mặt.'
  }

  return null
}

const switchSide = (side: Side): Side => (side === 'L' ? 'R' : 'L')

const moveLabel = (item: Transportable | null, to: Side): string => {
  const target = to === 'R' ? 'bờ bên phải' : 'bờ bên trái'
  if (!item) {
    return `Nông dân đi một mình sang ${target}`
  }

  const names: Record<Transportable, string> = {
    wolf: 'sói',
    goat: 'dê',
    cabbage: 'bắp cải',
  }

  return `Nông dân chở ${names[item]} sang ${target}`
}

const generateMoves = (state: PuzzleState): Move[] => {
  const to = switchSide(state.farmer)
  const moves: Move[] = [{ item: null, to, label: moveLabel(null, to) }]

  ITEMS.forEach((item) => {
    if (state[item] === state.farmer) {
      moves.push({ item, to, label: moveLabel(item, to) })
    }
  })

  return moves
}

const applyMove = (state: PuzzleState, move: Move): PuzzleState => {
  const next: PuzzleState = {
    farmer: move.to,
    wolf: state.wolf,
    goat: state.goat,
    cabbage: state.cabbage,
  }

  if (move.item) {
    next[move.item] = move.to
  }

  return next
}

const createContext = (algorithm: AlgorithmType, heuristic: HeuristicType | null): SearchContext => {
  return {
    algorithm,
    heuristic,
    nodes: [],
    expansionOrder: [],
    nextNodeId: 0,
    generated: 0,
    expanded: 0,
    maxFrontier: 0,
    bestCostByState: new Map<string, number>(),
  }
}

const addNode = (
  context: SearchContext,
  payload: Omit<SearchNode, 'id' | 'expandedOrder'>,
): SearchNode => {
  const node: SearchNode = {
    ...payload,
    id: `n${context.nextNodeId}`,
    expandedOrder: null,
  }
  context.nextNodeId += 1
  context.nodes.push(node)
  context.generated += 1
  return node
}

const markExpanded = (context: SearchContext, node: SearchNode): void => {
  node.expandedOrder = context.expanded
  context.expanded += 1
  context.expansionOrder.push(node.id)
}

const buildSolutionPath = (nodes: SearchNode[], solutionNodeId: string | null): string[] => {
  if (!solutionNodeId) {
    return []
  }

  const byId = new Map(nodes.map((node) => [node.id, node]))
  const chain: string[] = []
  let cursor: SearchNode | undefined = byId.get(solutionNodeId)

  while (cursor) {
    chain.push(cursor.id)
    cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined
  }

  return chain.reverse()
}

const buildMetrics = (
  context: SearchContext,
  startTime: number,
  solutionNode: SearchNode | null,
): SearchMetrics => {
  const durationMs = performance.now() - startTime

  return {
    generated: context.generated,
    expanded: context.expanded,
    maxFrontier: context.maxFrontier,
    durationMs,
    solutionDepth: solutionNode?.depth ?? null,
    solutionCost: solutionNode?.g ?? null,
    optimalGuaranteed:
      context.algorithm === 'BFS' || context.algorithm === 'IDS' || context.algorithm === 'A*' || context.algorithm === 'IDA*',
    algorithm: context.algorithm,
    heuristic: context.heuristic,
  }
}

const createRootNode = (context: SearchContext): SearchNode => {
  const h = context.heuristic ? evaluateHeuristic(START_STATE, context.heuristic) : 0
  const root = addNode(context, {
    parentId: null,
    state: START_STATE,
    stateKey: createStateKey(START_STATE),
    action: null,
    depth: 0,
    g: 0,
    h,
    f: h,
    valid: true,
    prunedReason: null,
  })
  context.bestCostByState.set(root.stateKey, 0)
  return root
}

const createChildNode = (
  context: SearchContext,
  parent: SearchNode,
  move: Move,
): { node: SearchNode; accepted: boolean } => {
  const state = applyMove(parent.state, move)
  const stateKey = createStateKey(state)
  const invalidReason = getInvalidReason(state)
  const g = parent.g + 1
  const h = context.heuristic ? evaluateHeuristic(state, context.heuristic) : 0

  if (invalidReason) {
    return {
      node: addNode(context, {
        parentId: parent.id,
        state,
        stateKey,
        action: move,
        depth: parent.depth + 1,
        g,
        h,
        f: g + h,
        valid: false,
        prunedReason: invalidReason,
      }),
      accepted: false,
    }
  }

  const bestSeen = context.bestCostByState.get(stateKey)
  if (bestSeen !== undefined && bestSeen <= g) {
    return {
      node: addNode(context, {
        parentId: parent.id,
        state,
        stateKey,
        action: move,
        depth: parent.depth + 1,
        g,
        h,
        f: g + h,
        valid: true,
        prunedReason: 'Trạng thái trùng lặp với chi phí không tốt hơn.',
      }),
      accepted: false,
    }
  }

  context.bestCostByState.set(stateKey, g)
  return {
    node: addNode(context, {
      parentId: parent.id,
      state,
      stateKey,
      action: move,
      depth: parent.depth + 1,
      g,
      h,
      f: g + h,
      valid: true,
      prunedReason: null,
    }),
    accepted: true,
  }
}

const solveBfsDfs = (algorithm: 'BFS' | 'DFS', heuristic: HeuristicType | null): SearchResult => {
  const context = createContext(algorithm, heuristic)
  const startTime = performance.now()
  const root = createRootNode(context)

  const frontier: SearchNode[] = [root]
  context.maxFrontier = 1

  let solutionNode: SearchNode | null = null

  while (frontier.length > 0) {
    const node = algorithm === 'BFS' ? frontier.shift()! : frontier.pop()!
    markExpanded(context, node)

    if (isGoalState(node.state)) {
      solutionNode = node
      break
    }

    const moves = generateMoves(node.state)
    const acceptedChildren: SearchNode[] = []

    moves.forEach((move) => {
      const { node: child, accepted } = createChildNode(context, node, move)
      if (accepted) {
        acceptedChildren.push(child)
      }
    })

    if (algorithm === 'BFS') {
      frontier.push(...acceptedChildren)
    } else {
      frontier.push(...acceptedChildren.reverse())
    }

    context.maxFrontier = Math.max(context.maxFrontier, frontier.length)
  }

  return {
    algorithm,
    heuristic,
    nodes: context.nodes,
    expansionOrder: context.expansionOrder,
    solutionNodeId: solutionNode?.id ?? null,
    solutionPathNodeIds: buildSolutionPath(context.nodes, solutionNode?.id ?? null),
    metrics: buildMetrics(context, startTime, solutionNode),
  }
}

const solveBestFirst = (algorithm: 'A*' | 'Greedy', heuristic: HeuristicType): SearchResult => {
  const context = createContext(algorithm, heuristic)
  const startTime = performance.now()
  const root = createRootNode(context)

  const frontier: SearchNode[] = [root]
  context.maxFrontier = 1

  let solutionNode: SearchNode | null = null

  const score = (node: SearchNode): number => {
    if (algorithm === 'Greedy') {
      return node.h
    }
    return node.f
  }

  while (frontier.length > 0) {
    frontier.sort((a, b) => score(a) - score(b) || a.h - b.h || a.g - b.g)
    const node = frontier.shift()!
    markExpanded(context, node)

    if (isGoalState(node.state)) {
      solutionNode = node
      break
    }

    generateMoves(node.state).forEach((move) => {
      const { node: child, accepted } = createChildNode(context, node, move)
      if (accepted) {
        frontier.push(child)
      }
    })

    context.maxFrontier = Math.max(context.maxFrontier, frontier.length)
  }

  return {
    algorithm,
    heuristic,
    nodes: context.nodes,
    expansionOrder: context.expansionOrder,
    solutionNodeId: solutionNode?.id ?? null,
    solutionPathNodeIds: buildSolutionPath(context.nodes, solutionNode?.id ?? null),
    metrics: buildMetrics(context, startTime, solutionNode),
  }
}

interface DepthRunResult {
  context: SearchContext
  solutionNode: SearchNode | null
}

const depthLimitedSearch = (
  depthLimit: number,
  algorithm: 'IDS' | 'IDA*',
  heuristic: HeuristicType,
  threshold: number | null,
): DepthRunResult => {
  const context = createContext(algorithm, heuristic)
  const root = createRootNode(context)
  const stack: SearchNode[] = [root]
  context.maxFrontier = 1

  let solutionNode: SearchNode | null = null

  while (stack.length > 0) {
    const node = stack.pop()!
    markExpanded(context, node)

    if (isGoalState(node.state)) {
      solutionNode = node
      break
    }

    if (node.depth >= depthLimit) {
      continue
    }

    const acceptedChildren: SearchNode[] = []

    generateMoves(node.state).forEach((move) => {
      const { node: child, accepted } = createChildNode(context, node, move)
      const overThreshold = threshold !== null && child.f > threshold

      if (accepted && !overThreshold) {
        acceptedChildren.push(child)
      } else if (accepted && overThreshold) {
        child.prunedReason = `Vượt ngưỡng f = ${threshold}`
      }
    })

    stack.push(...acceptedChildren.reverse())
    context.maxFrontier = Math.max(context.maxFrontier, stack.length)
  }

  return { context, solutionNode }
}

const solveIds = (): SearchResult => {
  const heuristic: HeuristicType = 'remaining-items'
  const startTime = performance.now()

  let mergedContext: SearchContext | null = null
  let solutionNodeId: string | null = null

  for (let limit = 0; limit <= 25; limit += 1) {
    const { context, solutionNode } = depthLimitedSearch(limit, 'IDS', heuristic, null)
    mergedContext = context

    if (solutionNode) {
      solutionNodeId = solutionNode.id
      break
    }
  }

  if (!mergedContext) {
    throw new Error('IDS không khởi tạo được ngữ cảnh tìm kiếm.')
  }

  const solutionNode = solutionNodeId
    ? mergedContext.nodes.find((node) => node.id === solutionNodeId) ?? null
    : null

  return {
    algorithm: 'IDS',
    heuristic,
    nodes: mergedContext.nodes,
    expansionOrder: mergedContext.expansionOrder,
    solutionNodeId,
    solutionPathNodeIds: buildSolutionPath(mergedContext.nodes, solutionNodeId),
    metrics: buildMetrics(mergedContext, startTime, solutionNode),
  }
}

const solveIdaStar = (heuristic: HeuristicType): SearchResult => {
  const startTime = performance.now()
  let threshold = evaluateHeuristic(START_STATE, heuristic)

  let bestContext: SearchContext | null = null
  let solutionNodeId: string | null = null

  for (let iteration = 0; iteration < 20; iteration += 1) {
    const { context, solutionNode } = depthLimitedSearch(30, 'IDA*', heuristic, threshold)
    bestContext = context

    if (solutionNode) {
      solutionNodeId = solutionNode.id
      break
    }

    const candidates = context.nodes
      .filter((node) => node.valid && node.prunedReason?.startsWith('Vượt ngưỡng'))
      .map((node) => node.f)
      .filter((value) => Number.isFinite(value) && value > threshold)

    if (candidates.length === 0) {
      break
    }

    threshold = Math.min(...candidates)
  }

  if (!bestContext) {
    throw new Error('IDA* không khởi tạo được ngữ cảnh tìm kiếm.')
  }

  const solutionNode = solutionNodeId
    ? bestContext.nodes.find((node) => node.id === solutionNodeId) ?? null
    : null

  return {
    algorithm: 'IDA*',
    heuristic,
    nodes: bestContext.nodes,
    expansionOrder: bestContext.expansionOrder,
    solutionNodeId,
    solutionPathNodeIds: buildSolutionPath(bestContext.nodes, solutionNodeId),
    metrics: buildMetrics(bestContext, startTime, solutionNode),
  }
}

export const runSearch = (
  algorithm: AlgorithmType,
  heuristic: HeuristicType,
): SearchResult => {
  if (algorithm === 'BFS') {
    return solveBfsDfs('BFS', null)
  }

  if (algorithm === 'DFS') {
    return solveBfsDfs('DFS', null)
  }

  if (algorithm === 'IDS') {
    return solveIds()
  }

  if (algorithm === 'A*') {
    return solveBestFirst('A*', heuristic)
  }

  if (algorithm === 'Greedy') {
    return solveBestFirst('Greedy', heuristic)
  }

  return solveIdaStar(heuristic)
}

export const formatState = (state: PuzzleState): string => {
  const s = (side: Side) => (side === 'L' ? 'Trái' : 'Phải')
  return `F:${s(state.farmer)} | S:${s(state.wolf)} | D:${s(state.goat)} | B:${s(state.cabbage)}`
}
