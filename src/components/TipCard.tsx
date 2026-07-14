import type { Tip } from '../data/courses'
import RaiseButton from './RaiseButton'
import './TipCard.css'

export default function TipCard({ tip, mine = false }: { tip: Tip; mine?: boolean }) {
  return (
    <article className={`tip-card${mine ? ' is-mine' : ''}`}>
      <p className="tip-text">“{tip.text}”</p>
      <footer className="tip-foot">
        <span className="tip-author">{tip.author}</span>
        <RaiseButton id={tip.id} count={tip.cheers} />
      </footer>
    </article>
  )
}
