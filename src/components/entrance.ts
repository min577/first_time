import { readJSON, writeJSON } from '../hooks/useLocalList'

// 스플래시 입장 연출 — 데모에서 심사 전 비교용으로 전환 가능
export type EntranceMode = 'hold' | 'twist' | 'open'

export const ENTRANCE_MODES: { key: EntranceMode; label: string }[] = [
  { key: 'hold', label: '꾹 눌러 찍기' },
  { key: 'twist', label: '뚜껑 따기' },
  { key: 'open', label: '병 오프닝' },
]

// 입장 = 병 하나 개봉: 출석 도장과 고백권(응모권)을 함께 적립한다
export function registerEntry() {
  writeJSON('chg.stamps', readJSON<number>('chg.stamps', 0) + 1)
  writeJSON('chg.tickets', readJSON<number>('chg.tickets', 0) + 1)
}
