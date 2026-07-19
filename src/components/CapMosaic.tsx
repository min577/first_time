import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { gridOrders, type DotGrid } from './mosaicText'
import './CapMosaic.css'

type Props = {
  grid: DotGrid // 글자(또는 형태)의 도트 그리드
  filled: number // 채워진 뚜껑 수 (0..total)
  dot?: number // 뚜껑 지름(px)
  justAdded?: boolean // 방금 잔을 들었다 — 마지막 뚜껑(내 뚜껑)이 앰버로 쾅 박힌다
  animateIn?: boolean // 등장 시 뚜껑이 아래부터 하나씩 박히는 스태거 웨이브
}

export default function CapMosaic({
  grid,
  filled,
  dot = 5,
  justAdded = false,
  animateIn = false,
}: Props) {
  const orders = useMemo(() => gridOrders(grid), [grid])

  return (
    <div className="capmosaic" aria-hidden="true">
      {grid.map((row, rowIdx) => (
        <div key={rowIdx} className="capmosaic-row">
          {row.map((isLetter, colIdx) => {
            const style = { width: dot, height: dot }
            if (!isLetter) {
              return <span key={colIdx} className="capmosaic-dot is-void" style={style} />
            }
            const order = orders[rowIdx][colIdx] ?? 0
            const isFilled = order < filled
            const isMine = justAdded && order === filled - 1
            if (isMine) {
              return (
                <motion.span
                  key={colIdx}
                  className="capmosaic-dot is-filled is-mine"
                  style={style}
                  initial={{ scale: 2.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              )
            }
            return (
              <span
                key={colIdx}
                className={`capmosaic-dot${isFilled ? ' is-filled' : ''}${
                  isFilled && animateIn ? ' is-pop' : ''
                }`}
                style={{
                  ...style,
                  ...(isFilled && animateIn ? { animationDelay: `${order * 12}ms` } : {}),
                }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
