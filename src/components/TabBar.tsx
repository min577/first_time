import { NavLink } from 'react-router-dom'
import './TabBar.css'

const TABS = [
  {
    to: '/app/courses',
    label: '강의',
    icon: (
      // 학사모 - 처음학개론의 수업 모티프
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3.8 21 7.9 12 12 3 7.9 12 3.8Z" />
        <path d="M7.2 10.1v3c0 1.55 2.15 2.85 4.8 2.85s4.8-1.3 4.8-2.85v-3" />
        <path d="M21 7.9v4.9" />
        <circle cx="21" cy="14.6" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    to: '/app/confess',
    label: '처음 고백',
    icon: (
      // 따옴표 말풍선 - 익명의 고백 한 마디
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3.8c-4.6 0-8.3 3-8.3 6.8 0 2.2 1.25 4.1 3.2 5.3L6.2 19.6l3.5-1.5c.73.16 1.5.25 2.3.25 4.6 0 8.3-3 8.3-6.8s-3.7-6.75-8.3-6.75Z" />
        <path d="M10 8.6l-.75 2.7" />
        <path d="M13.7 8.6l-.75 2.7" />
      </svg>
    ),
  },
  {
    to: '/app/toast',
    label: '건배사',
    icon: (
      // 부딪히는 두 잔 - 건배의 순간
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <g transform="rotate(13 6.9 12.6)">
          <path d="M4.6 6.4h4.6l-.95 7.7a1.6 1.6 0 0 1-1.59 1.4h-.5a1.6 1.6 0 0 1-1.6-1.4L4.6 6.4Z" />
          <path d="M5.2 9.6h3.5" />
        </g>
        <g transform="rotate(-13 17.1 12.6)">
          <path d="M14.8 6.4h4.6l-.95 7.7a1.6 1.6 0 0 1-1.59 1.4h-.5a1.6 1.6 0 0 1-1.6-1.4L14.8 6.4Z" />
          <path d="M15.3 9.6h3.5" />
        </g>
        <path d="M12 2.8v1.6" />
        <path d="M9.3 3.7l.85 1.2" />
        <path d="M14.7 3.7l-.85 1.2" />
      </svg>
    ),
  },
]

export default function TabBar() {
  return (
    <nav className="tabbar" aria-label="주요 메뉴">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => `tabbar-item${isActive ? ' is-active' : ''}`}
          aria-label={tab.label}
        >
          {tab.icon}
          <span className="tabbar-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
