import type { Confession } from '../data/confessions'
import { LABEL_THRESHOLD } from '../data/confessions'
import RaiseButton from './RaiseButton'
import LabelBadge from './LabelBadge'
import './ConfessionCard.css'

type Props = {
  confession: Confession
  mine?: boolean
  onRemove?: (id: string) => void
}

export default function ConfessionCard({ confession, mine = false, onRemove }: Props) {
  return (
    <article className={`confession-card${mine ? ' is-mine' : ''}`}>
      {confession.cheers >= LABEL_THRESHOLD && (
        <div className="confession-badge">
          <LabelBadge />
        </div>
      )}
      <p className="confession-text">{confession.text}</p>
      <footer className="confession-foot">
        <span className="confession-author">
          {confession.author}
          {mine && onRemove && (
            <button
              type="button"
              className="confession-delete"
              onClick={() => onRemove(confession.id)}
              aria-label="내 고백 삭제"
            >
              삭제
            </button>
          )}
        </span>
        <RaiseButton id={confession.id} count={confession.cheers} />
      </footer>
    </article>
  )
}
