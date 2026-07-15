import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { registerEntry } from './entrance'
import './CapTwist.css'

const OPEN_ANGLE = 120 // 누적 회전이 이 각도를 넘으면 뚜껑이 열린다
const NAVIGATE_DELAY_MS = 900

type Props = {
  onEntered?: () => void
}

// 뚜껑 따기 제스처: 병뚜껑(윗면)을 잡고 비틀면 치익— 하고 열린다. 탭 폴백 포함.
export default function CapTwist({ onEntered }: Props) {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const [rotation, setRotation] = useState(0)
  const [opened, setOpened] = useState(false)
  const zoneRef = useRef<HTMLButtonElement>(null)
  const lastAngle = useRef<number | null>(null)
  const enteredRef = useRef(false)

  const finish = () => (onEntered ? onEntered() : navigate('/app/courses'))

  const open = () => {
    if (enteredRef.current) return
    enteredRef.current = true
    registerEntry()
    if (reducedMotion) {
      finish()
      return
    }
    setOpened(true)
    navigator.vibrate?.([20, 40, 20])
    window.setTimeout(finish, NAVIGATE_DELAY_MS)
  }

  const angleAt = (e: React.PointerEvent) => {
    const rect = zoneRef.current!.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    return (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (opened) return
    lastAngle.current = angleAt(e)
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (lastAngle.current === null || opened) return
    const angle = angleAt(e)
    let delta = angle - lastAngle.current
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    lastAngle.current = angle
    setRotation((prev) => {
      const next = prev + delta
      if (Math.abs(next) >= OPEN_ANGLE) open()
      return next
    })
  }

  const onPointerUp = () => {
    lastAngle.current = null
  }

  // 폴백: 비틀지 않고 탭만 해도 열린다 (드래그 직후의 click은 무시)
  const onClick = () => {
    if (Math.abs(rotation) < 15) open()
  }

  return (
    <div className="captwist">
      <button
        ref={zoneRef}
        type="button"
        className="captwist-zone"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onClick}
        aria-label="입장하기 — 뚜껑을 비틀거나 탭하세요"
      >
        <motion.div
          className="captwist-cap"
          style={{ rotate: opened ? undefined : rotation }}
          animate={
            opened
              ? { y: -110, rotate: rotation + 260, opacity: 0, scale: 0.9 }
              : undefined
          }
          transition={{ duration: 0.6, ease: 'easeOut' }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 130 130" width="130" height="130">
            <g fill="var(--paper)">
              <circle cx="65" cy="65" r="56" opacity="0.14" />
              {Array.from({ length: 24 }, (_, i) => {
                const a = (i / 24) * Math.PI * 2
                return (
                  <circle
                    key={i}
                    cx={65 + Math.cos(a) * 56}
                    cy={65 + Math.sin(a) * 56}
                    r="4"
                  />
                )
              })}
            </g>
            <circle cx="65" cy="65" r="48" fill="none" stroke="var(--paper)" strokeWidth="3" />
            <circle
              cx="65"
              cy="65"
              r="38"
              fill="none"
              stroke="var(--paper)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.7"
            />
            <text
              x="65"
              y="71"
              textAnchor="middle"
              fill="var(--paper)"
              fontFamily="var(--font-display)"
              fontWeight="700"
              fontSize="17"
            >
              처음처럼
            </text>
          </svg>
        </motion.div>
        {opened && (
          <motion.span
            className="captwist-hiss"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.2 }}
          >
            치익—
          </motion.span>
        )}
      </button>

      <p className="captwist-status" role="status">
        {opened ? (
          <motion.span
            className="captwist-done"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.35 }}
          >
            열렸습니다 · 고백권 +1장
          </motion.span>
        ) : (
          '뚜껑을 잡고 비틀어보세요 · 탭해도 열립니다'
        )}
      </p>
    </div>
  )
}
