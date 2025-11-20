# Frames vs Mini Apps - Important Distinction

## What We're Building: A **Farcaster Frame**

This project is a **Farcaster Frame**, not a Mini App. Here's the difference:

### Frames (What We Built)
- ✅ Use the **Frames Protocol** (meta tags: `fc:frame`, `fc:frame:button`, etc.)
- ✅ Stateless - state managed via `fc:frame:state` meta tag
- ✅ Server-side rendering - returns HTML with meta tags
- ✅ No client-side SDK required
- ✅ Works in Farcaster clients via embedded iframe
- ✅ Simple POST/GET request handling

### Mini Apps (Different Technology)
- Use the **Mini App SDK** (`@farcaster/miniapp-sdk`)
- Client-side JavaScript applications
- Require `sdk.actions.ready()` initialization
- Full React/Next.js apps running in Farcaster
- More complex, full-featured applications

## Why You're Seeing Those Errors

The errors you're seeing are **NOT** from Farcaster:

1. **"Unchecked runtime.lastError"** - Browser extension error (Backpack wallet, etc.)
2. **"dispatchMessage channel-secure-background"** - Browser extension communication
3. **"Download the React DevTools"** - React development message

These are **harmless browser extension warnings**, not Farcaster SDK errors.

## Our Frame Architecture

```
User clicks button in Farcaster client
    ↓
Farcaster client sends POST to /api
    ↓
Our server processes game logic
    ↓
Returns HTML with fc:frame meta tags
    ↓
Farcaster client displays updated frame
```

**No client-side SDK needed!** The Frame protocol handles everything via meta tags.

## If You Want Mini App Features

If you want to convert this to a Mini App (which would require significant changes):

1. Install Mini App SDK: `npm install @farcaster/miniapp-sdk`
2. Initialize SDK: `await sdk.actions.ready()`
3. Use client-side React components instead of server-side HTML
4. Handle state client-side instead of via meta tags

But for a simple turn-based game, **Frames are perfect** - simpler, faster, and more efficient!

## Testing Your Frame

1. **Local testing**: Visit `http://localhost:3000/api` to see the frame HTML
2. **Farcaster testing**: Deploy to a public URL and test in Warpcast or another Farcaster client
3. **Frame validators**: Use tools like [Frames.js validator](https://frames.js.org/) to test your frame

## Resources

- [Farcaster Frames Docs](https://docs.farcaster.xyz/reference/frames) - What we're using
- [Farcaster Mini Apps Docs](https://miniapps.farcaster.xyz/) - Different technology
- [Frames Protocol Spec](https://docs.farcaster.xyz/reference/frames) - Technical details

