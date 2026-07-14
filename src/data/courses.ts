export type Tip = {
  id: string
  author: string
  text: string
  cheers: number
}

export type Course = {
  slug: string
  title: string
  category: string
  tips: Tip[]
}

export const CATEGORIES = ['학생편', '직장인편', '인생편'] as const

// 부록 A 시드 — 문구 수정 금지
export const COURSES: Course[] = [
  {
    slug: 'first-drink',
    title: '술자리가 처음이라면',
    category: '학생편',
    tips: [
      {
        id: 'first-drink-1',
        author: '복학생 선배',
        text: "첫 잔은 받되, 페이스는 네가 정하는 거야. '천천히 마실게요' 한마디면 아무도 뭐라 안 해.",
        cheers: 214,
      },
      {
        id: 'first-drink-2',
        author: '19학번 선배',
        text: '주량을 모르면 오늘 알아내려 하지 마. 다음에 알아내도 늦지 않아.',
        cheers: 187,
      },
    ],
  },
  {
    slug: 'first-mt',
    title: 'MT가 처음이라면',
    category: '학생편',
    tips: [
      {
        id: 'first-mt-1',
        author: '과대 출신',
        text: '장기자랑은 준비한 사람이 이기는 게 아니라 뻔뻔한 사람이 이겨. 완성도 말고 텐션.',
        cheers: 156,
      },
      {
        id: 'first-mt-2',
        author: '익명의 선배',
        text: '새벽 라면 끓이는 사람 옆에 있어라. 거기서 친구가 생긴다.',
        cheers: 243,
      },
    ],
  },
  {
    slug: 'first-game',
    title: '술게임이 처음이라면',
    category: '학생편',
    tips: [
      {
        id: 'first-game-1',
        author: '동아리 회장',
        text: "룰 몰라도 괜찮아. '저 처음이에요!' 하면 오히려 다들 신나서 가르쳐줌.",
        cheers: 98,
      },
    ],
  },
  {
    slug: 'first-hoesik',
    title: '회식이 처음이라면',
    category: '직장인편',
    tips: [
      {
        id: 'first-hoesik-1',
        author: '9년차 대리',
        text: '잔 비우는 속도를 제일 높은 분 말고, 제일 편한 선배한테 맞춰.',
        cheers: 512,
      },
      {
        id: 'first-hoesik-2',
        author: '인사팀 어딘가',
        text: '고기는 굽는 사람이 주인공이다. 집게를 잡으면 대화 주도권도 따라온다.',
        cheers: 389,
      },
    ],
  },
  {
    slug: 'first-sales',
    title: '첫 영업 자리라면',
    category: '직장인편',
    tips: [
      {
        id: 'first-sales-1',
        author: '영업 15년차',
        text: '안 마시고도 분위기 사는 법: 상대 잔이 30% 남았을 때 채워라. 그게 일의 8할이야.',
        cheers: 441,
      },
    ],
  },
  {
    slug: 'first-solo',
    title: '혼술이 처음이라면',
    category: '직장인편',
    tips: [
      {
        id: 'first-solo-1',
        author: '자취 7년차',
        text: '혼술은 청승이 아니라 취향이야. 대신 안주는 꼭 챙겨. 그게 나를 대접하는 방식.',
        cheers: 327,
      },
    ],
  },
  {
    slug: 'first-mourning',
    title: '조문이 처음이라면',
    category: '인생편',
    tips: [
      {
        id: 'first-mourning-1',
        author: '먼저 겪은 사람',
        text: "절은 두 번, 상주에겐 반 번. 말은 짧을수록 좋아. '뭐라 드릴 말씀이 없습니다'면 충분해.",
        cheers: 673,
      },
      {
        id: 'first-mourning-2',
        author: '익명의 어른',
        text: '빈소의 소주는 마시려고 있는 게 아니라, 같이 있으려고 있는 거야.',
        cheers: 592,
      },
    ],
  },
  {
    slug: 'first-child',
    title: '자녀와의 첫 잔이라면',
    category: '인생편',
    tips: [
      {
        id: 'first-child-1',
        author: '스무 살 딸의 아빠',
        text: '가르치려 하지 말고 따라줘라. 첫 잔은 교육이 아니라 환영식이니까.',
        cheers: 458,
      },
    ],
  },
]

export function findCourse(slug: string | undefined): Course | undefined {
  return COURSES.find((c) => c.slug === slug)
}
