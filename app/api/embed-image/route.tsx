import { ImageResponse } from 'next/og'

export const runtime = 'edge'

const WIDTH = 900
const HEIGHT = 600

export async function GET(req: Request) {
  const url = new URL(req.url)
  const name = url.searchParams.get('name') || 'Battle Game'
  const score = url.searchParams.get('score')
  const rank = url.searchParams.get('rank')

  const subtitle = score && rank
    ? `Rank #${rank} • Score ${score}`
    : score
      ? `Score ${score}`
      : 'Play now'

  const bg = 'linear-gradient(180deg, #273c8b 0%, #2f54a3 20%, #2c68b3 40%, #2883c6 60%, #249bd5 80%, #1fb1e3 100%)'

  const stars = (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', top: 40, left: 120, width: 6, height: 6, background: '#ffffff' }} />
      <div style={{ position: 'absolute', top: 90, left: 760, width: 6, height: 6, background: '#ffffff' }} />
      <div style={{ position: 'absolute', top: 200, left: 520, width: 6, height: 6, background: '#ffffff' }} />
      <div style={{ position: 'absolute', top: 70, left: 420, width: 3, height: 3, background: '#ffffff' }} />
      <div style={{ position: 'absolute', top: 140, left: 260, width: 3, height: 3, background: '#ffffff' }} />
      <div style={{ position: 'absolute', top: 180, left: 680, width: 3, height: 3, background: '#ffffff' }} />
      <div style={{ position: 'absolute', top: 260, left: 340, width: 3, height: 3, background: '#ffffff' }} />
      <div style={{ position: 'absolute', top: 300, left: 860, width: 3, height: 3, background: '#ffffff' }} />
      <div style={{ position: 'absolute', top: 320, left: 240, width: 3, height: 3, background: '#ffffff' }} />
      <div style={{ position: 'absolute', top: 220, left: 240, width: 140, height: 2, background: '#d6e7ff', transform: 'rotate(-20deg)', opacity: 0.9 }} />
      <div style={{ position: 'absolute', top: 220, left: 240, width: 6, height: 6, background: '#ffffff', transform: 'rotate(-20deg)' }} />
    </div>
  )

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: bg,
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          position: 'relative',
        }}
      >
        {stars}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            marginBottom: 16,
            letterSpacing: -1,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: '#FFD54F',
            textShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            fontSize: 20,
            opacity: 0.9,
          }}
        >
          Twin-Stick Shooter • Farcaster Mini App
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  )
}

export async function HEAD(req: Request) {
  return new Response(null, { headers: { 'content-type': 'image/png', 'cache-control': 'max-age=0' } })
}