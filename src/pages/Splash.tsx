import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import TouchCap from '../components/TouchCap'
import CapTwist from '../components/CapTwist'
import { ENTRANCE_MODES, type EntranceMode } from '../components/entrance'
import { readJSON, writeJSON } from '../hooks/useLocalList'
import './Splash.css'

export default function Splash() {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const [mode, setMode] = useState<EntranceMode>(() =>
    readJSON<EntranceMode>('chg.entrance', 'hold'),
  )
  const [opening, setOpening] = useState(false)

  const pickMode = (next: EntranceMode) => {
    setMode(next)
    writeJSON('chg.entrance', next)
  }

  // 병 오프닝: 초록 화면이 뚜껑처럼 위로 들리며 수업이 열린다
  const startOpening = () => {
    if (reducedMotion) {
      navigate('/app/courses')
      return
    }
    setOpening(true)
  }

  const onEntered = mode === 'open' ? startOpening : undefined

  return (
    <div className="splash-wrap">
      <div className="splash-under" aria-hidden="true">
        <p className="splash-under-text">開講</p>
        <p className="splash-under-sub">수업이 열립니다</p>
      </div>

      <motion.div
        className="splash"
        animate={opening ? { y: '-104%' } : { y: 0 }}
        transition={{ duration: 0.65, ease: [0.7, 0, 0.3, 1] }}
        onAnimationComplete={() => {
          if (opening) navigate('/app/courses')
        }}
      >
        <header className="splash-head">
          <p className="splash-eyebrow">개교 20주년 · 처음처럼</p>
          <h1 className="splash-logo">처음학개론</h1>
          <p className="splash-subtitle">교수는 없고, 선배만 있는 수업</p>
        </header>

        {mode === 'twist' ? (
          <CapTwist onEntered={onEntered} />
        ) : (
          <TouchCap key={mode} hold={mode === 'hold'} onEntered={onEntered} />
        )}

        {/* 데모용 연출 전환 스위치 — 최종 연출 확정 후 제거 */}
        <div className="splash-modes" role="radiogroup" aria-label="입장 연출 선택 (데모)">
          <span className="splash-modes-label">연출</span>
          {ENTRANCE_MODES.map((item) => (
            <button
              key={item.key}
              type="button"
              role="radio"
              aria-checked={mode === item.key}
              className={`splash-mode${mode === item.key ? ' is-active' : ''}`}
              onClick={() => pickMode(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="splash-footer">만 19세 이상 · 지나친 음주는 처음도 망칩니다</p>
      </motion.div>
    </div>
  )
}
