import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { TOAST_LEADS, TOAST_OCCASIONS, TOAST_RESPONSES, type Occasion } from '../data/toasts'
import './ToastMaker.css'

type Result = {
  key: number
  occasion: Occasion
  lead: string
  response: string
}

function pick<T>(list: readonly T[], avoid?: T): T {
  if (list.length < 2) return list[0]
  let next = list[Math.floor(Math.random() * list.length)]
  while (next === avoid) {
    next = list[Math.floor(Math.random() * list.length)]
  }
  return next
}

export default function ToastMaker() {
  const reducedMotion = useReducedMotion()
  const [occasion, setOccasion] = useState<Occasion>('회식')
  const [result, setResult] = useState<Result | null>(null)

  // 모임을 바꾸면 이전 건배사는 치운다
  const pickOccasion = (next: Occasion) => {
    setOccasion(next)
    setResult(null)
  }

  const draw = () => {
    setResult((prev) => ({
      key: (prev?.key ?? 0) + 1,
      occasion,
      lead: pick(TOAST_LEADS[occasion], prev?.lead),
      response: pick(TOAST_RESPONSES, prev?.response),
    }))
  }

  return (
    <div className="toastmaker">
      <header className="toast-head">
        {/* 앰버 존 시그니처 - 채워진 소주잔 */}
        <svg
          viewBox="0 0 24 24"
          className="toast-head-glass"
          fill="none"
          stroke="var(--amber-deep)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M8.1 11.2 7.6 4h8.8l-.5 7.2Z" fill="var(--amber)" stroke="none" />
          <path d="M7 4h10l-1.2 15a2 2 0 0 1-2 1.8H10.2a2 2 0 0 1-2-1.8L7 4Z" />
        </svg>
        <div>
          <h1 className="toast-title">오늘의 건배사</h1>
          <p className="toast-sub">건배사가 처음이어도 괜찮아요. 모임을 고르고 뽑아보세요.</p>
        </div>
      </header>

      {/* 무대 — 뽑힌 건배사가 병 라벨 카드로 가운데에서 등장한다 */}
      <div className="toast-stage">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.article
              key={result.key}
              className="toast-card"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.72, y: 22, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, scale: 0.92, y: -10 }}
              transition={
                reducedMotion
                  ? { duration: 0.15 }
                  : { type: 'spring', stiffness: 300, damping: 22 }
              }
            >
              <p className="toast-card-occasion">{result.occasion}</p>

              {/* 선창을 외치면 후창이 따라온다 — 실제 자리의 콜 앤 리스폰스 리듬 */}
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: reducedMotion ? 0 : 0.15 }}
              >
                <p className="toast-card-label">선창</p>
                <p className="toast-card-lead">"{result.lead}"</p>
              </motion.div>
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: reducedMotion ? 0 : 0.55 }}
              >
                <p className="toast-card-label">후창</p>
                <p className="toast-card-response">"{result.response}"</p>
              </motion.div>
            </motion.article>
          ) : (
            <motion.div
              key="empty"
              className="toast-empty"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <svg
                viewBox="0 0 24 24"
                width="30"
                height="30"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 4h10l-1.2 15a2 2 0 0 1-2 1.8H10.2a2 2 0 0 1-2-1.8L7 4Z" />
                <path d="M7.6 11h8.8" />
              </svg>
              <p>
                모임을 고르고
                <br />
                건배사를 뽑아보세요
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 하단 조작부 — 자리 선택과 뽑기가 엄지 근처에 붙어 있다 */}
      <div className="toast-controls">
        <div className="toast-occasions" role="radiogroup" aria-label="모임 선택">
          {TOAST_OCCASIONS.map((item) => (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={occasion === item}
              className={`toast-occasion${occasion === item ? ' is-active' : ''}`}
              onClick={() => pickOccasion(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <button type="button" className="toast-draw" onClick={draw}>
          {result ? '다시 뽑기' : '건배사 뽑기'}
        </button>
      </div>
    </div>
  )
}
