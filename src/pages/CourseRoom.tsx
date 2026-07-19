import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { confessionOpener, findCourse, type Course, type Tip } from '../data/courses'
import { newId, useLocalList } from '../hooks/useLocalList'
import TipCard from '../components/TipCard'
import SortToggle, { type SortMode } from '../components/SortToggle'
import Composer from '../components/Composer'
import './CourseRoom.css'

export default function CourseRoom() {
  const { slug } = useParams()
  const course = findCourse(slug)

  if (!course) return <Navigate to="/app/courses" replace />
  return <CourseRoomView course={course} />
}

function CourseRoomView({ course }: { course: Course }) {
  const navigate = useNavigate()
  const { items, localIds, add } = useLocalList<Tip>(`chg.tips.${course.slug}`, course.tips)
  const [sort, setSort] = useState<SortMode>('latest')

  // 최신순 = 내 글 먼저(작성순), 인기순 = 잔 많이 받은 조언 먼저 — 좋은 조언이 떠오른다
  const sorted = sort === 'popular' ? [...items].sort((a, b) => b.cheers - a.cheers) : items

  const submitTip = (text: string) => {
    // 수혜자 → 기여자 전환: 한 줄을 남기는 순간 나도 선배가 된다
    add({ id: newId(), author: '나 (오늘부터 선배)', text, cheers: 0 })
  }

  return (
    <div className="course-room">
      <header className="room-head">
        <Link to="/app/courses" className="room-back" aria-label="안내서 목록으로 돌아가기">
          ← 안내서 목록
        </Link>
        <p className="room-category">{course.category}</p>
        <h1 className="room-title">{course.title}</h1>
        <p className="room-sub">먼저 겪은 사람들이 쓴 안내와 위로입니다</p>
      </header>

      {/* 들어가며 - 챕터를 여는 위로 한 줄 */}
      <blockquote className="room-comfort">
        <p className="room-comfort-label">들어가며</p>
        <p className="room-comfort-text">{course.comfort}</p>
      </blockquote>

      <div className="room-sorthead">
        <h2 className="room-section-title">안내 {items.length}줄</h2>
        <SortToggle value={sort} onChange={setSort} />
      </div>

      <ul className="room-tips">
        {sorted.map((tip) => (
          <li key={tip.id}>
            <TipCard tip={tip} mine={localIds.has(tip.id)} />
          </li>
        ))}
      </ul>

      {/* 그 시절엔 - 3049에겐 향수, 2030에겐 재미. 세대를 한 테이블에 앉히는 장치 */}
      {course.memories && course.memories.length > 0 && (
        <section className="room-memories" aria-label="그 시절의 처음">
          <h2 className="room-section-title">그 시절엔</h2>
          <ul className="room-memories-list">
            {course.memories.map((memory) => (
              <li key={memory.id} className="room-memory">
                <span className="room-memory-era">{memory.author}</span>
                <p className="room-memory-text">{memory.text}</p>
              </li>
            ))}
          </ul>
          <p className="room-memories-hint">당신의 그 시절도 아래 한 줄로 보태주세요</p>
        </section>
      )}

      <section className="room-composer" aria-label="한 줄 남기기">
        <h2 className="room-composer-title">이 안내서에 한 줄 보태기</h2>
        <Composer
          placeholder="다음 사람의 처음이 덜 무섭도록, 안내 또는 위로 한 줄"
          helper="남기는 순간, 당신도 이 안내서의 저자가 됩니다"
          submitLabel="한 줄 남기기"
          rows={2}
          adviceGuard
          onSubmit={submitTip}
        />
      </section>

      {/* 열람 → 고백을 한 흐름으로: 이 수업의 처음을 그대로 고백실로 가져간다 */}
      <section className="room-confess" aria-label="고백실로 이동">
        <p className="room-confess-copy">읽어도 여전히 무섭다면, 실토해도 됩니다.</p>
        <button
          type="button"
          className="room-confess-btn"
          onClick={() => navigate('/app/confess', { state: { courseSlug: course.slug } })}
          aria-label={`"${confessionOpener(course)}" 고백하러 가기`}
        >
          "{confessionOpener(course)}" 고백하러 가기 →
        </button>
        <p className="room-confess-sub">익명입니다. 사람들이 이 처음에 잔을 들어줍니다.</p>
      </section>
    </div>
  )
}
