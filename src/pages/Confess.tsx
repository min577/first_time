import { useLocation } from 'react-router-dom'
import { CONFESSIONS, type Confession } from '../data/confessions'
import { confessionOpener, findCourse } from '../data/courses'
import { newId, useLocalList } from '../hooks/useLocalList'
import ConfessionCard from '../components/ConfessionCard'
import Composer from '../components/Composer'
import './Confess.css'

// 강의실에서 "이 처음을 고백하기"로 넘어오면 수업 컨텍스트가 state로 담겨 온다
type ConfessLocationState = { courseSlug?: string } | null

export default function Confess() {
  const { items, localIds, add, remove } = useLocalList<Confession>('chg.confessions', CONFESSIONS)
  const state = useLocation().state as ConfessLocationState
  const fromCourse = findCourse(state?.courseSlug)

  const submit = (text: string) => {
    add({ id: newId(), author: '익명의 나', text, cheers: 0, courseSlug: fromCourse?.slug })
  }

  return (
    <div className="confess">
      <section className="confess-hero">
        <h1 className="confess-hero-title">어른의 처음은 아무도 축하해주지 않는다</h1>
        <p className="confess-hero-sub">여기선 실토해도 됩니다. 익명이니까.</p>
      </section>

      <section className="confess-compose" aria-label="고백 작성">
        <Composer
          key={fromCourse?.slug ?? 'plain'}
          placeholder="○○이 처음입니다…"
          helper={
            fromCourse ? `'${fromCourse.title}' 수업에서 온 고백` : '익명 보장 · 삭제는 언제든'
          }
          submitLabel="고백하기"
          rows={3}
          initialValue={fromCourse ? `${confessionOpener(fromCourse)} ` : ''}
          onSubmit={submit}
        />
      </section>

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
