import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import type { Confession } from '../data/confessions'
import { LABEL_THRESHOLD } from '../data/confessions'
import { findCourse } from '../data/courses'
import RaiseButton from './RaiseButton'
import LabelBadge from './LabelBadge'
import { saveConfessionCard } from '../hooks/photocard'
import './ReelsView.css'

type Props = {
  confessions: Confession[]
  startIndex?: number
  onClose: () => void
}

// 릴스식 몰입 보기: 한 화면에 하나의 처음, 위로 쓸어올려 다음 처음으로
export default function ReelsView({ confessions, startIndex = 0, onClose }: Props) {
  const reducedMotion = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(startIndex)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // 시작 위치로 점프
  useEffect(() => {
    const el = trackRef.current
    if (el && startIndex > 0) el.scrollTop = startIndex * el.clientHeight
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    setIndex(Math.round(el.scrollTop / el.clientHeight))
  }

  return (
    <motion.div
      className="reels"
      role="dialog"
      aria-modal="true"
      aria-label="고백 한 장씩 보기"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="reels-top">
        <span className="reels-counter">
          {index + 1} / {confessions.length}
        </span>
        <button type="button" className="reels-close" onClick={onClose} aria-label="닫기">
          ✕
        </button>
      </div>

      <div className="reels-track" ref={trackRef} onScroll={onScroll}>
        {confessions.map((confession) => {
          const course = findCourse(confession.courseSlug)
          return (
            <article className="reels-slide" key={confession.id}>
              {confession.cheers >= LABEL_THRESHOLD && (
                <div className="reels-badge">
                  <LabelBadge />
                </div>
              )}
              <p className="reels-text">"{confession.text}"</p>
              <p className="reels-author">— {confession.author}</p>

              <div className="reels-actions">
                <RaiseButton id={confession.id} count={confession.cheers} />
                <button
                  type="button"
                  className="reels-photo"
                  onClick={() => saveConfessionCard(confession)}
                  aria-label="이 처음을 포토카드로 저장"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
                    <circle cx="12" cy="13" r="3.4" />
                  </svg>
                  포토카드
                </button>
                {course && (
                  <Link
                    to={`/app/courses/${course.slug}`}
                    className="reels-course"
                    aria-label={`${course.title} 안내서로 이동`}
                  >
                    ↗ {course.title}
                  </Link>
                )}
              </div>
            </article>
          )
        })}
      </div>

      <p className="reels-hint">위로 쓸어올려 다음 처음</p>
    </motion.div>
  )
}
