import { readJSON } from '../hooks/useLocalList'
import './StatusStrip.css'

const STAMP_GOAL = 5

// 나의 출석부: 도장 적립과 고백권 잔량을 앱 안에서도 상시 노출
export default function StatusStrip() {
  const stamps = readJSON<number>('chg.stamps', 0)
  const tickets = readJSON<number>('chg.tickets', 0)

  return (
    <div className="statusstrip" aria-label={`도장 ${stamps}개, 고백권 ${tickets}장`}>
      <span className="statusstrip-dots" aria-hidden="true">
        {Array.from({ length: STAMP_GOAL }, (_, i) => (
          <span
            key={i}
            className={`statusstrip-dot${i < Math.min(stamps, STAMP_GOAL) ? ' is-filled' : ''}`}
          />
        ))}
      </span>
      <span className="statusstrip-text">
        도장 {stamps}개{stamps >= STAMP_GOAL ? ' · 개근상 달성!' : ''} · 고백권 {tickets}장
      </span>
    </div>
  )
}
