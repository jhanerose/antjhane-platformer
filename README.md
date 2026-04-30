
# 🐜🚀 Dream Jumper
> *A spacefaring ant's endless dream — jump, dodge, survive.*

<p align="center">
  <img src="assets/img/dreamjumper-gamescreen.gif" width="700" alt="Dream Jumper Gameplay Preview">
</p>

<p align="center">
  <a href="https://jhanerose.github.io/antjhane-platformer/landing.html">
    <img src="https://img.shields.io/badge/PLAY%20NOW-9F2EFF?style=for-the-badge&logo=gamepad&logoColor=white" />
  </a>
</p>

---
## ✨ Key Features

- 🚀 Procedurally generated endless gameplay
- 🧠 Physics-based movement and momentum system
- 👾 Dynamic Shadow Boss with scaling difficulty
- 🌀 Real-time glitch events with gravity inversion
- ⚡ Multiple power-ups with strategic effects
- 💾 Local score persistence using `localStorage`
- 🎧 Procedural audio using Web Audio API

---

## 🎯 Why This Project?

This project demonstrates how complex game systems can be built **without frameworks**, focusing on:

- Low-level Canvas rendering  
- Real-time game loop architecture  
- Physics simulation and event systems  
- Modular JavaScript design  

It highlights strong fundamentals in **game development, performance optimization, and system design**.

---

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
| <img src="assets/img/dreamjumper-gamescreen.gif" width="400" alt="Dream Jumper Game Screen Preview"> | <img src="assets/video/dreamjumper-gameplay.gif" width="400" alt="Dream Jumper Gameplay Preview">
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

<p align="center">
  <img src="https://skillicons.dev/icons?i=html,css,js" />
</p>

| Layer        | Tech | Description |
|--------------|------|------------|
| 🎨 **Rendering** | HTML5 Canvas | Real-time 2D rendering using Canvas API |
| 🔊 **Audio** | Web Audio API | Procedural sound + spatial effects |
| 🧠 **Logic** | JavaScript (ES6+) | Core game systems & physics |
| 🎭 **Styling** | CSS3 | Flexbox, Grid, custom properties |
| 💾 **Storage** | `localStorage` | Saves high scores locally |
| 🔤 **Typography** | Google Fonts | Orbitron & Space Mono |

## 📁 Project Structure
```text
antjhane-platformer/
├── assets/
│   ├── img/
│   └── video/
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

<p align="center">
  <img src="https://img.shields.io/badge/Jhane%20Rose%20Sadicon-UI%2FUX%20%26%20Level%20Design-8A2BE2?style=for-the-badge&logo=figma&logoColor=white" />
  <img src="https://img.shields.io/badge/Anton%20Sebastian%20Dawinan-Game%20Dev%20%26%20Physics%20Logic-14B8A6?style=for-the-badge&logo=javascript&logoColor=white" />
</p>

<p align="center">
  <a href="https://github.com/jhanerose">
    <img src="https://img.shields.io/badge/@jhanerose-181717?style=flat-square&logo=github&logoColor=white" />
  </a>
  <a href="https://github.com/AntonDawinan">
    <img src="https://img.shields.io/badge/@AntonDawinan-181717?style=flat-square&logo=github&logoColor=white" />
  </a>
</p>

<p align="center">
  Developed collaboratively by the <b>SADICON-DAWINAN</b> team.
</p>

---
## 📄 License
This GitHub game project was developed under the course **BSIT 2207L – Web Systems and Technologies Lec/Lab (9318-AY225)**  

**Bachelor of Science in Information Technology with Specialization in Game Development (2nd Year)**  
College of Computer Studies, University of Perpetual Help System DALTA (UPHSD) Molino  

The project was developed under the supervision of **Sir Val Fabregas**, who provided the assigned genre pool for development.

© 2025 Dream Jumper. Developed by AntonDawinan & jhanerose. All rights reserved.

*No frameworks. Built with vanilla JavaScript, Canvas, and Web Audio API ☕*
