/**
 * starlight.js — Rolls-Royce Starlight Headliner & Celestial Constellation Canvas
 *
 * Implements:
 *   1. Fiber-optic pinpoint stars with delicate sine-wave twinkle (3D depth)
 *   2. Occasional shooting stars (delicate high-speed streaks with fading tails)
 *   3. Interactive constellation filaments reacting to cursor within attraction radius
 *   4. Smooth 3D camera pan & tilt triggered by slide transitions
 *   5. Full prefers-reduced-motion support and idle GPU protection
 */

import { isReducedMotion } from './motion-core.js';

let canvas = null;
let ctx = null;
let width = 0;
let height = 0;
let dpr = 1;
let rafId = null;
let isVisible = true;

// Camera state for 3D perspective shifts between slides
const camera = {
  x: 0,
  y: 0,
  z: 0,
  rotX: 0,
  rotY: 0,
  targetX: 0,
  targetY: 0,
  targetZ: 0,
  targetRotX: 0,
  targetRotY: 0,
};

// Slide-specific camera targets (0 to 4)
const SLIDE_CAMERA_TARGETS = [
  { x: 0, y: 0, z: 0, rotX: 0, rotY: 0 },            // Slide 1: Hero center
  { x: 120, y: -60, z: -80, rotX: 0.05, rotY: -0.06 }, // Slide 2: Identity & Systems
  { x: -140, y: 80, z: -50, rotX: -0.04, rotY: 0.08 }, // Slide 3: Featured Work
  { x: 90, y: 120, z: -100, rotX: 0.06, rotY: 0.04 },  // Slide 4: Experience
  { x: 0, y: -100, z: -40, rotX: -0.05, rotY: 0 },     // Slide 5: Contact
];

const mouse = {
  x: -9999,
  y: -9999,
  targetX: -9999,
  targetY: -9999,
  active: false,
};

let stars = [];
let shootingStars = [];
let nextShootingStarTime = 0;
let currentSlide = 0;

function createStars(count) {
  const result = [];
  for (let i = 0; i < count; i++) {
    // Distribute in a spherical / cylindrical 3D space
    const radius = 200 + Math.random() * 1400;
    const theta = Math.random() * Math.PI * 2;
    const ySpread = (Math.random() - 0.5) * 1600;

    result.push({
      x: Math.cos(theta) * radius,
      y: ySpread,
      z: 100 + Math.random() * 1200,
      baseSize: 0.6 + Math.random() * 1.6,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.02 + Math.random() * 0.05,
      baseAlpha: 0.25 + Math.random() * 0.7,
      color: Math.random() > 0.85 ? 'cyan' : 'white',
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
    });
  }
  return result;
}

function spawnShootingStar() {
  const startX = (Math.random() * 0.8 + 0.1) * width;
  const startY = Math.random() * (height * 0.4);
  const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3; // ~45 deg downward
  const speed = 14 + Math.random() * 10;
  const length = 120 + Math.random() * 100;

  shootingStars.push({
    x: startX,
    y: startY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    length,
    alpha: 0.9,
    decay: 0.018 + Math.random() * 0.012,
  });
}

