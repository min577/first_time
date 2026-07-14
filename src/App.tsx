import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import TabBar from './components/TabBar'
import Splash from './pages/Splash'
import Courses from './pages/Courses'
import CourseRoom from './pages/CourseRoom'
import Confess from './pages/Confess'
import ToastMaker from './pages/ToastMaker'
import About from './pages/About'

function AppShell() {
  return (
    <div className="app-shell">
      <main className="app-main">
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}

function App() {
  return (
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
  )
}

export default App
