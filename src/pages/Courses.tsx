import { Link } from 'react-router-dom'
import { CATEGORIES, COURSES } from '../data/courses'
import StatusStrip from '../components/StatusStrip'
import './Courses.css'

export default function Courses() {
  return (
    <div className="courses">
      <header className="courses-head">
        <p className="courses-eyebrow">개교 20주년 · 처음학개론</p>
        <h1 className="courses-title">수강신청</h1>
        <p className="courses-sub">지금 내 앞에 온 '처음'을 고르세요. 교수는 없고, 선배만 있습니다.</p>
        <StatusStrip />
      </header>

      {CATEGORIES.map((category) => (
        <section key={category} className="courses-section" aria-label={category}>
          <h2 className="courses-category">{category}</h2>
          <ul className="courses-list">
            {COURSES.filter((c) => c.category === category).map((course) => (
              <li key={course.slug}>
                <Link className="course-card" to={`/app/courses/${course.slug}`}>
                  <span className="course-title">{course.title}</span>
                  <span className="course-meta">
                    선배의 한 줄 {course.tips.length}개
                    <span className="course-arrow" aria-hidden="true">
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
