export type Confession = {
  id: string
  author: string
  text: string
  cheers: number
  courseSlug?: string // 어느 수업(강의실)에서 온 고백인지 — 열람→고백 루프의 연결 고리
}

// 부록 B 시드 — 문구 수정 금지
export const CONFESSIONS: Confession[] = [
  {
    id: 'confession-1',
    author: '익명의 팀장',
    text: '팀장이 처음입니다. 사실 회의 진행하는 법을 아직도 모릅니다.',
    cheers: 3482,
  },
  {
    id: 'confession-2',
    author: '마흔셋',
    text: '처음으로 아버지를 병원에 모시고 갔습니다. 보호자 칸에 제 이름을 쓰는데 손이 떨렸습니다.',
    cheers: 5104,
  },
  {
    id: 'confession-3',
    author: '익명의 신입',
    text: '오늘 첫 출근이었습니다. 점심 메뉴 고르는 것도 시험 같았습니다.',
    cheers: 1290,
    courseSlug: 'first-hoesik',
  },
  {
    id: 'confession-4',
    author: '12년차 주부',
    text: '올해 처음으로 제가 제사를 주관했습니다. 어머니가 하시던 게 이렇게 어려운 일이었습니다.',
    cheers: 2871,
  },
]

// 이 잔 수를 넘으면 '이번 주 라벨 인쇄 후보'
export const LABEL_THRESHOLD = 3000

export type ConfessionComment = {
  id: string
  author: string
  text: string
}

// 고백에 달리는 조언 댓글 시드 — 고백(병당 1회)과 달리 조언은 무제한
export const CONFESSION_COMMENTS: Record<string, ConfessionComment[]> = {
  'confession-1': [
    {
      id: 'comment-1-1',
      author: '11년차 팀장',
      text: '3년차에도 모릅니다. 아는 척을 안 하는 팀장이 제일 좋은 팀장이에요.',
    },
    {
      id: 'comment-1-2',
      author: '익명의 선배',
      text: '회의는 진행하는 게 아니라 끝내는 겁니다. 끝내는 시간만 지켜도 중간은 갑니다.',
    },
  ],
  'confession-2': [
    {
      id: 'comment-2-1',
      author: '먼저 겪은 사람',
      text: '보호자 칸에 이름을 쓰는 순간, 어른이 한 번 더 되는 거래요. 고생하셨습니다.',
    },
  ],
}
