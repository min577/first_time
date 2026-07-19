import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { CONFESSIONS } from '../data/confessions'
import { readJSON } from '../hooks/useLocalList'
import './EntryStats.css'

// 개교 벽화와 같은 수치 (고백실 참조) — 이번 주 모인 잔의 총량
const WEEK_GOAL = 20000
// 이번 학기 누적 출석 시드 — 내 도장 수가 더해져 'N번째 출석'이 된다
const ATTENDEE_SEED = 24846

const AUTO_MS = 2600
const FILL_MS = 1200

// 입장 직후 인터스티셜: 이번 주의 잔이 몇 % 찼는지 + 나는 몇 번째 출석인지
export default function EntryStats() {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()

  const weekCheers =
    CONFESSIONS.reduce((sum, c) => sum + c.cheers, 0) +
    readJSON<string[]>('chg.raised', []).length
  const target = Math.round(Math.min(weekCheers / WEEK_GOAL, 1) * 100)
  const attendee = ATTENDEE_SEED + readJSON<number>('chg.stamps', 0)

  const [pct, setPct] = useState(reducedMotion ? target : 0)

  // 퍼센트 카운트업 — 잔이 차오르는 속도와 맞춘다
  useEffect(() => {
    if (reducedMotion) return
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min((t - start) / FILL_MS, 1)
      setPct(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reducedMotion, target])

  const go = () => navigate('/app/courses')

  useEffect(() => {
    const timer = window.setTimeout(go, reducedMotion ? 1200 : AUTO_MS)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 잔 내부 높이: viewBox y 18(위)~130(아래). 수면(물결 중심)이 이 높이에 맞춰 올라온다
  const fillHeight = (target / 100) * 112
  const liquidY = 127 - fillHeight

  // 주기 40px짜리 물결 — x를 -40→0으로 무한 이동시키면 이음새 없이 흐른다
  const wave =
    'M-40,6 Q-30,0 -20,6 T0,6 T20,6 T40,6 T60,6 T80,6 T100,6 T120,6 T140,6 T160,6'

  return (
    <button type="button" className="entrystats" onClick={go} aria-label="강의실로 입장하기">
      <p className="entrystats-eyebrow">출석 확인</p>

      <svg viewBox="0 0 120 140" className="entrystats-glass" aria-hidden="true">
        <defs>
          {/* 유리 두께만큼 안쪽 — 액체는 잔벽에 닿지 않고 이 안에서만 찬다 */}
          <clipPath id="entry-glass-inner">
            <path d="M26,21 L94,21 L85,121 Q60,130 35,121 Z" />
          </clipPath>
          <linearGradient id="entry-liquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F3BA5E" />
            <stop offset="1" stopColor="#D28E29" />
          </linearGradient>
        </defs>

        {/* 유리 몸체 — 액체가 담기기 전에도 그릇이 보인다 */}
        <path d="M22,18 L98,18 L88,124 Q60,134 32,124 Z" fill="rgba(255, 255, 255, 0.08)" />

        <g clipPath="url(#entry-glass-inner)">
          {/* 술이 차오른다 — 수면은 물결치며 좌우로 흐른다 */}
          <motion.g
            initial={reducedMotion ? { y: liquidY } : { y: 132 }}
            animate={{ y: liquidY }}
            transition={{ duration: FILL_MS / 1000, ease: 'easeOut', delay: 0.15 }}
          >
            <motion.g
              animate={reducedMotion ? undefined : { x: [-40, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
            >
              <path d={`${wave} L160,150 L-40,150 Z`} fill="url(#entry-liquid)" />
              {/* 수면 하이라이트 */}
              <path d={wave} fill="none" stroke="#FBE3B4" strokeWidth="1.6" opacity="0.75" />
            </motion.g>
            {/* 잔 벽에 비치는 술 반사광 */}
            <ellipse cx="38" cy="46" rx="5" ry="26" fill="#ffffff" opacity="0.18" />
          </motion.g>
        </g>

        <path
          d="M22,18 L32,124 Q60,134 88,124 L98,18"
          fill="none"
          stroke="var(--paper)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* 잔 입구 림 — 위에서 본 타원이 그릇의 깊이를 만든다 */}
        <ellipse
          cx="60"
          cy="18"
          rx="38"
          ry="4.5"
          fill="none"
          stroke="rgba(250, 249, 244, 0.55)"
          strokeWidth="2"
        />
      </svg>

      <p className="entrystats-pct">{pct}%</p>
      <p className="entrystats-title">이번 주의 잔이 차오르고 있습니다</p>
      <p className="entrystats-desc">
        지금까지 {weekCheers.toLocaleString()}잔 · 잔이 가득 차면 이번 주 라벨이 인쇄됩니다
      </p>
      <p className="entrystats-attendee">당신은 {attendee.toLocaleString()}번째 출석입니다</p>

      <p className="entrystats-hint">잠시 후 강의실로 이동합니다 · 탭하면 바로</p>
    </button>
  )
}
