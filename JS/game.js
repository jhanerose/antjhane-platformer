"use strict";
/* ═══════════════════════════════════════════════
   DREAM JUMPER — game.js
   v2: more platforms, moving platforms, FPS boost,
   new mechanics: speed boost, spring, ice, coin combo
═══════════════════════════════════════════════ */

// ── SETTINGS ─────────────────────────────────
const settings = {
  sfx: true, volume: 0.7,
  quality: 'medium',
  keys: { left: ['ArrowLeft','a'], right: ['ArrowRight','d'] }
};
function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('dj_settings') || 'null');
    if (s) { Object.assign(settings, s); }
  } catch(e){}
}
function saveSettings() {
  localStorage.setItem('dj_settings', JSON.stringify(settings));
}
function resetSettings() {
  settings.sfx = true; settings.volume = 0.7;
  settings.quality = 'medium';
  settings.keys = { left: ['ArrowLeft','a'], right: ['ArrowRight','d'] };
  saveSettings(); applySettingsToUI();
}

// ── CONSTANTS ─────────────────────────────────
const GRAVITY         = 0.42;
const JUMP_FORCE      = -15.5;
const ITEM_JUMP_FORCE = -21;
const SPRING_FORCE    = -26;
const PLAYER_SPEED    = 10;
const PLAT_GAP_MIN    = 80;
const PLAT_GAP_MAX    = 130;
const PLAT_W_MIN      = 110;
const PLAT_W_MAX      = 185;
const BOSS_SPEED_BASE = 0.55;
const GLITCH_INTERVAL = [7000, 14000];
const GLITCH_DURATION = 1800;
const NIGHTMARE_FADE    = 1300;
const NIGHTMARE_GONE    = 5000;
const NIGHTMARE_RESPAWN = 1000;
const ITEM_SPAWN_CHANCE = 0.22;

const COLORS = {
  accent:'#7f5af0', accent2:'#2cb67d', coral:'#ff6b6b',
  amber:'#ffd166', text:'#e8e0f5', muted:'#6e6a80',
  dream:'#7f5af0', nightmare:'#ff6b6b', glitch:'#ffd166',
  moving:'#00d4ff', spring:'#ff9f43', ice:'#a8edea', coin:'#f9c74f',
};

// ── STATE ─────────────────────────────────────
let canvas, ctx, W, H;
let gameState = 'title';
let raf;
const keys = {};
let player, platforms, items, coins, boss;
let cameraY = 0, score = 0, maxHeight = 0, emotion = 0.5;
let gravityDir = 1, gravityFlipped = false;
let glitchActive = false, glitchShield = false;
let particles = [], stars = [];
let bestScore = parseInt(localStorage.getItem('dj_best') || '0');
let countdownValue = 3, countdownRAF;
let titleBGCanvas, titleBGCtx;
let settingsCallerScreen = 'title-screen';
let comboCount = 0, comboTimer = 0;
let speedBoostActive = false, speedBoostTimer = 0;

// FPS tracking
let lastFrameTime = 0;
let frameCount = 0;
let fps = 60;
let fpsTimer = 0;

// Quality multipliers
const QUALITY_SETTINGS = {
  low:    { stars: 40,  particles: 0.3, shadows: false, nebula: false },
  medium: { stars: 90,  particles: 0.7, shadows: true,  nebula: true  },
  high:   { stars: 160, particles: 1.0, shadows: true,  nebula: true  },
};
function qp() { return QUALITY_SETTINGS[settings.quality]; }

// ── SOUND (Web Audio API) ────────────────────
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freq, type='sine', duration=0.1, vol=0.15) {
  if (!settings.sfx) return;
  try {
    const ac = getAudioCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol * settings.volume, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.start(); osc.stop(ac.currentTime + duration);
  } catch(e){}
}
function sfxJump()      { playTone(320, 'sine',    0.12, 0.12); }
function sfxBigJump()   { playTone(500, 'sine',    0.15, 0.18); playTone(700,'triangle',0.08,0.12); }
function sfxSpring()    { playTone(650, 'triangle',0.08,0.2); setTimeout(()=>playTone(900,'triangle',0.06,0.18),60); setTimeout(()=>playTone(1200,'sine',0.08,0.12),120); }
function sfxGlitch()    { playTone(80,  'sawtooth', 0.25, 0.2); }
function sfxItemGet()   { playTone(880, 'sine',    0.18, 0.25); setTimeout(()=>playTone(1100,'sine',0.12,0.15),80); }
function sfxCoin()      { playTone(1200,'sine',    0.06, 0.12); }
function sfxCombo()     { playTone(660, 'triangle',0.08, 0.15); setTimeout(()=>playTone(880,'triangle',0.06,0.15),60); setTimeout(()=>playTone(1100,'triangle',0.06,0.2),120); }
function sfxSpeedBoost(){ playTone(400,'sawtooth',0.1,0.15); setTimeout(()=>playTone(600,'sawtooth',0.08,0.15),80); }
function sfxCountdown() { playTone(440, 'triangle', 0.15, 0.18); }
function sfxGo()        { playTone(660, 'triangle', 0.2, 0.08); setTimeout(()=>playTone(880,'triangle',0.15,0.08),90); setTimeout(()=>playTone(1100,'triangle',0.15,0.12),180); }
function sfxIce()       { playTone(180, 'sine', 0.15, 0.1); }

