# Turn-Based Battle Game - Farcaster Mini App

A turn-based battle game built as a **Farcaster Mini App v2** using the Mini App SDK. The game features pixel art displays, turn-based combat mechanics, and client-side state management with React.

> **Built with**: Farcaster Mini App SDK v2 - the modern way to build interactive apps in Farcaster!

## Game Mechanics

### Start Screen
- Displays pixel art (using placeholder image URLs - replace with your own)
- Features a "Start Game" button to begin the battle

### Gameplay Loop
- **Turn-based interaction**: Players click the "SHOOT" button to attack
- **Hit chances**: 
  - Player: 50% hit chance
  - Enemy: 30% hit chance
- **Damage**: Randomized between 10-20 HP per successful hit
- **State display**: Real-time HP bars, battle log, and turn counter
- **Initial stats**:
  - Player: 100 HP
  - Enemy: 50 HP

### Game Over
- Displays unique images for Win/Loss scenarios
- Shows final stats (HP, turns)
- Features a "Play Again" button that resets the game state

### State Management
- Game state is managed **client-side** using React state
- State persists during the session
- No server-side storage required

## Technical Implementation

### Framework
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Farcaster Mini App SDK v2** (`@farcaster/miniapp-sdk`)
- **React** for UI and state management

### Mini App Features
- Uses `sdk.actions.ready()` to initialize the Mini App (required to hide splash screen)
- Works in Farcaster clients and development mode
- Client-side rendering with React components
- Real-time UI updates
- Follows [official Farcaster Mini Apps documentation](https://docs.farcaster.xyz/developers/frames/v2/getting-started)

### File Structure
```
game/
├── app/
│   ├── page.tsx                    # Main Mini App component
│   ├── layout.tsx                   # Root layout
│   └── components/
│       ├── ConsoleSuppress.tsx      # Console error suppression
│       └── FrameContext.tsx         # Context detection
├── public/
│   ├── .well-known/
│   │   └── farcaster.json          # Mini App manifest
│   └── suppress-console.js         # Console suppression script
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript configuration
├── next.config.js                   # Next.js configuration
└── README.md                        # This file
```

## Setup Instructions

### Prerequisites
- **Node.js 22.11.0 or higher** (LTS version recommended) - [Download from nodejs.org](https://nodejs.org/)
  - Check your version: `node --version`
  - If you encounter installation errors, verify you're using Node.js 22.11.0 or higher
- A package manager (npm, pnpm, or yarn)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables** (optional):
   Create a `.env.local` file if you need to configure any environment-specific settings:
   ```env
   # Add any environment variables here if needed
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Access the Mini App**:
   - The app will be available at: `http://localhost:3000`
   - To test in a Farcaster client, you'll need to deploy to a public URL (see Deployment section)

## Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   Follow the prompts to link your project or create a new deployment.

3. **Update Manifest**:
   After deployment, update `public/.well-known/farcaster.json` with your actual URLs:
   ```json
   {
     "miniapp": {
       "homeUrl": "https://your-project.vercel.app",
       "iconUrl": "https://your-project.vercel.app/icon.png",
       "splashImageUrl": "https://your-project.vercel.app/splash.png",
       "heroImageUrl": "https://your-project.vercel.app/hero.png"
     }
   }
   ```

4. **Your Mini App URL**:
   After deployment, your Mini App will be available at:
   ```
   https://your-project.vercel.app
   ```

### Deploy to Other Platforms

The application can be deployed to any platform that supports Next.js:
- **Netlify**: Use the Next.js build preset
- **Railway**: Connect your GitHub repo
- **AWS Amplify**: Configure for Next.js
- **Any Node.js hosting**: Build and run the production server

### Building for Production

```bash
npm run build
npm start
```

## Customizing Images

The game currently uses placeholder images from `picsum.photos`. To use your own images:

1. **Replace image URLs** in `app/page.tsx`:
   - Start screen: Line ~157
   - Battle screen: Line ~200
   - Win screen: Line ~177
   - Loss screen: Line ~177

2. **Update manifest images** in `public/.well-known/farcaster.json`:
   - `iconUrl`: App icon (200x200 recommended)
   - `splashImageUrl`: Splash screen (1200x630 recommended)
   - `heroImageUrl`: Hero image (1200x630 recommended)

## How It Works

### Mini App Initialization

1. **SDK Initialization**:
   - The app calls `sdk.actions.ready()` when it loads
   - This signals to the Farcaster client that the app is ready
   - If not in a Farcaster client, the app still works in development mode

2. **Game Flow**:
   - User clicks "Start Game" → Game state changes to 'playing'
   - User clicks "SHOOT" → Turn is processed, state updates
   - Game checks win/loss conditions after each turn
   - User clicks "Play Again" → Game resets

3. **State Management**:
   - React `useState` manages game state
   - State persists during the session
   - No server-side storage needed

### Code Structure

- **Game Logic**: Functions for damage calculation, hit checking, turn processing
- **State Management**: React hooks for game state
- **UI Components**: React components for different game screens
- **SDK Integration**: Farcaster Mini App SDK initialization

## Testing

### Local Testing
1. Run `npm run dev`
2. Visit `http://localhost:3000` in a browser
3. The app will work in development mode (shows a warning that it's not in Farcaster)

### Farcaster Testing
1. Deploy your app to a public URL (HTTPS required)
2. Update the manifest with your deployed URLs
3. Test in a Farcaster client like Warpcast
4. The app should initialize properly with the SDK

## Customization

### Adjusting Game Balance
Edit the constants in `app/page.tsx`:
- `INITIAL_STATE.playerHP`: Starting player health (default: 100)
- `INITIAL_STATE.enemyHP`: Starting enemy health (default: 50)
- `checkHit()` function: Adjust hit chances (Player: 50%, Enemy: 30%)
- `calculateDamage()` function: Adjust damage range (default: 10-20)

### Adding Features
- Add more game states by extending the `GameState` interface
- Add more UI components for different screens
- Integrate Farcaster SDK features (user data, wallet, etc.)

## Troubleshooting

### Mini App Not Loading in Farcaster
- Ensure the app is deployed to HTTPS
- Check that the manifest is accessible at `/.well-known/farcaster.json`
- Verify all image URLs in the manifest are accessible
- Check browser console for errors

### SDK Not Initializing
- The app works in development mode even if SDK fails
- In production, ensure you're testing in a Farcaster client
- Check that `sdk.actions.ready()` is being called

### Images Not Loading
- Replace placeholder URLs with your own image URLs
- Ensure images are accessible via HTTPS
- Check image dimensions (recommended: 1200x630 for hero/splash)

## Resources

- [Farcaster Mini Apps Documentation](https://miniapps.farcaster.xyz/)
- [Farcaster Mini App SDK](https://www.npmjs.com/package/@farcaster/miniapp-sdk)
- [Next.js Documentation](https://nextjs.org/docs)
- [Mini App Asset Generator](https://www.miniappassets.com/)

## License

This project is open source and available for use and modification.
