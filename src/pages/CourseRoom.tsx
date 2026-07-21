import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { confessionOpener, findCourse, type Course, type Tip } from '../data/courses'
import { newId, useLocalList } from '../hooks/useLocalList'
import TipCard from '../components/TipCard'
import SortSelect from '../components/SortSelect'
import type { SortMode } from '../components/SortToggle'
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
        <Link to="/app/courses" className="room-back" aria-label="강의 목록으로 돌아가기">
          ← 강의 목록
        </Link>
        <p className="room-category">{course.category}</p>
        <h1 className="room-title">{course.title}</h1>
        <p className="room-sub">이 경험을 먼저 해본 선배들이 적어준 조언이에요.</p>
      </header>

      {/* 들어가며 - 챕터를 여는 위로 한 줄 */}
      <blockquote className="room-comfort">
        <p className="room-comfort-label">들어가며</p>
        <p className="room-comfort-text">{course.comfort}</p>
      </blockquote>

      <div className="room-sorthead">
        <h2 className="room-section-title">선배들의 조언</h2>
        <SortSelect value={sort} onChange={setSort} />
      </div>
      <p className="room-vote-help">도움이 됐다면 잔을 들어주세요.</p>

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
          <p className="room-memories-hint">그 시절의 경험도 조언으로 남겨주세요.</p>
        </section>
      )}

      <section className="room-composer" aria-label="조언 남기기">
        <h2 className="room-composer-title">조언 남기기</h2>
        <Composer
          placeholder="다른 사람의 처음에 도움이 되는 조언을 적어주세요."
          submitLabel="조언 남기기"
          rows={2}
          adviceGuard
          onSubmit={submitTip}
        />
      </section>

      {/* 열람 → 고백을 한 흐름으로: 이 수업의 처음을 그대로 고백실로 가져간다 */}
      <section className="room-confess" aria-label="고백실로 이동">
        <p className="room-confess-copy">읽어도 아직 마음이 무겁다면, 털어놔도 돼요.</p>
        <button
          type="button"
          className="room-confess-btn"
          onClick={() => navigate('/app/confess', { state: { courseSlug: course.slug } })}
          aria-label={`"${confessionOpener(course)}" 고백하러 가기`}
        >
          "{confessionOpener(course)}" 고백하러 가기 →
        </button>
        <p className="room-confess-sub">사람들이 당신의 처음에 잔을 들어줘요.</p>
      </section>
    </div>
  )
}
