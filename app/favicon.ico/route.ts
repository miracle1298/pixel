import { NextResponse } from 'next/server'

// Simple SVG favicon to prevent 404 errors
const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#4A90E2"/>
  <text x="50" y="60" font-size="50" text-anchor="middle" fill="white">⚔️</text>
</svg>`

export async function GET() {
  return new NextResponse(svgFavicon, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

