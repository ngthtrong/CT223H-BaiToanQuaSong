import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Col,
  ConfigProvider,
  Divider,
  Flex,
  Layout,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Typography,
  theme,
} from 'antd'
import {
  BulbOutlined,
  MoonOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  RedoOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
} from '@ant-design/icons'
import './App.css'
import { describeHeuristic } from './algorithms/heuristics'
import { parseStateKey, runSearch } from './algorithms/solver'
import { PseudocodePanel } from './components/PseudocodePanel'
import { RiverScene } from './components/RiverScene'
import { StateTree } from './components/StateTree'
import type { AlgorithmType, HeuristicType, SearchResult } from './types/puzzle'

const { Header, Content } = Layout
const { Title, Paragraph, Text } = Typography

type RunMode = 'full' | 'step'

interface CompareRow {
  key: string
  algorithm: AlgorithmType
  heuristic: string
  expanded: number
  generated: number
  durationMs: number
  solutionDepth: string
  optimal: string
}

const algorithmOptions: AlgorithmType[] = ['BFS', 'DFS', 'IDS', 'A*', 'Greedy', 'IDA*']
const heuristicOptions: Array<{ value: HeuristicType; label: string }> = [
  { value: 'remaining-items', label: 'Số đối tượng còn lại' },
  { value: 'remaining-trips', label: 'Số chuyến còn lại' },
]

const requiresHeuristic = (algorithm: AlgorithmType): boolean => {
  return algorithm === 'A*' || algorithm === 'Greedy' || algorithm === 'IDA*'
}

