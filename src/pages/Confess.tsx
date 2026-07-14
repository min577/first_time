import { CONFESSIONS, type Confession } from '../data/confessions'
import { newId, useLocalList } from '../hooks/useLocalList'
import ConfessionCard from '../components/ConfessionCard'
import Composer from '../components/Composer'
import './Confess.css'

export default function Confess() {
  const { items, localIds, add, remove } = useLocalList<Confession>('chg.confessions', CONFESSIONS)

  const submit = (text: string) => {
    add({ id: newId(), author: '익명의 나', text, cheers: 0 })
  }

  return (
    <div className="confess">
      <section className="confess-hero">
        <h1 className="confess-hero-title">어른의 처음은 아무도 축하해주지 않는다</h1>
        <p className="confess-hero-sub">여기선 실토해도 됩니다. 익명이니까.</p>
      </section>

      <section className="confess-compose" aria-label="고백 작성">
        <Composer
          placeholder="○○이 처음입니다…"
          helper="익명 보장 · 삭제는 언제든"
          submitLabel="고백하기"
          rows={3}
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
