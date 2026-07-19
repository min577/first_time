import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CONFESSIONS, LABEL_THRESHOLD, type Confession } from '../data/confessions'
import { confessionOpener, findCourse } from '../data/courses'
import { newId, readJSON, useLocalList, writeJSON } from '../hooks/useLocalList'
import { AnimatePresence } from 'framer-motion'
import ConfessionCard from '../components/ConfessionCard'
import CapMosaic, { mosaicTotal } from '../components/CapMosaic'
import MuralView from '../components/MuralView'
import SortToggle, { type SortMode } from '../components/SortToggle'
import Composer from '../components/Composer'
import './Confess.css'

// 개교 벽화: 모두의 잔(뚜껑)이 병 하나를 채우면 이번 주 라벨이 인쇄소로 간다
const MURAL_GOAL = 20000
const BOTTLE_DOTS = mosaicTotal('bottle')

// 벽화 갤러리 - 완성된 지난 벽화들. 캠페인이 살아 움직여 왔다는 증거
const PAST_MURALS = [
  {
    key: 'last-week',
    shape: 'glass' as const,
    title: '지난주의 잔',
    desc: "지난주에 다 함께 완성한 그림입니다. '보호자 칸에 제 이름을 쓰는데 손이 떨렸습니다'가 라벨 2호로 인쇄됐습니다.",
    count: '18,204잔으로 완성',
  },
  {
    key: 'anniversary',
    shape: 'cap' as const,
    title: '개교 기념 병뚜껑',
    desc: '개교 20주년을 축하하며 모두가 함께 채운 첫 그림입니다.',
    count: '32,000잔으로 완성',
  },
]

// 강의실에서 "이 처음을 고백하기"로 넘어오면 수업 컨텍스트가 state로 담겨 온다
type ConfessLocationState = { courseSlug?: string } | null

