import { useEffect } from 'react'
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

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
          {/* 실제 처음처럼 병 (롯데칠성 공식 제품 이미지) 위에 라벨을 합성한다 */}
          <img className="labelpreview-glass" src="/bottle.png" alt="" aria-hidden="true" />

          {/* 실제 라벨 지면(紙面) 위에 에디션을 조판한다 — 붓글씨 아트워크는 원본 사진에서 잘라 재사용 */}
          <div className="labelpreview-label">
            <p className="labelpreview-week">처음학개론 · 이번 주의 처음</p>
            <img className="labelpreview-art" src="/label-art.png" alt="처음처럼" />
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
