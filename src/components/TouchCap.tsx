import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { readJSON, writeJSON } from '../hooks/useLocalList'
import StampMark from './StampMark'
import './TouchCap.css'

// 출석 도장 적립 — 세계관의 '도장 N회 = 개근상 굿즈'를 프로토에서도 체감시킨다
const STAMP_GOAL = 5

const CAP_RADIUS = 300 // 세 접점이 이 반경의 원 안에 모여 있으면 터치캡으로 인식

// 스탬프 쾅(0.25s) + 잉크 번짐(0.5s) → "출석 완료" 0.6s 노출 후 이동
const NAVIGATE_DELAY_MS = 950

export default function TouchCap() {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const [stamped, setStamped] = useState(false)
  const [stampCount] = useState(() => readJSON<number>('chg.stamps', 0))
  const enteredRef = useRef(false)

  const enter = () => {
    if (enteredRef.current) return
    enteredRef.current = true
    writeJSON('chg.stamps', stampCount + 1)
    // 병 하나를 딴 것과 같다 — 고백권(응모권) 1장 적립
    writeJSON('chg.tickets', readJSON<number>('chg.tickets', 0) + 1)

    if (reducedMotion) {
      navigate('/app/courses')
      return
    }
    setStamped(true)
    navigator.vibrate?.(30)
    window.setTimeout(() => navigate('/app/courses'), NAVIGATE_DELAY_MS)
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
        className={`touchcap-zone${stamped ? ' is-stamped' : ''}`}
        onClick={enter}
        onTouchStart={handleTouchStart}
        aria-label="입장하기 — 뚜껑을 화면에 대거나 탭하세요"
      >
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
            뚜껑을
            <br />
            <strong>화면에 대보세요</strong>
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
            출석 완료 · 고백권 +1장
          </motion.span>
        ) : (
          '한정판 터치캡을 화면에 찍어 입장하세요 · 일반 병은 뚜껑 안 QR로'
        )}
      </p>

      {!stamped && stampCount > 0 && (
        <p className="touchcap-record">
          출석 도장 {Math.min(stampCount, STAMP_GOAL)}/{STAMP_GOAL}
          {stampCount >= STAMP_GOAL ? ' · 개근상 굿즈 교환 가능!' : ' · 다 모으면 개근상 굿즈'}
        </p>
      )}
    </div>
  )
}
