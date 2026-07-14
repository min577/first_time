import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import SojuGlass from './SojuGlass'
import { readJSON, writeJSON } from '../hooks/useLocalList'
import './RaiseButton.css'

const RAISED_KEY = 'chg.raised'

function readRaisedIds(): string[] {
  return readJSON<string[]>(RAISED_KEY, [])
}

// 잔 들기 — 1인 1잔. 탭하면 잔이 앰버로 차며 clink 흔들림 + "+1잔" 플로팅.
export default function RaiseButton({ id, count }: { id: string; count: number }) {
  const reducedMotion = useReducedMotion()
  const [raised, setRaised] = useState(() => readRaisedIds().includes(id))
  const [floating, setFloating] = useState(false)

  const total = count + (raised ? 1 : 0)

  const raise = () => {
    if (raised) return
    setRaised(true)
    const ids = readRaisedIds()
    if (!ids.includes(id)) writeJSON(RAISED_KEY, [...ids, id])
    if (!reducedMotion) setFloating(true)
  }

  return (
    <button
      type="button"
      className={`raise-btn${raised ? ' is-raised' : ''}`}
      onClick={raise}
      disabled={raised}
      aria-label={raised ? `잔을 들었습니다. 현재 ${total.toLocaleString()}잔` : '이 글에 잔 들기'}
    >
      <motion.span
        className="raise-glass"
        animate={floating ? { rotate: [0, -14, 9, 0] } : { rotate: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <SojuGlass filled={raised} />
      </motion.span>
      <span className="raise-count">{total.toLocaleString()}잔</span>

      <AnimatePresence>
        {floating && (
          <motion.span
            className="raise-float"
            initial={{ opacity: 0, x: '-50%', y: 2 }}
            animate={{ opacity: [0, 1, 1, 0], x: '-50%', y: -26 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            onAnimationComplete={() => setFloating(false)}
            aria-hidden="true"
          >
            +1잔
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
