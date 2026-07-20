import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { readJSON } from '../hooks/useLocalList'
import { registerEntry } from './entrance'
import StampMark from './StampMark'
import './TouchCap.css'

const NAVIGATE_DELAY_MS = 650
const STAMP_GOAL = 5

type Props = {
  onEntered?: () => void
}

export default function TouchCap({ onEntered }: Props) {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const [stamped, setStamped] = useState(false)
  const [stampCount] = useState(() => readJSON<number>('chg.stamps', 0))
  const enteredRef = useRef(false)

  const finish = () => (onEntered ? onEntered() : navigate('/app/courses'))

  const enter = () => {
    if (enteredRef.current) return
    enteredRef.current = true
    registerEntry()

    if (reducedMotion) {
      finish()
      return
    }

    setStamped(true)
    navigator.vibrate?.(30)
    window.setTimeout(finish, NAVIGATE_DELAY_MS)
  }

  return (
    <div className="touchcap">
      <p className="touchcap-guide">QR로 들어왔다면 바로 시작할 수 있어요.</p>
      <button
        type="button"
        className={`touchcap-zone${stamped ? ' is-stamped' : ''}`}
        onClick={enter}
        disabled={stamped}
        aria-label="처음학개론 시작하기"
      >
        {stamped ? (
          <>
            <motion.span
              className="touchcap-ink"
              initial={{ scale: 0.7, opacity: 0.6 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              aria-hidden="true"
            />
            <span className="touchcap-mark" aria-hidden="true">
              <StampMark />
            </span>
            <span>시작할게요</span>
          </>
        ) : (
          <span>처음 시작하기</span>
        )}
      </button>

      <p className="touchcap-status" role="status">
        {stamped ? (
          <motion.span
            className="touchcap-done"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            입장했어요. 고백권 1장이 생겼어요.
          </motion.span>
        ) : (
          '버튼을 누르면 강의 목록으로 이동해요.'
        )}
      </p>

      {!stamped && stampCount > 0 && (
        <p className="touchcap-record">
          출석 도장 {Math.min(stampCount, STAMP_GOAL)}/{STAMP_GOAL}
          {stampCount >= STAMP_GOAL
            ? ' · 개근상 굿즈를 받을 수 있어요.'
            : ' · 5개를 모으면 개근상 굿즈를 받을 수 있어요.'}
        </p>
      )}
    </div>
  )
}
