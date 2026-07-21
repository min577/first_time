import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { SOBER_TIPS, TOAST_LEADS, TOAST_OCCASIONS, TOAST_RESPONSES, type Occasion } from '../data/toasts'
import './ToastMaker.css'

type Result = {
  key: number
  lead: string
  response: string
  soberTip: string
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
  const [copied, setCopied] = useState(false)

  // 자리를 바꾸면 이전 자리의 건배사는 치운다
  const pickOccasion = (next: Occasion) => {
    setOccasion(next)
    setResult(null)
    setCopied(false)
  }

  const copy = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(`선창: ${result.lead}\n후창: ${result.response}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // 클립보드가 막힌 환경(권한 거부 등)에서는 조용히 무시
    }
  }

  const draw = () => {
    setCopied(false)
    setResult((prev) => ({
      key: (prev?.key ?? 0) + 1,
      lead: pick(TOAST_LEADS[occasion], prev?.lead),
      response: pick(TOAST_RESPONSES, prev?.response),
      soberTip: pick(SOBER_TIPS, prev?.soberTip),
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
          <p className="toast-sub">건배사가 처음이어도 괜찮아요. 자리를 고르고 뽑아보세요.</p>
        </div>
      </header>

      <div className="toast-occasions" role="radiogroup" aria-label="자리 선택">
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

      <button type="button" className="toast-draw" onClick={draw} aria-label="건배사 뽑기">
        {result ? '다시 뽑기' : '건배사 뽑기'}
      </button>

      <AnimatePresence mode="wait">
        {result && (
          <motion.article
            key={result.key}
            className="toast-card"
            initial={reducedMotion ? false : { opacity: 0, y: 14, rotate: -1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* 선창을 외치면 후창이 따라온다 — 실제 자리의 콜 앤 리스폰스 리듬 */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <p className="toast-card-label">선창</p>
              <p className="toast-card-lead">"{result.lead}"</p>
            </motion.div>
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: reducedMotion ? 0 : 0.4, ease: 'easeOut' }}
            >
              <p className="toast-card-label">후창</p>
              <p className="toast-card-response">"{result.response}"</p>
            </motion.div>
            <motion.div
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: reducedMotion ? 0 : 0.7 }}
            >
              <p className="toast-card-foot">따라 읽기만 하면 돼요.</p>
              <p className="toast-sober">{result.soberTip}</p>
              <button
                type="button"
                className="toast-copy"
                onClick={copy}
                aria-label="건배사 복사하기"
              >
                {copied ? '복사했어요' : '건배사 복사하기'}
              </button>
            </motion.div>
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  )
}
