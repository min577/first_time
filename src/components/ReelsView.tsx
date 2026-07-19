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

// 그날의 술상 — 사연마다 소품이 다른 폴라로이드 속 장면
function SojuScene({ variant }: { variant: number }) {
  return (
    <svg viewBox="0 0 200 150" className="reels-scene" aria-hidden="true">
      {/* 밤의 방 */}
      <rect x="0" y="0" width="200" height="150" fill="#12241c" />
      <circle cx="100" cy="14" r="30" fill="#f6e7c1" opacity="0.14" />
      <circle cx="100" cy="12" r="13" fill="#f6e7c1" opacity="0.28" />
      {/* 테이블 */}
      <rect x="0" y="108" width="200" height="42" fill="#3a2b20" />
      <rect x="0" y="108" width="200" height="3" fill="#54402f" />
      {/* 처음처럼 병 */}
      <rect x="84" y="34" width="9" height="18" fill="#1e8a62" />
      <rect x="82.5" y="27" width="12" height="9" rx="2.5" fill="#0B5C3F" />
      <rect x="77" y="48" width="23" height="62" rx="7" fill="#1e8a62" />
      <rect x="80" y="68" width="17" height="26" rx="2" fill="#f6f3e8" />
      <line x1="83" y1="76" x2="94" y2="76" stroke="#0B5C3F" strokeWidth="2.4" />
      <line x1="83" y1="82" x2="94" y2="82" stroke="#0B5C3F" strokeWidth="2.4" />
      <ellipse cx="82" cy="60" rx="2" ry="9" fill="#ffffff" opacity="0.25" />
      {/* 잔 */}
      <path d="M112,92 L114.5,111 L124.5,111 L127,92 Z" fill="#0d1b15" stroke="#d9d4c5" strokeWidth="2" />
      <path d="M114,100 L115.5,110 L123.5,110 L125,100 Z" fill="#E8A13D" />
      {/* 소품 - 사연마다 다르다 */}
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
          <rect x="60" y="88" width="2.6" height="14" rx="1.3" fill="#c9a24b" transform="rotate(28 61 95)" />
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
          {/* 마주 앉은 사람의 잔 - 같이 마신 밤 */}
          <path d="M46,92 L48.5,111 L58.5,111 L61,92 Z" fill="#0d1b15" stroke="#d9d4c5" strokeWidth="2" />
          <path d="M48,100 L49.5,110 L57.5,110 L59,100 Z" fill="#E8A13D" />
        </g>
      )}
      {/* 비네트 */}
      <rect x="0" y="0" width="200" height="150" fill="none" stroke="#0a1510" strokeWidth="10" opacity="0.35" />
    </svg>
  )
}

// 릴스식 몰입 보기: 한 화면에 하나의 처음, 위로 쓸어올려 다음 처음으로
export default function ReelsView({ confessions, startIndex = 0, onClose }: Props) {
  const reducedMotion = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(startIndex)
  const [flipped, setFlipped] = useState<Set<string>>(new Set())
  // 사진 파일이 아직 없으면 일러스트로 폴백
  const [photoFailed, setPhotoFailed] = useState<Set<string>>(new Set())

  const toggleFlip = (id: string) => {
    setFlipped((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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
          // 사연마다 다른 그날의 술상이 나온다
          const variant =
            Array.from(confession.id).reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 4
          const isFlipped = flipped.has(confession.id)
          return (
            <article className="reels-slide" key={confession.id}>
              {confession.cheers >= LABEL_THRESHOLD && (
                <div className="reels-badge">
                  <LabelBadge />
                </div>
              )}

              {/* 문구를 누르면 카드가 뒤집히며 그날의 사진이 나온다 */}
              <div
                className="reels-card"
                role="button"
                tabIndex={0}
                aria-label={isFlipped ? '사연으로 돌아가기' : '그날의 사진 보기'}
                onClick={() => toggleFlip(confession.id)}
                onKeyDown={(e) => e.key === 'Enter' && toggleFlip(confession.id)}
              >
                <div className={`reels-card-inner${isFlipped ? ' is-flipped' : ''}`}>
                  <div className="reels-face reels-front">
                    <p className="reels-text">"{confession.text}"</p>
                    <p className="reels-author">— {confession.author}</p>
                    <span className="reels-flip-hint">누르면 그날의 사진</span>
                  </div>
                  <div className="reels-face reels-back">
                    <div className="reels-polaroid">
                      {confession.photo && !photoFailed.has(confession.id) ? (
                        <img
                          className="reels-photo-img"
                          src={confession.photo}
                          alt="그날의 사진"
                          loading="lazy"
                          onError={() =>
                            setPhotoFailed((prev) => new Set(prev).add(confession.id))
                          }
                        />
                      ) : (
                        <SojuScene variant={variant} />
                      )}
                      <p className="reels-polaroid-caption">{confession.author}, 그날 밤</p>
                    </div>
                  </div>
                </div>
              </div>

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
