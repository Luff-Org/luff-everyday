<div align="center">
  <img src="https://raw.githubusercontent.com/Luff-Org/Luff-Everyday/main/public/focus-3d.png" width="120" height="120" alt="luff. logo" />
  
  # luff.
  ### *Elevate your everyday focus.*

  **[Live Demo →](https://luff-everyday.vercel.app/)**
</div>

---

## 🌪️ The Vision
**luff.** is a minimalist suite of productivity tools designed to help you reclaim your focus. Starting with a professional-grade typing engine, it combines high-performance interaction with deep aesthetic customization to create a "flow state" workspace.

---

## ✨ Primary Features

### ⌨️ Elite Typing Engine
*   **Precision Tracking:** Real-time WPM, raw WPM, and accuracy % with per-second historical data.
*   **Visual Feedback:** A smooth, character-following caret and intelligent error highlighting.
*   **Infinite Buffer:** Words auto-prefetch as you type, ensuring zero interruptions.
*   **Pro Shortcuts:** `Shift+Enter` to restart, `Esc` to reset—all driven by keyboard-first UX.

### 🎨 Deep Customization
*   **31+ Aesthetic Themes:** From sleek *Nord* and *Dracula* to vibrant *Vaporwave* and *Matrix* modes.
*   **20 Typography Styles:** High-impact fonts including modern sans-serifs, classic serifs, and playful display families.
*   **Dynamic Branding:** A theme-reactive favicon and UI that adapts instantly to your selected palette.

### 📊 Personal Analytics
*   **WPM History Charts:** Beautiful, interactive line graphs showing your speed and mistakes over time.
*   **Prisma Persistence:** Results are auto-saved to a secure PostgreSQL database for registered users.
*   **Google OAuth:** Seamless, secure login to track your progress over days and weeks.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **State Management** | Zustand (with local persistence) |
| **Database** | PostgreSQL + Prisma ORM |
| **Authentication** | NextAuth.js (Google OAuth 2.0) |
| **Visuals** | Framer Motion + Tailwind CSS |
| **Charts** | Chart.js |
| **Icons** | Lucide React |

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/Luff-Org/luff-everyday.git
cd Luff-Everyday
npm install
```

### 2. Configure Environment
Create a `.env` file in the root:
```env
DATABASE_URL="postgresql://..." # Your PostgreSQL string
GOOGLE_CLIENT_ID="..."           # From Google Cloud Console
GOOGLE_CLIENT_SECRET="..."       # From Google Cloud Console
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."            # Random string for encryption
```

### 3. Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development
```bash
npm run dev
```
Open **[localhost:3000](http://localhost:3000)** to begin.

---

## 🎹 Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `Shift + Enter` | Instant test restart |
| `Escape` | Reset to start / Hide results |
| `Tab` | Next field |
| `[Any Key]` | Auto-starts the timer |

---

## 🤝 Project Links
- **Organization:** [Luff-Org](https://github.com/Luff-Org)
- **Deployment:** [luff-everyday.vercel.app](https://luff-everyday.vercel.app/)

---

<div align="center">
  Built with ❤️ by the <b>luff.</b> team.
</div>
