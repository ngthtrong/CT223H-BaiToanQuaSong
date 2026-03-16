import { Card, Typography } from 'antd'
import type { AlgorithmType } from '../types/puzzle'

const { Text } = Typography

const PSEUDOCODE: Record<AlgorithmType, string[]> = {
  BFS: [
    '1. biên <- Hàng đợi(trạng thái đầu)',
    '2. khi biên chưa rỗng:',
    '3.   nút <- lấy ra khỏi đầu hàng đợi',
    '4.   nếu nút là đích: trả về đường đi',
    '5.   sinh các con hợp lệ và thêm vào biên',
  ],
  DFS: [
    '1. biên <- Ngăn xếp(trạng thái đầu)',
    '2. khi biên chưa rỗng:',
    '3.   nút <- lấy đỉnh ngăn xếp',
    '4.   nếu nút là đích: trả về đường đi',
    '5.   đẩy các con hợp lệ vào ngăn xếp',
  ],
  IDS: [
    '1. cho độ sâu = 0..độ sâu tối đa:',
    '2.   chạy DFS giới hạn độ sâu',
    '3.   nếu tìm thấy đích: trả về đường đi',
    '4.   ngược lại tăng giới hạn độ sâu',
  ],
  'A*': [
    '1. biên <- Hàng đợi ưu tiên theo f=g+h',
    '2. khi biên chưa rỗng:',
    '3.   nút <- lấy nút có f nhỏ nhất',
    '4.   nếu nút là đích: trả về đường đi',
    '5.   cập nhật các nút con và biên',
  ],
  Greedy: [
    '1. biên <- Hàng đợi ưu tiên theo h',
    '2. khi biên chưa rỗng:',
    '3.   nút <- lấy nút có h nhỏ nhất',
    '4.   nếu nút là đích: trả về đường đi',
    '5.   thêm con theo thứ tự heuristic',
  ],
  'IDA*': [
    '1. ngưỡng <- h(trạng thái đầu)',
    '2. chạy DFS với điều kiện f <= ngưỡng',
    '3. nếu tìm thấy đích: trả về đường đi',
    '4. ngưỡng <- giá trị f vượt ngưỡng nhỏ nhất kế tiếp',
    '5. lặp lại đến khi tìm thấy hoặc hết khả năng',
  ],
}

interface PseudocodePanelProps {
  algorithm: AlgorithmType
  activeLine: number
}

export function PseudocodePanel({ algorithm, activeLine }: PseudocodePanelProps) {
  const lines = PSEUDOCODE[algorithm]

  return (
    <Card className="pseudo-card">
      <div className="pseudo-lines">
        {lines.map((line, index) => (
          <div key={line} className={`pseudo-line ${index === activeLine ? 'active' : ''}`}>
            <Text code>{line}</Text>
          </div>
        ))}
      </div>
    </Card>
  )
}