// ── ANT SPACESUIT DRAWING ─────────────────────
function drawAnt(c, x, y, s, facing, isJumping, seed) {
  c.save();
  c.translate(x, y);
  if (facing < 0) { c.scale(-s, s); } else { c.scale(s, s); }

  const t = Date.now() / 380 + (seed || 0);
  const leg = isJumping ? 0.5 : Math.sin(t) * 0.45;

  c.beginPath();
  c.ellipse(0, 14, 14, 18, 0, 0, Math.PI*2);
  c.fillStyle = '#d0c4f0'; c.fill();
  c.strokeStyle = '#9880d0'; c.lineWidth = 1.2; c.stroke();
  c.strokeStyle = 'rgba(100,80,200,0.3)'; c.lineWidth = 1;
  [-2,6,12].forEach(yy => { c.beginPath(); c.moveTo(-11,yy); c.lineTo(11,yy); c.stroke(); });

  c.beginPath();
  c.ellipse(0, -5, 9, 8, 0, 0, Math.PI*2);
  c.fillStyle = '#baaee0'; c.fill();
  c.strokeStyle = '#9080c0'; c.lineWidth = 1; c.stroke();

  c.beginPath();
  c.arc(0, -20, 14, 0, Math.PI*2);
  c.fillStyle = '#ede8ff'; c.fill();
  c.strokeStyle = '#a090d0'; c.lineWidth = 1.5; c.stroke();

  c.beginPath();
  c.arc(0, -20, 14, Math.PI*0.85, Math.PI*2.15);
  c.strokeStyle = '#7f5af0'; c.lineWidth = 2; c.stroke();

  c.beginPath();
  c.ellipse(2, -20, 10, 10, 0, 0, Math.PI*2);
  c.fillStyle = '#160a28'; c.fill();
  c.strokeStyle = '#7f5af0'; c.lineWidth = 1.2; c.stroke();

  c.beginPath();
  c.ellipse(-2, -24, 3.5, 2.5, -0.4, 0, Math.PI*2);
  c.fillStyle = 'rgba(255,255,255,0.38)'; c.fill();
  c.beginPath();
  c.ellipse(4, -22, 1.5, 1, 0.2, 0, Math.PI*2);
  c.fillStyle = 'rgba(255,255,255,0.22)'; c.fill();

  c.lineWidth = 1.5; c.lineCap = 'round';
  const a1x = -14 + Math.sin(t*0.5)*3, a1y = -38 + Math.cos(t*0.4)*2;
  const a2x =  14 + Math.sin(t*0.5+1)*3, a2y = -38 + Math.cos(t*0.4+0.8)*2;
  c.strokeStyle = '#8070b8';
  c.beginPath(); c.moveTo(-6,-30); c.quadraticCurveTo(-12,-36,a1x,a1y); c.stroke();
  c.beginPath(); c.moveTo( 6,-30); c.quadraticCurveTo( 12,-36,a2x,a2y); c.stroke();
  c.beginPath(); c.arc(a1x,a1y, 2.5, 0, Math.PI*2);
  c.fillStyle = '#7f5af0'; c.fill();
  c.beginPath(); c.arc(a2x,a2y, 2.5, 0, Math.PI*2);
  c.fillStyle = '#2cb67d'; c.fill();

  c.strokeStyle = '#7060a8'; c.lineWidth = 2; c.lineCap = 'round';
  const legData = [
    [-11,  6, -22, 20,  0],
    [-10, -3, -21, 10,  1],
    [ -9,-10, -20, -2,  2],
    [ 11,  6,  22, 20,  0],
    [ 10, -3,  21, 10,  1],
    [  9,-10,  20, -2,  2],
  ];
  for (const [sx,sy,ex,ey,ph] of legData) {
    const swing = Math.sin(leg + ph) * 6;
    const kx = sx + (ex-sx)*0.5;
    const ky = sy + (ey-sy)*0.4 + swing*0.5;
    c.beginPath();
    c.moveTo(sx, sy);
    c.quadraticCurveTo(kx+swing*0.3, ky, ex+swing, ey+Math.cos(leg+ph)*3);
    c.stroke();
    c.beginPath(); c.arc(ex+swing, ey+Math.cos(leg+ph)*3, 1.5, 0, Math.PI*2);
    c.fillStyle = '#9080c8'; c.fill();
  }

  c.beginPath(); c.roundRect(-6, -1, 12, 14, 3);
  c.fillStyle = '#c4b4e4'; c.fill();
  c.strokeStyle = '#9080c0'; c.lineWidth = 1; c.stroke();
  c.fillStyle = '#7f5af0'; c.font = 'bold 5px monospace'; c.textAlign = 'center';
  c.fillText('O\u2082', 0, 10);
  c.beginPath(); c.roundRect(-2,-3,4,4,1);
  c.fillStyle = '#a090d0'; c.fill();

  // Speed boost flame trail
  if (speedBoostActive) {
    c.save();
    const flameAlpha = 0.6 + Math.sin(Date.now()/80)*0.3;
    c.globalAlpha = flameAlpha;
    c.beginPath();
    c.ellipse(0, 28, 6, 10+Math.sin(Date.now()/60)*4, 0, 0, Math.PI*2);
    const fg = c.createLinearGradient(0,18,0,42);
    fg.addColorStop(0,'#ff9f43'); fg.addColorStop(1,'rgba(255,50,0,0)');
    c.fillStyle = fg; c.fill();
    c.restore();
  }

  c.restore();
}

function drawAntLogo(el, size) {
  const c = el.getContext('2d');
  c.clearRect(0,0,size,size);
  const sc = size / 140;
  drawAnt(c, size/2, size/2+8, sc, 1, false, 0);
}

// ── TITLE BACKGROUND ANIMATION ───────────────
let titleParticles = [];
let titleBGStars = [];
function initTitleBG(canvasId) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  c.width = window.innerWidth; c.height = window.innerHeight;
  const cx = c.getContext('2d');
  titleBGStars = [];
  for (let i = 0; i < 150; i++) {
    titleBGStars.push({
      x: Math.random()*c.width, y: Math.random()*c.height,
      r: Math.random()*1.6+0.3,
      alpha: Math.random()*0.7+0.2,
      flicker: Math.random()*Math.PI*2,
      speed: Math.random()*0.3+0.05,
    });
  }
  titleParticles = [];
  for (let i = 0; i < 12; i++) {
    titleParticles.push(makeTitleParticle(c.width, c.height));
  }
  return { c, cx };
}
function makeTitleParticle(W, H) {
  return {
    x: Math.random()*W, y: Math.random()*H,
    vx: (Math.random()-0.5)*0.6, vy: (Math.random()-0.5)*0.6,
    r: Math.random()*30+10,
    col: Math.random() < 0.5 ? 'rgba(127,90,240,' : 'rgba(44,182,125,',
    alpha: Math.random()*0.1+0.03,
    life: 1, maxLife: 200+Math.random()*300,
    age: 0,
  };
}
const titleBGAnimations = {};
function animateTitleBG(canvasId) {
  const c = document.getElementById(canvasId);
  if (!c || !c.isConnected) return;
  const cx = c.getContext('2d');
  const t = Date.now()/1000;
  cx.clearRect(0,0,c.width,c.height);

  const grad = cx.createLinearGradient(0,0,0,c.height);
  grad.addColorStop(0,'#060210'); grad.addColorStop(1,'#0f071e');
  cx.fillStyle = grad; cx.fillRect(0,0,c.width,c.height);

  for (let i = 0; i < 4; i++) {
    const bx = c.width*(0.2+i*0.2) + Math.sin(t*0.4+i)*30;
    const by = c.height*(0.3+i*0.15) + Math.cos(t*0.3+i)*20;
    const br = 80+i*30;
    const bg = cx.createRadialGradient(bx,by,0,bx,by,br);
    const cols = ['rgba(127,90,240,0.07)','rgba(44,182,125,0.06)','rgba(255,107,107,0.04)','rgba(255,209,102,0.04)'];
    bg.addColorStop(0,cols[i]); bg.addColorStop(1,'transparent');
    cx.beginPath(); cx.ellipse(bx,by,br,br*0.6,t*0.1+i,0,Math.PI*2);
    cx.fillStyle=bg; cx.fill();
  }

  for (let i=0;i<6;i++) {
    const px = (c.width*0.12 + i*c.width*0.16 + Math.sin(t*0.4+i*1.2)*15);
    const py = (c.height*0.2 + i*c.height*0.12 + Math.cos(t*0.3+i)*10);
    const pw = 60+i*8;
    const cols2 = ['#7f5af0','#2cb67d','#ff6b6b','#ffd166','#00d4ff','#ff9f43'];
    cx.save();
    cx.globalAlpha = 0.18+Math.sin(t+i)*0.06;
    cx.beginPath(); cx.roundRect(px,py,pw,7,4);
    cx.fillStyle = cols2[i]; cx.shadowColor = cols2[i]; cx.shadowBlur = 10;
    cx.fill();
    cx.restore();
  }

  for (const s of titleBGStars) {
    const alpha = s.alpha*(0.6+Math.sin(t*2+s.flicker)*0.4);
    cx.save(); cx.globalAlpha = alpha;
    cx.beginPath(); cx.arc(s.x,s.y,s.r,0,Math.PI*2);
    cx.fillStyle = s.r>1.2?'#c8b8ff':'#ffffff'; cx.fill(); cx.restore();
  }

  for (const p of titleParticles) {
    p.x+=p.vx; p.y+=p.vy; p.age++;
    if (p.age>p.maxLife) { Object.assign(p, makeTitleParticle(c.width,c.height)); p.age=0; }
    const pAlpha = p.alpha * Math.sin(p.age/p.maxLife*Math.PI);
    cx.save();
    cx.globalAlpha = pAlpha;
    const pg = cx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
    pg.addColorStop(0, p.col+'0.9)'); pg.addColorStop(1, p.col+'0)');
    cx.beginPath(); cx.arc(p.x,p.y,p.r,0,Math.PI*2);
    cx.fillStyle=pg; cx.fill(); cx.restore();
  }

  titleBGAnimations[canvasId] = requestAnimationFrame(()=>animateTitleBG(canvasId));
}
function stopTitleBG(canvasId) {
  if (titleBGAnimations[canvasId]) {
    cancelAnimationFrame(titleBGAnimations[canvasId]);
    delete titleBGAnimations[canvasId];
  }
}
function startTitleBG(canvasId) {
  stopTitleBG(canvasId);
  initTitleBG(canvasId);
  animateTitleBG(canvasId);
}

