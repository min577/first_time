import type { SortMode } from './SortToggle'
import './SortSelect.css'

// 정렬 드롭다운 — 두 개의 버튼 대신 하나의 컴팩트한 컨트롤
export default function SortSelect({
  value,
  onChange,
  dark = false,
}: {
  value: SortMode
  onChange: (mode: SortMode) => void
  dark?: boolean
}) {
  return (
    <span className={`sortselect${dark ? ' is-dark' : ''}`}>
      <select
        className="sortselect-input"
        value={value}
        onChange={(e) => onChange(e.target.value as SortMode)}
        aria-label="조언 정렬 방식"
      >
        <option value="latest">최신순</option>
        <option value="popular">인기순</option>
      </select>
      <svg
        className="sortselect-arrow"
        viewBox="0 0 10 6"
        width="10"
        height="6"
        aria-hidden="true"
      >
        <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}
