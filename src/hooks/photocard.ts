import type { Confession } from '../data/confessions'

// 사연을 처음처럼 포토카드(1080x1350 PNG)로 렌더해 공유/저장한다.
// 실제 캠페인의 '병과 함께 찍는 인증샷' 프레임의 프로토타입 버전.

const W = 1080
const H = 1350

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const char of text) {
    const next = line + char
    if (ctx.measureText(next).width > maxWidth && line.length > 0) {
      lines.push(line)
      line = char === ' ' ? '' : char
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function saveConfessionCard(confession: Confession) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 병초록 유리 배경
  const grad = ctx.createLinearGradient(0, 0, W * 0.3, H)
  grad.addColorStop(0, '#1E8A62')
  grad.addColorStop(0.55, '#0B5C3F')
  grad.addColorStop(1, '#07402C')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // 이슬 결로
  for (let y = 40; y < H; y += 74) {
    for (let x = 30 + ((y / 74) % 2) * 37; x < W; x += 92) {
      ctx.fillStyle = 'rgba(255,255,255,0.09)'
      ctx.beginPath()
      ctx.arc(x, y, 4.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // 폰트 준비 (앱에서 이미 로드된 웹폰트 사용)
  try {
    await document.fonts.load('700 58px "Gowun Batang"')
  } catch {
    // 폰트 로드 실패 시 시스템 세리프로 대체된다
  }

  // 로고 (학사모 + 처음학개론)
  try {
    const logo = await loadImage('/logo.png')
    const lw = 430
    const lh = (logo.height / logo.width) * lw
    ctx.drawImage(logo, (W - lw) / 2, 88, lw, lh)
  } catch {
    // 로고 없이도 카드가 만들어진다
  }

  // 사연 본문
  ctx.fillStyle = '#FAF9F4'
  ctx.textAlign = 'center'
  ctx.font = '700 58px "Gowun Batang", serif'
  const lines = wrapText(ctx, `"${confession.text}"`, 860).slice(0, 7)
  const lineHeight = 96
  const textTop = 520
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, textTop + i * lineHeight)
  })

  // 작성자
  ctx.font = '400 34px Pretendard, sans-serif'
  ctx.fillStyle = 'rgba(250,249,244,0.72)'
  const authorY = textTop + lines.length * lineHeight + 30
  ctx.fillText(`- ${confession.author}`, W / 2, authorY)

  // 잔 수 (앰버)
  ctx.font = '700 40px Pretendard, sans-serif'
  ctx.fillStyle = '#E8A13D'
  ctx.fillText(`${confession.cheers.toLocaleString()}잔이 건배한 처음`, W / 2, authorY + 96)

  // 하단 크레딧
  ctx.font = '700 27px Pretendard, sans-serif'
  ctx.fillStyle = 'rgba(250,249,244,0.55)'
  ctx.fillText('처음학개론 × 처음처럼 · 어른들에게도 처음은 있으니까', W / 2, H - 76)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return

  const file = new File([blob], '처음학개론-포토카드.png', { type: 'image/png' })

  // 모바일: 공유 시트 / 데스크톱: 다운로드
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: '처음학개론' })
      return
    } catch {
      // 공유 취소 시 다운로드로 진행하지 않고 조용히 종료
      return
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '처음학개론-포토카드.png'
  a.click()
  URL.revokeObjectURL(url)
}
