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
  isDarkMode: boolean
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

export function StateTree({
  nodes,
  solutionPath,
  showEvaluation,
  isDarkMode,
  selectedNodeId,
  onSelectNode,
}: StateTreeProps) {
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
              ? '2px solid rgba(56, 189, 248, 0.9)'
              : isDarkMode
                ? '1px solid rgba(148, 163, 184, 0.28)'
                : '1px solid rgba(100, 116, 139, 0.34)',
          background:
            node.data?.status === 'pruned'
              ? isDarkMode
                ? 'linear-gradient(140deg, rgba(127, 29, 29, 0.46), rgba(69, 10, 10, 0.58))'
                : 'linear-gradient(140deg, rgba(254, 226, 226, 0.96), rgba(254, 202, 202, 0.96))'
              : node.data?.status === 'solution'
                ? isDarkMode
                  ? 'linear-gradient(140deg, rgba(22, 101, 52, 0.44), rgba(20, 83, 45, 0.62))'
                  : 'linear-gradient(140deg, rgba(220, 252, 231, 0.96), rgba(187, 247, 208, 0.96))'
                : isDarkMode
                  ? 'linear-gradient(140deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))'
                  : 'linear-gradient(140deg, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.95))',
          color: isDarkMode ? '#e2e8f0' : '#0f172a',
          width: 210,
          fontSize: 12,
          padding: 8,
          boxShadow:
            node.data?.status === 'solution'
              ? isDarkMode
                ? '0 0 0 1px rgba(74, 222, 128, 0.35), 0 8px 16px rgba(2, 6, 23, 0.4)'
                : '0 0 0 1px rgba(22, 163, 74, 0.25), 0 6px 14px rgba(15, 23, 42, 0.14)'
              : isDarkMode
                ? '0 8px 16px rgba(2, 6, 23, 0.4)'
                : '0 6px 14px rgba(15, 23, 42, 0.14)',
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
    [flowNodes, isDarkMode, selectedNodeId, showEvaluation],
  )

  if (nodes.length === 0) {
    return (
      <Card className="tree-card">
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
          colorMode={isDarkMode ? 'dark' : 'light'}
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
