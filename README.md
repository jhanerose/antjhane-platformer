
# 🐜🚀 Dream Jumper
> *A spacefaring ant's endless dream — jump, dodge, survive.*

<p align="center">
  <img src="assets/img/dreamjumper-gamescreen.gif" width="700" alt="Dream Jumper Gameplay Preview">
</p>    

<p align="center">
  <img src="https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white">
  <img src="https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white">
  <img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E">
</p>

> **PLAY NOW!** https://jhanerose.github.io/antjhane-platformer/


## 📖 Project Overview

**Dream Jumper** is an original, fast-paced endless platformer built entirely from scratch using vanilla JavaScript and the HTML5 Canvas 2D API. No frameworks. No dependencies. 

Players control a spacefaring ant bouncing upward through an endless, procedurally generated world. Success requires a careful balance of mastering physics-based momentum, navigating six unique platform types, and outrunning a progressive environmental hazard—the Shadow Boss.

Developed as a 14-day sprint for the WebSystems-9318-AY225 Final Project.

---

## 🎮 Gameplay & Controls

Your ant **bounces automatically** upon landing. Your primary objective is precise horizontal steering to climb as high as possible without falling into the void or being caught by the ascending shadow.

| Action | Primary Key | Secondary Key |
|--------|-------------|---------------|
| **Move Left** | `A` | `←` Left Arrow |
| **Move Right**| `D` | `→` Right Arrow |
| **Pause / Menu**| `Esc` | `P` |

> *Controls can be rebound in the in-game Settings menu.*

---
## 🎬 Gameplay Showcase

| Game Screen & UI | Active Gameplay |
| :---: | :---: |
| <img src="assets/img/dreamjumper-gamescreen.gif" width="400" alt="Dream Jumper Game Screen Preview"> | <img src="assets/video/dreamjumper-gameplay.mp4" width="400" alt="Dream Jumper Gameplay Preview">
---

## 🪐 Environment & Mechanics

Navigate a procedurally generated vertical obstacle course featuring distinct platform behaviors and dynamic events.

### Platform Types
| Platform | Visual Identity | Behavior & Physics |
|----------|----------------|--------------------|
| **Dream** | Purple | Standard bounce; reliable and consistent. |
| **Nightmare** | Red | Crumbles upon landing; zero dwell time. |
| **Glitch** | Amber | Triggers a gravity-warping event on contact. |
| **Moving** | Cyan | Slides horizontally; requires timing prediction. |
| **Spring** | Orange | Instantly launches the player at a 2x height multiplier. |
| **Ice** | Light Blue | Zero friction; momentum carries you sideways. |

### 🌀 The Glitch Event
Landing on an Amber platform triggers a system glitch:
* The canvas fills with a scanline CRT overlay.
* Gravity polarity flips for ~1.8 seconds.
* Particle emitters explode across the screen.

### 👾 The Shadow Boss
A tentacled shadow creature rises from the bottom of the canvas. It scales its vertical acceleration based on your current score. The higher you climb, the more aggressive the pursuit algorithm becomes.

### ⚡ Power-Ups & Items
* ⭐ **Star:** Massive bounce boost (launches far above normal viewport bounds).
* ⚡ **Zap Shield:** Nullifies the next Glitch platform gravity-flip event.
* 🔥 **Boost:** +50% lateral movement speed for 5 seconds.
* 💰 **Coin:** +15 score. Chaining multiple coins without touching a standard platform builds a combo multiplier.

---

## 🏆 Scoring System

Your **Personal Best** is automatically tracked and persisted locally via browser `localStorage`.

| Action | Points Awarded |
|--------|--------|
| **Vertical Climb** | 10 pts per metre |
| **Coin Collection** | +15 pts |
| **Combo Mechanic** | +5 pts × combo count (requires 3+ consecutive bounces) |

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology Used |
|-------|-----------|
| **Rendering** | HTML5 Canvas 2D API |
| **Audio** | Web Audio API (Procedural synthesis & spatial audio) |
| **Logic** | Vanilla JavaScript (ES6+) |
| **Styling** | CSS3 (Custom properties, Flexbox/Grid) |
| **Persistence** | Window `localStorage` |
| **Typography** | Google Fonts (Orbitron, Space Mono) |

### 📁 Project Structure
```text
antjhane-platformer/

├── assets/

│   └── img/

│       └── antjhane.png

├── css/

│   ├── landing.css

│   └── style.css

├── index.html

├── js/

│   ├── game.js

│   └── script.js

├── landing.html

└── README.md
```

---

## ⚙️ Local Installation & Setup

To run this project locally without CORS restrictions for image/audio asset loading:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jhanerose/antjhane-platformer.git
   ```
2. **Navigate to the directory:**
   ```bash
   cd antjhane-platformer
   ```
3. **Serve the files:**
   Use any local development server. If you have Node.js installed:
   ```bash
   npx serve .
   ```
   *Alternatively, use the VS Code "Live Server" extension.*
4. **Play:**
   Open `http://localhost:3000` (or your server's assigned port) in your web browser.

---

## 👨‍💻 The Team

Developed collaboratively by the **SADICON-DAWINAN** team.

* **Jhane Rose Sadicon**  [jhanerose](https://github.com/jhanerose)
    * **Role:** Visual Design / UI/UX & Level Dynamics
* **Anton Sebastian Dawinan** [AntonDawinan](https://github.com/AntonDawinan)
    * **Role:** Lead Game Developer / Programming & Physics Logic

---

***
## 📄 License
This GitHub game project was developed under the course **BSIT 2207L – Web Systems and Technologies Lec/Lab (9318-AY225)**  

**Bachelor of Science in Information Technology with Specialization in Game Development (2nd Year)**  
College of Computer Studies, University of Perpetual Help System DALTA (UPHSD) Molino  

The project was developed under the supervision of **Sir Val Fabregas**, who provided the assigned genre pool for development.

© 2025 Dream Jumper. Developed by AntonDawinan & jhanerose. All rights reserved.

*No frameworks. Built with vanilla JavaScript, Canvas, and Web Audio API ☕*
