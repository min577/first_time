import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './DeviceFrame.css'

const LOOP_STEPS = [
  { title: '열람', desc: '선배의 한 줄을 읽고' },
  { title: '고백', desc: '나의 처음을 실토하면' },
  { title: '잔 들기', desc: '사람들이 잔을 들어주고' },
  { title: '라벨 인쇄', desc: '베스트 고백은 병 라벨로' },
]

// 480px 초과: 좌측 심사위원 패널 + 중앙 375px 폰 프레임. 이하: 풀스크린.
export default function DeviceFrame({ children }: { children: ReactNode }) {
  return (
    <div className="device-layout">
      <aside className="judge-panel">
        <p className="judge-eyebrow">제43회 DCA · 처음처럼 · Digital Campaign</p>
        <h1 className="judge-title">처음학개론</h1>
        <p className="judge-concept">"병뚜껑을 따면 열리는 수업"</p>
        <ol className="judge-loop">
          {LOOP_STEPS.map((step, i) => (
            <li key={step.title}>
              <span className="judge-loop-num" aria-hidden="true">
                {i + 1}
              </span>
              <span>
                <strong>{step.title}</strong> - {step.desc}
              </span>
            </li>
          ))}
        </ol>
        <Link to="/about" className="judge-about">
          캠페인 소개 →
        </Link>
        <p className="judge-hint">오른쪽 화면을 직접 조작해보세요. 모바일 QR 접속과 동일한 경험입니다.</p>
      </aside>

      <div className="device-screen">{children}</div>
    </div>
  )
}
