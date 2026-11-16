/**
 * identity-reveal.js — Phase 2 standalone hero prototype
 *
 * 3–4s cinematic opening:
 *   1. Darkness → small geometric signal
 *   2. Signal expands into original character silhouette
 *   3. Lime particles enter from edges, form organic geometric halo
 *   4. Particles frame kinetic typography: GODWIN OTIENO ODHIAMBO
 *   5. Settle into homepage; navigation becomes interactive
 *
 * Layering contract: GSAP owns this cinematic timeline. The particle canvas
 * renders via rAF; GSAP only drives phase transitions (not per-frame values).
 * Under reduced motion the overlay never appears.
 */

import gsap from 'gsap';
import { isReducedMotion } from './motion-core.js';
import { particleDissolve, MOTION } from './motion-system.js';

const STORAGE_KEY = 'gasewe:reveal-seen';
const SEEN_SHORT_DURATION = 0.9; // returning visitor: abbreviated sequence
const reduced = isReducedMotion();

/* ── particle system (2D canvas) ───────────────────────────────────────── */

let canvas = null;
let ctx = null;
let width = 0;
let height = 0;
let particles = [];
let mouse = { x: -1000, y: -1000 };
let phase = 'idle'; // 'form' | 'halo' | 'idle' | 'disperse'
let rafId = null;
let painted = false;

const PARTICLE_COUNT = {
  desktop: 120,
  mobile: 50,
};

function particleCount() {
  return width < 720 ? PARTICLE_COUNT.mobile : PARTICLE_COUNT.desktop;
}

function randomEdge() {
  const side = Math.floor(Math.random() * 4);
  const r = Math.random();
  switch (side) {
    case 0: return { x: -10, y: r * height }; // left
    case 1: return { x: width + 10, y: r * height }; // right
    case 2: return { x: r * width, y: -10 }; // top
    default: return { x: r * width, y: height + 10 }; // bottom
  }
}

function createParticle(targetX, targetY) {
  const start = randomEdge();
  const speed = 0.15 + Math.random() * 0.15;
  const angle = Math.atan2(targetY - start.y, targetX - start.x);
  return {
    x: start.x,
    y: start.y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    targetX,
    targetY,
    size: 0.8 + Math.random() * 1.2,
    opacity: 0,
    angle: Math.random() * Math.PI * 2,
    orbitSpeed: 0.005 + Math.random() * 0.015,
    orbitRadius: 0,
  };
}

function initParticles() {
  canvas = document.querySelector('[data-reveal-particles]');
  if (!canvas) return;
  ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  resize();
}

function resize() {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  width = canvas.clientWidth || window.innerWidth;
  height = canvas.clientHeight || window.innerHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  spawnParticles();
}

function spawnParticles() {
  const count = particleCount();
  particles = [];
  const cx = width / 2;
  const cy = height / 2;

  if (phase === 'form') {
    // expand outward from center in a growing circle
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const r = 10 + (i / count) * 200;
      particles.push(createParticle(cx + Math.cos(t) * r, cy + Math.sin(t) * r));
    }
  } else if (phase === 'halo') {
    // halo ring around center, tighter
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const r = 90 + Math.sin(i * 0.7) * 25; // organic wobble
      particles.push(createParticle(cx + Math.cos(t) * r, cy + Math.sin(t) * r));
    }
  } else {
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(width / 2, height / 2));
    }
  }
  particles.forEach((p) => { p.opacity = 0; });
}

function updateParticles() {
  const cx = width / 2;
  const cy = height / 2;

  particles.forEach((p) => {
    // mouse repulsion
    const dx = mouse.x - p.x;
    const dy = mouse.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120 && dist > 0) {
      const force = (120 - dist) / 120;
      p.vx -= (dx / dist) * force * 0.04;
      p.vy -= (dy / dist) * force * 0.04;
    }

    // phase behaviour
    if (phase === 'form') {
      p.vx += (p.targetX - p.x) * 0.025;
      p.vy += (p.targetY - p.y) * 0.025;
    } else if (phase === 'halo') {
      p.orbitRadius = 90 + Math.sin(Date.now() * 0.001 + p.angle) * 15;
      const tx = cx + Math.cos(p.angle) * p.orbitRadius;
      const ty = cy + Math.sin(p.angle) * p.orbitRadius;
      p.vx += (tx - p.x) * 0.02;
      p.vy += (ty - p.y) * 0.02;
      p.angle += p.orbitSpeed;
    } else if (phase === 'disperse') {
      p.vx *= 1.05;
      p.vy *= 1.05;
      p.opacity *= 0.96;
    }

    p.vx *= 0.92;
    p.vy *= 0.92;
    p.x += p.vx;
    p.y += p.vy;

    // fade in during form/halo
    if (phase === 'form' || phase === 'halo') {
      p.opacity = Math.min(p.opacity + 0.02, 0.7);
    }
  });
}

