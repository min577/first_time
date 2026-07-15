import { readJSON, writeJSON } from '../hooks/useLocalList'

// 입장 = 병 하나 개봉: 출석 도장과 고백권(응모권)을 함께 적립한다
export function registerEntry() {
  writeJSON('chg.stamps', readJSON<number>('chg.stamps', 0) + 1)
  writeJSON('chg.tickets', readJSON<number>('chg.tickets', 0) + 1)
}