// ── PLATFORM ──────────────────────────────────
class Platform {
  constructor(x,y,w,type) {
    this.x=x; this.y=y; this.w=w; this.h=16;
    // types: 'dream'|'nightmare'|'glitch'|'moving'|'spring'|'ice'
    this.type=type;
    this.alpha=1; this.touched=false; this.touchTime=0;
    this.wobble=0; this.phase=Math.random()*Math.PI*2;
    // Moving platform properties
    if (type==='moving') {
      this.moveSpeed = (Math.random()*1.4+0.8) * (Math.random()<0.5?1:-1);
      this.moveRange = Math.random()*90+60;
      this.startX = x;
    }
    // Ice: player slides on it
    this.icy = (type==='ice');
    // Spring: huge bounce
    this.hasSpring = (type==='spring');
    this.springAnim = 0;
  }
  update() {
    this.phase+=0.025;
    if (this.type==='nightmare' && this.touched) {
      const e = Date.now() - this.touchTime;
      if (e < NIGHTMARE_FADE) {
        // Fading out
        this.alpha = Math.max(0, 1 - e / NIGHTMARE_FADE);
        this.solid = false;
      } else if (e < NIGHTMARE_FADE + NIGHTMARE_GONE) {
        // Fully invisible, waiting
        this.alpha = 0;
        this.solid = false;
      } else if (e < NIGHTMARE_FADE + NIGHTMARE_GONE + NIGHTMARE_RESPAWN) {
        // Fading back in
        const respawnProgress = (e - NIGHTMARE_FADE - NIGHTMARE_GONE) / NIGHTMARE_RESPAWN;
        this.alpha = respawnProgress;
        this.solid = false;
      } else {
        // Fully back — reset so it can be landed on again
        this.alpha = 1;
        this.solid = true;
        this.touched = false;
        this.touchTime = 0;
      }
    }
    if (this.type==='glitch') this.wobble=Math.sin(this.phase*3)*4;
    if (this.type==='moving') {
      this.x = this.startX + Math.sin(this.phase * this.moveSpeed * 0.8) * this.moveRange;
      // Clamp within screen
      if (this.x < 10) { this.x = 10; this.moveSpeed *= -1; }
      if (this.x + this.w > W - 10) { this.x = W - this.w - 10; this.moveSpeed *= -1; }
    }
    if (this.springAnim > 0) this.springAnim -= 0.08;
  }
  draw(ctx,camY) {
    const sy=this.y-camY;
    if (sy>H+20||sy<-30) return;
    ctx.save(); ctx.globalAlpha=this.alpha;
    ctx.translate(this.wobble,0);
    const {x,w,h}=this; const y=sy; const r=h/2;

    if (this.type==='glitch') {
      if (qp().shadows) { ctx.shadowColor=COLORS.glitch; ctx.shadowBlur=18+Math.sin(this.phase*3)*6; }
      ctx.beginPath(); ctx.roundRect(x+2,y+4,w,h,r);
      ctx.fillStyle='rgba(80,50,0,0.45)'; ctx.fill();
      ctx.beginPath(); ctx.roundRect(x,y,w,h,r);
      const ggrad = ctx.createLinearGradient(x,y,x,y+h);
      ggrad.addColorStop(0,'#ffe066');
      ggrad.addColorStop(0.45,COLORS.glitch);
      ggrad.addColorStop(1,'#aa7700');
      ctx.fillStyle=ggrad; ctx.fill();
      ctx.shadowBlur=0;
      ctx.beginPath(); ctx.roundRect(x+6,y+3,w-12,4,2);
      ctx.fillStyle='rgba(255,255,255,0.38)'; ctx.fill();
      ctx.beginPath(); ctx.roundRect(x+4,y+h-4,w-8,3,1.5);
      ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fill();

    } else if (this.type==='moving') {
      // Moving: cyan glowing platform
      if (qp().shadows) { ctx.shadowColor=COLORS.moving; ctx.shadowBlur=16; }
      ctx.beginPath(); ctx.roundRect(x+2,y+4,w,h,r);
      ctx.fillStyle='rgba(0,60,80,0.45)'; ctx.fill();
      ctx.beginPath(); ctx.roundRect(x,y,w,h,r);
      const grad = ctx.createLinearGradient(x,y,x,y+h);
      grad.addColorStop(0,'#80f8ff');
      grad.addColorStop(0.5,COLORS.moving);
      grad.addColorStop(1,'#006080');
      ctx.fillStyle=grad; ctx.fill();
      ctx.shadowBlur=0;
      // animated arrows showing direction
      ctx.fillStyle='rgba(255,255,255,0.45)';
      ctx.font='bold 9px monospace';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      const arrowChar = this.moveSpeed>0?'»':'«';
      ctx.fillText(arrowChar, x+w/2, y+h/2);
      ctx.beginPath(); ctx.roundRect(x+6,y+3,w-12,4,2);
      ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.fill();

    } else if (this.type==='ice') {
      // Ice: pale blue translucent
      if (qp().shadows) { ctx.shadowColor=COLORS.ice; ctx.shadowBlur=12; }
      ctx.beginPath(); ctx.roundRect(x+2,y+4,w,h,r);
      ctx.fillStyle='rgba(80,180,200,0.25)'; ctx.fill();
      ctx.beginPath(); ctx.roundRect(x,y,w,h,r);
      const grad = ctx.createLinearGradient(x,y,x,y+h);
      grad.addColorStop(0,'rgba(200,245,255,0.9)');
      grad.addColorStop(0.5,'rgba(140,220,240,0.85)');
      grad.addColorStop(1,'rgba(60,150,180,0.8)');
      ctx.fillStyle=grad; ctx.fill();
      ctx.shadowBlur=0;
      // ice cracks
      ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=0.8;
      for (let i=1; i<3; i++) {
        ctx.beginPath();
        ctx.moveTo(x+w*0.2*i, y+2);
        ctx.lineTo(x+w*0.2*i+6, y+h-2);
        ctx.stroke();
      }
      ctx.beginPath(); ctx.roundRect(x+6,y+3,w-12,4,2);
      ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.fill();

    } else if (this.type==='spring') {
      // Spring: green with a coil on top
      const isDream=true;
      if (qp().shadows) { ctx.shadowColor='#ff9f43'; ctx.shadowBlur=16; }
      ctx.beginPath(); ctx.roundRect(x+2,y+4,w,h,r);
      ctx.fillStyle='rgba(60,30,0,0.45)'; ctx.fill();
      ctx.beginPath(); ctx.roundRect(x,y,w,h,r);
      const grad = ctx.createLinearGradient(x,y,x,y+h);
      grad.addColorStop(0,'#ffc47a');
      grad.addColorStop(0.5,'#ff9f43');
      grad.addColorStop(1,'#c06010');
      ctx.fillStyle=grad; ctx.fill();
      ctx.shadowBlur=0;
      ctx.beginPath(); ctx.roundRect(x+6,y+3,w-12,4,2);
      ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.fill();
      // Spring coil indicator
      const springY = y - 6 - this.springAnim*8;
      ctx.strokeStyle='#ffd166'; ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(x+w/2-8, y);
      for (let i=0;i<4;i++) {
        ctx.lineTo(x+w/2+(i%2===0?8:-8), springY+i*2.5);
      }
      ctx.lineTo(x+w/2, springY-2);
      ctx.stroke();

    } else {
      const isDream = this.type==='dream';
      const baseCol = isDream ? COLORS.dream : COLORS.nightmare;
      ctx.beginPath(); ctx.roundRect(x+2, y+4, w, h, r);
      ctx.fillStyle = isDream ? 'rgba(30,0,80,0.45)' : 'rgba(80,0,0,0.45)';
      ctx.fill();
      if (qp().shadows) { ctx.shadowColor=baseCol; ctx.shadowBlur=isDream?14:18; }
      ctx.beginPath(); ctx.roundRect(x,y,w,h,r);
      const grad = ctx.createLinearGradient(x,y,x,y+h);
      grad.addColorStop(0, isDream?'#a07aff':'#ff9090');
      grad.addColorStop(0.45, baseCol);
      grad.addColorStop(1, isDream?'#4a2ab0':'#b03030');
      ctx.fillStyle=grad; ctx.fill();
      ctx.shadowBlur=0;
      ctx.beginPath(); ctx.roundRect(x+6,y+3,w-12,4,2);
      ctx.fillStyle='rgba(255,255,255,0.38)'; ctx.fill();
      ctx.beginPath(); ctx.roundRect(x+4,y+h-4,w-8,3,1.5);
      ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fill();
    }
    ctx.restore();
  }
}