export default function Confess() {
  const { items, localIds, add, remove } = useLocalList<Confession>('chg.confessions', CONFESSIONS)
  const state = useLocation().state as ConfessLocationState
  const fromCourse = findCourse(state?.courseSlug)

  // 고백권: 병뚜껑으로 입장할 때마다 1장. 고백은 응모처럼 병 하나당 한 번
  const [tickets, setTickets] = useState(() => readJSON<number>('chg.tickets', 0))
  const [justConfessed, setJustConfessed] = useState(false)

  // 개교 벽화 — 잔을 들거나 벽화에 직접 뚜껑을 보탤 때마다 실시간으로 차오른다
  const [raisedCount, setRaisedCount] = useState(() => readJSON<string[]>('chg.raised', []).length)
  const [muralExtra, setMuralExtra] = useState(() => readJSON<number>('chg.muralExtra', 0))
  useEffect(() => {
    const onRaise = () => {
      setRaisedCount(readJSON<string[]>('chg.raised', []).length)
      setMuralExtra(readJSON<number>('chg.muralExtra', 0))
    }
    window.addEventListener('chg:raise', onRaise)
    return () => window.removeEventListener('chg:raise', onRaise)
  }, [])

  const muralCheers = items.reduce((sum, c) => sum + c.cheers, 0) + raisedCount + muralExtra
  const muralRatio = Math.min(muralCheers / MURAL_GOAL, 1)
  const muralFilled = Math.round(muralRatio * BOTTLE_DOTS)

  // 피드 정렬 — 최신순(내 글 먼저) / 인기순(잔 많이 받은 처음 먼저)
  const [sort, setSort] = useState<SortMode>('latest')
  const sorted = sort === 'popular' ? [...items].sort((a, b) => b.cheers - a.cheers) : items

  // 벽화 갤러리 스와이프 위치 + 확대 뷰
  const [muralIndex, setMuralIndex] = useState(0)
  const [muralOpen, setMuralOpen] = useState<number | null>(null)
  const onMuralScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    setMuralIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  const submit = (text: string) => {
    add({ id: newId(), author: '익명의 나', text, cheers: 0, courseSlug: fromCourse?.slug })
    const next = Math.max(0, tickets - 1)
    writeJSON('chg.tickets', next)
    setTickets(next)
    setJustConfessed(true)
    window.setTimeout(() => setJustConfessed(false), 2800)
  }

  return (
    <div className="confess">
      <section className="confess-hero">
        <h1 className="confess-hero-title">어른의 처음은 아무도 축하해주지 않는다</h1>
        <p className="confess-hero-sub">여기선 털어놔도 됩니다. 익명이니까.</p>
      </section>

      {justConfessed && (
        <p className="confess-done" role="status">
          고백 완료 - 사람들이 잔을 들면 라벨 인쇄 후보가 됩니다
        </p>
      )}

      <section className="confess-mural" aria-label="개교 벽화 갤러리">
        <p className="confess-mural-eyebrow">개교 벽화 · 모두의 잔이 모여 그림이 됩니다</p>
        <div className="confess-mural-track" onScroll={onMuralScroll}>
          <article
            className="confess-mural-slide"
            role="button"
            tabIndex={0}
            aria-label="이번 주 벽화 크게 보기"
            onClick={() => setMuralOpen(0)}
            onKeyDown={(e) => e.key === 'Enter' && setMuralOpen(0)}
          >
            <div className="confess-mural-stage">
              <div className="confess-mural-float">
                <CapMosaic shape="bottle" dot={6} filled={muralFilled} animateIn />
              </div>
            </div>
            <div className="confess-mural-copy">
              <h2 className="confess-mural-title">이번 주의 병</h2>
              <p className="confess-mural-desc">
                누군가의 고백에 잔을 들면, 그 잔이 병뚜껑이 되어 여기에 쌓입니다. 병이 가득
                차면 이번 주 라벨이 실제로 인쇄됩니다.
              </p>
              <p className="confess-mural-count">
                {muralCheers.toLocaleString()} / {MURAL_GOAL.toLocaleString()}잔 ·{' '}
                {Math.round(muralRatio * 100)}%
              </p>
            </div>
          </article>

          {PAST_MURALS.map((mural, i) => (
            <article
              className="confess-mural-slide"
              key={mural.key}
              role="button"
              tabIndex={0}
              aria-label={`${mural.title} 크게 보기`}
              onClick={() => setMuralOpen(i + 1)}
              onKeyDown={(e) => e.key === 'Enter' && setMuralOpen(i + 1)}
            >
              <div className="confess-mural-stage">
                <div className="confess-mural-float">
                  <CapMosaic
                    shape={mural.shape}
                    dot={6}
                    filled={mosaicTotal(mural.shape)}
                    animateIn
                  />
                </div>
              </div>
              <div className="confess-mural-copy">
                <h2 className="confess-mural-title">
                  {mural.title}
                  <span className="confess-mural-done">완성</span>
                </h2>
                <p className="confess-mural-desc">{mural.desc}</p>
                <p className="confess-mural-count">{mural.count}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="confess-mural-foot">
          <div className="confess-mural-dots" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`confess-mural-dot${muralIndex === i ? ' is-active' : ''}`}
              />
            ))}
          </div>
          <span className="confess-mural-hint">누르면 크게 · 밀어서 지난 벽화</span>
        </div>
      </section>

      <AnimatePresence>
        {muralOpen === 0 && (
          <MuralView
            shape="bottle"
            title="이번 주의 병"
            desc="누군가의 고백에 잔을 들면 그 잔이 병뚜껑이 되어 쌓입니다. 병이 가득 차면 이번 주 라벨이 실제로 인쇄됩니다."
            live
            baseCheers={items.reduce((sum, c) => sum + c.cheers, 0) + raisedCount}
            goal={MURAL_GOAL}
            onClose={() => setMuralOpen(null)}
          />
        )}
        {muralOpen !== null && muralOpen > 0 && (
          <MuralView
            shape={PAST_MURALS[muralOpen - 1].shape}
            title={PAST_MURALS[muralOpen - 1].title}
            desc={PAST_MURALS[muralOpen - 1].desc}
            doneCount={PAST_MURALS[muralOpen - 1].count}
            onClose={() => setMuralOpen(null)}
          />
        )}
      </AnimatePresence>

      {tickets > 0 ? (
        <section className="confess-compose" aria-label="고백 작성">
          <Composer
            key={fromCourse?.slug ?? 'plain'}
            placeholder="○○이 처음입니다…"
            helper={
              fromCourse
                ? `'${fromCourse.title}' 수업에서 온 고백 · 고백권 ${tickets}장`
                : `고백권 ${tickets}장 · 병 하나당 한 번, 익명 보장`
            }
            submitLabel="고백하기"
            rows={3}
            initialValue={fromCourse ? `${confessionOpener(fromCourse)} ` : ''}
            onSubmit={submit}
          />
        </section>
      ) : (
        <section className="confess-locked" aria-label="고백권 없음">
          <p className="confess-locked-title">고백은 병 하나당 한 번입니다</p>
          <p className="confess-locked-sub">
            새 처음처럼의 뚜껑으로 입장하면 고백권이 다시 생깁니다.
            <br />
            그동안 다른 처음에 잔과 조언을 건네보세요. 조언은 무제한이니까.
          </p>
          <Link to="/" className="confess-locked-btn">
            뚜껑 찍으러 가기 →
          </Link>
        </section>
      )}

      <Link to="/app/confess/vote" className="confess-vote">
        <span className="confess-vote-tag">주간 공지</span>
        <span className="confess-vote-body">
          라벨 투표 진행 중 · 후보 {items.filter((c) => c.cheers >= LABEL_THRESHOLD).length}편
        </span>
        <span className="confess-vote-arrow">투표하기 →</span>
      </Link>

      <div className="confess-feedhead">
        <span className="confess-feedcount">고백 {items.length}편</span>
        <SortToggle value={sort} onChange={setSort} />
      </div>

      <ul className="confess-feed" aria-label="고백 피드">
        {sorted.map((confession) => (
          <li key={confession.id}>
            <ConfessionCard
              confession={confession}
              mine={localIds.has(confession.id)}
              onRemove={remove}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
