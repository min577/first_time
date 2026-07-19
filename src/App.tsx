import { useEffect, useRef } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import DeviceFrame from './components/DeviceFrame'
import TabBar from './components/TabBar'
import Splash from './pages/Splash'
import Courses from './pages/Courses'
import CourseRoom from './pages/CourseRoom'
import Confess from './pages/Confess'
import ToastMaker from './pages/ToastMaker'
import About from './pages/About'

function AppShell() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  // 탭·페이지 이동 시 스크롤을 맨 위로 — 실기기 앱과 동일한 감각
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="app-shell">
      <main className="app-main" ref={mainRef}>
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}

function App() {
  return (
    <DeviceFrame>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="courses" replace />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:slug" element={<CourseRoom />} />
          <Route path="confess" element={<Confess />} />
          <Route path="toast" element={<ToastMaker />} />
        </Route>
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DeviceFrame>
  )
}

export default App
