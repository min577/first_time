import './SortToggle.css'

export type SortMode = 'latest' | 'popular'

const OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'latest', label: '최신순' },
  { key: 'popular', label: '인기순' },
]

export default function SortToggle({
  value,
  onChange,
}: {
  value: SortMode
  onChange: (mode: SortMode) => void
}) {
  return (
    <div className="sorttoggle" role="radiogroup" aria-label="정렬 방식">
      {OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          role="radio"
          aria-checked={value === option.key}
          className={`sorttoggle-btn${value === option.key ? ' is-active' : ''}`}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
