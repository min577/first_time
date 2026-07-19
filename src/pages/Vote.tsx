import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CONFESSIONS,
  LABEL_THRESHOLD,
  VOTE_SEED,
  type Confession,
} from '../data/confessions'
import { readJSON, writeJSON } from '../hooks/useLocalList'
import './Vote.css'

// 라벨 투표소: 이번 주 라벨 인쇄 후보 중 다음 병에 인쇄될 처음을 1인 1표로 결정
export default function Vote() {
  const candidates = useMemo(
    () => CONFESSIONS.filter((c) => c.cheers >= LABEL_THRESHOLD),
    [],
  )
  const [myVote, setMyVote] = useState<string | null>(() =>
    readJSON<string | null>('chg.vote', null),
  )

  const countOf = (c: Confession) => (VOTE_SEED[c.id] ?? 0) + (myVote === c.id ? 1 : 0)
  const total = candidates.reduce((sum, c) => sum + countOf(c), 0)

  const vote = (id: string) => {
    // 내 표를 다시 누르면 취소
    if (myVote === id) {
      writeJSON('chg.vote', null)
      setMyVote(null)
      return
    }
    if (myVote) return
    writeJSON('chg.vote', id)
    setMyVote(id)
  }

  return (
    <div className="vote">
      <header className="vote-head">
        <Link to="/app/confess" className="vote-back" aria-label="고백실로 돌아가기" replace>
          ← 고백실
        </Link>
        <h1 className="vote-title">라벨 투표소</h1>
        <p className="vote-sub">다음 주 병에 인쇄될 처음을 골라주세요 · 1인 1표</p>
      </header>

      <ul className="vote-list" aria-label="라벨 인쇄 후보">
        {candidates.map((confession) => {
          const count = countOf(confession)
          const percent = total > 0 ? Math.round((count / total) * 100) : 0
          const picked = myVote === confession.id
          return (
            <li key={confession.id} className={`vote-card${picked ? ' is-picked' : ''}`}>
              <p className="vote-text">{confession.text}</p>
              <p className="vote-author">{confession.author}</p>

              <div className="vote-bar" aria-hidden="true">
                <span className="vote-bar-fill" style={{ width: `${percent}%` }} />
              </div>
              <p className="vote-count">
                {count.toLocaleString()}표 · {percent}%
                {picked && <strong> · 내 한 표</strong>}
              </p>

              <button
                type="button"
                className="vote-btn"
                onClick={() => vote(confession.id)}
                disabled={myVote !== null && !picked}
                aria-label={
                  picked ? '투표 취소하기' : `이 처음에 투표: ${confession.text}`
                }
              >
                {picked ? '투표 완료 · 다시 누르면 취소' : '이 처음에 투표'}
              </button>
            </li>
          )
        })}
      </ul>

      <p className="vote-foot">
        일요일 자정 마감 · 최다 득표 고백이 다음 주 '이번 주의 처음' 라벨로 인쇄됩니다
      </p>
    </div>
  )
}
