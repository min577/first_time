import { useId } from 'react'

// 소주잔 SVG. raised 상태면 앰버로 채워진다. 윤곽선은 currentColor.
export default function SojuGlass({ filled, size = 18 }: { filled: boolean; size?: number }) {
  const clipId = useId()

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <path d="M8 5.4 H16 L15.15 18.3 A1.3 1.3 0 0 1 13.85 19.5 H10.15 A1.3 1.3 0 0 1 8.85 18.3 Z" />
        </clipPath>
      </defs>
      {filled && (
        <rect x="4" y="10.5" width="16" height="12" fill="var(--amber)" clipPath={`url(#${clipId})`} />
      )}
      <path
        d="M7.2 4 H16.8 L15.7 18.5 A2 2 0 0 1 13.7 20.3 H10.3 A2 2 0 0 1 8.3 18.5 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}