function drawParticles() {
  if (!ctx || !painted) return;
  ctx.clearRect(0, 0, width, height);

  particles.forEach((p) => {
    if (p.opacity <= 0.02) return;
    ctx.fillStyle = `rgba(182, 255, 59, ${p.opacity.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function frame() {
  rafId = requestAnimationFrame(frame);
  updateParticles();
  drawParticles();
  painted = true;
}

function startParticles() {
  if (!rafId) rafId = requestAnimationFrame(frame);
}

function stopParticles() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
}

/* ── reveal sequence ──────────────────────────────────────────────────── */

function splitChars(el) {
  if (!el) return [];
  const text = el.textContent.trim();
  el.innerHTML = '';
  const chars = [];
  [...text].forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'reveal-name-char';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    el.appendChild(span);
    chars.push(span);
  });
  return chars;
}

function setupMarkup() {
  const nameEl = document.querySelector('[data-reveal-name]');
  if (nameEl && !nameEl.querySelector('.reveal-name-char')) {
    splitChars(nameEl);
  }
}

function playSequence(short) {
  const overlay = document.querySelector('.hero-reveal');
  const signal = overlay.querySelector('[data-reveal-signal]');
  const character = overlay.querySelector('[data-reveal-character]');
  const nameChars = document.querySelectorAll('.reveal-name-char');
  const positioning = overlay.querySelector('[data-reveal-positioning]');
  const supporting = overlay.querySelector('[data-reveal-supporting]');
  const particlesCanvas = overlay.querySelector('[data-reveal-particles]');

  const dur = short ? SEEN_SHORT_DURATION : null;
  const tl = gsap.timeline({ onComplete: finishReveal });

  // 1 — signal ignites
  tl.to(signal, {
    opacity: 1,
    scale: 1,
    duration: short ? 0.15 : 0.4,
    ease: 'easeOut',
  });

  // 2 — signal expands into character silhouette
  tl.to(signal, {
    opacity: 0,
    scale: 0,
    duration: short ? 0.15 : 0.3,
    ease: 'easeOut',
  })
    .to(character, {
      opacity: 1,
      scale: 1,
      duration: short ? 0.2 : 0.5,
      ease: 'easeOut',
    }, '-=0.15');

  // 3 — particles form ring → halo
  tl.call(() => {
    phase = 'form';
    startParticles();
    particlesCanvas.style.opacity = '1';
  }, '-=0.2')
    .to({}, { duration: short ? 0.2 : 0.6 })
    .call(() => {
      phase = 'halo';
      spawnParticles();
    });

  // 4 — kinetic typography reveal (character by character)
  tl.to(nameChars, {
    opacity: 1,
    y: 0,
    duration: short ? 0.25 : 0.6,
    stagger: short ? 0.015 : 0.035,
    ease: 'easeOut',
  }, '-=0.3')
    .to(positioning, {
      opacity: 1,
      y: 0,
      duration: short ? 0.2 : 0.4,
      ease: 'easeOut',
    }, '-=0.4')
    .to(supporting, {
      opacity: 1,
      y: 0,
      duration: short ? 0.2 : 0.4,
      ease: 'easeOut',
    }, '-=0.35');

  // 5 — hold, then fade out
  tl.to({}, { duration: short ? 0.3 : 0.8 })
    .call(() => {
      phase = 'idle';
    })
    .to(overlay, {
      opacity: 0,
      duration: short ? 0.3 : 0.6,
      ease: 'easeOut',
      onComplete: finishReveal,
    });

  return tl;
}

function finishReveal() {
  stopParticles();
  const overlay = document.querySelector('.hero-reveal');
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  if (reduced) {
    overlay?.remove();
    localStorage.setItem(STORAGE_KEY, '1');
    document.body.style.overflow = '';
    return;
  }

  // Particle dissolve hand-off: reveal center → homepage fully visible
  particleDissolve({
    target: overlay,
    centerX: cx,
    centerY: cy,
    count: 22,
    duration: MOTION.durParticle,
    onComplete: () => {
      overlay.remove();
      localStorage.setItem(STORAGE_KEY, '1');
      document.body.style.overflow = '';
    },
  });
}

function skipReveal() {
  const overlay = document.querySelector('.hero-reveal');
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  if (reduced) {
    overlay?.remove();
    localStorage.setItem(STORAGE_KEY, '1');
    document.body.style.overflow = '';
    return;
  }

  const tl = gsap.timeline({ onComplete: skipRevealDone });
  tl.to('.hero-reveal', { opacity: 0, duration: 0.35, ease: 'easeOut' });

  function skipRevealDone() {
    particleDissolve({
      target: overlay,
      centerX: cx,
      centerY: cy,
      count: 16,
      duration: MOTION.durParticle * 0.7,
      onComplete: () => {
        overlay.remove();
        localStorage.setItem(STORAGE_KEY, '1');
        document.body.style.overflow = '';
      },
    });
  }
}

/* ── public API ───────────────────────────────────────────────────────── */

export function initIdentityReveal() {
  if (isReducedMotion()) {
    const overlay = document.querySelector('.hero-reveal');
    if (overlay) overlay.remove();
    return Promise.resolve();
  }

  const overlay = document.querySelector('.hero-reveal');
  if (!overlay) return Promise.resolve();

  setupMarkup();
  initParticles();

  // Returning visitor: abbreviated sequence
  const seen = localStorage.getItem(STORAGE_KEY);
  const short = seen === '1';

  // Prevent body scroll during reveal
  document.body.style.overflow = 'hidden';

  const skipBtn = overlay.querySelector('[data-reveal-skip]');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      skipBtn.removeEventListener('click', skipReveal);
      skipReveal();
    });
  }

  playSequence(short);
  return new Promise((resolve) => {
    gsap.delayedCall(short ? 1.5 : 5, resolve);
  });
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
