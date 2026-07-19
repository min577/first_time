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

  // 잔 내부 높이: viewBox y 18(위)~130(아래)
  const fillHeight = (target / 100) * 112

  return (
    <button type="button" className="entrystats" onClick={go} aria-label="강의실로 입장하기">
      <p className="entrystats-eyebrow">출석 확인</p>

      <svg viewBox="0 0 120 140" className="entrystats-glass" aria-hidden="true">
        <defs>
          <clipPath id="entry-glass-clip">
            <path d="M22,18 L98,18 L88,124 Q60,134 32,124 Z" />
          </clipPath>
        </defs>
        <motion.rect
          x="0"
          width="120"
          clipPath="url(#entry-glass-clip)"
          fill="var(--amber)"
          initial={
            reducedMotion
              ? { y: 130 - fillHeight, height: fillHeight }
              : { y: 130, height: 0 }
          }
          animate={{ y: 130 - fillHeight, height: fillHeight }}
          transition={{ duration: FILL_MS / 1000, ease: 'easeOut', delay: 0.15 }}
        />
        <path
          d="M22,18 L32,124 Q60,134 88,124 L98,18"
          fill="none"
          stroke="var(--paper)"
          strokeWidth="4"
          strokeLinecap="round"
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
