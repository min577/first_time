import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  CONFESSIONS,
  CONFESSION_COMMENTS,
  LABEL_THRESHOLD,
  type Confession,
  type ConfessionComment,
} from '../data/confessions'
import { confessionOpener, findCourse } from '../data/courses'
import { newId, readJSON, useLocalList, writeJSON } from '../hooks/useLocalList'
import ConfessionSlide from '../components/ConfessionSlide'
import CapMosaic from '../components/CapMosaic'
import { gridTotal, useTextDots } from '../components/mosaicText'
import MuralView from '../components/MuralView'
import SortToggle, { type SortMode } from '../components/SortToggle'
import Composer from '../components/Composer'
import './Confess.css'

// 개교 벽화: 모두의 잔(뚜껑)이 글자를 완성하면 이번 주 라벨이 인쇄소로 간다
const MURAL_GOAL = 20000

const PAST_MURALS = [
  {
    key: 'last-week',
    text: '건배',
    title: '지난주 벽화 · 건배',
    desc: "지난주에 다 함께 완성한 글자입니다. '보호자 칸에 제 이름을 쓰는데 손이 떨렸습니다'가 라벨 2호로 인쇄됐습니다.",
    count: '18,204잔으로 완성',
  },
  {
    key: 'anniversary',
    text: '20',
    title: '개교 기념 · 20',
    desc: '개교 20주년을 축하하며 모두가 함께 채운 첫 글자입니다.',
    count: '32,000잔으로 완성',
  },
]

// 강의실에서 "이 처음을 고백하기"로 넘어오면 수업 컨텍스트가 state로 담겨 온다
type ConfessLocationState = { courseSlug?: string } | null

const NO_COMMENTS: ConfessionComment[] = []

