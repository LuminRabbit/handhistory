# 🎰 Poker Hand History Tracker PWA

A sleek, mobile-first Progressive Web App for tracking poker hand history with a sophisticated casino-noir aesthetic.

**Live Demo**: https://luminrabbit.github.io/handhistory/

## ✨ Features

- **Hero Cards Selection**: Tap to select your 2 hole cards from an interactive card grid
- **Villain Cards Selection**: Optional villain hole cards tracking
- **Board Cards Selection**: Select up to 5 community cards with automatic street detection (Flop/Turn/River)
- **Game Info**: Quick blind selection (1/2, 1/3, 2/5), position picker, and stack size
- **Player Configuration**: Select which players are in the hand and mark Hero
- **Auto-Advancing Actions**: Automatically cycles through players in correct order
- **Fold Tracking**: Folded players automatically removed from action buttons
- **Action Entry**: Select street, then action - player auto-advances
- **Keyboard Shortcuts**: Lightning-fast action recording (F/C/K/B/R/A keys)
- **Action Log**: Organized in 4 columns (Preflop/Flop/Turn/River)
- **Undo Function**: Fix mistakes with one tap (or Ctrl/Cmd+Z)
- **Hand History**: Save hands to localStorage, expand to see full details, delete unwanted hands
- **PWA Support**: Install on mobile devices and use offline
- **Mobile-First Design**: Optimized for touch interactions and small screens

## 🚀 Quick Start

### Option 1: Python HTTP Server (Recommended)

```bash
# Navigate to the project directory
cd poker-hand-tracker

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000`

### Option 2: Node.js HTTP Server

```bash
# Install http-server globally (if not already installed)
npm install -g http-server

# Run server
http-server -p 8000
```

Then open: `http://localhost:8000`

### Option 3: VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

**Important**: Do NOT use `file://` protocol as it will block PWA features and localStorage in most browsers.

## 📱 Installing as PWA

### On Mobile (Android/iOS)

1. Open the app in your mobile browser
2. **Android Chrome**: Tap the menu (⋮) → "Install app" or "Add to Home screen"
3. **iOS Safari**: Tap the Share button → "Add to Home Screen"

### On Desktop (Chrome/Edge)

1. Look for the install icon in the address bar (⊕ or computer icon)
2. Click it and follow the prompts
3. Or: Menu → "Install Poker Hand Tracker..."

## 🎮 How to Use

### 1. Select Hero Cards
- Tap the "Hero Cards" slot
- Select exactly 2 cards from the grid
- Cards are organized by suit (♠♥♦♣)
- Tap close button when done

### 2. Select Board Cards
- Tap the "Board" slot
- Select up to 5 community cards
- Street is automatically detected:
  - 3 cards = Flop
  - 4 cards = Turn
  - 5 cards = River

### 3. Set Game Info
- **Blinds**: Choose from 1/2, 1/3, or 2/5
- **Position**: Tap to select your position (SB, BB, UTG, etc.)
- **Stack**: Choose 50bb, 100bb, 150bb, or enter custom

### 4. Record Actions
- **Select Player**: Tap a player button (SB, BB, UTG, etc., or Hero)
- **Select Action**: Tap an action (Fold, Call, Check, Bet, Raise, All-in)
- Actions are automatically logged to the correct street column

### 5. Save Hand
- Tap "💾 Save Hand" to save to localStorage
- All data is preserved: cards, board, blinds, position, stack, actions, and timestamp

### 6. View History
- Tap "📚 View Hand History" to see all saved hands
- Hands are displayed with full details

## 🎨 Design Features

- **Casino-Noir Aesthetic**: Dark theme with gold accents
- **Sophisticated Typography**: Playfair Display for headers, Space Mono for body
- **Smooth Animations**: Card drops, button ripples, modal transitions
- **Touch-Optimized**: Large tap targets, active states, haptic-like feedback
- **Visual Hierarchy**: Clear sections with subtle borders and shadows

## 🗂️ Project Structure

```
poker-hand-tracker/
├── index.html          # Main HTML with mobile-first layout
├── app.js              # All JavaScript functionality
├── manifest.json       # PWA manifest
├── service-worker.js   # Service worker for offline support
└── README.md          # This file
```

## 💾 Data Storage

All hands are saved to browser localStorage with the following structure:

```javascript
{
  id: timestamp,
  date: "MM/DD/YYYY, HH:MM:SS",
  heroCards: ["A♠", "K♠"],
  boardCards: ["Q♠", "J♠", "10♠"],
  blinds: "1/2",
  position: "BTN",
  stack: "100bb",
  actions: {
    preflop: ["Hero: Raise", "BB: Call"],
    flop: ["BB: Check", "Hero: Bet"],
    turn: ["BB: Fold"],
    river: []
  }
}
```

## 🔧 Customization

### Changing Colors
Edit CSS variables in `index.html`:
```css
:root {
    --accent-gold: #d4af37;
    --accent-red: #ef4444;
    --accent-green: #10b981;
    /* etc. */
}
```

### Adding More Blind Levels
In `index.html`, add more buttons to the blinds section:
```html
<button class="btn blind-btn" data-blind="5/10">5/10</button>
```

### Custom Positions
Edit the position grid in `positionModal` in `index.html`

## 🐛 Troubleshooting

### PWA Not Installing
- Make sure you're using a proper web server (not `file://`)
- Check that `manifest.json` and `service-worker.js` are accessible
- Try in Chrome/Edge (best PWA support)

### Cards Not Saving
- Check browser console for errors
- Ensure localStorage is not disabled
- Try clearing browser cache and reloading

### Layout Issues on Mobile
- The app is designed for portrait orientation
- Works best on screens 320px - 600px wide
- Use Chrome DevTools mobile emulation for testing

## 📄 Browser Support

- ✅ Chrome/Edge (full support)
- ✅ Safari (iOS/macOS)
- ✅ Firefox
- ⚠️ Opera (limited PWA support)

## 📝 License

Free to use and modify for personal projects.

## 🎯 Future Enhancements

Potential features to add:
- Bet sizing input
- Hand strength calculator
- Export to CSV/JSON
- Hand replayer
- Statistics dashboard
- Cloud sync
- Dark/light theme toggle

---

**Enjoy tracking your poker hands!** 🃏♠♥♦♣
