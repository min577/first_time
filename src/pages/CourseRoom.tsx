import { Link, Navigate, useParams } from 'react-router-dom'
import { findCourse, type Course, type Tip } from '../data/courses'
import { newId, useLocalList } from '../hooks/useLocalList'
import TipCard from '../components/TipCard'
import Composer from '../components/Composer'
import './CourseRoom.css'

export default function CourseRoom() {
  const { slug } = useParams()
  const course = findCourse(slug)

  if (!course) return <Navigate to="/app/courses" replace />
  return <CourseRoomView course={course} />
}

function CourseRoomView({ course }: { course: Course }) {
  const { items, localIds, add } = useLocalList<Tip>(`chg.tips.${course.slug}`, course.tips)

  const submitTip = (text: string) => {
    // 수혜자 → 기여자 전환: 한 줄을 남기는 순간 나도 선배가 된다
    add({ id: newId(), author: '나 (오늘부터 선배)', text, cheers: 0 })
  }

  return (
    <div className="course-room">
      <header className="room-head">
        <Link to="/app/courses" className="room-back" aria-label="수강신청으로 돌아가기">
          ← 수강신청
        </Link>
        <p className="room-category">{course.category}</p>
        <h1 className="room-title">{course.title}</h1>
        <p className="room-sub">선배의 한 줄 {items.length}개 · 마음에 닿으면 잔을 들어주세요</p>
      </header>

      <ul className="room-tips">
        {items.map((tip) => (
          <li key={tip.id}>
            <TipCard tip={tip} mine={localIds.has(tip.id)} />
          </li>
        ))}
      </ul>

      <section className="room-composer" aria-label="한 줄 남기기">
        <h2 className="room-composer-title">나의 한 줄 남기기</h2>
        <Composer
          placeholder="다음 사람의 처음이 덜 무섭도록, 한 줄을 남겨주세요"
          helper="남기는 순간, 당신도 선배가 됩니다"
          submitLabel="한 줄 남기기"
          rows={2}
          onSubmit={submitTip}
        />
      </section>
    </div>
  )
}
