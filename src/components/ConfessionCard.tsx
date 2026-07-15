import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import type { Confession } from '../data/confessions'
import { LABEL_THRESHOLD } from '../data/confessions'
import { findCourse } from '../data/courses'
import RaiseButton from './RaiseButton'
import LabelBadge from './LabelBadge'
import LabelPreview from './LabelPreview'
import './ConfessionCard.css'

type Props = {
  confession: Confession
  mine?: boolean
  onRemove?: (id: string) => void
}

export default function ConfessionCard({ confession, mine = false, onRemove }: Props) {
  const [preview, setPreview] = useState(false)
  const isCandidate = confession.cheers >= LABEL_THRESHOLD
  const course = findCourse(confession.courseSlug)

  return (
    <article className={`confession-card${mine ? ' is-mine' : ''}`}>
      {(isCandidate || course) && (
        <div className="confession-meta">
          {isCandidate && (
            <button
              type="button"
              className="confession-badge-btn"
              onClick={() => setPreview(true)}
              aria-label="병 라벨 미리보기 열기"
            >
              <LabelBadge />
              <span className="confession-badge-hint">라벨 미리보기</span>
            </button>
          )}
          {course && (
            <Link
              to={`/app/courses/${course.slug}`}
              className="confession-course"
              aria-label={`${course.title} 강의실로 이동`}
            >
              ↗ {course.title}
            </Link>
          )}
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

      <AnimatePresence>
        {preview && <LabelPreview confession={confession} onClose={() => setPreview(false)} />}
      </AnimatePresence>
    </article>
  )
}
