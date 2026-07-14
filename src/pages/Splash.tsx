import { useNavigate } from 'react-router-dom'
import './Splash.css'

// 2단계에서 TouchCap(세 손가락 터치 감지 + 스탬프 애니메이션)으로 교체 예정.
export default function Splash() {
  const navigate = useNavigate()

  return (
    <div className="splash">
      <p className="splash-eyebrow">개교 20주년 · 처음처럼</p>
      <h1 className="splash-logo">처음학개론</h1>
      <p className="splash-subtitle">교수는 없고, 선배만 있는 수업</p>

      <button
        type="button"
        className="splash-stamp-zone"
        onClick={() => navigate('/app/courses')}
        aria-label="입장하기 — 뚜껑을 화면에 대보세요"
      >
        <span className="splash-stamp-copy">
          뚜껑을 <strong>화면에 대보세요</strong>
        </span>
      </button>
      <p className="splash-caption">한정판 터치캡을 화면에 찍어 입장하세요 · 일반 병은 뚜껑 안 QR로</p>

      <p className="splash-footer">만 19세 이상 · 지나친 음주는 처음도 망칩니다</p>
    </div>
  )
}
