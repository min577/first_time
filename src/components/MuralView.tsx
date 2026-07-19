import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { gridOrders, gridTotal, type DotGrid } from './mosaicText'
import { readJSON, writeJSON } from '../hooks/useLocalList'
import './MuralView.css'

const CAP_R = 7 // 뚜껑 반지름(px) — 확대 뷰에서는 톱니·하이라이트가 보이는 크기
const GAP = 4

type Flight = { id: number; sx: number; sy: number; tx: number; ty: number; size: number }

type Props = {
  grid: DotGrid // 글자 도트 그리드
  title: string
  desc: string
  live?: boolean // 진행 중인 벽화 — 잔을 탭해 직접 뚜껑을 보탤 수 있다
  baseCheers?: number // 나의 기여를 제외한 잔 수
  goal?: number
  doneCount?: string // 완성작의 표기 (예: "18,204잔으로 완성")
  onClose: () => void
}

// 벽화 확대 뷰: 잔을 탭하면 뚜껑이 포물선으로 날아가 글자에 박힌다
export default function MuralView({
  grid,
  title,
  desc,
  live = false,
  baseCheers = 0,
  goal = 1,
  doneCount,
  onClose,
}: Props) {
  const reducedMotion = useReducedMotion()
  const total = gridTotal(grid)
  const orders = useMemo(() => gridOrders(grid), [grid])

  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const glassRef = useRef<HTMLButtonElement>(null)
  const flightId = useRef(0)

  // 내가 이 벽화에 보탠 뚜껑 — 앰버색으로 박힌다
  const [myCaps, setMyCaps] = useState(() => readJSON<number>('chg.muralExtra', 0))
  const [flights, setFlights] = useState<Flight[]>([])
  const [clink, setClink] = useState(0)
  const [waveDone, setWaveDone] = useState(false)

  const cheers = baseCheers + myCaps
  const filled = live
    ? Math.min(cheers > 0 ? Math.max(1, Math.round(Math.min(cheers / goal, 1) * total)) : 0, total)
    : total
  const amberTail = live ? Math.min(myCaps, filled) : 0
  const complete = filled >= total

  // 최초 등장 스태거 웨이브가 끝나면, 이후 박히는 뚜껑은 즉시 팝
  useEffect(() => {
    const timer = window.setTimeout(() => setWaveDone(true), total * 10 + 500)
    return () => window.clearTimeout(timer)
  }, [total])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const cell = CAP_R * 2 + GAP
  const cols = grid[0]?.length ?? 1
  const width = cols * cell
  const height = grid.length * cell

  // order번째 뚜껑의 SVG 좌표 (아래 행부터, 왼쪽에서 오른쪽)
  const positions = useMemo(() => {
    const out: { cx: number; cy: number }[] = []
    for (let r = grid.length - 1; r >= 0; r -= 1) {
      for (let c = 0; c < grid[r].length; c += 1) {
        if (grid[r][c]) out[orders[r][c] as number] = {
          cx: c * cell + cell / 2,
          cy: r * cell + cell / 2,
        }
      }
    }
    return out
  }, [grid, orders, cell])

  const capPos = (order: number) => positions[order] ?? { cx: width / 2, cy: height / 2 }

  const commit = () => {
    setMyCaps((prev) => {
      const next = prev + 1
      writeJSON('chg.muralExtra', next)
      return next
    })
    window.dispatchEvent(new Event('chg:raise'))
  }

  // 잔 탭 → 뚜껑이 잔에서 다음 빈 소켓으로 포물선 비행
  const launch = () => {
    if (!live || complete) return
    setClink((c) => c + 1)
    navigator.vibrate?.(15)

    if (reducedMotion) {
      commit()
      return
    }

    const cont = containerRef.current?.getBoundingClientRect()
    const svg = svgRef.current?.getBoundingClientRect()
    const glass = glassRef.current?.getBoundingClientRect()
    if (!cont || !svg || !glass) {
      commit()
      return
    }

    const scale = svg.width / width
    const targetOrder = Math.min(filled + flights.length, total - 1)
    const { cx, cy } = capPos(targetOrder)
    const id = (flightId.current += 1)
    setFlights((prev) => [
      ...prev,
      {
        id,
        sx: glass.left - cont.left + glass.width / 2,
        sy: glass.top - cont.top + 8,
        tx: svg.left - cont.left + cx * scale,
        ty: svg.top - cont.top + cy * scale,
        size: CAP_R * 2 * scale,
      },
    ])
  }

  const land = (id: number) => {
    setFlights((prev) => prev.filter((f) => f.id !== id))
    commit()
    navigator.vibrate?.(10)
  }

  return (
    <motion.div
      ref={containerRef}
      className="muralview"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} 크게 보기`}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <p className="muralview-eyebrow">개교 벽화 갤러리</p>
      <p className="muralview-title">
        {title}
        {!live && <span className="muralview-done">완성</span>}
      </p>
      <p className="muralview-desc">{desc}</p>

      {/* 액자 — 병 라벨식 이중 괘선 프레임 */}
      <div className={`muralview-frame${live ? ' is-live' : ''}`}>
        <motion.svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="muralview-art"
          style={{ width: Math.min(width * 1.05, 300) }}
          initial={reducedMotion ? false : { scale: 0.85, opacity: 0 }}
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
          {grid.map((row, rowIdx) =>
            row.map((isLetter, colIdx) => {
              if (!isLetter) return null
              const order = orders[rowIdx][colIdx] as number
              const isFilled = order < filled
              const isMine = isFilled && order >= filled - amberTail
              const cx = colIdx * cell + cell / 2
              const cy = rowIdx * cell + cell / 2
              if (!isFilled) {
                return (
                  <circle
                    key={`${rowIdx}-${colIdx}`}
                    cx={cx}
                    cy={cy}
                    r={CAP_R - 1}
                    fill="rgba(250, 249, 244, 0.05)"
                    stroke="rgba(250, 249, 244, 0.28)"
                    strokeWidth="1"
                    strokeDasharray="2.5 3"
                  />
                )
              }
              return (
                <g
                  key={`${rowIdx}-${colIdx}`}
                  className="muralview-cap"
                  style={{ animationDelay: waveDone ? '0ms' : `${order * 10}ms` }}
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

      {/* 통계 */}
      <div className="muralview-stats">
        {live ? (
          <>
            <span className="muralview-stat">
              모인 잔 <strong>{cheers.toLocaleString()}</strong> / {goal.toLocaleString()}
            </span>
            {myCaps > 0 && (
              <span className="muralview-stat is-mine">
                내 뚜껑 <strong>{myCaps}</strong>
              </span>
            )}
          </>
        ) : (
          <span className="muralview-stat">{doneCount} · 라벨로 인쇄되어 병에 붙었습니다</span>
        )}
      </div>

      {/* 기여 — 버튼이 아니라 테이블 위에 놓인 잔 */}
      {live && (
        <div className="muralview-table">
          <motion.button
            ref={glassRef}
            type="button"
            className="muralview-glass"
            onClick={launch}
            disabled={complete}
            aria-label="잔을 탭해 건배 — 뚜껑이 벽화에 박힙니다"
            animate={clink > 0 && !reducedMotion ? { rotate: [0, -16, 10, 0] } : undefined}
            transition={{ duration: 0.4 }}
            key={clink}
          >
            <svg
              viewBox="0 0 40 44"
              width="44"
              height="48"
              aria-hidden="true"
            >
              <path d="M12.5 19 11.6 6h16.8l-.9 13Z" fill="var(--amber)" />
              <path
                d="M11 6h18l-1.9 28.5a3.2 3.2 0 0 1-3.2 3H16.1a3.2 3.2 0 0 1-3.2-3L11 6Z"
                fill="none"
                stroke="var(--paper)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <ellipse cx="15.5" cy="14" rx="1.7" ry="4.5" fill="#ffffff" opacity="0.35" />
            </svg>
          </motion.button>
          <p className="muralview-table-hint">
            {complete ? '벽화가 완성됐습니다!' : '잔을 탭해 건배 — 뚜껑이 벽화에 박힙니다'}
          </p>
        </div>
      )}

      {/* 날아가는 뚜껑들 */}
      {flights.map((flight) => (
        <motion.span
          key={flight.id}
          className="muralview-flight"
          style={{ width: flight.size, height: flight.size }}
          initial={{ x: flight.sx - flight.size / 2, y: flight.sy - flight.size / 2, scale: 0.6 }}
          animate={{
            x: [
              flight.sx - flight.size / 2,
              (flight.sx + flight.tx) / 2 - flight.size / 2,
              flight.tx - flight.size / 2,
            ],
            y: [
              flight.sy - flight.size / 2,
              Math.min(flight.sy, flight.ty) - 64 - flight.size / 2,
              flight.ty - flight.size / 2,
            ],
            scale: [0.6, 1.15, 1],
            rotate: [0, 200, 380],
          }}
          transition={{ duration: 0.55, times: [0, 0.5, 1], ease: 'easeOut' }}
          onAnimationComplete={() => land(flight.id)}
          aria-hidden="true"
        />
      ))}

      <button type="button" className="muralview-close" onClick={onClose} aria-label="닫기">
        닫기
      </button>
    </motion.div>
  )
}
