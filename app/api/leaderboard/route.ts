type Entry = { name: string; score: number; date: number }

let entries: Entry[] = []

const top10 = () => entries.sort((a, b) => b.score - a.score).slice(0, 10)

export async function GET() {
  return Response.json({ entries: top10() })
}

export async function POST(req: Request) {
  let body: any = null
  try {
    body = await req.json()
  } catch {}
  const nameRaw = body?.name
  const scoreRaw = body?.score
  const name = typeof nameRaw === 'string' && nameRaw.length ? nameRaw.slice(0, 32) : 'Player'
  const scoreNum = Number(scoreRaw)
  if (!Number.isFinite(scoreNum)) {
    return Response.json({ error: 'invalid score' }, { status: 400 })
  }
  const entry: Entry = { name, score: Math.floor(scoreNum), date: Date.now() }
  entries = [...entries, entry]
  const list = top10()
  const idx = list.findIndex(e => e === entry)
  const rank = idx >= 0 ? idx + 1 : null
  return Response.json({ rank, entries: list })
}