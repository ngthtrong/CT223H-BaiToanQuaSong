import { Card } from 'antd'
import boatImage from '../assets/boat.svg'
import cabbageImage from '../assets/cabbage.svg'
import farmerImage from '../assets/farmer.svg'
import goatImage from '../assets/goat.svg'
import wolfImage from '../assets/wolf.svg'
import type { PuzzleState } from '../types/puzzle'

interface RiverSceneProps {
  state: PuzzleState
}

interface EntityMeta {
  key: keyof PuzzleState
  label: string
  shortCode: string
  image: string
}

const entityMap: Record<keyof PuzzleState, EntityMeta> = {
  farmer: { key: 'farmer', label: 'Nông dân', shortCode: 'F', image: farmerImage },
  wolf: { key: 'wolf', label: 'Sói', shortCode: 'S', image: wolfImage },
  goat: { key: 'goat', label: 'Dê', shortCode: 'D', image: goatImage },
  cabbage: { key: 'cabbage', label: 'Bắp cải', shortCode: 'B', image: cabbageImage },
}

const renderBank = (state: PuzzleState, side: 'L' | 'R'): EntityMeta[] => {
  return (Object.keys(state) as Array<keyof PuzzleState>)
    .filter((key) => state[key] === side)
    .map((key) => entityMap[key])
}

export function RiverScene({ state }: RiverSceneProps) {
  const leftBank = renderBank(state, 'L')
  const rightBank = renderBank(state, 'R')
  const boatRight = state.farmer === 'R'

  return (
    <Card className="river-card">
      <div className="river-wrap">
        <div className="bank left">
          <h4>Bờ trái</h4>
          <div className="tokens">
            {leftBank.length === 0 ? (
              <div className="token-empty">Trống</div>
            ) : (
              leftBank.map((entity) => (
                <div key={entity.key} className="entity-token">
                  <img src={entity.image} alt={entity.label} className="entity-avatar" />
                  <span>{entity.label}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="river">
          <div className={`boat ${boatRight ? 'right' : 'left'}`}>
            <img src={boatImage} alt="Thuyền" className="boat-image" />
          </div>
        </div>

        <div className="bank right">
          <h4>Bờ phải</h4>
          <div className="tokens">
            {rightBank.length === 0 ? (
              <div className="token-empty">Trống</div>
            ) : (
              rightBank.map((entity) => (
                <div key={entity.key} className="entity-token">
                  <img src={entity.image} alt={entity.label} className="entity-avatar" />
                  <span>{entity.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </Card>
  )
}
