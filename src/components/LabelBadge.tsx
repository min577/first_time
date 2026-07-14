import './LabelBadge.css'

// 참여 → 제품 회귀를 암시하는 장치: 베스트 고백은 병 라벨로 인쇄된다
export default function LabelBadge() {
  return (
    <span className="label-badge">
      <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
        <rect x="1.5" y="2.5" width="9" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <line x1="3.8" y1="5" x2="8.2" y2="5" stroke="currentColor" strokeWidth="1.1" />
        <line x1="3.8" y1="7" x2="6.8" y2="7" stroke="currentColor" strokeWidth="1.1" />
      </svg>
      이번 주 라벨 인쇄 후보
    </span>
  )
}
