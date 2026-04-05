# Luff-Everyday

A minimalist productivity platform built with Next.js — featuring a professional-grade typing test with real-time WPM tracking, 31+ color themes, 20 font families, and persistent user customization.

---

## Features

### ⌨️ Typing Test Engine
- **Real-time WPM & raw WPM tracking** with per-second history points
- **Smooth cursor** that follows your position character-by-character
- **Configurable durations**: 15s, 30s, 60s, 120s
- **Error detection**: incorrect characters highlighted in real-time, mistyped words underlined
- **Infinite word generation**: words auto-prefetch as you approach the end of the buffer
- **Keyboard shortcuts**: `Shift+Enter` to restart, `Esc` to stop/reset

### 📊 Results & Analytics
- **WPM History Chart** (Chart.js) — line graph with error markers (bold red crosses) at each second where mistakes occurred
- **Theme-aware chart colors** — chart dynamically reads computed CSS variables for your active theme
- Stats breakdown: WPM, raw WPM, accuracy %, character counts, test duration
- **Auto-save results** to database for authenticated users via Prisma + PostgreSQL

### 🎨 Theming Engine
- **31 built-in themes** including dark luff, dracula, nord, gruvbox, vaporwave, matrix, and more
- Themes are applied via CSS custom properties generated at the layout level
- Instant theme switching with full persistence via `zustand/persist`
- Theme preview chips with color swatches on hover

### 🔤 Font Customization
- **20 font families** loaded via Google Fonts (sans-serif, serif, monospace, display, cursive)
- Single unified font applied globally across the entire app including the typing area
- Persistent font selection via Zustand

### 🔐 Authentication
- Google OAuth via NextAuth.js
- JWT session strategy
- Protected API routes for saving test results

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Framework    | Next.js 14 (App Router)             |
| Language     | TypeScript                          |
| Styling      | Tailwind CSS + CSS custom properties|
| State        | Zustand (with persistence)          |
| Auth         | NextAuth.js (Google OAuth)          |
| Database     | PostgreSQL via Prisma ORM           |
| Charts       | Chart.js + react-chartjs-2          |
| Animations   | Framer Motion (landing page)        |
| Icons        | Lucide React                        |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout — theme CSS generation, providers
│   ├── page.tsx            # Landing page with animated hero + feature cards
│   ├── globals.css         # Tailwind directives, Google Fonts import, CSS vars
│   ├── typing/
│   │   └── page.tsx        # Typing test page (TypingArea or ResultScreen)
│   ├── settings/
│   │   └── page.tsx        # Font family & theme selection grids
│   └── api/
│       ├── auth/[...nextauth]/route.ts  # NextAuth handler
│       └── tests/route.ts               # POST endpoint to save test results
├── components/
│   ├── Header.tsx          # Nav bar — logo, duration picker, auth controls
│   ├── TypingArea.tsx      # Core typing engine — caret, word rendering, input
│   ├── ResultScreen.tsx    # Post-test stats, WPM chart, keyboard shortcuts
│   ├── ThemeProvider.tsx   # Applies theme class + font to document
│   └── Providers.tsx       # NextAuth SessionProvider wrapper
├── store/
│   ├── useTypingStore.ts   # Typing state machine (idle → typing → finished)
│   ├── useThemeStore.ts    # Persisted theme selection
│   └── useAppFontStore.ts  # Persisted font selection
└── lib/
    ├── constants.ts        # ⭐ ALL constants — words, fonts, themes, config
    ├── auth.ts             # NextAuth configuration
    └── prisma.ts           # Prisma client singleton
```

---

## Constants Architecture

All application constants are consolidated into **`src/lib/constants.ts`**:

| Constant               | Purpose                                      |
|------------------------|----------------------------------------------|
| `COMMON_WORDS`         | 100-word pool for random test generation      |
| `generateWords()`      | Utility to produce N random words             |
| `WORD_BATCH_SIZE`      | Words generated per batch (100)               |
| `MAX_EXTRA_CHARS`      | Max chars beyond word length (5)              |
| `WORD_PREFETCH_THRESHOLD` | Remaining words before fetching more (20)  |
| `DURATION_OPTIONS`     | Available test durations [15, 30, 60, 120]    |
| `DEFAULT_DURATION`     | Default test duration (30s)                   |
| `LINE_HEIGHT_PX`       | Typing area line height for scroll calc (56px)|
| `APP_FONTS`            | 20 font definitions with id/name/fontString   |
| `THEMES`               | 31 theme definitions with full color palettes |
| `CHART_FALLBACK_COLORS`| Fallback hex colors for Chart.js rendering    |
| `STORAGE_KEYS`         | localStorage keys for persisted stores        |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Google OAuth credentials

### Installation

```bash
git clone https://github.com/Luff-Org/Luff-Everyday.git
cd Luff-Everyday
npm install
```

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/luff_everyday"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### Database Setup

```bash
npx prisma generate
npx prisma db push
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## Keyboard Shortcuts

| Shortcut          | Action                     |
|-------------------|----------------------------|
| `Shift + Enter`   | Restart the typing test    |
| `Escape`          | Stop / reset test          |
| Any character key | Begin typing (auto-start)  |

---

## License

Private — Luff-Org.
