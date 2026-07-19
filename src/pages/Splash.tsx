import { useState } from 'react'
import TouchCap from '../components/TouchCap'
import EntryStats from '../components/EntryStats'
import './Splash.css'

export default function Splash() {
  const [entered, setEntered] = useState(false)

  return (
    <div className="splash">
      <header className="splash-head">
        <p className="splash-eyebrow">개교 20주년 · 처음처럼</p>
        <h1 className="splash-logo">처음학개론</h1>
        <p className="splash-subtitle">교수는 없고, 선배만 있는 수업</p>
      </header>

      <TouchCap onEntered={() => setEntered(true)} />

      <p className="splash-footer">만 19세 이상 · 지나친 음주는 처음도 망칩니다</p>

      {/* 도장이 찍히면 이번 주의 잔이 얼마나 찼는지 보여주고 입장한다 */}
      {entered && <EntryStats />}
    </div>
  )
}
