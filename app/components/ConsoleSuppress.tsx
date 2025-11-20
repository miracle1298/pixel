'use client'

import { useEffect } from 'react'

export default function ConsoleSuppress() {
  useEffect(() => {
    // Suppress harmless browser extension errors and React DevTools messages
    const originalError = console.error
    const originalWarn = console.warn
    const originalLog = console.log

    // Suppress console.error messages - catch all variations
    console.error = function (...args: any[]) {
      const message = args[0]?.toString() || ''
      const fullMessage = args.map(a => String(a)).join(' ')
      // Filter out browser extension errors and harmless 404s
      if (
        message.includes('runtime.lastError') ||
        message.includes('Receiving end') ||
        message.includes('Backpack') ||
        message.includes('injected.js') ||
        message.includes('message.js') ||
        message.includes('Could not establish') ||
        message.includes('Unchecked runtime') ||
        fullMessage.includes('runtime.lastError') ||
        fullMessage.includes('Receiving end') ||
        message.includes('favicon') ||
        (message.includes('404') && (message.includes('favicon') || message.includes('_next')))
      ) {
        return // Suppress these errors
      }
      originalError.apply(console, args)
    }

    // Suppress console.warn messages - catch all variations
    console.warn = function (...args: any[]) {
      const message = args[0]?.toString() || ''
      const fullMessage = args.map(a => String(a)).join(' ')
      // Suppress React DevTools suggestion and extension warnings
      if (
        message.includes('React DevTools') ||
        message.includes('reactjs.org/link/react-devtools') ||
        message.includes('react-devtools') ||
        message.includes('Download the React DevTools') ||
        fullMessage.includes('React DevTools') ||
        message.includes('Backpack') ||
        message.includes('dispatchMessage') ||
        message.includes('channel-secure-background') ||
        fullMessage.includes('dispatchMessage') ||
        fullMessage.includes('channel-secure-background')
      ) {
        return // Suppress these warnings
      }
      originalWarn.apply(console, args)
    }

    // Suppress console.log messages from extensions - catch all variations
    console.log = function (...args: any[]) {
      const message = args[0]?.toString() || ''
      const fullMessage = args.map(a => String(a)).join(' ')
      // Filter out extension messages
      if (
        message.includes('dispatchMessage') ||
        message.includes('channel-secure-background') ||
        message.includes('channel-secure-background-request') ||
        message.includes('channel-secure-background-response') ||
        message.includes('message.js') ||
        fullMessage.includes('dispatchMessage') ||
        fullMessage.includes('channel-secure-background')
      ) {
        return // Suppress these logs
      }
      originalLog.apply(console, args)
    }


    // Cleanup on unmount
    return () => {
      console.error = originalError
      console.warn = originalWarn
      console.log = originalLog
    }
  }, [])

  return null // This component doesn't render anything
}

