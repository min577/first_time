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
