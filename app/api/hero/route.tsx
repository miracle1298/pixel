import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const contentType = 'image/png'

const W = 1200
const H = 630

export async function GET() {
  const bg = 'linear-gradient(180deg, #273c8b 0%, #2f54a3 20%, #2c68b3 40%, #2883c6 60%, #249bd5 80%, #1fb1e3 100%)'
  const stars = (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* big stars */}
      <div style={{ position: 'absolute', top: 60, left: 180, width: 6, height: 6, background: '#ffffff' }} />
      <div style={{ position: 'absolute', top: 120, left: 980, width: 6, height: 6, background: '#ffffff' }} />
      <div style={{ position: 'absolute', top: 300, left: 700, width: 6, height: 6, background: '#ffffff' }} />
      {/* small stars */}
      <div style={{ position: 'absolute', top: 90, left: 420, width: 3, height: 3, background: '#ffffff' }} />
      <div style={{ position: 'absolute', top: 160, left: 260, width: 3, height: 3, background: '#ffffff' }} />
      <div style={{ position: 'absolute', top: 220, left: 520, width: 3, height: 3, background: '#ffffff' }} />
      <div style={{ position: 'absolute', top: 260, left: 860, width: 3, height: 3, background: '#ffffff' }} />
      <div style={{ position: 'absolute', top: 330, left: 340, width: 3, height: 3, background: '#ffffff' }} />
      <div style={{ position: 'absolute', top: 400, left: 1060, width: 3, height: 3, background: '#ffffff' }} />
      {/* streak */}
      <div style={{ position: 'absolute', top: 210, left: 340, width: 160, height: 2, background: '#d6e7ff', transform: 'rotate(-20deg)', opacity: 0.9 }} />
      <div style={{ position: 'absolute', top: 210, left: 340, width: 6, height: 6, background: '#ffffff', transform: 'rotate(-20deg)' }} />
    </div>
  )
  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: bg,
          color: '#FFFFFF',
          fontFamily: 'Arial, sans-serif',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {stars}
        <div style={{ fontSize: 72, fontWeight: 800, color: '#FFD54F', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Battle Game</div>
        <div style={{ fontSize: 28, opacity: 0.95, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>Twin-Stick Shooter • Farcaster Mini App</div>
      </div>
    ),
    { width: W, height: H }
  )
}