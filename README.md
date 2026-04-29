# 🐜 Dream Jumper

> *A spacefaring ant's endless dream — jump, dodge, survive.*

A browser-based endless platformer built with vanilla HTML5 Canvas and the Web Audio API. No frameworks. No downloads. Just you, six platform types, and a shadow boss rising from below.

---

## 🎮 Gameplay

You control a spacefaring ant bouncing upward through an endless procedurally generated world. Your ant **bounces automatically** on every landing — your only job is to steer left and right. Climb as high as possible without getting caught by the Shadow Boss that chases you from below.

**Controls**

| Key | Action |
|-----|--------|
| `←` / `A` | Move left |
| `→` / `D` | Move right |
| `Esc` / `P` | Pause / Resume |

> Controls can be rebound in the in-game Settings menu.

---

## 🪐 Platform Types

| Platform | Color | Behavior |
|----------|-------|----------|
| **Dream** | Purple | Standard bounce — reliable and consistent |
| **Nightmare** | Red | Crumbles after landing — don't linger |
| **Glitch** | Amber | Warps gravity on contact — brace yourself |
| **Moving** | Cyan | Slides side to side — timing is everything |
| **Spring** | Orange | Mega bounce — launches you sky-high instantly |
| **Ice** | Light blue | Slippery surface — momentum carries you sideways |

---

## ⚡ Power-Up Items

| Item | Effect |
|------|--------|
| ⭐ **Star** | Massive bounce boost — launches you far above normal height |
| ⚡ **Zap Shield** | Blocks the next glitch gravity-flip event |
| 🔥 **Boost** | Speed boost for 5 seconds |
| $ **Coin** | +15 score each; chain multiple for combo multipliers |

---

## 👾 The Shadow Boss

A tentacled shadow creature rises from below, accelerating as your score increases. It tracks your position and speeds up over time — the higher you climb, the faster it chases. If it catches you, the dream ends.

---

## 🌀 Glitch Events

Landing on a **Glitch platform** triggers a glitch event:
- The screen fills with a scanline overlay
- Gravity may flip upside-down for ~1.8 seconds
- Particles explode across the screen

Collect a **Zap Shield** before landing on a glitch platform to block the effect entirely.

---

## 🏆 Scoring

| Action | Points |
|--------|--------|
| Height climbed | 10 pts per metre |
| Coin collected | +15 pts |
| Combo (3+ bounces) | +5 pts × combo count |
| Height record | Score always matches height × 10 minimum |

Your **personal best** is saved automatically in your browser via `localStorage`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Rendering | HTML5 Canvas 2D API |
| Audio | Web Audio API (procedural synthesis) |
| Language | Vanilla JavaScript (ES6+) |
| Styling | CSS3 with custom properties |
| Storage | `localStorage` |
| Fonts | Google Fonts — Orbitron, Space Mono |

No build tools. No dependencies. No frameworks. Open `index.html` in any modern browser and play.

---

## 📁 Project Structure

```
dream-jumper/
├── index.html       # Game shell — screens, HUD, overlays
├── style.css        # All game UI styles
├── game.js          # Full game logic (physics, rendering, input, audio)
├── landing.html     # Marketing landing page
├── landing.css      # Landing page styles
├── landing.js       # Landing page scripts (starfield, ant animation)
└── README.md        # This file
```

---

## 🚀 Getting Started

No installation required. Just open the files locally:

```bash
# Clone or download the project, then:
open index.html       # macOS
start index.html      # Windows
xdg-open index.html   # Linux
```

Or serve it with any static file server:

```bash
npx serve .
# then visit http://localhost:3000
```

> **Note:** Some browser features (like `localStorage`) require a server context. Use a local server if anything behaves unexpectedly when opening files directly.

---

## 👥 Team

Built in a **14-day game development sprint**.

| Role | Contributor |
|------|-------------|
| Game Developer · Lead | Student One |
| Visual Design · UI/UX | Student Two |

---

## 📄 License

© 2025 Dream Jumper Team. All rights reserved.

---

*Made with HTML5 Canvas & Web Audio API · No frameworks · Built in 14 days*