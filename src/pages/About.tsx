import { useState } from 'react'
import { Link } from 'react-router-dom'
import './About.css'

const LOOP_STEPS = [
  { title: '열람', desc: '선배의 한 줄을 읽고' },
  { title: '고백', desc: '나의 처음을 털어놓으면' },
  { title: '잔 들기', desc: '사람들이 잔을 들어주고' },
  { title: '라벨 인쇄', desc: '베스트 고백은 병 라벨로' },
]

// 시연 전 초기화용 이스터에그 — 데모에서 쌓인 로컬 데이터(chg.*)만 지운다
function resetDemo() {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (key?.startsWith('chg.')) keys.push(key)
  }
  keys.forEach((key) => localStorage.removeItem(key))
}

export default function About() {
  const [resetDone, setResetDone] = useState(false)

  const handleReset = () => {
    resetDemo()
    setResetDone(true)
  }

  return (
    <div className="about">
      <header className="about-head">
        <p className="about-eyebrow">제43회 DCA · 처음처럼 · Digital Campaign</p>
        <h1 className="about-logo">처음학개론</h1>
        <p className="about-concept">"병뚜껑을 따면 열리는 수업"</p>
      </header>

      <section className="about-section" aria-labelledby="about-bg">
        <h2 id="about-bg" className="about-section-title">
          Background
        </h2>
        <p>
          회식 문화 축소로 소주의 사회적 역할이 줄었지만, 인생의 '처음'은 사라지지 않았다.
          2030의 처음은 몰라서 무섭고, 3049의 처음은 모른다고 말할 수 없다.
        </p>
      </section>

      <section className="about-section" aria-labelledby="about-idea">
        <h2 id="about-idea" className="about-section-title">
          Idea
        </h2>
        <p>
          병뚜껑을 따면 열리는 수업, 처음학개론. 뚜껑 안 QR - 한정판은 뚜껑을 화면에 도장처럼
          찍어 - 입장한다. 고백은 병 하나당 한 번뿐인 응모이고, 가장 많은 잔을 받은 처음이
          다음 주의 라벨이 된다.
        </p>
        <ol className="about-loop" aria-label="참여 루프 4단계">
          {LOOP_STEPS.map((step, i) => (
            <li key={step.title} className="about-loop-step">
              <span className="about-loop-num" aria-hidden="true">
                {i + 1}
              </span>
              <strong className="about-loop-title">{step.title}</strong>
              <span className="about-loop-desc">{step.desc}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-section" aria-labelledby="about-effect">
        <h2 id="about-effect" className="about-section-title">
          Effect
        </h2>
        <p>
          오늘의 후배가 내일의 선배가 되는 자생 루프. 하나의 언어('처음')로 3049와 2030을
          관통하며, 절주 가이드 내장으로 책임 있는 음주 문화까지 설계한다.
        </p>
      </section>

      <Link to="/" className="about-cta">
        프로토타입 체험하기 →
      </Link>

      <div className="about-reset">
        <button
          type="button"
          className="about-reset-btn"
          onClick={handleReset}
          aria-label="데모 데이터 초기화"
        >
          {resetDone ? '초기화 완료' : '데모 초기화'}
        </button>
      </div>
    </div>
  )
}
