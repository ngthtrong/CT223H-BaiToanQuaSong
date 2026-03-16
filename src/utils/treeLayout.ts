import { Position, type Edge, type Node } from '@xyflow/react'
import { formatState } from '../algorithms/solver'
import type { SearchNode } from '../types/puzzle'

export interface FlowNodeData extends Record<string, unknown> {
  title: string
  subtitle: string
  evalInfo: string
  tooltip: string
  status: 'solution' | 'expanded' | 'pruned' | 'default'
}

export const buildFlowGraph = (
  nodes: SearchNode[],
  solutionPath: string[],
): { flowNodes: Node<FlowNodeData>[]; flowEdges: Edge[] } => {
  const levels = new Map<number, SearchNode[]>()

  nodes.forEach((node) => {
    const bucket = levels.get(node.depth) ?? []
    bucket.push(node)
    levels.set(node.depth, bucket)
  })

  levels.forEach((group) => {
    group.sort((a, b) => {
      const first = a.expandedOrder ?? Number.MAX_SAFE_INTEGER
      const second = b.expandedOrder ?? Number.MAX_SAFE_INTEGER
      return first - second
    })
  })

  const solutionSet = new Set(solutionPath)

  const flowNodes: Node<FlowNodeData>[] = nodes.map((node) => {
    const group = levels.get(node.depth) ?? []
    const indexInLevel = group.findIndex((n) => n.id === node.id)

    const x = indexInLevel * 250
    const y = node.depth * 170

    const status: FlowNodeData['status'] = solutionSet.has(node.id)
      ? 'solution'
      : node.prunedReason
        ? 'pruned'
        : node.expandedOrder !== null
          ? 'expanded'
          : 'default'

    const tooltip = node.prunedReason
      ? `${formatState(node.state)}\nLý do loại: ${node.prunedReason}`
      : `${formatState(node.state)}\ng=${node.g}, h=${node.h}, f=${node.f}`

    return {
      id: node.id,
      position: { x, y },
      type: 'default',
      data: {
        title: node.stateKey,
        subtitle: node.action?.label ?? 'Trạng thái khởi đầu',
        evalInfo: `g=${node.g}, h=${node.h}`,
        tooltip,
        status,
      },
      draggable: false,
      selectable: true,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    }
  })

  const flowEdges: Edge[] = nodes
    .filter((node) => node.parentId)
    .map((node) => ({
      id: `e-${node.parentId}-${node.id}`,
      source: node.parentId!,
      target: node.id,
      label: node.action?.item ?? 'một mình',
      animated: solutionSet.has(node.id),
      style: {
        stroke: solutionSet.has(node.id) ? '#d97706' : '#6b7280',
        strokeWidth: solutionSet.has(node.id) ? 2.5 : 1.2,
      },
    }))

  return { flowNodes, flowEdges }
}