// ── COIN ──────────────────────────────────────
class Coin {
  constructor(x,y) {
    this.x=x; this.y=y;
    this.collected=false; this.phase=Math.random()*Math.PI*2;
    this.r=9;
  }
  update() { this.phase+=0.08; }
  draw(ctx,camY) {
    if (this.collected) return;
    const sy=this.y-camY;
    if (sy>H+30||sy<-30) return;
    ctx.save();
    const bob=Math.sin(this.phase)*4;
    const sy2=sy+bob;
    ctx.beginPath();
    // coin squish to simulate rotation
    const squish = Math.abs(Math.sin(this.phase*1.5));
    ctx.ellipse(this.x, sy2, this.r*squish+2, this.r, 0, 0, Math.PI*2);
    if (qp().shadows) { ctx.shadowColor=COLORS.coin; ctx.shadowBlur=10; }
    const bg=ctx.createRadialGradient(this.x,sy2,0,this.x,sy2,this.r);
    bg.addColorStop(0,'#fffacd');
    bg.addColorStop(0.6,COLORS.coin);
    bg.addColorStop(1,'#c8960a');
    ctx.fillStyle=bg; ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.font='bold 8px serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('$', this.x, sy2);
    ctx.restore();
  }
}

// ── ITEM ──────────────────────────────────────
class Item {
  constructor(x,y,type) {
    this.x=x; this.y=y; this.type=type; // 'star'|'zap'|'boost'
    this.collected=false; this.phase=Math.random()*Math.PI*2;
    this.r=14;
  }
  update() { this.phase+=0.05; }
  draw(ctx,camY) {
    if (this.collected) return;
    const sy=this.y-camY;
    if (sy>H+30||sy<-30) return;
    ctx.save();
    const bob=Math.sin(this.phase)*6;
    const isStar=this.type==='star';
    const isBoost=this.type==='boost';
    const col=isStar?COLORS.amber:isBoost?COLORS.coral:COLORS.accent;
    const sy2=sy+bob;
    if (qp().shadows) { ctx.shadowColor=col; ctx.shadowBlur=18+Math.sin(this.phase)*6; }
    ctx.beginPath(); ctx.arc(this.x, sy2, this.r, 0, Math.PI*2);
    const bg=ctx.createRadialGradient(this.x,sy2,0,this.x,sy2,this.r);
    bg.addColorStop(0, isStar?'rgba(255,209,102,0.35)':isBoost?'rgba(255,107,107,0.35)':'rgba(127,90,240,0.35)');
    bg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle=bg; ctx.fill();
    ctx.shadowBlur=0;
    ctx.font=`bold ${22+Math.sin(this.phase)*1.5}px serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle=col;
    ctx.fillText(isStar?'★':isBoost?'🔥':'⚡', this.x, sy2);
    ctx.restore();
  }
  get hitbox() { return { x:this.x-this.r, y:this.y-this.r, w:this.r*2, h:this.r*2 }; }
}

// ── PLAYER ────────────────────────────────────
class Player {
  constructor(x,y) {
    this.x=x; this.y=y;
    this.vx=0; this.vy=0;
    this.w=26; this.h=46;
    this.facing=1; this.jumping=false;
    this.onGround=false; this.groundType='dream';
    this.trail=[]; this.seed=Math.random()*100;
    this.iceSliding=false;
  }
  get left()   { return this.x-this.w/2; }
  get right()  { return this.x+this.w/2; }
  get top()    { return this.y-this.h; }
  get bottom() { return this.y; }
  update() {
    const goLeft  = isKeyDown('left');
    const goRight = isKeyDown('right');
    const speed = speedBoostActive ? PLAYER_SPEED*1.7 : PLAYER_SPEED;

    if (this.iceSliding) {
      // On ice: gradual acceleration, reduced deceleration
      if (goLeft)  { this.vx = Math.max(this.vx-0.8, -speed); this.facing=-1; }
      if (goRight) { this.vx = Math.min(this.vx+0.8,  speed); this.facing= 1; }
      if (!goLeft&&!goRight) this.vx *= 0.97; // slippery!
    } else {
      if (goLeft)  { this.vx=-speed; this.facing=-1; }
      if (goRight) { this.vx= speed; this.facing= 1; }
      if (!goLeft&&!goRight) this.vx=0;
    }

    if (this.onGround) {
      this.jump(JUMP_FORCE, this.groundType);
      this.onGround=false;
      this.iceSliding=false;
    }
    this.vy+=GRAVITY*gravityDir;
    this.vy=Math.max(-24,Math.min(24,this.vy));
    this.x+=this.vx; this.y+=this.vy;
    if (this.x<-this.w/2) this.x=W+this.w/2;
    if (this.x>W+this.w/2) this.x=-this.w/2;
    this.jumping=Math.abs(this.vy)>1.5;

    // Speed boost timer
    if (speedBoostActive) {
      speedBoostTimer -= 16;
      if (speedBoostTimer <= 0) { speedBoostActive=false; }
    }

    if (qp().particles > 0.4) {
      this.trail.push({x:this.x,y:this.y,t:Date.now()});
      if (this.trail.length>10) this.trail.shift();
    }
  }
  jump(force, type) {
    this.vy=force*gravityDir;
    spawnJumpParticles(this.x, this.y, type||'dream');
    if (force===SPRING_FORCE) sfxSpring();
    else if (force===ITEM_JUMP_FORCE) sfxBigJump();
    else sfxJump();
  }
  draw(camY) {
    const sy=this.y-camY - 25;
    if (qp().particles > 0.5) {
      for (let i=0;i<this.trail.length;i++) {
        const pt=this.trail[i];
        const age=(Date.now()-pt.t)/250;
        const alpha=Math.max(0,0.2-age*0.25);
        ctx.save(); ctx.globalAlpha=alpha;
        ctx.beginPath(); ctx.arc(pt.x,pt.y-camY-25,4*(i/this.trail.length),0,Math.PI*2);
        const tc = speedBoostActive?'#ff9f43':COLORS.accent;
        ctx.fillStyle=tc; ctx.fill(); ctx.restore();
      }
    }
    drawAnt(ctx, this.x, sy, 1.25, this.facing, this.jumping, this.seed);
  }
}

// ── BOSS ─────────────────────────────────────
class Boss {
  constructor() {
    this.y=cameraY+H+250; this.speed=BOSS_SPEED_BASE;
    this.phase=0; this.eyePhase=0;
    this.tentacles=Array.from({length:6},(_,i)=>({angle:i*Math.PI/3,len:40+Math.random()*25,phase:Math.random()*Math.PI*2}));
  }
  update() {
    this.phase+=0.04; this.eyePhase+=0.06;
    const target=player.y+H*0.72;
    this.y+=(target-this.y)*0.012+this.speed;
    this.speed=Math.min(BOSS_SPEED_BASE+score*0.00025,3.2);
  }
  get screenY() { return this.y-cameraY; }
  draw() {
    const sy=this.screenY, cx=W/2;
    ctx.save();
    for (const t of this.tentacles) {
      t.phase+=0.04;
      const angle=t.angle+Math.sin(t.phase)*0.4;
      const ex=cx+Math.cos(angle)*(t.len+Math.sin(t.phase*1.3)*8);
      const ey=sy+Math.sin(angle)*(t.len*0.5+Math.sin(t.phase)*5);
      ctx.beginPath(); ctx.moveTo(cx,sy);
      ctx.quadraticCurveTo(cx+Math.cos(angle+0.5)*t.len*0.6,sy+Math.sin(angle+0.5)*t.len*0.3,ex,ey);
      ctx.strokeStyle=`rgba(80,0,120,${0.4+Math.sin(t.phase)*0.2})`;
      ctx.lineWidth=3+Math.sin(t.phase)*1.5; ctx.lineCap='round'; ctx.stroke();
    }
    const bR=55+Math.sin(this.phase)*6;
    const g=ctx.createRadialGradient(cx,sy,0,cx,sy,bR);
    g.addColorStop(0,'rgba(30,0,60,0.95)'); g.addColorStop(0.5,'rgba(15,0,40,0.85)'); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.ellipse(cx,sy,bR,bR*0.65,0,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    const eyeOff=14+Math.sin(this.eyePhase*0.5)*2, eyeY=sy-8+Math.sin(this.eyePhase)*3;
    for (const ex of [cx-eyeOff,cx+eyeOff]) {
      const eg=ctx.createRadialGradient(ex,eyeY,0,ex,eyeY,10);
      eg.addColorStop(0,'rgba(255,50,50,0.9)'); eg.addColorStop(1,'rgba(255,0,0,0)');
      ctx.beginPath(); ctx.arc(ex,eyeY,10,0,Math.PI*2); ctx.fillStyle=eg; ctx.fill();
      ctx.beginPath(); ctx.arc(ex,eyeY,4,0,Math.PI*2); ctx.fillStyle='#ff3030'; ctx.fill();
    }
    ctx.restore();
  }
  get proximity() {
    return Math.max(0,Math.min(1,1-(this.y-player.y)/(H*0.8)));
  }
  isCaught() { return this.y < player.y+30; }
}

// ── PARTICLES ────────────────────────────────
function spawnJumpParticles(x,y,type) {
  if (Math.random()>qp().particles) return;
  const col={dream:COLORS.accent,nightmare:COLORS.coral,glitch:COLORS.amber,moving:COLORS.moving,spring:'#ff9f43',ice:COLORS.ice}[type]||COLORS.accent;
  for (let i=0;i<6;i++) {
    particles.push({x,y,vx:(Math.random()-0.5)*4,vy:Math.random()*-3-1,life:1,col,size:2+Math.random()*3});
  }
}
function spawnGlitchParticles() {
  const count=Math.floor(18*qp().particles);
  for (let i=0;i<count;i++) {
    particles.push({x:Math.random()*W,y:player.y-cameraY+(Math.random()-0.5)*80,vx:(Math.random()-0.5)*8,vy:(Math.random()-0.5)*6,life:1,col:Math.random()<0.5?COLORS.glitch:COLORS.nightmare,size:2+Math.random()*5});
  }
}
function spawnCollectParticles(x,y,col) {
  for (let i=0;i<14;i++) {
    const angle=Math.random()*Math.PI*2;
    const speed=2+Math.random()*5;
    particles.push({x,y:y-cameraY,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:1,col,size:3+Math.random()*3});
  }
}
function updateParticles() {
  for (let i=particles.length-1;i>=0;i--) {
    const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.12; p.life-=0.035;
    if (p.life<=0) particles.splice(i,1);
  }
}
function drawParticles(camY) {
  for (const p of particles) {
    ctx.save(); ctx.globalAlpha=p.life;
    ctx.beginPath(); ctx.arc(p.x,p.y-camY,p.size,0,Math.PI*2);
    ctx.fillStyle=p.col;
    if (qp().shadows) { ctx.shadowColor=p.col; ctx.shadowBlur=6; }
    ctx.fill(); ctx.restore();
  }
}

// ── STARS ────────────────────────────────────
function initStars() {
  stars=[];
  const count=qp().stars;
  for (let i=0;i<count;i++) {
    stars.push({x:Math.random()*W,y:Math.random()*H*6-H*3,size:Math.random()*1.8+0.2,speed:Math.random()*0.3+0.05,alpha:Math.random()*0.7+0.2,flicker:Math.random()*Math.PI*2});
  }
}
function drawStars(camY) {
  const t=Date.now()/1200;
  for (const s of stars) {
    const wy=((s.y-camY*s.speed)%(H*2)+H*2)%(H*2)-H*0.5;
    const alpha=s.alpha*(0.7+Math.sin(t+s.flicker)*0.3);
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.beginPath(); ctx.arc(s.x,wy,s.size,0,Math.PI*2);
    ctx.fillStyle=s.size>1.3?'#c8b8ff':'#ffffff';
    if (qp().shadows) { ctx.shadowColor='#7f5af0'; ctx.shadowBlur=s.size>1?4:0; }
    ctx.fill(); ctx.restore();
  }
}

// ── PLATFORM & ITEM GENERATION ───────────────
function pickPlatformType() {
  const r = Math.random();
  // Glitch event override
  if (glitchActive && r < 0.25) return 'glitch';
  // dream 55% | nightmare 12% | moving 12% | spring 10% | ice 8% | glitch 3%
  if (r < 0.55) return 'dream';
  if (r < 0.67) return 'nightmare';
  if (r < 0.79) return 'moving';
  if (r < 0.89) return 'spring';
  if (r < 0.97) return 'ice';
  return 'glitch';
}
function diffFactor() { return Math.min(1, maxHeight / 800); }
function platGap()    { return 55 + Math.random()*45 + diffFactor()*20; }
function platWidth()  { return Math.max(100, PLAT_W_MIN + Math.random()*(PLAT_W_MAX-PLAT_W_MIN) - diffFactor()*30); }

let lastPlatCenterX = 0;
let zoneIndex = 0;

function safeX(w) {
  // Pure Doodle Jump style: fully random across the whole screen width
  // Only constraint: don't spawn so close to screen edge that it's cut off
  const margin = 20;
  const x = margin + Math.random() * (W - w - margin * 2);
  lastPlatCenterX = x + w / 2;
  return x;
}

function spawnCoin(x, y) {
  coins.push(new Coin(x, y));
}

let lastSpawnedPlatX = 0;
let lastSpawnedPlatY = 0;
let lastSpawnedPlatW = 0;

function spawnPlatformRow(y, type) {
  const w = platWidth();
  const x = safeX(w);

  // Check if this platform is hard to reach from the last one.
  // Hard = horizontal center distance > 300px OR vertical gap > 130px
  // In those cases, force spring so the player always has a way up.
  const horizDist = Math.abs((x + w/2) - (lastSpawnedPlatX + lastSpawnedPlatW/2));
  const vertDist  = Math.abs(y - lastSpawnedPlatY);
  if (lastSpawnedPlatY !== 0 && horizDist > 500 && vertDist > 160 && type !== 'spring') {
    type = 'spring';
  }

  lastSpawnedPlatX = x;
  lastSpawnedPlatY = y;
  lastSpawnedPlatW = w;

  platforms.push(new Platform(x, y, w, type));
  if (Math.random() < ITEM_SPAWN_CHANCE) {
    const irand = Math.random();
    const itype = irand < 0.5 ? 'star' : irand < 0.75 ? 'zap' : 'boost';
    items.push(new Item(x + w / 2, y - 38, itype));
  }
  if (Math.random() < 0.38) {
    const ccount = Math.floor(Math.random() * 3) + 1;
    for (let c = 0; c < ccount; c++) {
      spawnCoin(x + w * 0.15 + c * 24, y - 26 - Math.random() * 18);
    }
  }
}

function generatePlatforms(topY, count=80) {
  platforms = [];
  items = [];
  coins = [];
  lastPlatCenterX = W / 2;
  zoneIndex = 1;
  lastSpawnedPlatX = W / 2 - 100;
  lastSpawnedPlatY = topY;
  lastSpawnedPlatW = 210;
  // First platform: wide, centered under player spawn
  platforms.push(new Platform(W/2 - 100, topY, 210, 'dream'));
  let y = topY;
  for (let i = 0; i < count; i++) {
    y -= platGap();
    let type;
    if (i < 6) {
      const er = Math.random();
      if (er < 0.45) type = 'dream';
      else if (er < 0.65) type = 'moving';
      else if (er < 0.82) type = 'spring';
      else type = 'ice';
    } else {
      type = pickPlatformType();
    }
    spawnPlatformRow(y, type);
  }
}

function extendPlatforms() {
  const topY = Math.min(...platforms.map(p => p.y));
  let y = topY;
  while (y > cameraY - H * 2) {
    y -= platGap();
    spawnPlatformRow(y, pickPlatformType());
  }
  platforms = platforms.filter(p => p.y < cameraY + H * 1.5);
  items     = items.filter(it => it.y < cameraY + H * 1.5);
  coins     = coins.filter(co => co.y < cameraY + H * 1.5);
}

// ── COLLISION ────────────────────────────────
function checkPlatformCollisions() {
  const falling=gravityDir===1?player.vy>0:player.vy<0;
  player.onGround=false;
  player.iceSliding=false;
  if (!falling) return;
  for (const plat of platforms) {
    if (plat.alpha<=0.05) continue;
    if (plat.type==='nightmare' && plat.touched && plat.solid===false) continue;
    const py  = gravityDir===1?player.bottom:player.top;
    const ppy = gravityDir===1?player.bottom-player.vy:player.top-player.vy;
    const platTop=plat.y, platBot=plat.y+plat.h;
    const hitsV = gravityDir===1?(ppy<=platTop&&py>=platTop):(ppy>=platBot&&py<=platBot);
    if (!hitsV) continue;
    const hitsH = player.right>plat.x+4&&player.left<plat.x+plat.w-4;
    if (!hitsH) continue;
    if (gravityDir===1) player.y=platTop; else player.y=platBot+player.h;
    player.vy=0;
    player.onGround=true;
    player.groundType=plat.type;
    // Spring platform: override jump
    if (plat.type==='spring') {
      player.vy=SPRING_FORCE*gravityDir;
      plat.springAnim=1;
      spawnJumpParticles(player.x, player.y, 'spring');
      sfxSpring();
      player.onGround=false;
      break;
    }
    if (plat.type==='glitch') {
      triggerGlitch();
    }
    if (plat.type==='ice') {
      player.iceSliding=true;
      sfxIce();
    }
    if (plat.type==='nightmare'&&!plat.touched) { plat.touched=true; plat.touchTime=Date.now(); }
    // Moving platform: transfer horizontal velocity
    if (plat.type==='moving') {
      player.x += plat.moveSpeed * 0.5;
    }
    // Combo counter for consecutive fast bounces
    comboCount++;
    comboTimer=Date.now()+800;
    if (comboCount>=3) { sfxCombo(); score+=comboCount*5; }
    break;
  }
  // Reset combo if no ground for too long
  if (!player.onGround && Date.now()>comboTimer) comboCount=0;
}
function checkItemCollisions() {
  for (const it of items) {
    if (it.collected) continue;
    const px=player.x, py=player.y-player.h/2;
    if (Math.abs(px-it.x)<it.r*2&&Math.abs(py-it.y)<it.r*2) {
      it.collected=true; sfxItemGet();
      if (it.type==='star') {
        player.jump(ITEM_JUMP_FORCE, 'dream');
        spawnCollectParticles(it.x, it.y, COLORS.amber);
      } else if (it.type==='zap') {
        glitchShield=true;
        spawnCollectParticles(it.x, it.y, COLORS.accent);
      } else if (it.type==='boost') {
        speedBoostActive=true; speedBoostTimer=5000;
        spawnCollectParticles(it.x, it.y, COLORS.coral);
        sfxSpeedBoost();
      }
    }
  }
}
function checkCoinCollisions() {
  for (const co of coins) {
    if (co.collected) continue;
    const px=player.x, py=player.y-player.h/2;
    if (Math.abs(px-co.x)<co.r*2.5&&Math.abs(py-co.y)<co.r*2.5) {
      co.collected=true; sfxCoin();
      score+=15;
      spawnCollectParticles(co.x, co.y, COLORS.coin);
    }
  }
}

// ── GLITCH ───────────────────────────────────
function triggerGlitch() {
  if (glitchActive) return;
  if (glitchShield) { glitchShield=false; return; }
  glitchActive=true; sfxGlitch();
  if (Math.random()<0.5) {
    gravityDir=-gravityDir; gravityFlipped=true;
    const gi=document.getElementById('gravity-indicator');
    gi.classList.add('show');
    setTimeout(()=>{ gravityDir=1; gravityFlipped=false; gi.classList.remove('show'); }, GLITCH_DURATION);
  }
  const go=document.getElementById('glitch-overlay'), gt=document.getElementById('glitch-text');
  go.classList.add('active'); gt.classList.add('show');
  spawnGlitchParticles();
  setTimeout(()=>{ go.classList.remove('active'); gt.classList.remove('show'); glitchActive=false; }, GLITCH_DURATION);
}

// ── HUD ──────────────────────────────────────
function updateHUD() {
  const h=Math.max(0,Math.floor(-player.y/60));
  document.getElementById('hud-height').textContent=h+'m';
  document.getElementById('hud-score').textContent=score;
  document.getElementById('boss-vignette').style.opacity=boss.proximity*0.85;
  if (h>maxHeight) { maxHeight=h; score=Math.max(score, maxHeight*10); }
}

// ── COMBO DISPLAY ─────────────────────────────
function drawCombo() {
  if (comboCount < 3 || Date.now()>comboTimer) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, (comboTimer-Date.now())/400);
  ctx.font = `bold ${22+comboCount*2}px 'Orbitron', monospace`;
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.amber;
  if (qp().shadows) { ctx.shadowColor=COLORS.amber; ctx.shadowBlur=15; }
  ctx.fillText(`x${comboCount} COMBO!`, W/2, H*0.35);
  ctx.restore();
}

// ── SPEED BOOST HUD ──────────────────────────
function drawSpeedBoostHUD() {
  if (!speedBoostActive) return;
  const pct = speedBoostTimer/5000;
  const bw = 120, bh = 8;
  const bx = W/2 - bw/2, by = H - 50;
  ctx.save();
  ctx.fillStyle='rgba(0,0,0,0.5)';
  ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,4); ctx.fill();
  const grad = ctx.createLinearGradient(bx,by,bx+bw,by);
  grad.addColorStop(0,'#ff9f43'); grad.addColorStop(1,'#ff6b6b');
  ctx.fillStyle=grad;
  ctx.beginPath(); ctx.roundRect(bx,by,bw*pct,bh,4); ctx.fill();
  ctx.font='bold 10px Orbitron, monospace';
  ctx.textAlign='center'; ctx.fillStyle='#fff';
  ctx.fillText('🔥 SPEED BOOST', W/2, by-6);
  ctx.restore();
}

// ── BACKGROUND ───────────────────────────────
function drawBG() {
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#060210'); g.addColorStop(1,'#0f071e');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  if (!qp().nebula) return;
  const t=Date.now()/8000;
  const blobs=[
    {x:W*0.2,y:H*0.3,r:120,col:'rgba(127,90,240,0.06)'},
    {x:W*0.8,y:H*0.6,r:100,col:'rgba(44,182,125,0.05)'},
    {x:W*0.5,y:H*0.8,r:90,col:'rgba(255,107,107,0.04)'},
  ];
  for (const b of blobs) {
    const bx=b.x+Math.sin(t+b.x)*20;
    const by=(b.y-cameraY*0.04)%H;
    const bg=ctx.createRadialGradient(bx,by,0,bx,by,b.r);
    bg.addColorStop(0,b.col); bg.addColorStop(1,'transparent');
    ctx.beginPath(); ctx.ellipse(bx,by,b.r,b.r*0.6,t*0.3,0,Math.PI*2);
    ctx.fillStyle=bg; ctx.fill();
  }
}

// ── GAME INIT ────────────────────────────────
function initGame() {
  W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight;
  cameraY=0; score=0; maxHeight=0; emotion=0.5;
  gravityDir=1; gravityFlipped=false;
  glitchActive=false; glitchShield=false;
  particles=[]; comboCount=0; comboTimer=0;
  speedBoostActive=false; speedBoostTimer=0;
  const startPlatY = H*0.65;
  player=new Player(W/2, startPlatY);
  player.onGround=true; player.groundType='dream';
  boss=new Boss();
  generatePlatforms(startPlatY, 45);
  initStars();
  document.getElementById('gravity-indicator').classList.remove('show');
  document.getElementById('glitch-overlay').classList.remove('active');
  document.getElementById('glitch-text').classList.remove('show');
  document.getElementById('boss-vignette').style.opacity=0;
}

// ── GAME LOOP (delta-time capped for FPS stability) ─────
let lastTime = 0;
function gameLoop(timestamp) {
  if (gameState!=='playing') return;

  // FPS-independent update: cap delta to prevent spiral of death
  const raw = timestamp - lastTime;
  lastTime = timestamp;
  const dt = Math.min(raw, 32); // cap at ~31fps minimum equivalent

  // Track FPS
  frameCount++;
  fpsTimer += dt;
  if (fpsTimer >= 1000) {
    fps = frameCount;
    frameCount = 0;
    fpsTimer = 0;
    // Auto-downgrade quality on sustained low FPS
    if (fps < 30 && settings.quality === 'high') {
      settings.quality = 'medium';
    } else if (fps < 20 && settings.quality === 'medium') {
      settings.quality = 'low';
    }
  }

  if (canvas.width!==window.innerWidth||canvas.height!==window.innerHeight) {
    W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight;
  }
  ctx.clearRect(0,0,W,H);
  player.update();
  checkPlatformCollisions();
  checkItemCollisions();
  checkCoinCollisions();
  const targetCamY=player.y-H*0.45;
  cameraY+=(targetCamY-cameraY)*0.1;
  extendPlatforms();
  boss.update();
  if (boss.isCaught()) { endGame(); return; }
  if (player.y-cameraY>H+60) { endGame(); return; }
  updateParticles();
  drawBG(); drawStars(cameraY);
  for (const p of platforms) { p.update(); p.draw(ctx,cameraY); }
  for (const it of items) { it.update(); it.draw(ctx,cameraY); }
  for (const co of coins) { co.update(); co.draw(ctx,cameraY); }
  drawParticles(cameraY);
  player.draw(cameraY);
  boss.draw();
  drawCombo();
  drawSpeedBoostHUD();
  updateHUD();
  raf=requestAnimationFrame(gameLoop);
}

// ── COUNTDOWN ────────────────────────────────
function startCountdown(callback) {
  const overlay=document.getElementById('countdown-overlay');
  const numEl=document.getElementById('countdown-num');
  overlay.classList.add('active');
  countdownValue=3;
  function tick() {
    if (countdownValue>0) {
      numEl.textContent=countdownValue;
      sfxCountdown();
    } else {
      numEl.textContent='GO!';
      sfxGo();
    }
    numEl.className='countdown-num';
    void numEl.offsetWidth;
    numEl.className='countdown-num pop';
    if (countdownValue>0) {
      countdownValue--;
      countdownRAF=setTimeout(tick, 950);
    } else {
      countdownRAF=setTimeout(()=>{
        overlay.classList.remove('active');
        callback();
      }, 750);
    }
  }
  tick();
}

// ── GAME OVER ────────────────────────────────
function endGame() {
  gameState='dead';
  cancelAnimationFrame(raf);
  if (maxHeight>bestScore) { bestScore=maxHeight; localStorage.setItem('dj_best',bestScore); }
  document.getElementById('go-height').textContent=maxHeight+'m';
  document.getElementById('go-score').textContent=score;
  document.getElementById('go-best').textContent=bestScore+'m';
  drawAntLogo(document.getElementById('go-canvas'),160);
  showScreen('gameover-screen');
  startTitleBG('go-bg-canvas');
}

// ── PAUSE ────────────────────────────────────
function pauseGame() {
  if (gameState!=='playing') return;
  gameState='paused'; cancelAnimationFrame(raf);
  document.getElementById('pause-overlay').classList.add('active');
}
function resumeGame() {
  if (gameState!=='paused') return;
  document.getElementById('pause-overlay').classList.remove('active');
  gameState='playing';
  lastTime = performance.now();
  raf=requestAnimationFrame(gameLoop);
}

// ── SCREEN MANAGEMENT ────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function startGame() {
  stopTitleBG('title-bg-canvas'); stopTitleBG('how-bg-canvas'); stopTitleBG('go-bg-canvas');
  showScreen('game-screen');
  initGame();
  startCountdown(()=>{
    gameState='playing';
    lastTime = performance.now();
    raf=requestAnimationFrame(gameLoop);
  });
}

// ── INPUT ─────────────────────────────────────
function isKeyDown(action) {
  return settings.keys[action].some(k=>keys[k.toLowerCase()]);
}
document.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  keys[k]=true;
  if (e.key===' ') e.preventDefault();
  if (k==='escape'||k==='p') { if (gameState==='playing') pauseGame(); else if (gameState==='paused') resumeGame(); }
});
document.addEventListener('keyup',e=>{ keys[e.key.toLowerCase()]=false; });

// ── SETTINGS UI ──────────────────────────────
function applySettingsToUI() {
  document.getElementById('sfx-toggle').checked    = settings.sfx;
  document.getElementById('volume-slider').value   = Math.round(settings.volume*100);
  document.getElementById('volume-val').textContent= Math.round(settings.volume*100)+'%';
  document.getElementById('kb-left').textContent   = settings.keys.left.map(k=>k==='ArrowLeft'?'←':k==='ArrowRight'?'→':k.toUpperCase()).join(' / ');
  document.getElementById('kb-right').textContent  = settings.keys.right.map(k=>k==='ArrowLeft'?'←':k==='ArrowRight'?'→':k.toUpperCase()).join(' / ');
  const dl=document.getElementById('display-left'), dr=document.getElementById('display-right');
  if (dl) dl.textContent=document.getElementById('kb-left').textContent;
  if (dr) dr.textContent=document.getElementById('kb-right').textContent;
}

let listeningFor=null;
function setupSettingsUI() {
  document.getElementById('sfx-toggle').addEventListener('change',e=>{settings.sfx=e.target.checked;saveSettings();});
  document.getElementById('volume-slider').addEventListener('input',e=>{
    settings.volume=parseInt(e.target.value)/100;
    document.getElementById('volume-val').textContent=e.target.value+'%';
    saveSettings();
  });
  document.querySelectorAll('.keybind-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      if (listeningFor) { document.getElementById(listeningFor==='left'?'kb-left':'kb-right').classList.remove('listening'); }
      listeningFor=btn.dataset.action;
      btn.classList.add('listening');
      document.getElementById('keybind-hint').textContent='Press any key for '+listeningFor+' movement...';
    });
  });
  document.addEventListener('keydown',e=>{
    if (!listeningFor) return;
    e.preventDefault();
    const k=e.key;
    if (['Escape','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'].includes(k)) return;
    settings.keys[listeningFor]=[k];
    saveSettings(); applySettingsToUI();
    document.getElementById(listeningFor==='left'?'kb-left':'kb-right').classList.remove('listening');
    document.getElementById('keybind-hint').textContent='Saved! '+k+' set for '+listeningFor;
    setTimeout(()=>document.getElementById('keybind-hint').textContent='',2000);
    listeningFor=null;
  },true);
  document.getElementById('btn-settings-reset').addEventListener('click',resetSettings);
}

// ── INIT ──────────────────────────────────────
window.addEventListener('DOMContentLoaded',()=>{
  loadSettings();
  canvas=document.getElementById('game-canvas');
  ctx=canvas.getContext('2d');
  W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight;

  drawAntLogo(document.getElementById('logo-canvas'),180);
  document.getElementById('title-best').textContent=bestScore;

  startTitleBG('title-bg-canvas');

  document.getElementById('btn-play').addEventListener('click',startGame);
  document.getElementById('btn-how').addEventListener('click',()=>{ showScreen('how-screen'); startTitleBG('how-bg-canvas'); });
  document.getElementById('btn-back').addEventListener('click',()=>{ stopTitleBG('how-bg-canvas'); showScreen('title-screen'); });
  document.getElementById('btn-settings-title').addEventListener('click',()=>{ settingsCallerScreen='title-screen'; showScreen('settings-screen'); startTitleBG('settings-bg-canvas'); });
  document.getElementById('btn-pause').addEventListener('click',pauseGame);
  document.getElementById('btn-resume').addEventListener('click',resumeGame);
  document.getElementById('btn-pause-menu').addEventListener('click',()=>{
    cancelAnimationFrame(raf); gameState='title';
    document.getElementById('pause-overlay').classList.remove('active');
    document.getElementById('title-best').textContent=bestScore;
    showScreen('title-screen'); startTitleBG('title-bg-canvas');
  });
  document.getElementById('btn-pause-settings').addEventListener('click',()=>{
    document.getElementById('pause-overlay').classList.remove('active');
    settingsCallerScreen='pause'; showScreen('settings-screen'); startTitleBG('settings-bg-canvas');
  });
  document.getElementById('btn-settings-back').addEventListener('click',()=>{
    stopTitleBG('settings-bg-canvas');
    if (settingsCallerScreen==='pause') {
      showScreen('game-screen');
      document.getElementById('pause-overlay').classList.add('active');
    } else {
      showScreen(settingsCallerScreen); startTitleBG('title-bg-canvas');
    }
  });
  document.getElementById('btn-retry').addEventListener('click',()=>{ stopTitleBG('go-bg-canvas'); startGame(); });
  document.getElementById('btn-menu').addEventListener('click',()=>{
    stopTitleBG('go-bg-canvas'); gameState='title';
    document.getElementById('title-best').textContent=bestScore;
    showScreen('title-screen'); startTitleBG('title-bg-canvas');
  });

  setupSettingsUI();
  applySettingsToUI();

  window.addEventListener('resize',()=>{
    W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight;
    ['title-bg-canvas','how-bg-canvas','settings-bg-canvas','go-bg-canvas'].forEach(id=>{
      const c=document.getElementById(id);
      if (c) { c.width=window.innerWidth; c.height=window.innerHeight; }
    });
  });

  showScreen('title-screen');
});