import { motion, useReducedMotion } from 'framer-motion'
import type { Confession } from '../data/confessions'
import './LabelPreview.css'

type Props = {
  confession: Confession
  onClose: () => void
}

// 라벨 인쇄 후보 고백을 실제 병 라벨 시안으로 보여준다 — 참여가 제품으로 돌아가는 순간
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
      <motion.article
        className="labelpreview"
        onClick={(e) => e.stopPropagation()}
        initial={reducedMotion ? false : { scale: 0.85, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={reducedMotion ? undefined : { scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <p className="labelpreview-brand">처음처럼 × 처음학개론</p>
        <p className="labelpreview-week">이번 주의 처음</p>
        <p className="labelpreview-text">"{confession.text}"</p>
        <p className="labelpreview-author">— {confession.author}</p>
        <div className="labelpreview-foot">
          <p className="labelpreview-cheers">{confession.cheers.toLocaleString()}잔이 이 처음에 건배했습니다</p>
          <p className="labelpreview-fine">베스트 고백은 실제 병 라벨로 인쇄됩니다 · 만 19세 이상</p>
        </div>
        <button type="button" className="labelpreview-close" onClick={onClose} aria-label="미리보기 닫기">
          닫기
        </button>
      </motion.article>
    </motion.div>
  )
}
