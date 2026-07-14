import { useParams } from 'react-router-dom'

export default function CourseRoom() {
  const { slug } = useParams()

  return (
    <div className="page-placeholder">
      <h1>강의실</h1>
      <p>3단계에서 선배의 한 줄 + 한 줄 남기기가 들어옵니다. (slug: {slug})</p>
    </div>
  )
}
