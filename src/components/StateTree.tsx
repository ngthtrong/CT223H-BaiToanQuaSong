import { Card, Empty, Tooltip } from 'antd'
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react'
import { useEffect, useMemo } from 'react'
import '@xyflow/react/dist/style.css'
import type { SearchNode } from '../types/puzzle'
import { buildFlowGraph, type FlowNodeData } from '../utils/treeLayout'

interface StateTreeProps {
  nodes: SearchNode[]
  solutionPath: string[]
  showEvaluation: boolean
  selectedNodeId: string | null
  onSelectNode: (nodeId: string) => void
}

function AutoFitView({ nodeCount }: { nodeCount: number }) {
  const { fitView } = useReactFlow()
  useEffect(() => {
    if (nodeCount > 0) {
      fitView({ duration: 350, padding: 0.15 })
    }
  }, [nodeCount, fitView])
  return null
}

export function StateTree({ nodes, solutionPath, showEvaluation, selectedNodeId, onSelectNode }: StateTreeProps) {
  const graph = useMemo(() => buildFlowGraph(nodes, solutionPath), [nodes, solutionPath])
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState<Node<FlowNodeData>>(graph.flowNodes)
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState<Edge>(graph.flowEdges)

  useEffect(() => {
    setFlowNodes(graph.flowNodes)
    setFlowEdges(graph.flowEdges)
  }, [graph, setFlowEdges, setFlowNodes])

  const decoratedNodes = useMemo(
    () =>
      flowNodes.map((node) => ({
        ...node,
        style: {
          ...(node.style ?? {}),
          borderRadius: 12,
          border:
            node.id === selectedNodeId
              ? '2px solid #ea580c'
              : 'none',
          background:
            node.data?.status === 'pruned'
              ? '#fef2f2'
              : node.data?.status === 'solution'
                ? '#fffbeb'
                : '#f8fafc',
          color: '#111827',
          width: 210,
          fontSize: 12,
          padding: 8,
          boxShadow:
            node.data?.status === 'solution'
              ? '0 0 0 1px rgba(217, 119, 6, 0.35), 0 4px 12px rgba(15, 23, 42, 0.12)'
              : '0 4px 12px rgba(15, 23, 42, 0.12)',
        },
        data: {
          ...node.data,
          label: (
            <Tooltip title={node.data?.tooltip}>
              <div>
                <strong>{node.data?.title}</strong>
                <div>{node.data?.subtitle}</div>
                {showEvaluation && <div>{node.data?.evalInfo as string}</div>}
              </div>
            </Tooltip>
          ),
        },
      })),
    [flowNodes, selectedNodeId, showEvaluation],
  )

  if (nodes.length === 0) {
    return (
      <Card>
        <Empty description="Chưa có dữ liệu. Bấm Chạy thuật toán để xem cây." />
      </Card>
    )
  }

  return (
    <Card className="tree-card">
      <div className="tree-wrap">
        <ReactFlow
          nodes={decoratedNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_, node) => onSelectNode(node.id)}
          defaultViewport={{ x: 24, y: 24, zoom: 0.72 }}
          minZoom={0.25}
          maxZoom={1.5}
          nodesDraggable={false}
          panOnDrag
          panOnScroll
        >
          <AutoFitView nodeCount={nodes.length} />
          <MiniMap zoomable pannable />
          <Controls />
          <Background gap={18} size={1} />
        </ReactFlow>
      </div>
    </Card>
  )
}
