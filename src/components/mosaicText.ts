import { useEffect, useMemo, useState } from 'react'

// 글자를 뚜껑 도트 그리드로 변환한다 — 앱 UI와 같은 글꼴을 캔버스에 그려 픽셀 샘플링
export type DotGrid = boolean[][]

export function textDotGrid(text: string, cols = 18): DotGrid {
  const font = '700 96px "Pretendard Variable", Pretendard, sans-serif'
  const canvas = document.createElement('canvas')
  const measure = canvas.getContext('2d')
  if (!measure) return [[]]
  measure.font = font
  const metric = measure.measureText(text)
  const w = Math.max(1, Math.ceil(metric.width))
  const asc = Math.ceil(metric.actualBoundingBoxAscent || 76)
  const desc = Math.ceil(metric.actualBoundingBoxDescent || 12)
  const h = asc + desc

  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return [[]]
  ctx.font = font
  ctx.fillStyle = '#000'
  ctx.fillText(text, 0, asc)

  const stepX = w / cols
  const rows = Math.max(1, Math.round(h / stepX))
  const stepY = h / rows
  const data = ctx.getImageData(0, 0, w, h).data

  const grid: DotGrid = []
  for (let r = 0; r < rows; r += 1) {
    const row: boolean[] = []
    for (let c = 0; c < cols; c += 1) {
      // 셀 중심 주변 3x3 알파 평균으로 획 위인지 판단
      let sum = 0
      let n = 0
      const cx = Math.floor((c + 0.5) * stepX)
      const cy = Math.floor((r + 0.5) * stepY)
      for (let dy = -2; dy <= 2; dy += 2) {
        for (let dx = -2; dx <= 2; dx += 2) {
          const x = cx + dx
          const y = cy + dy
          if (x >= 0 && x < w && y >= 0 && y < h) {
            sum += data[(y * w + x) * 4 + 3]
            n += 1
          }
        }
      }
      row.push(n > 0 && sum / n > 60)
    }
    grid.push(row)
  }
  return grid
}

// 웹폰트가 늦게 로드되면 글자꼴이 달라지므로, 폰트 준비 후 한 번 다시 계산한다
export function useTextDots(text: string, cols = 18): DotGrid {
  const [fontsReady, setFontsReady] = useState(0)
  useEffect(() => {
    let alive = true
    document.fonts?.ready.then(() => {
      if (alive) setFontsReady((t) => t + 1)
    })
    return () => {
      alive = false
    }
  }, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => textDotGrid(text, cols), [text, cols, fontsReady])
}

export function gridTotal(grid: DotGrid): number {
  return grid.reduce((sum, row) => sum + row.filter(Boolean).length, 0)
}

// 아래 행부터, 왼쪽에서 오른쪽으로 뚜껑이 박히는 순번
export function gridOrders(grid: DotGrid): (number | null)[][] {
  let order = 0
  const out = grid.map((row) => row.map(() => null as number | null))
  for (let r = grid.length - 1; r >= 0; r -= 1) {
    for (let c = 0; c < grid[r].length; c += 1) {
      if (grid[r][c]) {
        out[r][c] = order
        order += 1
      }
    }
  }
  return out
}
