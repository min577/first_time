import { useState } from 'react'
import TouchCap from '../components/TouchCap'
import EntryStats from '../components/EntryStats'
import './Splash.css'

export default function Splash() {
  const [entered, setEntered] = useState(false)

  return (
    <div className="splash">
      <header className="splash-head">
        <p className="splash-intro">어른들에게도 처음은 있으니까</p>
        <h1 className="splash-logo">
          <img src="/logo.png" alt="처음학개론" className="splash-logo-img" />
        </h1>
      </header>

      <TouchCap onEntered={() => setEntered(true)} />

      <footer className="splash-footer">
        <p>만 19세 이상만 이용할 수 있어요.</p>
        <p>술은 천천히, 내 속도에 맞게 즐겨요.</p>
      </footer>

      {/* 도장이 찍히면 이번 주의 잔이 얼마나 찼는지 보여주고 입장한다 */}
      {entered && <EntryStats />}
    </div>
  )
}
