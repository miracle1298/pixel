'use client'

import { useEffect, useState } from 'react'

/**
 * Frame Context Component
 * 
 * NOTE: This is a Farcaster FRAME, not a Mini App.
 * Frames use the Frames Protocol (meta tags) and don't require the Mini App SDK.
 * 
 * This component detects if we're running in a Farcaster Frame context
 * and provides helpful debugging information.
 */
export default function FrameContext() {
  const [frameInfo, setFrameInfo] = useState<{
    isFrame: boolean
    userAgent: string
    hasParent: boolean
  } | null>(null)

  useEffect(() => {
    // Check if we're in a Frame context
    const isFrame = typeof window !== 'undefined' && window.self !== window.top
    const hasParent = typeof window !== 'undefined' && window.parent !== window.self
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'

    setFrameInfo({
      isFrame,
      userAgent,
      hasParent,
    })

    // Log frame context (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Frame Context:', {
        isFrame,
        hasParent,
        userAgent: userAgent.substring(0, 50) + '...',
      })
    }
  }, [])

  // This component doesn't render anything visible
  // It's just for context detection
  return null
}