function resize() {
  if (!canvas) return;
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function render() {
  if (!ctx || !isVisible) {
    rafId = requestAnimationFrame(render);
    return;
  }

  const reduced = isReducedMotion();

  // Clear canvas to transparent (underlying body is #000000 velvet black)
  ctx.clearRect(0, 0, width, height);

  // Smooth camera interpolation
  const camEase = 0.04;
  camera.x += (camera.targetX - camera.x) * camEase;
  camera.y += (camera.targetY - camera.y) * camEase;
  camera.z += (camera.targetZ - camera.z) * camEase;
  camera.rotX += (camera.targetRotX - camera.rotX) * camEase;
  camera.rotY += (camera.targetRotY - camera.rotY) * camEase;

  // Smooth mouse interpolation
  if (mouse.active) {
    mouse.x += (mouse.targetX - mouse.x) * 0.1;
    mouse.y += (mouse.targetY - mouse.y) * 0.1;
  }

  const cx = width * 0.5;
  const cy = height * 0.5;
  const fov = 750;

  // Project 3D stars to screen coordinates
  const projectedStars = [];

  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];

    if (!reduced) {
      s.twinklePhase += s.twinkleSpeed;
      s.x += s.vx;
      s.y += s.vy;
    }

    // Camera offset
    const relX = s.x - camera.x;
    const relY = s.y - camera.y;
    const relZ = s.z - camera.z;

    if (relZ <= 10) continue; // behind camera

    // Apply slight camera tilt
    const cosY = Math.cos(camera.rotY);
    const sinY = Math.sin(camera.rotY);
    const rotX = relX * cosY - relZ * sinY;
    const rotZ = relX * sinY + relZ * cosY;

    if (rotZ <= 10) continue;

    const scale = fov / (fov + rotZ);
    let screenX = cx + rotX * scale;
    let screenY = cy + relY * scale;

    // Interactive cursor gravitational attraction (soft, elegant)
    if (mouse.active && !reduced) {
      const dx = mouse.x - screenX;
      const dy = mouse.y - screenY;
      const dist = Math.hypot(dx, dy);
      if (dist < 180 && dist > 1) {
        const force = (1 - dist / 180) * 14;
        screenX += (dx / dist) * force;
        screenY += (dy / dist) * force;
      }
    }

    // Skip if off-screen
    if (screenX < -20 || screenX > width + 20 || screenY < -20 || screenY > height + 20) {
      continue;
    }

    // Twinkle modulation
    const twinkle = reduced ? 1 : 0.7 + 0.3 * Math.sin(s.twinklePhase);
    const alpha = Math.min(Math.max(s.baseAlpha * twinkle * scale * 1.5, 0.05), 0.95);
    const size = Math.max(s.baseSize * scale * 1.3, 0.5);

    projectedStars.push({
      x: screenX,
      y: screenY,
      size,
      alpha,
      color: s.color,
    });
  }

  // Draw delicate constellation connecting lines (Rolls Royce delicate filaments)
  const connectionDistance = width < 768 ? 55 : 85;
  const maxLines = width < 768 ? 40 : 90;
  let linesDrawn = 0;

  ctx.lineWidth = 0.6;
  for (let i = 0; i < projectedStars.length && linesDrawn < maxLines; i++) {
    const p1 = projectedStars[i];

    // Connect to mouse if close
    if (mouse.active && !reduced) {
      const dMouse = Math.hypot(mouse.x - p1.x, mouse.y - p1.y);
      if (dMouse < 120) {
        const lineAlpha = (1 - dMouse / 120) * 0.22;
        ctx.strokeStyle = `rgba(0, 240, 255, ${lineAlpha})`;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    // Connect to nearby stars
    for (let j = i + 1; j < projectedStars.length; j++) {
      const p2 = projectedStars[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.hypot(dx, dy);

      if (dist < connectionDistance) {
        const lineAlpha = (1 - dist / connectionDistance) * 0.12 * Math.min(p1.alpha, p2.alpha);
        ctx.strokeStyle = `rgba(0, 240, 255, ${lineAlpha})`;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        linesDrawn++;
        if (linesDrawn >= maxLines) break;
      }
    }
  }

  // Draw fiber-optic stars
  for (let i = 0; i < projectedStars.length; i++) {
    const p = projectedStars[i];

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

    if (p.color === 'cyan') {
      ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha})`;
      ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
      ctx.shadowBlur = p.size * 3;
    } else {
      ctx.fillStyle = `rgba(240, 246, 252, ${p.alpha})`;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      ctx.shadowBlur = p.size * 2;
    }

    ctx.fill();
    ctx.shadowBlur = 0; // reset
  }

  // Draw Shooting Stars (rare, delicate)
  const now = performance.now();
  if (!reduced && now > nextShootingStarTime) {
    spawnShootingStar();
    nextShootingStarTime = now + 5000 + Math.random() * 7000; // every 5-12s
  }

  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const ss = shootingStars[i];
    ss.x += ss.vx;
    ss.y += ss.vy;
    ss.alpha -= ss.decay;

    if (ss.alpha <= 0 || ss.x > width + 100 || ss.y > height + 100) {
      shootingStars.splice(i, 1);
      continue;
    }

    // Draw shooting star head + glowing tail
    const tailX = ss.x - (ss.vx / Math.hypot(ss.vx, ss.vy)) * ss.length;
    const tailY = ss.y - (ss.vy / Math.hypot(ss.vx, ss.vy)) * ss.length;

    const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
    grad.addColorStop(0.7, `rgba(0, 240, 255, ${ss.alpha * 0.4})`);
    grad.addColorStop(1, `rgba(255, 255, 255, ${ss.alpha})`);

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(ss.x, ss.y);
    ctx.stroke();

    // Bright head spark
    ctx.beginPath();
    ctx.arc(ss.x, ss.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${ss.alpha})`;
    ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  rafId = requestAnimationFrame(render);
}

export function initStarlight() {
  canvas = document.querySelector('[data-starlight-canvas]');
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  resize();

  const count = window.innerWidth < 768 ? 160 : 380;
  stars = createStars(count);
  nextShootingStarTime = performance.now() + 3000;

  window.addEventListener('resize', resize, { passive: true });

  window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
    const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    camera.targetY = progress * 240;
    camera.targetZ = -progress * 140;
    camera.targetRotX = progress * 0.1;
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.active = true;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
  });

  // Start animation loop
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(render);
}

/**
 * Update the 3D camera target based on current slide index (0 to 4)
 */
export function setStarlightSlide(index) {
  currentSlide = Math.max(0, Math.min(index, SLIDE_CAMERA_TARGETS.length - 1));
  const target = SLIDE_CAMERA_TARGETS[currentSlide];
  if (target) {
    camera.targetX = target.x;
    camera.targetY = target.y;
    camera.targetZ = target.z;
    camera.targetRotX = target.rotX;
    camera.targetRotY = target.rotY;
  }
}
