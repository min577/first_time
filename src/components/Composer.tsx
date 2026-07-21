import { useState } from 'react'
import { readJSON, writeJSON } from '../hooks/useLocalList'
import './Composer.css'

const OATH_KEY = 'chg.oath'

// 훈계 시그니처 — 차단이 아니라 제출 전에 한 번 붙잡고 고쳐쓰기를 권한다
const KKONDAE_PATTERNS = [
  /나\s*때는/,
  /라떼는/,
  /요즘\s*애들/,
  /요즘\s*것들/,
  /요즘\s*젊은/,
  /해야지/,
  /하라니까/,
  /버릇이/,
  /어디서\s*감히/,
  /쯧/,
]

type GuardStep = null | 'oath' | 'warn'

type Props = {
  placeholder: string
  helper?: string
  submitLabel: string
  rows?: number
  initialValue?: string
  adviceGuard?: boolean // 조언 작성용 — 선배 서약(1회) + 훈계 시그니처 점검
  onSubmit: (text: string) => void
}

// 고백/한 줄 작성 공용 인풋
export default function Composer({
  placeholder,
  helper,
  submitLabel,
  rows = 3,
  initialValue = '',
  adviceGuard = false,
  onSubmit,
}: Props) {
  const [text, setText] = useState(initialValue)
  const [guard, setGuard] = useState<GuardStep>(null)
  const trimmed = text.trim()

  const doSubmit = () => {
    onSubmit(trimmed)
    setText('')
    setGuard(null)
  }

  const hasKkondae = () => KKONDAE_PATTERNS.some((p) => p.test(trimmed))

  const submit = () => {
    if (!trimmed) return
    if (adviceGuard) {
      if (!readJSON<boolean>(OATH_KEY, false)) {
        setGuard('oath')
        return
      }
      if (hasKkondae()) {
        setGuard('warn')
        return
      }
    }
    doSubmit()
  }

  // 서약은 평생 1회 — 서약 후 바로 훈계 점검으로 이어진다
  const confirmOath = () => {
    writeJSON(OATH_KEY, true)
    if (hasKkondae()) setGuard('warn')
    else doSubmit()
  }

  return (
    <div className="composer">
      <textarea
        className="composer-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={200}
        aria-label={placeholder}
      />
      <div className="composer-foot">
        <span className="composer-helper">
          {helper}
          {text.length > 0 && (
            <span className="composer-count">
              {helper ? ' · ' : ''}
              {text.length}/200
            </span>
          )}
        </span>
        <button
          type="button"
          className="composer-submit"
          onClick={submit}
          disabled={!trimmed || guard !== null}
          aria-label={submitLabel}
        >
          {submitLabel}
        </button>
      </div>

      {guard === 'oath' && (
        <div className="composer-guard" role="dialog" aria-label="선배 서약">
          <p className="composer-guard-title">선배 서약</p>
          <p className="composer-guard-text">
            가르치려 하지 않고, 먼저 겪은 것만 말하겠습니다.
            <br />
            충고 대신 존중을 남기겠습니다.
          </p>
          <button type="button" className="composer-guard-confirm" onClick={confirmOath}>
            서약하고 남기기
          </button>
        </div>
      )}

      {guard === 'warn' && (
        <div className="composer-guard is-warn" role="alertdialog" aria-label="문장 점검">
          <p className="composer-guard-title">가르치는 말투일 수 있어요</p>
          <p className="composer-guard-text">'나 때는'보다 내 경험을 그대로 적으면 더 잘 읽혀요.</p>
          <div className="composer-guard-actions">
            <button
              type="button"
              className="composer-guard-confirm"
              onClick={() => setGuard(null)}
            >
              문장 고치기
            </button>
            <button type="button" className="composer-guard-pass" onClick={doSubmit}>
              이대로 남기기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
