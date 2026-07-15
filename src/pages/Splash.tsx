import TouchCap from '../components/TouchCap'
import './Splash.css'

export default function Splash() {
  return (
    <div className="splash">
      <header className="splash-head">
        <p className="splash-eyebrow">개교 20주년 · 처음처럼</p>
        <h1 className="splash-logo">처음학개론</h1>
        <p className="splash-subtitle">교수는 없고, 선배만 있는 수업</p>
      </header>

      <TouchCap />

      <p className="splash-footer">만 19세 이상 · 지나친 음주는 처음도 망칩니다</p>
    </div>
  )
}
