import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { mosaicRows, mosaicTotal, type MosaicShape } from './CapMosaic'
import { readJSON, writeJSON } from '../hooks/useLocalList'
import './MuralView.css'

const CAP_R = 9 // 뚜껑 반지름(px) — 확대 뷰에서는 톱니·하이라이트가 보이는 크기
const GAP = 5

type Props = {
  shape: MosaicShape
  title: string
  desc: string
  live?: boolean // 진행 중인 벽화 — 잔을 들어 직접 뚜껑을 보탤 수 있다
  baseCheers?: number // 나의 기여를 제외한 잔 수
  goal?: number
  doneCount?: string // 완성작의 표기 (예: "18,204잔으로 완성")
  onClose: () => void
}

// 벽화 확대 뷰: 톱니 달린 진짜 병뚜껑들로 그려지고, 잔을 들어 직접 기여한다
export default function MuralView({
  shape,
  title,
  desc,
  live = false,
  baseCheers = 0,
  goal = 1,
  doneCount,
  onClose,
}: Props) {
  const reducedMotion = useReducedMotion()
  const rows = mosaicRows(shape)
  const total = mosaicTotal(shape)

  // 내가 이 벽화에 보탠 뚜껑 — 앰버색으로 박힌다
  const [myCaps, setMyCaps] = useState(() => readJSON<number>('chg.muralExtra', 0))
  const [clink, setClink] = useState(0)

  const cheers = baseCheers + myCaps
  const filled = live
    ? Math.min(cheers > 0 ? Math.max(1, Math.round(Math.min(cheers / goal, 1) * total)) : 0, total)
    : total
  const amberTail = live ? Math.min(myCaps, filled) : 0

  const contribute = () => {
    const next = myCaps + 1
    setMyCaps(next)
    setClink((c) => c + 1)
    writeJSON('chg.muralExtra', next)
    navigator.vibrate?.(20)
    window.dispatchEvent(new Event('chg:raise'))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // 아래 행부터 채우는 순번 계산 (CapMosaic과 동일 규칙)
  const rowStart: number[] = new Array(rows.length)
  let below = 0
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    rowStart[i] = below
    below += rows[i]
  }

  const cell = CAP_R * 2 + GAP
  const maxW = Math.max(...rows)
  const width = maxW * cell
  const height = rows.length * cell

  return (
    <motion.div
      className="muralview"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} 크게 보기`}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <p className="muralview-title">
        {title}
        {!live && <span className="muralview-done">완성</span>}
      </p>
      <p className="muralview-desc">{desc}</p>

      <div className="muralview-stage">
        <motion.svg
          viewBox={`0 0 ${width} ${height}`}
          className="muralview-art"
          style={{ width: width * 1.35 }}
          initial={reducedMotion ? false : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <defs>
            <radialGradient id="mv-green" cx="0.32" cy="0.28" r="0.85">
              <stop offset="0%" stopColor="#3cb489" />
              <stop offset="55%" stopColor="#0B5C3F" />
              <stop offset="100%" stopColor="#05301f" />
            </radialGradient>
            <radialGradient id="mv-amber" cx="0.32" cy="0.28" r="0.85">
              <stop offset="0%" stopColor="#f5c06a" />
              <stop offset="55%" stopColor="#E8A13D" />
              <stop offset="100%" stopColor="#8a5e18" />
            </radialGradient>
          </defs>
          {rows.map((rowWidth, rowIdx) =>
            Array.from({ length: rowWidth }, (_, i) => {
              const order = rowStart[rowIdx] + i
              const isFilled = order < filled
              const isMine = isFilled && order >= filled - amberTail
              const cx = (width - rowWidth * cell) / 2 + i * cell + cell / 2
              const cy = rowIdx * cell + cell / 2
              if (!isFilled) {
                return (
                  <circle
                    key={`${rowIdx}-${i}`}
                    cx={cx}
                    cy={cy}
                    r={CAP_R - 1}
                    fill="rgba(250, 249, 244, 0.06)"
                    stroke="rgba(250, 249, 244, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="2.5 3"
                  />
                )
              }
              return (
                <g
                  key={`${rowIdx}-${i}`}
                  className="muralview-cap"
                  style={{ animationDelay: `${order * 10}ms` }}
                >
                  {/* 뚜껑 본체 */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={CAP_R}
                    fill={isMine ? 'url(#mv-amber)' : 'url(#mv-green)'}
                  />
                  {/* 톱니 주름 */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={CAP_R - 1.2}
                    fill="none"
                    stroke={isMine ? '#7a5213' : '#04281a'}
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeDasharray="0.1 3.2"
                    opacity="0.85"
                  />
                  {/* 유리 하이라이트 */}
                  <ellipse
                    cx={cx - CAP_R * 0.3}
                    cy={cy - CAP_R * 0.35}
                    rx={CAP_R * 0.32}
                    ry={CAP_R * 0.2}
                    fill="#ffffff"
                    opacity="0.4"
                  />
                </g>
              )
            }),
          )}
        </motion.svg>
      </div>

      {live ? (
        <>
          <p className="muralview-count">
            {cheers.toLocaleString()} / {goal.toLocaleString()}잔
            {myCaps > 0 && <strong> · 내가 보탠 뚜껑 {myCaps}개</strong>}
          </p>
          <motion.button
            type="button"
            className="muralview-raise"
            onClick={contribute}
            aria-label="이 벽화에 잔 들어 뚜껑 보태기"
            animate={clink > 0 && !reducedMotion ? { rotate: [0, -12, 8, 0] } : undefined}
            transition={{ duration: 0.4 }}
            key={clink}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M8.1 11.2 7.6 4h8.8l-.5 7.2Z" fill="currentColor" stroke="none" opacity="0.5" />
              <path d="M7 4h10l-1.2 15a2 2 0 0 1-2 1.8H10.2a2 2 0 0 1-2-1.8L7 4Z" />
            </svg>
            이 벽화에 잔 들기
          </motion.button>
        </>
      ) : (
        <p className="muralview-count">{doneCount} · 라벨로 인쇄되어 병에 붙었습니다</p>
      )}

      <button type="button" className="muralview-close" onClick={onClose} aria-label="닫기">
        닫기
      </button>
    </motion.div>
  )
}
