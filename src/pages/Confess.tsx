import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  CONFESSIONS,
  CONFESSION_COMMENTS,
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

// 개교 벽화 = 출석판: 병을 딴 사람들의 뚜껑이 모여 글자를 완성한다
const MURAL_GOAL = 10000 // 병
const MURAL_SEED = 6408 // 이번 주 먼저 출석한 사람들의 뚜껑

const PAST_MURALS = [
  {
    key: 'last-week',
    text: '건배',
    title: '지난주 벽화',
    buttonLabel: '지난주 벽화 보기',
    desc: '지난주에 모인 처음들이 완성한 글자입니다.',
    count: '9,821개의 처음으로 완성',
  },
  {
    key: 'anniversary',
    text: '20',
    title: '처음처럼 20주년 벽화',
    buttonLabel: '20주년 벽화 보기',
    desc: '처음처럼 20주년에 모인 뚜껑으로 완성한 벽화예요.',
    count: '20,000개의 처음으로 완성',
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

  // 개교 벽화 — 내가 뚜껑을 붙일 때마다 실시간으로 차오른다
  const [muralExtra, setMuralExtra] = useState(() => readJSON<number>('chg.muralExtra', 0))
  useEffect(() => {
    const onRaise = () => setMuralExtra(readJSON<number>('chg.muralExtra', 0))
    window.addEventListener('chg:raise', onRaise)
    return () => window.removeEventListener('chg:raise', onRaise)
  }, [])

  const gridThisWeek = useTextDots('처음', 20)
  const gridLastWeek = useTextDots('건배', 20)
  const gridAnniv = useTextDots('20', 13)
  const pastGrids = [gridLastWeek, gridAnniv]

  const muralCaps = MURAL_SEED + muralExtra
  const muralRatio = Math.min(muralCaps / MURAL_GOAL, 1)
  const muralFilled = Math.round(muralRatio * gridTotal(gridThisWeek))

  const [sort, setSort] = useState<SortMode>('latest')
  const sorted = sort === 'popular' ? [...items].sort((a, b) => b.cheers - a.cheers) : items

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
    setSort('latest')
  }

  return (
    <div className="confessr">
      <header className="confessr-top">
        <span className="confessr-title">처음 고백</span>
        <div className="confessr-tools">
          <SortToggle value={sort} onChange={setSort} />
        </div>
      </header>

      <div className="confessr-track">
        <section className="confessr-intro">
          <h1 className="confessr-hero">어른에게도 처음은 있어요.</h1>
          <p className="confessr-hero-sub">이름 없이 고백을 남길 수 있어요.</p>

          <button
            type="button"
            className="confessr-mural"
            onClick={() => setMuralOpen(0)}
            aria-label="이번 주 벽화 크게 보기"
          >
            <CapMosaic grid={gridThisWeek} dot={5} filled={muralFilled} animateIn />
          </button>
          <p className="confessr-mural-count">이번 주 벽화 {Math.round(muralRatio * 100)}%</p>
          <p className="confessr-mural-desc">{muralCaps.toLocaleString()}개의 처음이 모였어요.</p>
          <button type="button" className="confessr-mural-link" onClick={() => setMuralOpen(0)}>
            벽화 크게 보기
          </button>
          <div className="confessr-pastchips">
            {PAST_MURALS.map((mural, i) => (
              <button
                key={mural.key}
                type="button"
                className="confessr-pastchip"
                onClick={() => setMuralOpen(i + 1)}
              >
                {mural.buttonLabel}
              </button>
            ))}
          </div>
        </section>

        <div className="confessr-addbar">
          <span className="confessr-ticket">남은 고백권 {tickets}장</span>
          <button
            type="button"
            className="confessr-add"
            onClick={() => setComposerOpen(true)}
            aria-label="고백 남기기"
          >
            고백 남기기
          </button>
        </div>

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

      {justConfessed && (
        <p className="confessr-toast" role="status">
          고백을 남겼어요.
        </p>
      )}

      <AnimatePresence>
        {muralOpen === 0 && (
          <MuralView
            key="mural-live"
            grid={gridThisWeek}
            title="이번 주 벽화"
            desc="이번 주에 모인 뚜껑으로 '처음' 두 글자를 채우고 있어요."
            live
            baseCheers={MURAL_SEED}
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
                  <p className="confessr-sheet-title">고백 남기기</p>
                  <Composer
                    key={fromCourse?.slug ?? 'plain'}
                    placeholder="어떤 처음을 겪고 있는지 적어주세요."
                    helper={
                      fromCourse
                        ? `${fromCourse.title} 강의에서 이어진 고백이에요. 남은 고백권 ${tickets}장`
                        : `남은 고백권 ${tickets}장 · 이름은 공개되지 않아요.`
                    }
                    submitLabel="고백하기"
                    rows={3}
                    initialValue={fromCourse ? `${confessionOpener(fromCourse)} ` : ''}
                    onSubmit={submitConfession}
                  />
                </>
              ) : (
                <div className="confessr-locked">
                  <p className="confessr-sheet-title">남은 고백권이 없어요.</p>
                  <p className="confessr-locked-sub">
                    새 병의 QR로 다시 입장하면 고백권 1장이 생겨요.
                  </p>
                  <Link to="/" className="confessr-locked-btn">
                    처음 화면으로
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
