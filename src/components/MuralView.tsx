import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { gridOrders, gridTotal, type DotGrid } from './mosaicText'
import { readJSON, writeJSON } from '../hooks/useLocalList'
import './MuralView.css'

const CAP_R = 7 // 뚜껑 반지름(px) — 확대 뷰에서는 톱니·하이라이트가 보이는 크기
const GAP = 4

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

  // 내가 이 벽화에 보탠 뚜껑 — 앰버색으로 박힌다
  const [myCaps, setMyCaps] = useState(() => readJSON<number>('chg.muralExtra', 0))
  const [pending, setPending] = useState<{ cx: number; cy: number } | null>(null)
  const [clink, setClink] = useState(0)
  const [waveDone, setWaveDone] = useState(false)

  // 병을 딸 때(입장)마다 뚜껑이 하나 생긴다 — 무제한이 아니다
  const stamps = readJSON<number>('chg.stamps', 0)
  const remaining = Math.max(0, stamps - myCaps)

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

  // 뚜껑 누르기 → 다음 자리가 은은히 빛나고, 그 자리에서 뚜껑이 스며나듯 맺힌다
  const attach = () => {
    if (!live || complete || remaining <= 0 || pending) return
    setClink((c) => c + 1)
    navigator.vibrate?.(12)

    if (reducedMotion) {
      commit()
      return
    }

    const target = capPos(Math.min(filled, total - 1))
    setPending(target)
    window.setTimeout(() => {
      commit()
      setPending(null)
      navigator.vibrate?.(8)
    }, 430)
  }

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
      <p className="muralview-eyebrow">개교 벽화 갤러리</p>
      <p className="muralview-title">
        {title}
        {!live && <span className="muralview-done">완성</span>}
      </p>
      <p className="muralview-desc">{desc}</p>

      {/* 액자 — 병 라벨식 이중 괘선 프레임 */}
      <div className={`muralview-frame${live ? ' is-live' : ''}`}>
        <motion.svg
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

          {/* 뚜껑이 맺히는 자리 — 앰버 빛이 잉크 번지듯 퍼진다 */}
          {pending && (
            <g>
              <motion.circle
                cx={pending.cx}
                cy={pending.cy}
                fill="var(--amber)"
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: CAP_R * 0.9, opacity: 0.55 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
              <motion.circle
                cx={pending.cx}
                cy={pending.cy}
                fill="none"
                stroke="var(--amber)"
                strokeWidth="2"
                initial={{ r: 2, opacity: 0.9 }}
                animate={{ r: cell * 1.6, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </g>
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

      {/* 기여 — 손에 쥔 내 뚜껑. 누르면 벽화에 스며나듯 맺힌다 */}
      {live && (
        <div className="muralview-table">
          <motion.button
            type="button"
            className="muralview-glass"
            onClick={attach}
            disabled={complete || remaining <= 0 || pending !== null}
            aria-label="뚜껑을 눌러 벽화에 붙이기"
            animate={clink > 0 && !reducedMotion ? { scale: [1, 0.82, 1.06, 1] } : undefined}
            transition={{ duration: 0.35 }}
            key={clink}
          >
            {/* 실제 처음처럼 병뚜껑 (윗면) - 초록 톱니 캡에 흰 붓글씨 로고 */}
            <svg viewBox="0 0 52 52" width="50" height="50" aria-hidden="true">
              <defs>
                <radialGradient id="mv-realcap" cx="0.35" cy="0.3" r="0.9">
                  <stop offset="0%" stopColor="#4cbf7e" />
                  <stop offset="55%" stopColor="#1e8a62" />
                  <stop offset="100%" stopColor="#0b5c3f" />
                </radialGradient>
              </defs>
              {/* 톱니 주름 */}
              {Array.from({ length: 20 }, (_, i) => {
                const angle = (i / 20) * Math.PI * 2
                return (
                  <circle
                    key={i}
                    cx={26 + Math.cos(angle) * 22}
                    cy={26 + Math.sin(angle) * 22}
                    r="2.6"
                    fill="#0b5c3f"
                  />
                )
              })}
              <circle cx="26" cy="26" r="22" fill="url(#mv-realcap)" />
              {/* 상판 프레스 라인 */}
              <circle
                cx="26"
                cy="26"
                r="18"
                fill="none"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="1"
              />
              {/* 두루미 */}
              <path
                d="M21.5,14.5 q2.5,-2.6 4.5,-0.3 q2,-2.3 4.5,-0.6"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              {/* 붓글씨 로고 */}
              <text
                x="26"
                y="26.5"
                textAnchor="middle"
                fill="#ffffff"
                fontFamily="var(--font-display)"
                fontWeight="700"
                fontSize="9.5"
              >
                처음
              </text>
              <text
                x="26"
                y="37"
                textAnchor="middle"
                fill="#ffffff"
                fontFamily="var(--font-display)"
                fontWeight="700"
                fontSize="9.5"
              >
                처럼
              </text>
              {/* 금속 광택 */}
              <ellipse cx="19" cy="16" rx="6.5" ry="4" fill="#ffffff" opacity="0.28" />
            </svg>
          </motion.button>
          <p className="muralview-table-hint">
            {complete
              ? '벽화가 완성됐습니다!'
              : remaining > 0
                ? `내 뚜껑 ${remaining}개 · 눌러서 벽화에 붙이기`
                : '뚜껑을 다 붙였습니다 · 새 병을 따면 또 생깁니다'}
          </p>
        </div>
      )}

      <button type="button" className="muralview-close" onClick={onClose} aria-label="닫기">
        닫기
      </button>
    </motion.div>
  )
}
