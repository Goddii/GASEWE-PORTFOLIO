/**
 * hud.js — the DOM half of the scanning instrument (system S1).
 *
 * Everything here is aria-hidden decoration built on real numbers pulled
 * from src/data/projects.js: the readout never states anything the site
 * doesn't already claim elsewhere. No invented coordinates, no fake uptime.
 *
 * The waveform strip along the foot of the frame reacts to Lenis scroll
 * velocity — the instrument idles flat and kicks when the page moves.
 */

import { isReducedMotion, onReducedMotionChange } from './motion-core.js';
import { buildStackGraph } from './stack-graph.js';
import { projects } from '../data/projects.js';

const TICK_COUNT = 14;
const WAVE_POINTS = 64;
const WAVE_WIDTH = 600;
const WAVE_HEIGHT = 48;

/** Nairobi — the coordinates are literal, the location comes from site.js. */
const NAIROBI = { lat: '-1.2921', lon: '36.8219' };

export function initHud(lenis) {
  const readoutEl = document.querySelector('[data-hud-readout]');
  const ticksEl = document.querySelector('[data-hud-ticks]');
  const waveEl = document.querySelector('[data-hud-wave]');
  const velocityEl = document.querySelector('[data-hud-velocity]');
  const stateEl = document.querySelector('[data-hud-state]');
  const stage = document.querySelector('[data-hero-stage]');
  const arcSvg = document.querySelector('[data-hero-arc]');
  const arcPath = document.querySelector('[data-hero-arc-path]');

  if (!stage) return createApi(null);

  if (readoutEl) readoutEl.innerHTML = renderReadout();

  const ticks = renderTicks(ticksEl);

  let destroyed = false;
  let rafId = 0;
  let inView = true;
  let velocity = 0;
  let phase = 0;
  let frame = 0;
  let lastAmpText = -1;

  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- waveform ---------- */

  function drawWave(amp) {
    if (!waveEl) return;
    const mid = WAVE_HEIGHT / 2;
    let d = '';
    for (let i = 0; i < WAVE_POINTS; i++) {
      const t = i / (WAVE_POINTS - 1);
      const x = t * WAVE_WIDTH;
      const env = Math.sin(t * Math.PI); // taper to the edges, like a real scope trace
      const y =
        mid +
        env *
          (Math.sin(i * 0.55 + phase) * (1.6 + amp * 9) +
            Math.sin(i * 0.21 - phase * 0.6) * (1.2 + amp * 6));
      d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(2)} `;
    }
    waveEl.setAttribute('d', d.trim());
  }

  function setVelocityLabel(amp) {
    if (!velocityEl) return;
    const text = amp.toFixed(2);
    if (text === String(lastAmpText)) return;
    lastAmpText = text;
    velocityEl.textContent = `${text} px/f`;
  }

  function tick() {
    if (destroyed) return;
    frame++;
    const amp = Math.min(velocity / 22, 1);
    phase += 0.05 + amp * 0.16;
    drawWave(amp);
    if (frame % 6 === 0) setVelocityLabel(amp);
    velocity *= 0.9; // decay: the trace settles back to idle
    rafId = requestAnimationFrame(tick);
  }

  function syncLoop() {
    if (destroyed) return;
    const should = inView && !reducedQuery.matches && document.visibilityState === 'visible';
    if (should && !rafId) rafId = requestAnimationFrame(tick);
    if (!should && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
      if (reducedQuery.matches) {
        drawWave(0);
        setVelocityLabel(0);
      }
    }
  }

  const onScroll = ({ velocity: v }) => {
    velocity = Math.max(velocity, Math.abs(v));
  };
  lenis?.on('scroll', onScroll);

  const io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      syncLoop();
    },
    { rootMargin: '80px' }
  );
  io.observe(stage);

  const onVisibility = () => syncLoop();
  document.addEventListener('visibilitychange', onVisibility);

  const offReduced = onReducedMotionChange(() => syncLoop());

  drawWave(0);
  syncLoop();
  startArc();

  return createApi({
    setScanProgress(progress) {
      if (!ticks) return;
      const lit = Math.round(Math.min(Math.max(progress, 0), 1) * TICK_COUNT);
      ticks.forEach((tick, i) => tick.classList.toggle('is-on', i < lit));
    },
    setState(label) {
      if (stateEl) stateEl.textContent = label;
    },
    destroy() {
      destroyed = true;
      if (rafId) cancelAnimationFrame(rafId);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      offReduced();
      lenis?.off('scroll', onScroll);
      clearTimeout(arcTimer);
    },
  });

  /* ---------- the occasional filament arc (insp ds) ---------- */

  function startArc() {
    if (!arcSvg || !arcPath) return;
    if (!window.matchMedia('(min-width: 900px)').matches) return;

    const fire = () => {
      if (destroyed) return;
      if (!reducedQuery.matches) {
        const steps = 6 + Math.floor(Math.random() * 4);
        const startX = 8 + Math.random() * 25;
        const endX = startX + 35 + Math.random() * 30;
        const startY = 25 + Math.random() * 30;
        let x = startX;
        let y = startY;
        let points = '';
        for (let i = 0; i <= steps; i++) {
          points += `${x.toFixed(1)},${y.toFixed(1)} `;
          x += (endX - startX) / steps;
          y += (Math.random() - 0.5) * 18;
        }
        arcPath.setAttribute('points', points.trim());
        arcSvg.classList.add('is-on');
        setTimeout(() => arcSvg.classList.remove('is-on'), 100 + Math.random() * 60);
      }
      arcTimer = setTimeout(fire, 7000 + Math.random() * 3000);
    };

    arcTimer = setTimeout(fire, 4500 + Math.random() * 2500);
  }
}

let arcTimer = 0;

function createApi(handlers = {}) {
  return {
    setScanProgress: handlers.setScanProgress || (() => {}),
    setState: handlers.setState || (() => {}),
    destroy: handlers.destroy || (() => {}),
  };
}

/** The readout states only real, computed values. */
function renderReadout() {
  const { technologies } = buildStackGraph();
  const rows = [
    ['sys', 'gasewe.portfolio'],
    ['proj', String(projects.length).padStart(2, '0')],
    ['stack', String(technologies.length).padStart(2, '0')],
    ['loc', `nbo ${NAIROBI.lat} ${NAIROBI.lon}`],
    ['build', String(new Date().getFullYear())],
  ];

  return rows
    .map(
      ([key, value]) =>
        `<span class="hud__readout-row"><span class="hud__readout-key">${key}</span><span class="hud__readout-value">${value}</span></span>`
    )
    .join('');
}

function renderTicks(el) {
  if (!el) return null;
  el.innerHTML = Array.from({ length: TICK_COUNT }, () => '<span class="hud__tick"></span>').join('');
  return [...el.querySelectorAll('.hud__tick')];
}
