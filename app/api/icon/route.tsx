import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const contentType = 'image/png'

const W = 1024
const H = 1024

export async function GET() {
  const size = W
  const unit = size / 32
  const parts = [] as any[]
  const add = (x: number, y: number, w: number, h: number, color: string) => {
    parts.push(
      <div style={{ position: 'absolute', left: x * unit, top: y * unit, width: w * unit, height: h * unit, background: color }} />
    )
  }
  add(4, 4, 24, 24, '#000000')
  add(6, 6, 20, 20, '#cdd106')
  add(6, 6, 6, 6, '#ffffff')
  add(14, 14, 3, 3, '#000000')
  add(18, 18, 3, 3, '#000000')
  return new ImageResponse(
    (
      <div style={{ position: 'relative', width: W, height: H, background: '#000000' }}>{parts}</div>
    ),
    { width: W, height: H }
  )
}