import { Position, type Edge, type Node } from '@xyflow/react'
import { formatState } from '../algorithms/solver'
import type { SearchNode } from '../types/puzzle'

export interface FlowNodeData extends Record<string, unknown> {
  title: string
  subtitle: string
  evalInfo: string
  tooltip: string
  details: string
  iterationLabel: string | null
  prunedType: SearchNode['prunedType']
  status: 'solution' | 'expanded' | 'pruned' | 'default'
}

export const buildFlowGraph = (
  nodes: SearchNode[],
  solutionPath: string[],
): { flowNodes: Node<FlowNodeData>[]; flowEdges: Edge[] } => {
  const levels = new Map<string, SearchNode[]>()
  const maxDepth = Math.max(0, ...nodes.map((node) => node.depth))
  const bandHeight = (maxDepth + 1) * 170 + 120
  const isIdaStarRun = nodes.some((node) => node.iteration > 0)

  nodes.forEach((node) => {
    const levelKey = `${node.iteration}-${node.depth}`
    const bucket = levels.get(levelKey) ?? []
    bucket.push(node)
    levels.set(levelKey, bucket)
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
    const levelKey = `${node.iteration}-${node.depth}`
    const group = levels.get(levelKey) ?? []
    const indexInLevel = group.findIndex((n) => n.id === node.id)

    const x = indexInLevel * 250
    const iterationBand = Math.max(0, node.iteration - 1)
    const y = node.depth * 170 + iterationBand * bandHeight

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

    const iterationLabel = isIdaStarRun
      ? `Vòng ${node.iteration} | ngưỡng f <= ${node.threshold ?? '∞'}`
      : null

    const details = node.prunedType === 'threshold'
      ? `Nhánh bị cắt: f=${node.f} > ngưỡng=${node.threshold}`
      : node.prunedReason
        ? `Loại: ${node.prunedReason}`
        : ''

    return {
      id: node.id,
      position: { x, y },
      type: 'default',
      data: {
        title: iterationLabel ? `${node.stateKey} • ${iterationLabel}` : node.stateKey,
        subtitle: node.action?.label ?? 'Trạng thái khởi đầu',
        evalInfo: `g=${node.g}, h=${node.h}, f=${node.f}`,
        tooltip,
        details,
        iterationLabel,
        prunedType: node.prunedType,
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
        stroke:
          solutionSet.has(node.id)
            ? '#d97706'
            : node.prunedType === 'threshold'
              ? '#dc2626'
              : '#6b7280',
        strokeWidth: solutionSet.has(node.id) ? 2.5 : 1.2,
        strokeDasharray: node.prunedType === 'threshold' ? '6 4' : undefined,
      },
    }))

  return { flowNodes, flowEdges }
}
