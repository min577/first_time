import { motion } from 'framer-motion'

// 병뚜껑 도장 자국: 톱니 테두리 + '처음처럼' 각인. 1.4→1 스케일로 쾅 찍힌다.
export default function StampMark() {
  return (
    <motion.div
      className="stampmark"
      initial={{ scale: 1.4, opacity: 0, rotate: -8 }}
      animate={{ scale: 1, opacity: 1, rotate: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 120" width="110" height="110">
        <g fill="none" stroke="var(--paper)">
          {/* 톱니 (병뚜껑 주름) */}
          <g strokeWidth="3" strokeLinecap="round">
            {Array.from({ length: 24 }, (_, i) => {
              const angle = (i / 24) * Math.PI * 2
              const x1 = 60 + Math.cos(angle) * 52
              const y1 = 60 + Math.sin(angle) * 52
              const x2 = 60 + Math.cos(angle) * 57
              const y2 = 60 + Math.sin(angle) * 57
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
            })}
          </g>
          <circle cx="60" cy="60" r="52" strokeWidth="3" />
          <circle cx="60" cy="60" r="42" strokeWidth="1.5" opacity="0.8" />
        </g>
        <text
          x="60"
          y="66"
          textAnchor="middle"
          fill="var(--paper)"
          fontFamily="var(--font-display)"
          fontWeight="700"
          fontSize="19"
        >
          처음처럼
        </text>
      </svg>
    </motion.div>
  )
}
