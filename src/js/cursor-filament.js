/**
 * cursor-filament.js — S2: Cursor Light Trail (inspiration 4)
 *
 * A fine, glowing lime filament that trails the cursor with smooth lag and fades.
 *
 * Rules:
 *   - Only active on fine pointers (pointer: fine) and desktop viewports (>= 900px).
 *   - Disabled completely under prefers-reduced-motion: reduce.
 *   - pointer-events: none — never intercepts clicks or hovers.
 *   - Self-sleeping rAF loop: when cursor stops and trail clears, rAF stops completely.
 *   - DPR capped at 1.5 to guarantee 60 fps without GPU pressure.
 */

import { isReducedMotion } from './motion-core.js';

const TRAIL_LIFETIME_MS = 380;
const MAX_POINTS = 32;

export function initCursorFilament() {
  if (isReducedMotion()) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.innerWidth < 900) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-filament';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 1;
    opacity: 0.85;
  `;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.scale(dpr, dpr);
  }

  resize();

  let resizeTimer;
  window.addEventListener(
    'resize',
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    },
    { passive: true }
  );

  const points = [];
  let isRunning = false;
  let rafId = null;

  function addPoint(x, y) {
    const now = performance.now();
    points.push({ x, y, time: now });
    if (points.length > MAX_POINTS) {
      points.shift();
    }
    if (!isRunning) {
      isRunning = true;
      rafId = requestAnimationFrame(render);
    }
  }

  function render(now) {
    // Filter expired points
    while (points.length > 0 && now - points[0].time > TRAIL_LIFETIME_MS) {
      points.shift();
    }

    ctx.clearRect(0, 0, width, height);

    if (points.length < 2) {
      if (points.length === 0) {
        isRunning = false;
        return; // sleep
      }
      rafId = requestAnimationFrame(render);
      return;
    }

    // Draw fading, glowing filament ribbon
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(200, 245, 66, 0.45)';
    ctx.shadowBlur = 6;

    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const age = now - p1.time;
      const progress = Math.max(0, 1 - age / TRAIL_LIFETIME_MS);
      const ratio = i / points.length;

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);

      // Lime color with fading alpha, tapering stroke width (2.2px -> 0.6px)
      const alpha = progress * ratio * 0.45;
      ctx.strokeStyle = `rgba(200, 245, 66, ${alpha.toFixed(3)})`;
      ctx.lineWidth = 0.6 + progress * 1.6;
      ctx.stroke();
    }

    ctx.restore();

    rafId = requestAnimationFrame(render);
  }

  window.addEventListener(
    'mousemove',
    (e) => {
      addPoint(e.clientX, e.clientY);
    },
    { passive: true }
  );

  document.addEventListener('mouseleave', () => {
    points.length = 0;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      points.length = 0;
      if (rafId) cancelAnimationFrame(rafId);
      isRunning = false;
      ctx.clearRect(0, 0, width, height);
    }
  });
}
