import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  SOBER_TIPS,
  TOAST_LEADS,
  TOAST_OCCASIONS,
  TOAST_RESPONSES,
  type Occasion,
} from '../data/toasts'
import './ToastMaker.css'

type Result = {
  key: number
  lead: string
  response: string
  sober: string
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
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  const draw = () => {
    setCopied(false)
    setResult((previous) => ({
      key: (previous?.key ?? 0) + 1,
      lead: pick(TOAST_LEADS[occasion], previous?.lead),
      response: pick(TOAST_RESPONSES, previous?.response),
      sober: pick(SOBER_TIPS, previous?.sober),
    }))
  }

  return (
    <div className="toastmaker">
      <header className="toast-head">
        <p className="toast-kicker">건배사</p>
        <h1 className="toast-title">
          어떤 자리에서
          <br />
          건배하나요?
        </h1>
        <p className="toast-sub">자리를 고르면 바로 읽을 수 있는 건배사를 보여드려요.</p>
      </header>

      <div className="toast-occasions" role="radiogroup" aria-label="건배 자리 선택">
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

      {!result && (
        <button type="button" className="toast-draw" onClick={draw}>
          건배사 보기
        </button>
      )}

      <AnimatePresence mode="wait">
        {result && (
          <motion.article
            key={result.key}
            className="toast-card"
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <h2 className="toast-result-title">이 건배사 어때요?</h2>
            <div className="toast-lines">
              <p className="toast-card-label">선창</p>
              <p className="toast-card-lead">“{result.lead}”</p>
              <p className="toast-card-label">후창</p>
              <p className="toast-card-response">“{result.response}”</p>
            </div>
            <p className="toast-sober">{result.sober}</p>
            <div className="toast-actions">
              <button type="button" className="toast-copy" onClick={copy}>
                {copied ? '복사했어요' : '복사하기'}
              </button>
              <button type="button" className="toast-redraw" onClick={draw}>
                다른 건배사 보기
              </button>
            </div>
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  )
}
