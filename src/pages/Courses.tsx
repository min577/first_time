import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES, COURSES } from '../data/courses'
import { readJSON, writeJSON } from '../hooks/useLocalList'
import StatusStrip from '../components/StatusStrip'
import './Courses.css'

type Persona = 'all' | 'student' | 'worker' | 'family'

const PERSONAS: {
  key: Persona
  label: string
  category?: (typeof CATEGORIES)[number]
}[] = [
  { key: 'all', label: '전체' },
  { key: 'student', label: '학생', category: '학생편' },
  { key: 'worker', label: '직장', category: '직장인편' },
  { key: 'family', label: '가족', category: '인생편' },
]

export default function Courses() {
  const [persona, setPersona] = useState<Persona>(() => {
    const saved = readJSON<Persona | null>('chg.persona', 'all')
    return PERSONAS.some((item) => item.key === saved) ? (saved as Persona) : 'all'
  })

  const pick = (key: Persona) => {
    setPersona(key)
    writeJSON('chg.persona', key)
  }

  const selectedCategory = PERSONAS.find((item) => item.key === persona)?.category
  const categories = selectedCategory ? [selectedCategory] : [...CATEGORIES]

  return (
    <div className="courses">
      <header className="courses-head">
        <h1 className="courses-title">강의 목록</h1>
        <p className="courses-sub">
          <span>지금 필요한 강의를 골라보세요.</span>
          <span>먼저 해본 선배들의 조언을 볼 수 있어요.</span>
        </p>
        <StatusStrip />
        <div className="courses-persona" role="radiogroup" aria-label="강의 대상 필터">
          {PERSONAS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="radio"
              aria-checked={persona === item.key}
              className={`courses-persona-chip${persona === item.key ? ' is-active' : ''}`}
              onClick={() => pick(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {categories.map((category) => {
        const categoryIndex = CATEGORIES.indexOf(category)
        const list = COURSES.filter((course) => course.category === category)

        return (
          <section key={category} className="courses-section" aria-labelledby={`category-${category}`}>
            <h2 className="courses-category" id={`category-${category}`}>
              {category}
            </h2>
            <ul className="courses-list">
              {list.map((course, index) => (
                <li key={course.slug}>
                  <Link className="course-card" to={`/app/courses/${course.slug}`}>
                    <span className="course-main">
                      <span className="course-code">
                        처음학 {(categoryIndex + 1) * 100 + index + 1}
                      </span>
                      <span className="course-title">{course.title}</span>
                    </span>
                    <span className="course-arrow" aria-hidden="true">
                      →
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
