import { motion } from 'framer-motion'
import './CapMosaic.css'

// 실루엣을 행 폭 배열(위→아래)로 정의 — 뚜껑이 아래부터 쌓여 형태를 완성한다
const SHAPES = {
  glass: [9, 9, 8, 8, 8, 7, 7, 6], // 소주잔 (위가 넓다)
  bottle: [2, 2, 2, 3, 5, 7, 8, 8, 8, 8, 8, 8, 8, 7], // 소주병
  cap: [4, 6, 8, 9, 9, 9, 9, 8, 6, 4], // 병뚜껑 (원형)
}

export type MosaicShape = keyof typeof SHAPES

export function mosaicTotal(shape: MosaicShape): number {
  return SHAPES[shape].reduce((a, b) => a + b, 0)
}

export function mosaicRows(shape: MosaicShape): number[] {
  return SHAPES[shape]
}

type Props = {
  shape: MosaicShape
  filled: number // 채워진 뚜껑 수 (0..total)
  dot?: number // 뚜껑 지름(px)
  justAdded?: boolean // 방금 잔을 들었다 — 마지막 뚜껑(내 뚜껑)이 앰버로 쾅 박힌다
  animateIn?: boolean // 등장 시 뚜껑이 아래부터 하나씩 박히는 스태거 웨이브
}

export default function CapMosaic({
  shape,
  filled,
  dot = 6,
  justAdded = false,
  animateIn = false,
}: Props) {
  const rows = SHAPES[shape]
  const total = mosaicTotal(shape)
  const capped = Math.max(0, Math.min(filled, total))

  // 각 행의 '아래에서부터 순번' 시작값 — 아래 행부터 차오르게 한다
  const rowStart: number[] = new Array(rows.length)
  let below = 0
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    rowStart[i] = below
    below += rows[i]
  }

  return (
    <div className="capmosaic" aria-hidden="true">
      {rows.map((width, rowIdx) => (
        <div key={rowIdx} className="capmosaic-row">
          {Array.from({ length: width }, (_, i) => {
            const order = rowStart[rowIdx] + i
            const isFilled = order < capped
            const isMine = justAdded && order === capped - 1
            if (isMine) {
              return (
                <motion.span
                  key={i}
                  className="capmosaic-dot is-filled is-mine"
                  style={{ width: dot, height: dot }}
                  initial={{ scale: 2.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              )
            }
            return (
              <span
                key={i}
                className={`capmosaic-dot${isFilled ? ' is-filled' : ''}${
                  isFilled && animateIn ? ' is-pop' : ''
                }`}
                style={{
                  width: dot,
                  height: dot,
                  ...(isFilled && animateIn ? { animationDelay: `${order * 14}ms` } : {}),
                }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
