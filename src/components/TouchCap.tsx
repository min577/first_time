import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { readJSON } from '../hooks/useLocalList'
import { registerEntry } from './entrance'
import StampMark from './StampMark'
import './TouchCap.css'

const CAP_RADIUS = 300 // 세 접점이 이 반경의 원 안에 모여 있으면 터치캡으로 인식

// 스탬프 쾅(0.25s) + 잉크 번짐(0.5s) → "출석 완료" 0.6s 노출 후 이동
const NAVIGATE_DELAY_MS = 950
const HOLD_MS = 600 // 꾹 눌러 찍기: 이만큼 누르면 도장이 찍힌다
const STAMP_GOAL = 5

type Props = {
  onEntered?: () => void // 지정 시 기본 네비게이션 대신 호출 (입장 통계 인터스티셜용)
}

// 꾹 눌러 찍기: 누르는 동안 잉크 링이 차오르고, 다 차면 도장이 쾅 찍힌다.
// 홀드는 연출이지 조건이 아니다 — 짧은 탭으로도 입장된다.
export default function TouchCap({ onEntered }: Props) {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const [stamped, setStamped] = useState(false)
  const [pressing, setPressing] = useState(false)
  const [stampCount] = useState(() => readJSON<number>('chg.stamps', 0))
  const enteredRef = useRef(false)
  const holdTimer = useRef<number | undefined>(undefined)

  const finish = () => (onEntered ? onEntered() : navigate('/app/courses'))

  const enter = () => {
    if (enteredRef.current) return
    enteredRef.current = true
    window.clearTimeout(holdTimer.current)
    setPressing(false)
    registerEntry()

    if (reducedMotion) {
      finish()
      return
    }
    setStamped(true)
    navigator.vibrate?.(30)
    window.setTimeout(finish, NAVIGATE_DELAY_MS)
  }

  const startHold = () => {
    if (enteredRef.current) return
    setPressing(true)
    holdTimer.current = window.setTimeout(enter, HOLD_MS)
  }

  const releaseHold = (commit: boolean) => {
    if (enteredRef.current) return
    window.clearTimeout(holdTimer.current)
    setPressing(false)
    if (commit) enter()
  }

  // 터치캡 감지: 세 손가락(전도성 접점 시뮬레이션)이 동시에 닿으면 인식
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length < 3) return
    const pts = Array.from(e.touches).slice(0, 3)
    const cx = pts.reduce((sum, t) => sum + t.clientX, 0) / 3
    const cy = pts.reduce((sum, t) => sum + t.clientY, 0) / 3
    const within = pts.every((t) => Math.hypot(t.clientX - cx, t.clientY - cy) <= CAP_RADIUS)
    if (within) enter()
  }

  return (
    <div className="touchcap">
      <button
        type="button"
        className={`touchcap-zone${stamped ? ' is-stamped' : ''}${pressing ? ' is-pressing' : ''}`}
        onClick={enter}
        onPointerDown={startHold}
        onPointerUp={() => releaseHold(true)}
        onPointerLeave={() => releaseHold(false)}
        onTouchStart={handleTouchStart}
        aria-label="꾹 눌러서 출석 도장 찍고 입장하기"
      >
        {pressing && !stamped && (
          <svg className="touchcap-holdring" viewBox="0 0 130 130" aria-hidden="true">
            <circle cx="65" cy="65" r="61" />
          </svg>
        )}
        {stamped ? (
          <>
            <motion.span
              className="touchcap-ink"
              initial={{ scale: 0.5, opacity: 0.7 }}
              animate={{ scale: 1.9, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              aria-hidden="true"
            />
            <StampMark />
          </>
        ) : (
          <span className="touchcap-copy">
            꾹 눌러서
            <br />
            <strong>출석 도장 찍기</strong>
          </span>
        )}
      </button>

      <p className="touchcap-status" role="status">
        {stamped ? (
          <motion.span
            className="touchcap-done"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.25 }}
          >
            <span>출석 완료</span>
            <br />
            <span>고백권이 1장 생겼어요</span>
          </motion.span>
        ) : (
          '병뚜껑 안 QR로 들어오면 출석 도장이 쌓여요'
        )}
      </p>

      {!stamped && stampCount > 0 && (
        <p className="touchcap-record">
          출석 도장 {Math.min(stampCount, STAMP_GOAL)}/{STAMP_GOAL}
          {stampCount >= STAMP_GOAL
            ? ' · 개근상 굿즈를 받을 수 있어요'
            : ' · 다 모으면 개근상 굿즈를 드려요'}
        </p>
      )}
    </div>
  )
}
