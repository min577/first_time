import { motion, useReducedMotion } from 'framer-motion'
import type { Confession } from '../data/confessions'
import './LabelPreview.css'

type Props = {
  confession: Confession
  onClose: () => void
}

// 라벨 인쇄 후보 고백을 실제 소주병에 합성해 보여준다 — 참여가 제품으로 돌아가는 순간
export default function LabelPreview({ confession, onClose }: Props) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      className="labelpreview-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="병 라벨 미리보기"
      onClick={onClose}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className="labelpreview-stage"
        onClick={(e) => e.stopPropagation()}
        initial={reducedMotion ? false : { scale: 0.88, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={reducedMotion ? undefined : { scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <div className="labelpreview-bottle">
          <svg viewBox="0 0 200 560" className="labelpreview-glass" aria-hidden="true">
            <defs>
              <linearGradient id="bottle-glass" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#1E8A62" />
                <stop offset="0.45" stopColor="#0B5C3F" />
                <stop offset="1" stopColor="#07402C" />
              </linearGradient>
            </defs>
            {/* 뚜껑 */}
            <rect x="72" y="6" width="56" height="46" rx="8" fill="#0B5C3F" />
            <rect x="72" y="42" width="56" height="6" fill="#07402C" />
            <text
              x="100"
              y="32"
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill="#FAF9F4"
            >
              처음
            </text>
            {/* 병 몸통 */}
            <path
              d="M78,52 h44 v38 c0,32 38,48 38,92 v290 c0,22 -14,34 -36,34 h-48 c-22,0 -36,-12 -36,-34 v-290 c0,-44 38,-60 38,-92 z"
              fill="url(#bottle-glass)"
            />
            {/* 유리 하이라이트 */}
            <rect x="52" y="122" width="12" height="330" rx="6" fill="#FFFFFF" opacity="0.16" />
            <rect x="130" y="200" width="6" height="240" rx="3" fill="#FFFFFF" opacity="0.08" />
          </svg>

          {/* 병 몸통 위에 합성되는 라벨 */}
          <div className="labelpreview-label">
            <p className="labelpreview-brand">처음처럼 × 처음학개론</p>
            <p className="labelpreview-week">이번 주의 처음</p>
            <p className="labelpreview-text">"{confession.text}"</p>
            <p className="labelpreview-author">— {confession.author}</p>
            <p className="labelpreview-cheers">
              {confession.cheers.toLocaleString()}잔이 이 처음에 건배했습니다
            </p>
          </div>
        </div>

        <p className="labelpreview-fine">베스트 고백은 실제 병 라벨로 인쇄됩니다 · 만 19세 이상</p>
        <button
          type="button"
          className="labelpreview-close"
          onClick={onClose}
          aria-label="미리보기 닫기"
        >
          닫기
        </button>
      </motion.div>
    </motion.div>
  )
}