// 조언 바텀 시트 — 무제한, 선배 서약·리라이트 필터 적용
function CommentsSheet({
  confession,
  onClose,
  onChanged,
}: {
  confession: Confession
  onClose: () => void
  onChanged: () => void
}) {
  const reducedMotion = useReducedMotion()
  const { items: comments, add } = useLocalList<ConfessionComment>(
    `chg.comments.${confession.id}`,
    CONFESSION_COMMENTS[confession.id] ?? NO_COMMENTS,
  )

  const submit = (text: string) => {
    add({ id: newId(), author: '나 (오늘부터 선배)', text })
    onChanged()
  }

  return (
    <motion.div
      className="confessr-sheetwrap"
      onClick={onClose}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className="confessr-sheet"
        onClick={(e) => e.stopPropagation()}
        initial={reducedMotion ? false : { y: '100%' }}
        animate={{ y: 0 }}
        exit={reducedMotion ? undefined : { y: '100%' }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <p className="confessr-sheet-title">조언 {comments.length}</p>
        <p className="confessr-sheet-quote">"{confession.text}"</p>
        {comments.length > 0 && (
          <ul className="confessr-comments" aria-label="조언 목록">
            {comments.map((comment) => (
              <li key={comment.id} className="confessr-comment">
                <strong>{comment.author}</strong> {comment.text}
              </li>
            ))}
          </ul>
        )}
        <Composer
          placeholder="이 처음에 조언 한 줄"
          submitLabel="조언 남기기"
          rows={1}
          adviceGuard
          onSubmit={submit}
        />
      </motion.div>
    </motion.div>
  )
}

export default function Confess() {
  const { items, localIds, add, remove } = useLocalList<Confession>('chg.confessions', CONFESSIONS)
  const state = useLocation().state as ConfessLocationState
  const fromCourse = findCourse(state?.courseSlug)
  const reducedMotion = useReducedMotion()

  // 고백권: 병뚜껑으로 입장할 때마다 1장. 고백은 응모처럼 병 하나당 한 번
  const [tickets, setTickets] = useState(() => readJSON<number>('chg.tickets', 0))
  const [justConfessed, setJustConfessed] = useState(false)

  // 개교 벽화 — 잔을 들거나 뚜껑을 보탤 때마다 실시간으로 차오른다
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

  const gridThisWeek = useTextDots('처음', 20)
  const gridLastWeek = useTextDots('건배', 20)
  const gridAnniv = useTextDots('20', 13)
  const pastGrids = [gridLastWeek, gridAnniv]

  const muralCheers = items.reduce((sum, c) => sum + c.cheers, 0) + raisedCount + muralExtra
  const muralRatio = Math.min(muralCheers / MURAL_GOAL, 1)
  const muralFilled = Math.round(muralRatio * gridTotal(gridThisWeek))

  // 정렬 + 릴스 트랙
  const [sort, setSort] = useState<SortMode>('latest')
  const sorted = sort === 'popular' ? [...items].sort((a, b) => b.cheers - a.cheers) : items
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    setIndex(Math.round(el.scrollTop / el.clientHeight))
  }

  // 오버레이들
  const [muralOpen, setMuralOpen] = useState<number | null>(null)
  const [commentsFor, setCommentsFor] = useState<Confession | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const [commentVersion, setCommentVersion] = useState(0)

  // 안내서에서 "이 처음을 고백하기"로 넘어오면 작성 시트가 바로 열린다
  useEffect(() => {
    if (fromCourse) setComposerOpen(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const commentCount = (id: string) => {
    void commentVersion // 시트에서 조언이 추가되면 다시 센다
    return (
      (CONFESSION_COMMENTS[id]?.length ?? 0) + readJSON<ConfessionComment[]>(`chg.comments.${id}`, []).length
    )
  }

  const submitConfession = (text: string) => {
    add({ id: newId(), author: '익명의 나', text, cheers: 0, courseSlug: fromCourse?.slug })
    const next = Math.max(0, tickets - 1)
    writeJSON('chg.tickets', next)
    setTickets(next)
    setComposerOpen(false)
    setJustConfessed(true)
    window.setTimeout(() => setJustConfessed(false), 2600)
    // 최신순으로 바꾸고 내 고백(첫 사연 슬라이드)으로 이동
    setSort('latest')
    window.setTimeout(() => {
      trackRef.current?.scrollTo({
        top: trackRef.current.clientHeight,
        behavior: reducedMotion ? 'auto' : 'smooth',
      })
    }, 80)
  }

  const candidates = items.filter((c) => c.cheers >= LABEL_THRESHOLD).length

  return (
    <div className="confessr">
      {/* 상단 오버레이 바 */}
      <header className="confessr-top">
        <span className="confessr-title">
          처음 고백
          <span className="confessr-counter">
            {index === 0 ? `사연 ${sorted.length}편` : `${index} / ${sorted.length}`}
          </span>
        </span>
        <div className="confessr-tools">
          <SortToggle value={sort} onChange={setSort} />
          <Link to="/app/confess/vote" className="confessr-vote" aria-label="라벨 투표소">
            투표 {candidates}
          </Link>
        </div>
      </header>

      {/* 릴스 트랙: 첫 장은 개교 벽화, 이후 사연들 */}
      <div className="confessr-track" ref={trackRef} onScroll={onScroll}>
        <section className="confessr-intro">
          <h1 className="confessr-hero">어른의 처음은 아무도 축하해주지 않는다</h1>
          <p className="confessr-hero-sub">여기선 털어놔도 됩니다. 익명이니까.</p>

          <button
            type="button"
            className="confessr-mural"
            onClick={() => setMuralOpen(0)}
            aria-label="이번 주 벽화 크게 보기"
          >
            <CapMosaic grid={gridThisWeek} dot={5} filled={muralFilled} animateIn />
          </button>
          <p className="confessr-mural-count">
            개교 벽화 '처음' · {muralCheers.toLocaleString()} / {MURAL_GOAL.toLocaleString()}잔 ·{' '}
            {Math.round(muralRatio * 100)}%
          </p>
          <p className="confessr-mural-desc">
            잔을 들면 뚜껑이 글자를 채웁니다. 완성되면 이번 주 라벨이 인쇄됩니다.
          </p>
          <div className="confessr-pastchips">
            {PAST_MURALS.map((mural, i) => (
              <button
                key={mural.key}
                type="button"
                className="confessr-pastchip"
                onClick={() => setMuralOpen(i + 1)}
              >
                {mural.title.replace(' 벽화', '')} 完
              </button>
            ))}
          </div>

          <p className="confessr-swipe-hint">위로 쓸어올려 사연 보기</p>
        </section>

        {sorted.map((confession) => (
          <ConfessionSlide
            key={confession.id}
            confession={confession}
            mine={localIds.has(confession.id)}
            commentCount={commentCount(confession.id)}
            onOpenComments={setCommentsFor}
            onRemove={remove}
          />
        ))}
      </div>

      {/* 고백하기 플로팅 — 고백권이 응모권이다 */}
      <button
        type="button"
        className="confessr-add"
        onClick={() => setComposerOpen(true)}
        aria-label="고백 작성하기"
      >
        + 고백
        <span className="confessr-add-ticket">{tickets}</span>
      </button>

      {justConfessed && (
        <p className="confessr-toast" role="status">
          고백 완료 - 사람들이 잔을 들면 라벨 인쇄 후보가 됩니다
        </p>
      )}

      <AnimatePresence>
        {muralOpen === 0 && (
          <MuralView
            key="mural-live"
            grid={gridThisWeek}
            title="이번 주 벽화 · 처음"
            desc="누군가의 고백에 잔을 들면 그 잔이 병뚜껑이 되어 글자를 채웁니다. '처음' 두 글자가 완성되면 이번 주 라벨이 실제로 인쇄됩니다."
            live
            baseCheers={items.reduce((sum, c) => sum + c.cheers, 0) + raisedCount}
            goal={MURAL_GOAL}
            onClose={() => setMuralOpen(null)}
          />
        )}
        {muralOpen !== null && muralOpen > 0 && (
          <MuralView
            key={`mural-past-${muralOpen}`}
            grid={pastGrids[muralOpen - 1]}
            title={PAST_MURALS[muralOpen - 1].title}
            desc={PAST_MURALS[muralOpen - 1].desc}
            doneCount={PAST_MURALS[muralOpen - 1].count}
            onClose={() => setMuralOpen(null)}
          />
        )}

        {commentsFor && (
          <CommentsSheet
            key={`comments-${commentsFor.id}`}
            confession={commentsFor}
            onClose={() => setCommentsFor(null)}
            onChanged={() => setCommentVersion((v) => v + 1)}
          />
        )}

        {composerOpen && (
          <motion.div
            key="composer"
            className="confessr-sheetwrap"
            onClick={() => setComposerOpen(false)}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              className="confessr-sheet"
              onClick={(e) => e.stopPropagation()}
              initial={reducedMotion ? false : { y: '100%' }}
              animate={{ y: 0 }}
              exit={reducedMotion ? undefined : { y: '100%' }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              {tickets > 0 ? (
                <>
                  <p className="confessr-sheet-title">나의 처음 고백하기</p>
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
                    onSubmit={submitConfession}
                  />
                </>
              ) : (
                <div className="confessr-locked">
                  <p className="confessr-sheet-title">고백은 병 하나당 한 번입니다</p>
                  <p className="confessr-locked-sub">
                    새 처음처럼의 뚜껑으로 입장하면 고백권이 다시 생깁니다.
                    <br />
                    그동안 다른 처음에 잔과 조언을 건네보세요.
                  </p>
                  <Link to="/" className="confessr-locked-btn">
                    뚜껑 찍으러 가기 →
                  </Link>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
