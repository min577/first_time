import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CONFESSIONS, LABEL_THRESHOLD, type Confession } from '../data/confessions'
import { confessionOpener, findCourse } from '../data/courses'
import { newId, readJSON, useLocalList, writeJSON } from '../hooks/useLocalList'
import ConfessionCard from '../components/ConfessionCard'
import CapMosaic, { mosaicTotal } from '../components/CapMosaic'
import Composer from '../components/Composer'
import './Confess.css'

// 개교 벽화: 모두의 잔(뚜껑)이 병 하나를 채우면 이번 주 라벨이 인쇄소로 간다
const MURAL_GOAL = 20000
const BOTTLE_DOTS = mosaicTotal('bottle')

// 강의실에서 "이 처음을 고백하기"로 넘어오면 수업 컨텍스트가 state로 담겨 온다
type ConfessLocationState = { courseSlug?: string } | null

export default function Confess() {
  const { items, localIds, add, remove } = useLocalList<Confession>('chg.confessions', CONFESSIONS)
  const state = useLocation().state as ConfessLocationState
  const fromCourse = findCourse(state?.courseSlug)

  // 고백권: 병뚜껑으로 입장할 때마다 1장. 고백은 응모처럼 병 하나당 한 번
  const [tickets, setTickets] = useState(() => readJSON<number>('chg.tickets', 0))
  const [justConfessed, setJustConfessed] = useState(false)

  // 개교 벽화 — 잔을 들 때마다 실시간으로 병이 차오른다
  const [raisedCount, setRaisedCount] = useState(() => readJSON<string[]>('chg.raised', []).length)
  useEffect(() => {
    const onRaise = () => setRaisedCount(readJSON<string[]>('chg.raised', []).length)
    window.addEventListener('chg:raise', onRaise)
    return () => window.removeEventListener('chg:raise', onRaise)
  }, [])

  const muralCheers = items.reduce((sum, c) => sum + c.cheers, 0) + raisedCount
  const muralRatio = Math.min(muralCheers / MURAL_GOAL, 1)
  const muralFilled = Math.round(muralRatio * BOTTLE_DOTS)

  const submit = (text: string) => {
    add({ id: newId(), author: '익명의 나', text, cheers: 0, courseSlug: fromCourse?.slug })
    const next = Math.max(0, tickets - 1)
    writeJSON('chg.tickets', next)
    setTickets(next)
    setJustConfessed(true)
    window.setTimeout(() => setJustConfessed(false), 2800)
  }

  return (
    <div className="confess">
      <section className="confess-hero">
        <h1 className="confess-hero-title">어른의 처음은 아무도 축하해주지 않는다</h1>
        <p className="confess-hero-sub">여기선 실토해도 됩니다. 익명이니까.</p>
      </section>

      {justConfessed && (
        <p className="confess-done" role="status">
          실토 완료 — 사람들이 잔을 들면 라벨 인쇄 후보가 됩니다
        </p>
      )}

      <section className="confess-mural" aria-label="개교 벽화">
        <CapMosaic shape="bottle" dot={6} filled={muralFilled} />
        <div className="confess-mural-copy">
          <h2 className="confess-mural-title">개교 벽화</h2>
          <p className="confess-mural-desc">
            잔을 들 때마다 뚜껑이 하나씩 쌓입니다. 병이 가득 차면 이번 주 라벨이 인쇄소로
            갑니다.
          </p>
          <p className="confess-mural-count">
            {muralCheers.toLocaleString()} / {MURAL_GOAL.toLocaleString()}잔 ·{' '}
            {Math.round(muralRatio * 100)}%
          </p>
        </div>
      </section>

      {tickets > 0 ? (
        <section className="confess-compose" aria-label="고백 작성">
          <Composer
            key={fromCourse?.slug ?? 'plain'}
            placeholder="○○이 처음입니다…"
            helper={
              fromCourse
                ? `'${fromCourse.title}' 수업에서 온 고백 · 고백권 ${tickets}장`
                : `고백권 ${tickets}장 · 병 하나당 한 번, 익명 보장`
            }
            submitLabel="고백하기"
            rows={3}
            initialValue={fromCourse ? `${confessionOpener(fromCourse)} ` : ''}
            onSubmit={submit}
          />
        </section>
      ) : (
        <section className="confess-locked" aria-label="고백권 없음">
          <p className="confess-locked-title">고백은 병 하나당 한 번입니다</p>
          <p className="confess-locked-sub">
            새 처음처럼의 뚜껑으로 입장하면 고백권이 다시 생깁니다.
            <br />
            그동안 다른 처음에 잔과 조언을 건네보세요. 조언은 무제한이니까.
          </p>
          <Link to="/" className="confess-locked-btn">
            뚜껑 찍으러 가기 →
          </Link>
        </section>
      )}

      <Link to="/app/confess/vote" className="confess-vote">
        <span className="confess-vote-tag">주간 공지</span>
        <span className="confess-vote-body">
          라벨 투표 진행 중 · 후보 {items.filter((c) => c.cheers >= LABEL_THRESHOLD).length}편
        </span>
        <span className="confess-vote-arrow">투표하기 →</span>
      </Link>

      <ul className="confess-feed" aria-label="고백 피드">
        {items.map((confession) => (
          <li key={confession.id}>
            <ConfessionCard
              confession={confession}
              mine={localIds.has(confession.id)}
              onRemove={remove}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
