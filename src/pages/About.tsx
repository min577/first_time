import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="page-placeholder">
      <h1>처음학개론</h1>
      <p>6단계에서 캠페인 소개(Background → Idea → Effect)가 들어옵니다.</p>
      <p style={{ marginTop: 16 }}>
        <Link to="/" style={{ color: 'var(--green-light)', fontWeight: 600 }}>
          프로토타입 체험하기 →
        </Link>
      </p>
    </div>
  )
}
