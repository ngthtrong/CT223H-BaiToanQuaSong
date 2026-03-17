import { Card, Empty, Space, Tag, Tooltip, Typography } from 'antd'
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

const { Text } = Typography

interface StateTreeProps {
  nodes: SearchNode[]
  solutionPath: string[]
  showEvaluation: boolean
  isDarkMode: boolean
  selectedNodeId: string | null
  followSelectedNode: boolean
  onSelectNode: (nodeId: string) => void
}

function AutoViewport({
  nodeCount,
  focusNodeId,
  focusEnabled,
  flowNodes,
}: {
  nodeCount: number
  focusNodeId: string | null
  focusEnabled: boolean
  flowNodes: Node<FlowNodeData>[]
}) {
  const { fitView, getZoom, setCenter } = useReactFlow()
  useEffect(() => {
    if (nodeCount === 0) {
      return
    }

    if (focusEnabled && focusNodeId) {
      const targetNode = flowNodes.find((node) => node.id === focusNodeId)
      if (targetNode) {
        const width = typeof targetNode.width === 'number' ? targetNode.width : 210
        const height = typeof targetNode.height === 'number' ? targetNode.height : 70
        const centerX = targetNode.position.x + width / 2
        const centerY = targetNode.position.y + height / 2

        setCenter(centerX, centerY, {
          duration: 320,
          zoom: Math.max(getZoom(), 0.72),
        })
        return
      }
    }

    fitView({ duration: 350, padding: 0.15 })
  }, [fitView, flowNodes, focusEnabled, focusNodeId, getZoom, nodeCount, setCenter])

  return null
}

export function StateTree({
  nodes,
  solutionPath,
  showEvaluation,
  isDarkMode,
  selectedNodeId,
  followSelectedNode,
  onSelectNode,
}: StateTreeProps) {
  const graph = useMemo(() => buildFlowGraph(nodes, solutionPath), [nodes, solutionPath])
  const idaThresholds = useMemo(() => {
    const seen = new Set<string>()
    const items: Array<{ iteration: number; threshold: number | null }> = []

    nodes
      .filter((node) => node.iteration > 0)
      .forEach((node) => {
        const key = `${node.iteration}-${node.threshold}`
        if (!seen.has(key)) {
          seen.add(key)
          items.push({ iteration: node.iteration, threshold: node.threshold })
        }
      })

    return items.sort((a, b) => a.iteration - b.iteration)
  }, [nodes])

  const thresholdPrunedCount = useMemo(
    () => nodes.filter((node) => node.prunedType === 'threshold').length,
    [nodes],
  )

  const isIdaStarView = idaThresholds.length > 0
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
              ? node.data?.prunedType === 'threshold'
                ? isDarkMode
                  ? 'linear-gradient(140deg, rgba(120, 53, 15, 0.52), rgba(92, 25, 8, 0.62))'
                  : 'linear-gradient(140deg, rgba(255, 237, 213, 0.98), rgba(254, 215, 170, 0.98))'
                : node.data?.prunedType === 'invalid'
                  ? isDarkMode
                    ? 'linear-gradient(140deg, rgba(127, 29, 29, 0.46), rgba(69, 10, 10, 0.58))'
                    : 'linear-gradient(140deg, rgba(254, 226, 226, 0.96), rgba(254, 202, 202, 0.96))'
                  : isDarkMode
                    ? 'linear-gradient(140deg, rgba(71, 85, 105, 0.52), rgba(51, 65, 85, 0.62))'
                    : 'linear-gradient(140deg, rgba(241, 245, 249, 0.98), rgba(226, 232, 240, 0.98))'
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
                {node.data?.details && <div>{node.data.details as string}</div>}
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
      {isIdaStarView && (
        <Space direction="vertical" size={6} style={{ marginBottom: 8 }}>
          <Text strong>Thông tin IDA*</Text>
          <Space wrap>
            {idaThresholds.map((item) => (
              <Tag key={`${item.iteration}-${item.threshold}`} color="geekblue">
                Vòng {item.iteration}: ngưỡng f {'<='} {item.threshold ?? '∞'}
              </Tag>
            ))}
            <Tag color="red">Nhánh bị cắt theo ngưỡng: {thresholdPrunedCount}</Tag>
            <Tag color="orange">Màu cam: cắt theo ngưỡng IDA*</Tag>
            <Tag color="red">Màu đỏ: vi phạm ràng buộc</Tag>
          </Space>
        </Space>
      )}
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
          <AutoViewport
            nodeCount={nodes.length}
            focusNodeId={selectedNodeId}
            focusEnabled={followSelectedNode}
            flowNodes={flowNodes}
          />
          <MiniMap zoomable pannable />
          <Controls />
          <Background gap={18} size={1} />
        </ReactFlow>
      </div>
    </Card>
  )
}
