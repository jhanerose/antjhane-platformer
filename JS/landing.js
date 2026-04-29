// ══ STARFIELD ══
const SC = document.getElementById('star-canvas');
const SX = SC.getContext('2d');
let STARS = [];

function resizeSC() {
  SC.width  = window.innerWidth;
  SC.height = window.innerHeight;
}

function makeStars() {
  STARS = [];
  const n = Math.floor((SC.width * SC.height) / 7500);
  for (let i = 0; i < n; i++) {
    STARS.push({
      x: Math.random() * SC.width, y: Math.random() * SC.height,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random() * 0.65 + 0.15,
      spd: Math.random() * 0.45 + 0.06,
      ph: Math.random() * Math.PI * 2
    });
  }
}

function drawStarFrame(ts) {
  SX.clearRect(0, 0, SC.width, SC.height);
  const t = ts / 1000;
  for (const s of STARS) {
    const a = s.a * (0.55 + 0.45 * Math.sin(t * s.spd + s.ph));
    SX.beginPath();
    SX.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    SX.fillStyle = `rgba(232,224,245,${a.toFixed(2)})`;
    SX.fill();
  }
  requestAnimationFrame(drawStarFrame);
}

window.addEventListener('resize', () => { resizeSC(); makeStars(); });
resizeSC(); makeStars();
requestAnimationFrame(drawStarFrame);

// ══ HERO BEST SCORE ══
const storedBest = parseInt(localStorage.getItem('dj_best') || '0');
if (storedBest > 0) document.getElementById('hero-best').textContent = storedBest;

// ══ ANT DRAWING ══
function drawAnt(canvas, size) {
  const c = canvas.getContext('2d');
  const s = size / 130;
  c.clearRect(0, 0, size, size);
  c.save();
  c.translate(size / 2, size / 2 + size * 0.08);
  c.scale(s, s);

  const t = Date.now() / 380;
  const leg = Math.sin(t) * 0.45;

  // Body
  c.beginPath(); c.ellipse(0, 14, 14, 18, 0, 0, Math.PI*2);
  c.fillStyle = '#d0c4f0'; c.fill();
  c.strokeStyle = '#9880d0'; c.lineWidth = 1.2; c.stroke();
  // Ribs
  c.strokeStyle = 'rgba(100,80,200,0.3)'; c.lineWidth = 1;
  [-2,6,12].forEach(y => { c.beginPath(); c.moveTo(-11,y); c.lineTo(11,y); c.stroke(); });

  // Torso
  c.beginPath(); c.ellipse(0, -5, 9, 8, 0, 0, Math.PI*2);
  c.fillStyle = '#baaee0'; c.fill();
  c.strokeStyle = '#9080c0'; c.lineWidth = 1; c.stroke();

  // Helmet
  c.beginPath(); c.arc(0, -20, 14, 0, Math.PI*2);
  c.fillStyle = '#ede8ff'; c.fill();
  c.strokeStyle = '#a090d0'; c.lineWidth = 1.5; c.stroke();

  // Visor stripe
  c.beginPath(); c.arc(0,-20,14,Math.PI*0.85,Math.PI*2.15);
  c.strokeStyle = '#7f5af0'; c.lineWidth = 2; c.stroke();

  // Dark visor
  c.beginPath(); c.ellipse(2,-20,10,10,0,0,Math.PI*2);
  c.fillStyle = '#160a28'; c.fill();
  c.strokeStyle = '#7f5af0'; c.lineWidth = 1.2; c.stroke();

  // Highlights
  c.beginPath(); c.ellipse(-2,-24,3.5,2.5,-0.4,0,Math.PI*2);
  c.fillStyle = 'rgba(255,255,255,0.38)'; c.fill();
  c.beginPath(); c.ellipse(4,-22,1.5,1,0.2,0,Math.PI*2);
  c.fillStyle = 'rgba(255,255,255,0.22)'; c.fill();

  // Antennae
  c.lineWidth = 1.5; c.lineCap = 'round';
  const a1x = -14+Math.sin(t*0.5)*3, a1y = -38+Math.cos(t*0.4)*2;
  const a2x =  14+Math.sin(t*0.5+1)*3, a2y = -38+Math.cos(t*0.4+0.8)*2;
  c.strokeStyle = '#8070b8';
  c.beginPath(); c.moveTo(-6,-30); c.quadraticCurveTo(-12,-36,a1x,a1y); c.stroke();
  c.beginPath(); c.moveTo(6,-30);  c.quadraticCurveTo(12,-36,a2x,a2y);  c.stroke();
  c.beginPath(); c.arc(a1x,a1y,2.5,0,Math.PI*2); c.fillStyle='#7f5af0'; c.fill();
  c.beginPath(); c.arc(a2x,a2y,2.5,0,Math.PI*2); c.fillStyle='#2cb67d'; c.fill();

  // Legs
  c.strokeStyle = '#7060a8'; c.lineWidth = 2; c.lineCap = 'round';
  [[-11,6,-22,20,0],[-10,-3,-21,10,1],[-9,-10,-20,-2,2],
   [11,6,22,20,0],[10,-3,21,10,1],[9,-10,20,-2,2]].forEach(([sx,sy,ex,ey,ph]) => {
    const sw = Math.sin(leg+ph)*6;
    const kx = sx+(ex-sx)*0.5, ky = sy+(ey-sy)*0.4+sw*0.5;
    c.beginPath(); c.moveTo(sx,sy); c.quadraticCurveTo(kx+sw*0.3,ky,ex+sw,ey+Math.cos(leg+ph)*3); c.stroke();
    c.beginPath(); c.arc(ex+sw,ey+Math.cos(leg+ph)*3,1.5,0,Math.PI*2);
    c.fillStyle='#9080c8'; c.fill();
  });

  c.restore();
}

