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
        <h1 className="toast-title">건배사 생성기</h1>
        <p className="toast-sub">건배사가 처음이어도 괜찮습니다. 자리를 고르고 뽑으세요.</p>
      </header>

      <div className="toast-occasions" role="radiogroup" aria-label="자리 선택">
        {TOAST_OCCASIONS.map((item) => (
          <button
            key={item}
            type="button"
            role="radio"
            aria-checked={occasion === item}
            className={`toast-occasion${occasion === item ? ' is-active' : ''}`}
            onClick={() => setOccasion(item)}
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
            <p className="toast-card-label">선창</p>
            <p className="toast-card-lead">"{result.lead}"</p>
            <p className="toast-card-label">후창</p>
            <p className="toast-card-response">"{result.response}"</p>
            <p className="toast-card-foot">따라 읽기만 하면 됩니다. 나머지는 잔이 알아서.</p>
            <p className="toast-sober">절주 한 줄 — {result.soberTip}</p>
            <button type="button" className="toast-copy" onClick={copy} aria-label="건배사 복사하기">
              {copied ? '복사됐습니다 — 단톡방에 미리 공유해두세요' : '건배사 복사하기'}
            </button>
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  )
}
