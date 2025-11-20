import type { Metadata } from 'next'
import ConsoleSuppress from './components/ConsoleSuppress'
import FrameContext from './components/FrameContext'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Battle Game Frame',
  description: 'Turn-based battle game built with Farcaster Frames',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta
          name="fc:miniapp"
          content='{"version":"1","imageUrl":"https://pixel-6i89.vercel.app/api/embed-image","button":{"title":"Start Game","action":{"type":"launch_miniapp","url":"https://pixel-6i89.vercel.app","splashImageUrl":"https://pixel-6i89.vercel.app/api/splash","splashBackgroundColor":"#1a1a1a"}}}'
        />
        <meta
          name="fc:frame"
          content='{"version":"1","imageUrl":"https://pixel-6i89.vercel.app/api/embed-image","button":{"title":"Start Game","action":{"type":"launch_frame","url":"https://pixel-6i89.vercel.app","splashImageUrl":"https://pixel-6i89.vercel.app/api/splash","splashBackgroundColor":"#1a1a1a"}}}'
        />
        {/* Suppress console messages immediately, before anything else loads */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){var o=console.error,w=console.warn,l=console.log,i=console.info;console.error=function(){var m=String(arguments[0]||'');if(m.includes('runtime.lastError')||m.includes('Receiving end')||m.includes('Backpack')||m.includes('injected.js')||m.includes('Could not establish')||m.includes('Unchecked runtime')||m.includes('favicon')||(m.includes('404')&&m.includes('_next')))return;o.apply(console,arguments);};console.warn=function(){var m=String(arguments[0]||'');if(m.includes('React DevTools')||m.includes('reactjs.org/link/react-devtools')||m.includes('react-devtools')||m.includes('Backpack')||m.includes('dispatchMessage')||m.includes('channel-secure-background'))return;w.apply(console,arguments);};console.log=function(){var m=String(arguments[0]||'');if(m.includes('dispatchMessage')||m.includes('channel-secure-background')||m.includes('message.js'))return;l.apply(console,arguments);};console.info=function(){var m=String(arguments[0]||'');if(m.includes('dispatchMessage')||m.includes('channel-secure-background')||m.includes('React DevTools'))return;i.apply(console,arguments);};})();
            `.trim(),
          }}
        />
        <Script
          src="/suppress-console.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <ConsoleSuppress />
        <FrameContext />
        {children}
      </body>
    </html>
  )
}