const heroAntCanvas = document.getElementById('hero-ant');
function animAnt() { drawAnt(heroAntCanvas, 150); requestAnimationFrame(animAnt); }
animAnt();

// ══ PLATFORM PREVIEW CANVAS ══
const PC = document.getElementById('plat-canvas');
const PX = PC.getContext('2d');
const PW = 320, PH = 490;

const PLATS = [
  { name:'DREAM',     col:'#7f5af0', glow:'rgba(127,90,240,0.55)', y: 55,  w:130 },
  { name:'NIGHTMARE', col:'#ff6b6b', glow:'rgba(255,107,107,0.55)',y:130, w:118 },
  { name:'GLITCH',    col:'#ffd166', glow:'rgba(255,209,102,0.45)',y:205, w:135 },
  { name:'MOVING',    col:'#00d4ff', glow:'rgba(0,212,255,0.45)',  y:280, w:120 },
  { name:'SPRING',    col:'#ff9f43', glow:'rgba(255,159,67,0.45)', y:355, w:112 },
  { name:'ICE',       col:'#a8edea', glow:'rgba(168,237,234,0.38)',y:420, w:128 },
];

function drawPlatCanvas() {
  PX.clearRect(0, 0, PW, PH);

  // BG
  PX.fillStyle = '#0a0614';
  PX.fillRect(0, 0, PW, PH);

  // mini stars
  const t = Date.now() / 1000;
  for (let i = 0; i < 55; i++) {
    const sx = ((i * 53.3 + 7) % PW);
    const sy = ((i * 79.7 + 11) % PH);
    const a  = 0.15 + 0.3 * Math.sin(t * 0.7 + i * 0.4);
    PX.beginPath(); PX.arc(sx, sy, 0.7, 0, Math.PI*2);
    PX.fillStyle = `rgba(232,224,245,${a.toFixed(2)})`; PX.fill();
  }

  const movOff = Math.sin(t) * 38;

  PLATS.forEach((p, i) => {
    let cx = PW / 2 - p.w / 2;
    if (p.name === 'MOVING') cx += movOff;

    // glow under
    const g = PX.createLinearGradient(cx, p.y, cx + p.w, p.y);
    g.addColorStop(0, 'transparent'); g.addColorStop(0.5, p.glow); g.addColorStop(1, 'transparent');
    PX.fillStyle = g; PX.fillRect(cx, p.y + 14, p.w, 10);

    // platform bar
    PX.beginPath(); PX.roundRect(cx, p.y, p.w, 14, 5);

    if (p.name === 'ICE') {
      const ig = PX.createLinearGradient(cx, p.y, cx + p.w, p.y + 14);
      ig.addColorStop(0, '#d0f8f6'); ig.addColorStop(1, '#7fd8d5');
      PX.fillStyle = ig;
    } else if (p.name === 'GLITCH') {
      PX.fillStyle = Math.sin(t * 9 + i) > 0.25 ? p.col : '#997700';
    } else {
      PX.fillStyle = p.col;
    }
    PX.fill();
    PX.strokeStyle = 'rgba(255,255,255,0.12)'; PX.lineWidth = 1; PX.stroke();

    // Spring bouncer
    if (p.name === 'SPRING') {
      const bx = cx + p.w / 2;
      PX.fillStyle = '#ffe0b0'; PX.fillRect(bx - 9, p.y - 11, 18, 12);
      PX.fillStyle = '#ff9f43'; PX.fillRect(bx - 6, p.y - 7, 12, 6);
    }

    // Nightmare crumble hint (right edge fades)
    if (p.name === 'NIGHTMARE') {
      const na = (Math.sin(t * 1.5) * 0.5 + 0.5) * 0.4 + 0.05;
      PX.beginPath(); PX.roundRect(cx + p.w - 32, p.y, 30, 14, [0,5,5,0]);
      PX.fillStyle = `rgba(10,6,20,${na})`; PX.fill();
    }

    // Ice shine
    if (p.name === 'ICE') {
      PX.beginPath(); PX.roundRect(cx + 6, p.y + 2, p.w - 12, 4, 3);
      PX.fillStyle = 'rgba(255,255,255,0.28)'; PX.fill();
    }

    // label
    PX.fillStyle = p.col;
    PX.font = 'bold 8.5px "Orbitron", monospace';
    PX.fillText(p.name, cx + 6, p.y + 30);
  });

  // Ant icon at top
  PX.fillStyle = 'rgba(127,90,240,0.5)';
  PX.beginPath(); PX.arc(PW/2, 25, 8, 0, Math.PI*2); PX.fill();
  PX.fillStyle = 'rgba(232,224,245,0.9)';
  PX.font = '11px serif'; PX.textAlign = 'center'; PX.fillText('🐜', PW/2, 30);
  PX.textAlign = 'left';

  requestAnimationFrame(drawPlatCanvas);
}
drawPlatCanvas();

// ══ NAV HAMBURGER ══
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('nav-links').classList.toggle('open');
});
document.querySelectorAll('#nav-links a').forEach(a => {
  a.addEventListener('click', () => document.getElementById('nav-links').classList.remove('open'));
});

// ══ SCROLL REVEAL ══
const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
}, { threshold: 0.1 });
reveals.forEach(el => obs.observe(el));
