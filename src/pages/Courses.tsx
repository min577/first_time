import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES, COURSES } from '../data/courses'
import { readJSON, writeJSON } from '../hooks/useLocalList'
import StatusStrip from '../components/StatusStrip'
import './Courses.css'

type Persona = 'student' | 'worker' | 'parent'

const PERSONAS: { key: Persona; label: string; category: (typeof CATEGORIES)[number] }[] = [
  { key: 'student', label: '학생', category: '학생편' },
  { key: 'worker', label: '직장인', category: '직장인편' },
  { key: 'parent', label: '부모', category: '인생편' },
]

export default function Courses() {
  // 요즘 나는 — 고르면 내 세대의 편이 맨 위로 온다
  const [persona, setPersona] = useState<Persona | null>(() =>
    readJSON<Persona | null>('chg.persona', null),
  )

  const pick = (key: Persona) => {
    const next = persona === key ? null : key
    setPersona(next)
    writeJSON('chg.persona', next)
  }

  const myCategory = PERSONAS.find((p) => p.key === persona)?.category
  const ordered = myCategory
    ? [myCategory, ...CATEGORIES.filter((c) => c !== myCategory)]
    : [...CATEGORIES]

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
        <div className="courses-persona" role="radiogroup" aria-label="요즘 나는">
          <span className="courses-persona-label">요즘 나는</span>
          {PERSONAS.map((p) => (
            <button
              key={p.key}
              type="button"
              role="radio"
              aria-checked={persona === p.key}
              className={`courses-persona-chip${persona === p.key ? ' is-active' : ''}`}
              onClick={() => pick(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      {ordered.map((category) => {
        const catIdx = CATEGORIES.indexOf(category) // 과목코드는 원래 편 순서 기준으로 고정
        const list = COURSES.filter((c) => c.category === category)
        const isMine = category === myCategory
        return (
          <section key={category} className="courses-section" aria-label={category}>
            <h2 className="courses-category">
              <span>
                {category}
                {isMine && <span className="courses-category-mine">나의 편</span>}
              </span>
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
