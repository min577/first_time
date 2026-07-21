export const TOAST_OCCASIONS = ['회식', '동창회', '축하자리'] as const
export type Occasion = (typeof TOAST_OCCASIONS)[number]

// 부록 C 시드 — 문구 수정 금지
export const TOAST_LEADS: Record<Occasion, string[]> = {
  회식: ['오늘의 야근은 잊고', '우리 팀의 다음 분기를 위하여', '부장님의 건강과 나의 칼퇴를 위하여'],
  동창회: ['그때의 우리와 지금의 우리를 위하여', '20년 전 그 테이블을 위하여', '변한 얼굴, 안 변한 우정을 위하여'],
  축하자리: ['오늘의 주인공을 위하여', '축하는 크게, 잔은 가볍게', '이 사람의 다음 처음을 위하여'],
}

// 후창 (공통 랜덤)
export const TOAST_RESPONSES = ['오늘이! 처음처럼!', '다시! 처음처럼!', '우리! 처음처럼!']

// 절주 가이드 한 줄 — 건배사와 함께 뽑혀 나온다 (책임 있는 음주 문화 내장)
export const SOBER_TIPS = [
  '첫 잔은 천천히 마셔도 괜찮아요.',
  '잔은 다 비우지 않아도 돼요.',
  '건배 사이에 물도 한 잔 마셔요.',
  '막잔은 가볍게 마셔요.',
]
