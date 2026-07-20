import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Confession } from '../data/confessions'
import { LABEL_THRESHOLD } from '../data/confessions'
import { findCourse } from '../data/courses'
import RaiseButton from './RaiseButton'
import LabelBadge from './LabelBadge'
import { saveConfessionCard } from '../hooks/photocard'
import './ConfessionSlide.css'

// 그날의 술상 — 사연마다 소품이 다른 폴라로이드 속 장면 (사진이 없을 때의 폴백)
function SojuScene({ variant }: { variant: number }) {
  return (
    <svg viewBox="0 0 200 150" className="cslide-scene" aria-hidden="true">
      <rect x="0" y="0" width="200" height="150" fill="#12241c" />
      <circle cx="100" cy="14" r="30" fill="#f6e7c1" opacity="0.14" />
      <circle cx="100" cy="12" r="13" fill="#f6e7c1" opacity="0.28" />
      <rect x="0" y="108" width="200" height="42" fill="#3a2b20" />
      <rect x="0" y="108" width="200" height="3" fill="#54402f" />
      <rect x="84" y="34" width="9" height="18" fill="#1e8a62" />
      <rect x="82.5" y="27" width="12" height="9" rx="2.5" fill="#0B5C3F" />
      <rect x="77" y="48" width="23" height="62" rx="7" fill="#1e8a62" />
      <rect x="80" y="68" width="17" height="26" rx="2" fill="#f6f3e8" />
      <line x1="83" y1="76" x2="94" y2="76" stroke="#0B5C3F" strokeWidth="2.4" />
      <line x1="83" y1="82" x2="94" y2="82" stroke="#0B5C3F" strokeWidth="2.4" />
      <ellipse cx="82" cy="60" rx="2" ry="9" fill="#ffffff" opacity="0.25" />
      <path d="M112,92 L114.5,111 L124.5,111 L127,92 Z" fill="#0d1b15" stroke="#d9d4c5" strokeWidth="2" />
      <path d="M114,100 L115.5,110 L123.5,110 L125,100 Z" fill="#E8A13D" />
      {variant === 0 && (
        <g>
          <rect x="42" y="86" width="22" height="24" rx="3" fill="#d94f35" />
          <ellipse cx="53" cy="86" rx="11" ry="3.5" fill="#f3ede0" />
          <path d="M46,92 h14 M46,98 h14" stroke="#b53a24" strokeWidth="2" />
        </g>
      )}
      {variant === 1 && (
        <g transform="rotate(-5 52 102)">
          <rect x="38" y="95" width="28" height="16" rx="2" fill="#ece6d4" />
          <line x1="42" y1="100" x2="60" y2="100" stroke="#9a9381" strokeWidth="1.6" />
          <line x1="42" y1="105" x2="56" y2="105" stroke="#9a9381" strokeWidth="1.6" />
        </g>
      )}
      {variant === 2 && (
        <g>
          <circle cx="49" cy="104" r="7" fill="#f0932f" />
          <circle cx="62" cy="107" r="6" fill="#f0932f" />
          <path d="M49,97 q2,-3 5,-3" stroke="#3f7d4e" strokeWidth="2" fill="none" />
        </g>
      )}
      {variant === 3 && (
        <g>
          <path d="M46,92 L48.5,111 L58.5,111 L61,92 Z" fill="#0d1b15" stroke="#d9d4c5" strokeWidth="2" />
          <path d="M48,100 L49.5,110 L57.5,110 L59,100 Z" fill="#E8A13D" />
        </g>
      )}
      <rect x="0" y="0" width="200" height="150" fill="none" stroke="#0a1510" strokeWidth="10" opacity="0.35" />
    </svg>
  )
}

type Props = {
  confession: Confession
  mine: boolean
  commentCount: number
  onOpenComments: (confession: Confession) => void
  onRemove?: (id: string) => void
}

// 릴스 슬라이드 한 장: 앞면 사연, 누르면 뒤집혀 그날의 사진
export default function ConfessionSlide({
  confession,
  mine,
  commentCount,
  onOpenComments,
  onRemove,
}: Props) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [photoFailed, setPhotoFailed] = useState(false)
  const course = findCourse(confession.courseSlug)
  const variant = Array.from(confession.id).reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 4

  return (
    <article className="cslide">
      {confession.cheers >= LABEL_THRESHOLD && (
        <div className="cslide-badge">
          <LabelBadge />
        </div>
      )}

      <div
        className="cslide-card"
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? '사연으로 돌아가기' : '그날의 사진 보기'}
        onClick={() => setIsFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsFlipped((f) => !f)
          }
        }}
      >
        {isFlipped ? (
          <div className="cslide-face cslide-back">
            <div className="cslide-polaroid">
              {confession.photo && !photoFailed ? (
                <img
                  className="cslide-photo"
                  src={confession.photo}
                  alt="그날의 사진"
                  loading="lazy"
                  onError={() => setPhotoFailed(true)}
                />
              ) : (
                <SojuScene variant={variant} />
              )}
              <p className="cslide-polaroid-caption">{confession.author}, 그날 밤</p>
            </div>
            <span className="cslide-flip-hint">누르면 고백으로 돌아가기</span>
          </div>
        ) : (
          <div className="cslide-face cslide-front">
            <p className="cslide-text">“{confession.text}”</p>
            <p className="cslide-author">{confession.author}</p>
            <span className="cslide-flip-hint">누르면 그날의 사진</span>
          </div>
        )}
      </div>

      <div className="cslide-actions">
        <RaiseButton id={confession.id} count={confession.cheers} />
        <button
          type="button"
          className="cslide-action"
          onClick={() => onOpenComments(confession)}
          aria-label={`조언 ${commentCount}개 보기`}
        >
          조언 {commentCount}
        </button>
        <button
          type="button"
          className="cslide-action"
          onClick={() => saveConfessionCard(confession)}
          aria-label="포토카드로 저장"
        >
          포토카드
        </button>
        {mine && onRemove && (
          <button
            type="button"
            className="cslide-action is-danger"
            onClick={() => onRemove(confession.id)}
            aria-label="내 고백 삭제"
          >
            삭제
          </button>
        )}
      </div>

      {course && (
        <Link
          to={`/app/courses/${course.slug}`}
          className="cslide-course"
          aria-label={`${course.title} 강의로 이동`}
        >
          ↗ {course.title}
        </Link>
      )}
    </article>
  )
}
