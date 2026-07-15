import { useState } from 'react'
import './Composer.css'

type Props = {
  placeholder: string
  helper?: string
  submitLabel: string
  rows?: number
  initialValue?: string
  onSubmit: (text: string) => void
}

// 고백/한 줄 작성 공용 인풋
export default function Composer({
  placeholder,
  helper,
  submitLabel,
  rows = 3,
  initialValue = '',
  onSubmit,
}: Props) {
  const [text, setText] = useState(initialValue)
  const trimmed = text.trim()

  const submit = () => {
    if (!trimmed) return
    onSubmit(trimmed)
    setText('')
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
        {helper ? <span className="composer-helper">{helper}</span> : <span />}
        <button
          type="button"
          className="composer-submit"
          onClick={submit}
          disabled={!trimmed}
          aria-label={submitLabel}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  )
}
