import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CONFESSIONS, type Confession } from '../data/confessions'
import { confessionOpener, findCourse } from '../data/courses'
import { newId, readJSON, useLocalList, writeJSON } from '../hooks/useLocalList'
import ConfessionCard from '../components/ConfessionCard'
import Composer from '../components/Composer'
import './Confess.css'

// 강의실에서 "이 처음을 고백하기"로 넘어오면 수업 컨텍스트가 state로 담겨 온다
type ConfessLocationState = { courseSlug?: string } | null

export default function Confess() {
  const { items, localIds, add, remove } = useLocalList<Confession>('chg.confessions', CONFESSIONS)
  const state = useLocation().state as ConfessLocationState
  const fromCourse = findCourse(state?.courseSlug)

  // 고백권: 병뚜껑으로 입장할 때마다 1장. 고백은 응모처럼 병 하나당 한 번
  const [tickets, setTickets] = useState(() => readJSON<number>('chg.tickets', 0))

  const submit = (text: string) => {
    add({ id: newId(), author: '익명의 나', text, cheers: 0, courseSlug: fromCourse?.slug })
    const next = Math.max(0, tickets - 1)
    writeJSON('chg.tickets', next)
    setTickets(next)
  }

  return (
    <div className="confess">
      <section className="confess-hero">
        <h1 className="confess-hero-title">어른의 처음은 아무도 축하해주지 않는다</h1>
        <p className="confess-hero-sub">여기선 실토해도 됩니다. 익명이니까.</p>
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