function App() {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('BFS')
  const [heuristic, setHeuristic] = useState<HeuristicType>('remaining-items')
  const [mode, setMode] = useState<RunMode>('step')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [historyRows, setHistoryRows] = useState<CompareRow[]>([])
  const [stepIndex, setStepIndex] = useState(0)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = window.localStorage.getItem('app-theme-mode')
    if (saved === 'dark') return true
    if (saved === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const isHeuristicEnabled = requiresHeuristic(algorithm)

  const nodeMap = useMemo(() => {
    if (!result) {
      return new Map<string, SearchResult['nodes'][number]>()
    }

    return new Map(result.nodes.map((node) => [node.id, node]))
  }, [result])

  const activeNodeId = useMemo(() => {
    if (!result) {
      return null
    }

    if (mode === 'step') {
      if (result.expansionOrder.length === 0) {
        return result.solutionNodeId
      }

      const safeIndex = Math.max(0, Math.min(stepIndex, result.expansionOrder.length - 1))
      return result.expansionOrder[safeIndex]
    }

    return selectedNodeId ?? result.solutionNodeId ?? result.expansionOrder.at(-1) ?? null
  }, [mode, result, selectedNodeId, stepIndex])

  const activeNode = activeNodeId ? nodeMap.get(activeNodeId) ?? null : null

  const visibleTree = useMemo(() => {
    if (!result) {
      return {
        nodes: [] as SearchResult['nodes'],
        solutionPath: [] as string[],
      }
    }

    if (mode !== 'step') {
      return {
        nodes: result.nodes,
        solutionPath: result.solutionPathNodeIds,
      }
    }

    const maxOrder = result.expansionOrder.length - 1
    const revealedOrder = maxOrder >= 0 ? Math.min(Math.max(stepIndex, 0), maxOrder) : -1
    const byId = new Map(result.nodes.map((node) => [node.id, node]))

    const nodes = result.nodes.filter((node) => {
      if (node.parentId === null) {
        return true
      }

      const parent = byId.get(node.parentId)
      return parent?.expandedOrder !== null && (parent?.expandedOrder ?? Number.MAX_SAFE_INTEGER) <= revealedOrder
    })

    const visibleIds = new Set(nodes.map((node) => node.id))

    return {
      nodes,
      solutionPath: result.solutionPathNodeIds.filter((id) => visibleIds.has(id)),
    }
  }, [mode, result, stepIndex])

  useEffect(() => {
    window.localStorage.setItem('app-theme-mode', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  useEffect(() => {
    if (!playing || !result || mode !== 'step') {
      return
    }

    const max = Math.max(0, result.expansionOrder.length - 1)
    if (stepIndex >= max) {
      return
    }

    const timer = window.setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= max) {
          setPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 850)

    return () => window.clearInterval(timer)
  }, [mode, playing, result, stepIndex])

  const handleRun = () => {
    const resolvedHeuristic = requiresHeuristic(algorithm) ? heuristic : 'remaining-items'
    const output = runSearch(algorithm, resolvedHeuristic)
    setResult(output)
    setStepIndex(0)
    setSelectedNodeId(output.expansionOrder[0] ?? output.solutionNodeId ?? null)
    setPlaying(false)

    setHistoryRows((prev) => {
      const row: CompareRow = {
        key: `${output.algorithm}-${Date.now()}`,
        algorithm: output.algorithm,
        heuristic: output.heuristic ?? 'Không áp dụng',
        expanded: output.metrics.expanded,
        generated: output.metrics.generated,
        durationMs: Number(output.metrics.durationMs.toFixed(2)),
        solutionDepth:
          output.metrics.solutionDepth !== null ? String(output.metrics.solutionDepth) : 'Không tìm thấy',
        optimal: output.metrics.optimalGuaranteed ? 'Có' : 'Không chắc',
      }

      return [row, ...prev].slice(0, 10)
    })
  }

  const handleResetSteps = () => {
    setStepIndex(0)
    setPlaying(false)
    if (result?.expansionOrder[0]) {
      setSelectedNodeId(result.expansionOrder[0])
    }
  }

  const stepMax = Math.max(0, (result?.expansionOrder.length ?? 1) - 1)
  const disablePlayButton = !result || mode !== 'step' || (!playing && stepIndex >= stepMax)
  const activeLine = result ? Math.min(4, Math.max(0, stepIndex % 5)) : 0

  const compareColumns = [
    { title: 'Thuật toán', dataIndex: 'algorithm', key: 'algorithm' },
    { title: 'Hàm đánh giá', dataIndex: 'heuristic', key: 'heuristic' },
    { title: 'Nút đã duyệt', dataIndex: 'expanded', key: 'expanded' },
    { title: 'Nút đã sinh', dataIndex: 'generated', key: 'generated' },
    { title: 'Thời gian (ms)', dataIndex: 'durationMs', key: 'durationMs' },
    { title: 'Độ sâu lời giải', dataIndex: 'solutionDepth', key: 'solutionDepth' },
    { title: 'Bảo đảm tối ưu', dataIndex: 'optimal', key: 'optimal' },
  ]

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#0ea5e9',
          borderRadius: 12,
          colorBgBase: isDarkMode ? '#070b14' : '#f8fafc',
          colorTextBase: isDarkMode ? '#e2e8f0' : '#0f172a',
          colorBorder: isDarkMode ? 'rgba(148, 163, 184, 0.26)' : 'rgba(15, 23, 42, 0.16)',
        },
      }}
    >
      <Layout className={`app-shell ${isDarkMode ? 'theme-dark' : 'theme-light'}`}>
        <Header className="hero-header">
          <div className="hero-toolbar">
            <div>
              <Title level={2} className="hero-title">
                Bài toán Qua Sông
              </Title>
              <Paragraph className="hero-subtitle">
                Công cụ giảng dạy trực quan cho bài toán Nông dân - Sói - Dê - Bắp cải
              </Paragraph>
            </div>
            <Space className="theme-switch-wrap" size={8}>
              <Text className="theme-switch-label">Dark mode</Text>
              <Switch
                checked={isDarkMode}
                onChange={setIsDarkMode}
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<BulbOutlined />}
              />
            </Space>
          </div>
        </Header>

        <Content className="app-content">
        <Card className="control-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={6}>
              <Text strong>Thuật toán</Text>
              <Select value={algorithm} style={{ width: '100%' }} onChange={setAlgorithm} options={algorithmOptions.map((algo) => ({ value: algo, label: algo }))} />
            </Col>

            <Col xs={24} md={7}>
              <Text strong>Hàm đánh giá (A*, Greedy, IDA*)</Text>
              <Select
                value={heuristic}
                style={{ width: '100%' }}
                onChange={setHeuristic}
                options={heuristicOptions}
                disabled={!isHeuristicEnabled}
              />
              {isHeuristicEnabled && (
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                  {describeHeuristic(heuristic)}
                </Text>
              )}
            </Col>

            <Col xs={24} md={6}>
              <Text strong>Chế độ chạy</Text>
              <Segmented
                style={{ width: '100%' }}
                value={mode}
                onChange={(value) => setMode(value as RunMode)}
                options={[
                  { label: 'Chạy một lượt', value: 'full' },
                  { label: 'Từng bước', value: 'step' },
                ]}
              />
            </Col>

            <Col xs={24} md={5}>
              <Space wrap>
                <Button type="primary" size="large" onClick={handleRun} className="action-button">
                  Chạy thuật toán
                </Button>
                <Button onClick={() => setHistoryRows([])}>Xóa lịch sử</Button>
              </Space>
            </Col>
          </Row>


        </Card>

        <Row gutter={[16, 16]} className="workspace-row">
          <Col xs={24} xl={7}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Card className="step-card">
                <Space wrap>
                  <Button icon={<StepBackwardOutlined />} disabled={!result || mode !== 'step'} onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}>
                    Lùi
                  </Button>
                  <Button
                    icon={playing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    disabled={disablePlayButton}
                    onClick={() => setPlaying((prev) => !prev)}
                  >
                    {playing ? 'Tạm dừng' : 'Phát'}
                  </Button>
                  <Button icon={<StepForwardOutlined />} disabled={!result || mode !== 'step'} onClick={() => setStepIndex((prev) => Math.min(stepMax, prev + 1))}>
                    Tiếp
                  </Button>
                  <Button icon={<RedoOutlined />} disabled={!result || mode !== 'step'} onClick={handleResetSteps}>
                    Đặt lại
                  </Button>
                  <Tag>
                    Bước: {mode === 'step' ? stepIndex : 0}/{mode === 'step' ? stepMax : 0}
                  </Tag>
                </Space>
                <Paragraph className="step-note">
                  Nút hiện tại:{' '}
                  <Text strong>
                    {activeNode
                      ? `${activeNode.stateKey} ${activeNode.prunedReason ? `(Loại: ${activeNode.prunedReason})` : ''}`
                      : 'Không có'}
                  </Text>
                </Paragraph>
              </Card>
              <RiverScene state={activeNode?.state ?? parseStateKey('LLLL')} />
              <PseudocodePanel algorithm={algorithm} activeLine={activeLine} />
            </Space>
          </Col>

          <Col xs={24} xl={17}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <StateTree
                nodes={visibleTree.nodes}
                solutionPath={visibleTree.solutionPath}
                showEvaluation={Boolean(result?.heuristic)}
                isDarkMode={isDarkMode}
                selectedNodeId={activeNodeId}
                onSelectNode={setSelectedNodeId}
              />
              <Card className="metric-card">
                {result ? (
                  <>
                    <Row gutter={[8, 8]} className="compact-metrics-row">
                      <Col xs={12} sm={8} xl={4}>
                        <Statistic className="compact-stat" title="Nút đã duyệt" value={result.metrics.expanded} />
                      </Col>
                      <Col xs={12} sm={8} xl={4}>
                        <Statistic className="compact-stat" title="Nút đã sinh" value={result.metrics.generated} />
                      </Col>
                      <Col xs={12} sm={8} xl={4}>
                        <Statistic className="compact-stat" title="Biên tối đa" value={result.metrics.maxFrontier} />
                      </Col>
                      <Col xs={12} sm={8} xl={4}>
                        <Statistic className="compact-stat" title="Thời gian (ms)" value={Number(result.metrics.durationMs.toFixed(2))} />
                      </Col>
                      <Col xs={12} sm={8} xl={4}>
                        <Statistic className="compact-stat" title="Độ sâu lời giải" value={result.metrics.solutionDepth ?? 'Không có'} />
                      </Col>
                      <Col xs={12} sm={8} xl={4}>
                        <Statistic className="compact-stat" title="Chi phí lời giải" value={result.metrics.solutionCost ?? 'Không có'} />
                      </Col>
                    </Row>
                    <Divider />
                    <Flex gap={8} wrap>
                      <Tag color={result.metrics.optimalGuaranteed ? 'green' : 'orange'}>
                        {result.metrics.optimalGuaranteed ? 'Có bảo đảm tối ưu' : 'Không bảo đảm tối ưu'}
                      </Tag>
                      <Tag color={result.solutionNodeId ? 'blue' : 'red'}>
                        {result.solutionNodeId ? 'Đã tìm thấy lời giải' : 'Chưa tìm thấy lời giải'}
                      </Tag>
                      {result.heuristic && <Tag color="gold">Hàm đánh giá: {result.heuristic}</Tag>}
                    </Flex>
                  </>
                ) : (
                  <Alert type="warning" message="Chưa có kết quả" description="Chọn thuật toán và bấm Chạy thuật toán." />
                )}
              </Card>
            </Space>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="dashboard-row">
          <Col xs={24}>
            <Card title="Bảng so sánh kết quả (chạy lần lượt)" className="history-card">
              <Table
                rowKey="key"
                columns={compareColumns}
                dataSource={historyRows}
                pagination={{ pageSize: 6 }}
                locale={{ emptyText: 'Chưa có dữ liệu so sánh. Hãy chạy thêm thuật toán.' }}
              />
            </Card>
          </Col>
        </Row>
        </Content>
      </Layout>
    </ConfigProvider>
  )
}

export default App
