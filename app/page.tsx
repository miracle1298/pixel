'use client'

import { useEffect, useRef, useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

type GameStatus = 'start' | 'playing' | 'over'

type Player = {
  x: number
  y: number
  w: number
  h: number
  color: string
  health: number
  speed: number
  lastShot: number
}

type Bullet = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  color: string
  dmg: number
}

type Enemy = {
  x: number
  y: number
  w: number
  h: number
  color: string
  health: number
  speed: number
  shape: 'square' | 'circle' | 'triangle' | 'diamond' | 'sprite'
  spriteIndex?: number
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
  size: number
}

export default function ShooterGame() {
  const [sdkReady, setSdkReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<GameStatus>('start')
  const [score, setScore] = useState(0)
  const [isTouch, setIsTouch] = useState(false)
  const [spriteReady, setSpriteReady] = useState(false)
  const [spriteSrc, setSpriteSrc] = useState<string | null>(null)
  const [coinsReady, setCoinsReady] = useState(false)
  const [coinsSrc, setCoinsSrc] = useState<string | null>(null)
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number; date: number }[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [playerName, setPlayerName] = useState('Player')
  const [rank, setRank] = useState<number | null>(null)
  const submittedRef = useRef(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const reqRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const keysRef = useRef<Record<string, boolean>>({})
  const playerRef = useRef<Player>({ x: 400, y: 300, w: 26, h: 26, color: '#41C37A', health: 100, speed: 3.0, lastShot: 0 })
  const playerImgRef = useRef<HTMLImageElement | null>(null)
  const coinsImgRef = useRef<HTMLImageElement | null>(null)
  const bulletsRef = useRef<Bullet[]>([])
  const enemiesRef = useRef<Enemy[]>([])
  const particlesRef = useRef<Particle[]>([])

  const joyLeftBaseRef = useRef<HTMLDivElement | null>(null)
  const joyRightBaseRef = useRef<HTMLDivElement | null>(null)
  const joyLeftRef = useRef({ active: false, cx: 0, cy: 0, dx: 0, dy: 0 })
  const joyRightRef = useRef({ active: false, cx: 0, cy: 0, dx: 0, dy: 0 })
  const mouseAimRef = useRef({ active: false, x: 0, y: 0 })
  const lastSpawnRef = useRef(0)
  const spawnMsRef = useRef(1200)
  const spawnCountRef = useRef(2)
  const maxEnemiesRef = useRef(80)
  const blastKillsRef = useRef(0)
  const blastFlashRef = useRef(0)
  const BLAST_KILLS = 20
  const levelRef = useRef(1)
  const MAX_LEVEL = 20
  const applyLevelParams = () => {
    const lvl = levelRef.current
    const scale = isTouch ? 0.75 : 1
    spawnCountRef.current = Math.max(1, Math.min(1 + Math.floor(lvl / 2), 6))
    spawnCountRef.current = Math.max(1, Math.floor(spawnCountRef.current * scale))
    maxEnemiesRef.current = Math.min(Math.floor((12 + lvl * 4) * scale), 100)
    spawnMsRef.current = Math.max(350, 1200 - (lvl - 1) * 60)
  }

  const width = 800
  const height = 600
  const COINS_COLS = 8
  const COINS_ROWS = 4

  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready({ disableNativeGestures: true })
        setSdkReady(true)
      } catch (err) {
        setSdkReady(true)
        setError('Running in development mode (not in Farcaster client)')
      }
    }
    init()
  }, [])

  

  useEffect(() => {
    const loadName = async () => {
      try {
        const user = await (sdk as any)?.context?.getFarcasterUser?.()
        const name = user?.username || user?.displayName || 'Player'
        setPlayerName(typeof name === 'string' && name.length ? name : 'Player')
      } catch {
        setPlayerName('Player')
      }
    }
    loadName()
  }, [])

  useEffect(() => {
    const qs = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const paramUrl = qs ? qs.get('sprite') : null
    const stored = typeof window !== 'undefined' ? localStorage.getItem('playerSpriteUrl') : null
    const url = paramUrl || stored || '/player.png'
    if (paramUrl && typeof window !== 'undefined') localStorage.setItem('playerSpriteUrl', paramUrl)
    setSpriteSrc(url)
  }, [])

  useEffect(() => {
    if (!spriteSrc) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = spriteSrc
    img.onload = () => { playerImgRef.current = img; setSpriteReady(true) }
    img.onerror = () => { setSpriteReady(false) }
  }, [spriteSrc])

  useEffect(() => {
    const qs = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const paramUrl = qs ? qs.get('coins') : null
    const stored = typeof window !== 'undefined' ? localStorage.getItem('coinsSpriteUrl') : null
    const url = paramUrl || stored || '/coins.png'
    if (paramUrl && typeof window !== 'undefined') localStorage.setItem('coinsSpriteUrl', paramUrl)
    setCoinsSrc(url)
  }, [])

  useEffect(() => {
    if (!coinsSrc) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = coinsSrc
    img.onload = () => { coinsImgRef.current = img; setCoinsReady(true) }
    img.onerror = () => { setCoinsReady(false) }
  }, [coinsSrc])


  useEffect(() => {
    const coarse = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false
    const touchCap = typeof window !== 'undefined' && 'ontouchstart' in window
    setIsTouch(Boolean(coarse || touchCap))
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard', { cache: 'no-store' })
      const json = await res.json()
      setLeaderboard(Array.isArray(json?.entries) ? json.entries : [])
    } catch {
      setLeaderboard([])
    }
  }

  const submitScore = async () => {
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName, score })
      })
      const json = await res.json()
      setLeaderboard(Array.isArray(json?.entries) ? json.entries : [])
      setRank(typeof json?.rank === 'number' ? json.rank : null)
    } catch {
      setRank(null)
    }
  }

  useEffect(() => {
    if (status === 'over' && !submittedRef.current) {
      submitScore()
      submittedRef.current = true
    }
    if (status === 'playing') {
      submittedRef.current = false
      setRank(null)
    }
  }, [status, score])

  const shareRank = async () => {
    const text = rank ? `I\'m rank #${rank} with score ${score} in Battle Game!` : `My score is ${score} in Battle Game!`
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pixel-6i89.vercel.app'
    const url = `${origin}/?score=${encodeURIComponent(String(score))}${rank ? `&rank=${encodeURIComponent(String(rank))}` : ''}&name=${encodeURIComponent(playerName)}`
    try {
      await (sdk as any)?.actions?.composeCast?.({ text: `${text} ${url}` })
    } catch (e) {
      console.warn('Share failed:', e)
    }
  }

  useEffect(() => {
    if (status !== 'playing') return
    const down = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true
      e.preventDefault()
    }
    const up = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false
      e.preventDefault()
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    const loop = (t: number) => {
      update(t)
      draw()
      reqRef.current = requestAnimationFrame(loop)
    }
    reqRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      if (reqRef.current) cancelAnimationFrame(reqRef.current)
    }
  }, [status])

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
  const normalize = (dx: number, dy: number) => {
    const len = Math.hypot(dx, dy) || 1
    return [dx / len, dy / len] as const
  }

  const shootVec = (dx: number, dy: number, t: number) => {
    const p = playerRef.current
    const cd = 140
    if (t - p.lastShot < cd) return
    p.lastShot = t
    const [nx, ny] = normalize(dx, dy)
    const s = 7
    bulletsRef.current.push({ x: p.x + p.w / 2, y: p.y + p.h / 2, vx: nx * s, vy: ny * s, r: 4, color: '#FFD54F', dmg: 12 })
  }

  const rectHitEnemy = (b: Bullet, e: Enemy) => {
    const left = e.x - b.r
    const right = e.x + e.w + b.r
    const top = e.y - b.r
    const bottom = e.y + e.h + b.r
    return b.x > left && b.x < right && b.y > top && b.y < bottom
  }

  const rectsOverlap = (ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) => {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
  }

  const update = (t: number) => {
    const prev = lastTimeRef.current ?? t
    const dt = Math.min(2, (t - prev) / 16.67 || 1)
    lastTimeRef.current = t
    const p = playerRef.current

    let mdx = 0
    let mdy = 0
    if (joyLeftRef.current.active) {
      mdx = joyLeftRef.current.dx
      mdy = joyLeftRef.current.dy
    } else {
      if (keysRef.current['KeyA']) mdx -= 1
      if (keysRef.current['KeyD']) mdx += 1
      if (keysRef.current['KeyW']) mdy -= 1
      if (keysRef.current['KeyS']) mdy += 1
      if (keysRef.current['ArrowLeft']) mdx -= 1
      if (keysRef.current['ArrowRight']) mdx += 1
      if (keysRef.current['ArrowUp']) mdy -= 1
      if (keysRef.current['ArrowDown']) mdy += 1
    }
    const isMoving = Math.hypot(mdx, mdy) > 0.1
    if (isMoving) {
      const [nx, ny] = normalize(mdx, mdy)
      p.x += nx * p.speed * dt
      p.y += ny * p.speed * dt
    }

    p.x = clamp(p.x, 0, width - p.w)
    p.y = clamp(p.y, 0, height - p.h)

    if (joyRightRef.current.active) {
      const adx = joyRightRef.current.dx
      const ady = joyRightRef.current.dy
      if (isMoving && Math.hypot(adx, ady) > 0.3) shootVec(adx, ady, t)
    } else if (mouseAimRef.current.active) {
      const adx = mouseAimRef.current.x - (p.x + p.w / 2)
      const ady = mouseAimRef.current.y - (p.y + p.h / 2)
      if (isMoving) shootVec(adx, ady, t)
    } else {
      if (isMoving && enemiesRef.current.length) {
        let nearest = enemiesRef.current[0]
        let best = Infinity
        const cx = p.x + p.w / 2
        const cy = p.y + p.h / 2
        for (let i = 0; i < enemiesRef.current.length; i++) {
          const e = enemiesRef.current[i]
          const dx = e.x + e.w / 2 - cx
          const dy = e.y + e.h / 2 - cy
          const d = Math.hypot(dx, dy)
          if (d < best) { best = d; nearest = e }
        }
        if (best < 600) {
          const dx = nearest.x + nearest.w / 2 - cx
          const dy = nearest.y + nearest.h / 2 - cy
          shootVec(dx, dy, t)
        }
      }
    }

    bulletsRef.current.forEach(b => {
      b.x += b.vx * dt
      b.y += b.vy * dt
    })

    bulletsRef.current = bulletsRef.current.filter(b => {
      if (b.x < -10 || b.x > width + 10 || b.y < -10 || b.y > height + 10) return false
      let hit = false
      enemiesRef.current.forEach(e => {
        if (!hit && rectHitEnemy(b, e)) {
          e.health = Math.max(0, e.health - b.dmg)
          hit = true
          if (e.health <= 0) {
            spawnExplosion(e.x + e.w / 2, e.y + e.h / 2)
            setScore(s => s + 10)
            blastKillsRef.current += 1
          }
        }
      })
      if (hit) enemiesRef.current = enemiesRef.current.filter(e => e.health > 0)
      return !hit
    })

    enemiesRef.current.forEach(e => {
      const dx = p.x - e.x
      const dy = p.y - e.y
      const [nx, ny] = normalize(dx, dy)
      e.x += nx * e.speed * dt
      e.y += ny * e.speed * dt
    })

    enemiesRef.current.forEach(e => {
      if (rectsOverlap(p.x, p.y, p.w, p.h, e.x, e.y, e.w, e.h)) {
        p.health = Math.max(0, p.health - 0.6)
      }
    })

    particlesRef.current.forEach(pt => {
      pt.x += pt.vx * dt
      pt.y += pt.vy * dt
      const fr = Math.pow(0.98, dt)
      pt.vx *= fr
      pt.vy *= fr
      pt.life -= dt
    })
    particlesRef.current = particlesRef.current.filter(pt => pt.life > 0)

    if (p.health <= 0) setStatus('over')

    if (t - lastSpawnRef.current > spawnMsRef.current) {
      const need = Math.max(0, maxEnemiesRef.current - enemiesRef.current.length)
      const wave = Math.min(spawnCountRef.current, need)
      if (wave > 0) spawnWave(wave)
      lastSpawnRef.current = t
      spawnMsRef.current = Math.max(300, spawnMsRef.current - 10)
    }

    if (blastKillsRef.current >= BLAST_KILLS) {
      triggerBlast()
    }

    if (blastFlashRef.current > 0) blastFlashRef.current -= 1
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#151515'
    ctx.fillRect(0, 0, width, height)
    const p = playerRef.current
    const img = playerImgRef.current
    if (spriteReady && img) {
      ctx.drawImage(img, p.x, p.y, p.w, p.h)
    } else {
      ctx.fillStyle = p.color
      ctx.fillRect(p.x, p.y, p.w, p.h)
    }
    enemiesRef.current.forEach(e => {
      const cx = e.x + e.w / 2
      const cy = e.y + e.h / 2
      if (e.shape === 'sprite' && coinsReady && coinsImgRef.current) {
        const img = coinsImgRef.current
        const cw = img.width / COINS_COLS
        const ch = img.height / COINS_ROWS
        const idx = e.spriteIndex || 0
        const col = idx % COINS_COLS
        const row = Math.floor(idx / COINS_COLS)
        const sx = Math.floor(col * cw)
        const sy = Math.floor(row * ch)
        const sw = Math.floor(cw)
        const sh = Math.floor(ch)
        ctx.drawImage(img, sx, sy, sw, sh, e.x, e.y, e.w, e.h)
      } else {
        ctx.fillStyle = e.color
        if (e.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(cx, cy, Math.min(e.w, e.h) / 2, 0, Math.PI * 2)
          ctx.fill()
        } else if (e.shape === 'triangle') {
          ctx.beginPath()
          ctx.moveTo(cx, e.y)
          ctx.lineTo(e.x, e.y + e.h)
          ctx.lineTo(e.x + e.w, e.y + e.h)
          ctx.closePath()
          ctx.fill()
        } else if (e.shape === 'diamond') {
          ctx.beginPath()
          ctx.moveTo(cx, e.y)
          ctx.lineTo(e.x + e.w, cy)
          ctx.lineTo(cx, e.y + e.h)
          ctx.lineTo(e.x, cy)
          ctx.closePath()
          ctx.fill()
        } else {
          ctx.fillRect(e.x, e.y, e.w, e.h)
        }
      }
    })
    bulletsRef.current.forEach(b => {
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fillStyle = b.color
      ctx.fill()
    })
    particlesRef.current.forEach(pt => {
      ctx.fillStyle = pt.color
      ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size)
    })

    if (blastFlashRef.current > 0) {
      const a = (blastFlashRef.current / 18) * 0.6
      ctx.fillStyle = `rgba(255,255,255,${a})`
      ctx.fillRect(0, 0, width, height)
    }
  }

  const start = () => {
    const w = 26
    const h = 26
    playerRef.current = { x: (width - w) / 2, y: (height - h) / 2, w, h, color: '#41C37A', health: 100, speed: 3.0, lastShot: 0 }
    bulletsRef.current = []
    enemiesRef.current = []
    particlesRef.current = []
    setScore(0)
    lastSpawnRef.current = 0
    
    blastKillsRef.current = 0
    blastFlashRef.current = 0
    levelRef.current = 1
    applyLevelParams()
    keysRef.current = {}
    joyLeftRef.current.active = false
    joyLeftRef.current.dx = 0
    joyLeftRef.current.dy = 0
    joyRightRef.current.active = false
    joyRightRef.current.dx = 0
    joyRightRef.current.dy = 0
    mouseAimRef.current.active = false
    setStatus('playing')
  }

  const restart = () => { start() }

  const spawnWave = (count: number) => {
    for (let i = 0; i < count; i++) {
      const side = Math.floor(Math.random() * 4)
      let x = 0
      let y = 0
      if (side === 0) { x = -20; y = Math.random() * height }
      else if (side === 1) { x = width + 20; y = Math.random() * height }
      else if (side === 2) { x = Math.random() * width; y = -20 }
      else { x = Math.random() * width; y = height + 20 }
      const base = 1.0 + (levelRef.current - 1) * 0.15
      const speed = base + Math.random() * 0.8
      const size = 24
      const hp = 20 + Math.floor(Math.random() * 10)
      const idxMax = COINS_COLS * COINS_ROWS
      const idx = Math.floor(Math.random() * idxMax)
      enemiesRef.current.push({ x, y, w: size, h: size, color: '#E53935', health: hp, speed, shape: 'sprite', spriteIndex: idx })
    }
  }

  const triggerBlast = () => {
    if (enemiesRef.current.length === 0) {
      blastKillsRef.current = 0
      return
    }
    const removed = enemiesRef.current.length
    enemiesRef.current.forEach(e => {
      spawnExplosion(e.x + e.w / 2, e.y + e.h / 2)
    })
    enemiesRef.current = []
    blastKillsRef.current = 0
    blastFlashRef.current = 18
    setScore(s => s + removed * 10)
    levelRef.current = Math.min(MAX_LEVEL, levelRef.current + 1)
    applyLevelParams()
  }

  const spawnExplosion = (x: number, y: number) => {
    const count = isTouch ? 10 : 16
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2
      const s = 2 + Math.random() * 3
      particlesRef.current.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 28 + Math.random() * 20, color: i % 2 ? '#FFA726' : '#FF7043', size: 4 + Math.random() * 3 })
    }
  }

  if (!sdkReady) {
    return (
      <div style={styles.container}>
        <div style={styles.screen}>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'start') {
    return (
      <div style={styles.container}>
        <div style={styles.screen}>
          <div style={styles.title}>Pixel Twin-Stick Shooter</div>
          <div style={styles.controls}>
            <div>Left joystick: move</div>
            <div>Right joystick: aim & shoot</div>
            <div>Desktop: WASD + mouse</div>
          </div>
          <button onClick={start} style={styles.button}>Start</button>
          <button onClick={() => { fetchLeaderboard(); setShowLeaderboard(true) }} style={styles.button}>Leaderboard</button>
          {showLeaderboard && (
            <div style={styles.leaderboardBox}>
              <div style={styles.title}>Top 10</div>
              {leaderboard.length === 0 && <div>No scores yet</div>}
              {leaderboard.map((e, i) => (
                <div key={e.date + ':' + i} style={styles.leaderboardItem}>{`#${i + 1} ${e.name} — ${e.score}`}</div>
              ))}
              <button onClick={() => setShowLeaderboard(false)} style={styles.button}>Close</button>
            </div>
          )}
          
          {error && <p style={styles.error}>{error}</p>}
        </div>
      </div>
    )
  }

  if (status === 'over') {
    return (
      <div style={styles.container}>
        <div style={styles.screen}>
          <div style={styles.title}>Game Over</div>
          <div style={styles.controls}>Score: {score}</div>
          <div style={styles.controls}>{`Your Rank: ${rank ?? '-'}`}</div>
          <button onClick={shareRank} style={styles.button}>Share Rank</button>
          <button onClick={() => { fetchLeaderboard(); setShowLeaderboard(true) }} style={styles.button}>View Leaderboard</button>
          {showLeaderboard && (
            <div style={styles.leaderboardBox}>
              <div style={styles.title}>Top 10</div>
              {leaderboard.length === 0 && <div>No scores yet</div>}
              {leaderboard.map((e, i) => (
                <div key={e.date + ':' + i} style={styles.leaderboardItem}>{`#${i + 1} ${e.name} — ${e.score}`}</div>
              ))}
              <button onClick={() => setShowLeaderboard(false)} style={styles.button}>Close</button>
            </div>
          )}
          <button onClick={restart} style={styles.button}>Play Again</button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={{ ...styles.screen, position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ ...styles.canvas, touchAction: 'none' }}
          onMouseMove={e => {
            const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
            const sx = width / rect.width
            const sy = height / rect.height
            mouseAimRef.current.x = (e.clientX - rect.left) * sx
            mouseAimRef.current.y = (e.clientY - rect.top) * sy
          }}
          onMouseDown={() => { mouseAimRef.current.active = true }}
          onMouseUp={() => { mouseAimRef.current.active = false }}
          onContextMenu={e => { e.preventDefault() }}
        />

        <div style={styles.topHud}>
          <div style={styles.hudLeft}>
            <div style={styles.healthBarOuter}>
              <div style={{ ...styles.healthBarInner, width: `${playerRef.current.health}%` }} />
            </div>
            <div style={styles.blastBarOuter}>
              <div style={{ ...styles.blastBarInner, width: `${Math.min(100, (blastKillsRef.current / BLAST_KILLS) * 100)}%` }} />
            </div>
          </div>
          <div style={styles.rightHud}>
            <div style={styles.levelBox}>Lvl {levelRef.current}</div>
            <div style={styles.scoreBox}>{score}</div>
            <button onClick={() => { fetchLeaderboard(); setShowLeaderboard(true) }} style={styles.smallButton}>Leaderboard</button>
          </div>
        </div>

        {isTouch && (
        <div
          ref={joyLeftBaseRef}
          style={styles.joyBaseLeft}
          onPointerDown={e => {
            const el = joyLeftBaseRef.current
            if (!el) return
            el.setPointerCapture(e.pointerId)
            const r = el.getBoundingClientRect()
            joyLeftRef.current.active = true
            joyLeftRef.current.cx = r.left + r.width / 2
            joyLeftRef.current.cy = r.top + r.height / 2
            joyLeftRef.current.dx = 0
            joyLeftRef.current.dy = 0
          }}
          onPointerMove={e => {
            if (!joyLeftRef.current.active) return
            const dx = e.clientX - joyLeftRef.current.cx
            const dy = e.clientY - joyLeftRef.current.cy
            const m = Math.min(40, Math.hypot(dx, dy))
            const [nx, ny] = normalize(dx, dy)
            joyLeftRef.current.dx = nx * m
            joyLeftRef.current.dy = ny * m
          }}
          onPointerUp={e => {
            const el = joyLeftBaseRef.current
            if (el) el.releasePointerCapture(e.pointerId)
            joyLeftRef.current.active = false
            joyLeftRef.current.dx = 0
            joyLeftRef.current.dy = 0
          }}
        >
          <div style={{ ...styles.joyKnob, width: isTouch ? 52 : 44, height: isTouch ? 52 : 44, transform: `translate(${joyLeftRef.current.dx}px, ${joyLeftRef.current.dy}px)` }} />
        </div>
        )}

        {isTouch && (
        <div
          ref={joyRightBaseRef}
          style={styles.joyBaseRight}
          onPointerDown={e => {
            const el = joyRightBaseRef.current
            if (!el) return
            el.setPointerCapture(e.pointerId)
            const r = el.getBoundingClientRect()
            joyRightRef.current.active = true
            joyRightRef.current.cx = r.left + r.width / 2
            joyRightRef.current.cy = r.top + r.height / 2
            joyRightRef.current.dx = 0
            joyRightRef.current.dy = 0
          }}
          onPointerMove={e => {
            if (!joyRightRef.current.active) return
            const dx = e.clientX - joyRightRef.current.cx
            const dy = e.clientY - joyRightRef.current.cy
            const m = Math.min(40, Math.hypot(dx, dy))
            const [nx, ny] = normalize(dx, dy)
            joyRightRef.current.dx = nx * m
            joyRightRef.current.dy = ny * m
          }}
          onPointerUp={e => {
            const el = joyRightBaseRef.current
            if (el) el.releasePointerCapture(e.pointerId)
            joyRightRef.current.active = false
            joyRightRef.current.dx = 0
            joyRightRef.current.dy = 0
          }}
        >
          <div style={{ ...styles.joyKnob, width: isTouch ? 52 : 44, height: isTouch ? 52 : 44, transform: `translate(${joyRightRef.current.dx}px, ${joyRightRef.current.dy}px)` }} />
        </div>
        )}
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    padding: '1rem',
  },
  screen: {
    maxWidth: '800px',
    width: '100%',
    textAlign: 'center',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  controls: {
    marginBottom: '1rem',
    opacity: 0.85,
  },
  canvas: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    backgroundColor: '#0f0f0f',
    display: 'block',
  },
  topHud: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem',
  },
  hudLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '65%',
  },
  healthBarOuter: {
    width: '60%',
    height: '18px',
    backgroundColor: '#333',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  healthBarInner: {
    height: '100%',
    backgroundColor: '#E74C3C',
    transition: 'width 0.1s linear',
  },
  blastBarOuter: {
    width: '60%',
    height: '12px',
    backgroundColor: '#2a2a2a',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  blastBarInner: {
    height: '100%',
    backgroundColor: '#FFD54F',
    transition: 'width 0.1s linear',
  },
  scoreBox: {
    minWidth: '64px',
    padding: '6px 10px',
    backgroundColor: '#2c2c2c',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  rightHud: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  levelBox: {
    minWidth: '64px',
    padding: '6px 10px',
    backgroundColor: '#3a3a3a',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#FFD54F',
  },
  smallButton: {
    padding: '6px 10px',
    fontSize: '0.8rem',
    backgroundColor: '#444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  leaderboardBox: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: '8px',
    textAlign: 'left',
  },
  leaderboardItem: {
    padding: '6px 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  button: {
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    backgroundColor: '#4A90E2',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'background-color 0.3s',
  },
  joyBaseLeft: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    width: 92,
    height: 92,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    border: '2px solid rgba(255,255,255,0.15)',
    touchAction: 'none',
    overflow: 'hidden',
  },
  joyBaseRight: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 92,
    height: 92,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    border: '2px solid rgba(255,255,255,0.15)',
    touchAction: 'none',
    overflow: 'hidden',
  },
  joyKnob: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 44,
    height: 44,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.25)',
    border: '2px solid rgba(255,255,255,0.3)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  error: {
    color: '#FF9800',
    fontSize: '0.9rem',
    marginTop: '0.5rem',
  },
}
