export type Side = 'L' | 'R'

export type Transportable = 'wolf' | 'goat' | 'cabbage'

export type AlgorithmType = 'BFS' | 'DFS' | 'IDS' | 'A*' | 'Greedy' | 'IDA*'

export type HeuristicType = 'remaining-items' | 'remaining-trips'

export interface PuzzleState {
  farmer: Side
  wolf: Side
  goat: Side
  cabbage: Side
}

export interface Move {
  item: Transportable | null
  to: Side
  label: string
}

export interface SearchNode {
  id: string
  parentId: string | null
  iteration: number
  threshold: number | null
  state: PuzzleState
  stateKey: string
  action: Move | null
  depth: number
  g: number
  h: number
  f: number
  valid: boolean
  prunedType: 'invalid' | 'duplicate' | 'threshold' | null
  prunedReason: string | null
  expandedOrder: number | null
}

export interface SearchMetrics {
  generated: number
  expanded: number
  maxFrontier: number
  durationMs: number
  solutionDepth: number | null
  solutionCost: number | null
  optimalGuaranteed: boolean
  algorithm: AlgorithmType
  heuristic: HeuristicType | null
}

export interface SearchResult {
  algorithm: AlgorithmType
  heuristic: HeuristicType | null
  nodes: SearchNode[]
  expansionOrder: string[]
  solutionNodeId: string | null
  solutionPathNodeIds: string[]
  metrics: SearchMetrics
}
