# Setup Notes - Farcaster Mini App v2

## Important: SDK Initialization

According to the [official Farcaster documentation](https://docs.farcaster.xyz/developers/frames/v2/getting-started), you **MUST** call `sdk.actions.ready()` after your app loads.

### Why This Matters

> **Important**: If you don't call `ready()`, users will see an infinite loading screen. This is one of the most common issues when building Mini Apps.

### Implementation

The code in `app/page.tsx` already implements this correctly:

```typescript
useEffect(() => {
  const initSDK = async () => {
    try {
      // Call ready() after your app is fully loaded
      await sdk.actions.ready()
      setSdkReady(true)
    } catch (err) {
      // Handle errors (e.g., not in Farcaster client)
      setSdkReady(true)
    }
  }
  initSDK()
}, [])
```

## Requirements

- **Node.js 22.11.0 or higher** (LTS version recommended)
  - Check: `node --version`
  - Download: https://nodejs.org/
- Package manager: npm, pnpm, or yarn

## Manifest File

The manifest is located at: `public/.well-known/farcaster.json`

**Before deploying**, update the URLs in the manifest:
- `homeUrl`: Your deployed app URL
- `iconUrl`: Your app icon (200x200 recommended)
- `splashImageUrl`: Splash screen (1200x630 recommended)
- `heroImageUrl`: Hero image (1200x630 recommended)

## Developer Mode

To test and develop Mini Apps, enable Developer Mode:
1. Log in to Farcaster (mobile or desktop)
2. Visit: https://farcaster.xyz/~/settings/developer-tools
3. Toggle on "Developer Mode"
4. A developer section will appear on desktop

## Resources

- [Official Documentation](https://docs.farcaster.xyz/developers/frames/v2/getting-started)
- [Mini App SDK](https://www.npmjs.com/package/@farcaster/miniapp-sdk)
- [Mini App Asset Generator](https://www.miniappassets.com/)

