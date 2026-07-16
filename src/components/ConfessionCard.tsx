import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Confession, ConfessionComment } from '../data/confessions'
import { CONFESSION_COMMENTS, LABEL_THRESHOLD } from '../data/confessions'
import { findCourse } from '../data/courses'
import { newId, readJSON, useLocalList } from '../hooks/useLocalList'
import RaiseButton from './RaiseButton'
import LabelBadge from './LabelBadge'
import CapMosaic, { mosaicTotal } from './CapMosaic'
import Composer from './Composer'
import './ConfessionCard.css'

type Props = {
  confession: Confession
  mine?: boolean
  onRemove?: (id: string) => void
}

const NO_COMMENTS: ConfessionComment[] = []

const GLASS_DOTS = mosaicTotal('glass')

export default function ConfessionCard({ confession, mine = false, onRemove }: Props) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  // 내가 이미 든 잔도 모자이크에 반영한다
  const [myCap, setMyCap] = useState(() =>
    readJSON<string[]>('chg.raised', []).includes(confession.id) ? 1 : 0,
  )
  const [justRaised, setJustRaised] = useState(false)
  const course = findCourse(confession.courseSlug)

  const cheers = confession.cheers + myCap
  const isCandidate = cheers >= LABEL_THRESHOLD
  const fillRatio = Math.min(cheers / LABEL_THRESHOLD, 1)
  const filledDots = Math.round(fillRatio * GLASS_DOTS)

  const handleRaise = () => {
    setMyCap(1)
    setJustRaised(true)
  }

  // 조언 댓글 — 고백(병당 1회)과 달리 무제한으로 달 수 있다
  const { items: comments, add: addComment } = useLocalList<ConfessionComment>(
    `chg.comments.${confession.id}`,
    CONFESSION_COMMENTS[confession.id] ?? NO_COMMENTS,
  )

  const submitComment = (text: string) => {
    // 조언을 남기는 순간 나도 선배가 된다 — 강의실 한 줄 남기기와 동일한 전환 카피
    addComment({ id: newId(), author: '나 (오늘부터 선배)', text })
  }

  return (
    <article className={`confession-card${mine ? ' is-mine' : ''}`}>
      {(isCandidate || course) && (
        <div className="confession-meta">
          {isCandidate && <LabelBadge />}
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
        <RaiseButton id={confession.id} count={confession.cheers} onRaise={handleRaise} />
      </footer>

      {/* 잔들이 뚜껑이 되어 잔 실루엣을 채운다 — 가득 차면(3,000잔) 라벨 인쇄 후보 */}
      <div className="confession-mosaic">
        <CapMosaic shape="glass" dot={5} filled={filledDots} justAdded={justRaised} />
        <p className="confession-mosaic-caption">
          {isCandidate
            ? '잔이 가득 찼습니다 — 라벨 인쇄 후보'
            : `뚜껑이 잔을 ${Math.round(fillRatio * 100)}% 채웠습니다 · 가득 차면 라벨 인쇄 후보`}
        </p>
      </div>

      <button
        type="button"
        className="confession-comments-toggle"
        onClick={() => setCommentsOpen((open) => !open)}
        aria-expanded={commentsOpen}
        aria-label={`조언 ${comments.length}개 ${commentsOpen ? '접기' : '보기'}`}
      >
        조언 {comments.length} {commentsOpen ? '▲' : '▼'}
      </button>

      {commentsOpen && (
        <div className="confession-comments">
          {comments.length > 0 && (
            <ul className="confession-comments-list" aria-label="조언 목록">
              {comments.map((comment) => (
                <li key={comment.id} className="confession-comment">
                  <strong>{comment.author}</strong> {comment.text}
                </li>
              ))}
            </ul>
          )}
          <Composer
            placeholder="이 처음에 조언 한 줄 (무제한)"
            submitLabel="조언 남기기"
            rows={1}
            onSubmit={submitComment}
          />
        </div>
      )}
    </article>
  )
}
