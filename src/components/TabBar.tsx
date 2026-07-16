import { NavLink } from 'react-router-dom'
import './TabBar.css'

const TABS = [
  {
    to: '/app/courses',
    label: '선배 한 줄',
    icon: (
      // 펼친 책
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 6.5C10.5 5 8.2 4.5 5.5 4.5c-1 0-2 .1-2.5.3v13.7c.5-.2 1.5-.3 2.5-.3 2.7 0 5 .5 6.5 2 1.5-1.5 3.8-2 6.5-2 1 0 2 .1 2.5.3V4.8c-.5-.2-1.5-.3-2.5-.3-2.7 0-5 .5-6.5 2Z" />
        <path d="M12 6.5v13.7" />
      </svg>
    ),
  },
  {
    to: '/app/confess',
    label: '처음 고백',
    icon: (
      // 말풍선
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.4-4.1-1L3 20l1-5.4A8.5 8.5 0 1 1 21 11.5Z" />
      </svg>
    ),
  },
  {
    to: '/app/toast',
    label: '건배사',
    icon: (
      // 소주잔
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 4h10l-1.2 15a2 2 0 0 1-2 1.8H10.2a2 2 0 0 1-2-1.8L7 4Z" />
        <path d="M7.6 11h8.8" />
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
