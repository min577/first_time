import { Link } from 'react-router-dom'
import { CATEGORIES, COURSES } from '../data/courses'
import StatusStrip from '../components/StatusStrip'
import './Courses.css'

export default function Courses() {
  return (
    <div className="courses">
      <header className="courses-head">
        <p className="courses-eyebrow">개교 20주년 · 처음학개론</p>
        <h1 className="courses-title">
          처음 안내서
          <span className="courses-seal" aria-hidden="true">
            처음
          </span>
        </h1>
        <p className="courses-sub">
          지금 내 앞에 온 '처음'을 고르세요. 먼저 겪은 사람들이 쓴 안내와 위로가 있습니다.
        </p>
        <StatusStrip />
      </header>

      {CATEGORIES.map((category, catIdx) => {
        const list = COURSES.filter((c) => c.category === category)
        return (
          <section key={category} className="courses-section" aria-label={category}>
            <h2 className="courses-category">
              {category}
              <span className="courses-category-count">{list.length}과목</span>
            </h2>
            <ul className="courses-list">
              {list.map((course, i) => (
                <li key={course.slug}>
                  <Link className="course-card" to={`/app/courses/${course.slug}`}>
                    <span className="course-main">
                      {/* 수강편람 감성: 과목코드 (학생편 1XX · 직장인편 2XX · 인생편 3XX) */}
                      <span className="course-code">처음학 {(catIdx + 1) * 100 + i + 1}</span>
                      <span className="course-title">{course.title}</span>
                    </span>
                    <span className="course-meta">
                      안내 {course.tips.length}줄
                      <span className="course-arrow" aria-hidden="true">
                        →
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
