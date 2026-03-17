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

interface SearchContextOptions {
  nextNodeId?: number
  expanded?: number
}

interface NodeMeta {
  iteration: number
  threshold: number | null
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

const createContext = (
  algorithm: AlgorithmType,
  heuristic: HeuristicType | null,
  options?: SearchContextOptions,
): SearchContext => {
  return {
    algorithm,
    heuristic,
    nodes: [],
    expansionOrder: [],
    nextNodeId: options?.nextNodeId ?? 0,
    generated: 0,
    expanded: options?.expanded ?? 0,
    maxFrontier: 0,
    bestCostByState: new Map<string, number>(),
  }
}

const defaultNodeMeta: NodeMeta = {
  iteration: 0,
  threshold: null,
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

const createRootNode = (context: SearchContext, nodeMeta: NodeMeta = defaultNodeMeta): SearchNode => {
  const h = context.heuristic ? evaluateHeuristic(START_STATE, context.heuristic) : 0
  const root = addNode(context, {
    parentId: null,
    iteration: nodeMeta.iteration,
    threshold: nodeMeta.threshold,
    state: START_STATE,
    stateKey: createStateKey(START_STATE),
    action: null,
    depth: 0,
    g: 0,
    h,
    f: h,
    valid: true,
    prunedType: null,
    prunedReason: null,
  })
  context.bestCostByState.set(root.stateKey, 0)
  return root
}

const createChildNode = (
  context: SearchContext,
  parent: SearchNode,
  move: Move,
  nodeMeta: NodeMeta = defaultNodeMeta,
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
        iteration: nodeMeta.iteration,
        threshold: nodeMeta.threshold,
        state,
        stateKey,
        action: move,
        depth: parent.depth + 1,
        g,
        h,
        f: g + h,
        valid: false,
        prunedType: 'invalid',
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
        iteration: nodeMeta.iteration,
        threshold: nodeMeta.threshold,
        state,
        stateKey,
        action: move,
        depth: parent.depth + 1,
        g,
        h,
        f: g + h,
        valid: true,
        prunedType: 'duplicate',
        prunedReason: 'Trạng thái trùng lặp với chi phí không tốt hơn.',
      }),
      accepted: false,
    }
  }

  context.bestCostByState.set(stateKey, g)
  return {
    node: addNode(context, {
      parentId: parent.id,
      iteration: nodeMeta.iteration,
      threshold: nodeMeta.threshold,
      state,
      stateKey,
      action: move,
      depth: parent.depth + 1,
      g,
      h,
      f: g + h,
      valid: true,
      prunedType: null,
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
  nextThresholdCandidate: number | null
}

const depthLimitedSearch = (
  depthLimit: number,
  algorithm: 'IDS' | 'IDA*',
  heuristic: HeuristicType,
  threshold: number | null,
  iterationIndex = 0,
  contextOptions?: SearchContextOptions,
): DepthRunResult => {
  const nodeMeta: NodeMeta = {
    iteration: iterationIndex,
    threshold,
  }

  const context = createContext(algorithm, heuristic, contextOptions)
  const root = createRootNode(context, nodeMeta)
  const stack: SearchNode[] = [root]
  context.maxFrontier = 1

  let solutionNode: SearchNode | null = null
  let minExceededThreshold = Number.POSITIVE_INFINITY

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
      const { node: child, accepted } = createChildNode(context, node, move, nodeMeta)
      const overThreshold = threshold !== null && child.f > threshold

      if (accepted && !overThreshold) {
        acceptedChildren.push(child)
      } else if (accepted && overThreshold) {
        child.prunedType = 'threshold'
        child.prunedReason = `Cắt IDA*: f=${child.f} > ngưỡng=${threshold}`
        minExceededThreshold = Math.min(minExceededThreshold, child.f)
      }
    })

    stack.push(...acceptedChildren.reverse())
    context.maxFrontier = Math.max(context.maxFrontier, stack.length)
  }

  return {
    context,
    solutionNode,
    nextThresholdCandidate:
      Number.isFinite(minExceededThreshold) && threshold !== null ? minExceededThreshold : null,
  }
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

  const mergedContext = createContext('IDA*', heuristic)
  let nextNodeId = 0
  let expandedOffset = 0
  let solutionNodeId: string | null = null

  for (let iteration = 0; iteration < 20; iteration += 1) {
    const { context, solutionNode, nextThresholdCandidate } = depthLimitedSearch(
      30,
      'IDA*',
      heuristic,
      threshold,
      iteration + 1,
      {
        nextNodeId,
        expanded: expandedOffset,
      },
    )

    mergedContext.nodes.push(...context.nodes)
    mergedContext.expansionOrder.push(...context.expansionOrder)
    mergedContext.generated += context.generated
    mergedContext.expanded = context.expanded
    mergedContext.maxFrontier = Math.max(mergedContext.maxFrontier, context.maxFrontier)

    nextNodeId = context.nextNodeId
    expandedOffset = context.expanded

    if (solutionNode) {
      solutionNodeId = solutionNode.id
      break
    }

    if (nextThresholdCandidate === null) {
      break
    }

    threshold = nextThresholdCandidate
  }

  const solutionNode = solutionNodeId
    ? mergedContext.nodes.find((node) => node.id === solutionNodeId) ?? null
    : null

  return {
    algorithm: 'IDA*',
    heuristic,
    nodes: mergedContext.nodes,
    expansionOrder: mergedContext.expansionOrder,
    solutionNodeId,
    solutionPathNodeIds: buildSolutionPath(mergedContext.nodes, solutionNodeId),
    metrics: buildMetrics(mergedContext, startTime, solutionNode),
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
