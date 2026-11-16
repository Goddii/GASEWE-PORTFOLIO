/**
 * motion-system.js — Phase 3 global motion system
 *
 * Reusable motion primitives owned by GSAP (cinematic layer). Each primitive
 * is a small, testable timeline function. One property, one engine per the
 * layering contract: these drive opacity/transform/clip-path/SVG pathLength
 * only — never scroll-scrubbed values (those stay in animations.js) and never
 * per-frame canvas values (those stay in identity-reveal.js / traveler.js).
 *
 * All durations/easing/stagger come from --id-* CSS tokens via getComputedStyle,
 * so the motion language is a single source of truth and respects
 * prefers-reduced-motion (durations are zeroed there).
 */

import gsap from 'gsap';
import { isReducedMotion } from './motion-core.js';

/* Read motion tokens from CSS so JS never hard-codes timing. */
const root = getComputedStyle(document.documentElement);
const tok = (name) => root.getPropertyValue(name).trim() || '0s';
const toSeconds = (v) => {
  const n = parseFloat(v);
  return v.endsWith('ms') ? n / 1000 : n;
};

export const MOTION = {
  durSignal: toSeconds(tok('--id-dur-signal')),
  durParticle: toSeconds(tok('--id-dur-particle')),
  durTypography: toSeconds(tok('--id-dur-typography')),
  durPortal: toSeconds(tok('--id-dur-portal')),
  durLightTrail: toSeconds(tok('--id-dur-lighttrail')),
  durFast: toSeconds(tok('--id-dur-fast')),
  durBase: toSeconds(tok('--id-dur-base')),
  durSlow: toSeconds(tok('--id-dur-slow')),
  easeSignal: tok('--id-ease-signal') || 'power2.out',
  easeParticle: tok('--id-ease-particle') || 'power2.out',
  easeTypography: tok('--id-ease-typography') || 'power2.out',
  easePortal: tok('--id-ease-portal') || 'power2.out',
  easeSpring: tok('--id-ease-spring') || 'power2.out',
  staggerChar: toSeconds(tok('--id-stagger-char')),
  staggerWord: toSeconds(tok('--id-stagger-word')),
  staggerSection: toSeconds(tok('--id-stagger-section')),
  staggerNode: toSeconds(tok('--id-stagger-node')),
};

const reduced = isReducedMotion();

/* ── 01. Particle dissolve ──
   Lime particles burst from an element's center and disperse; the element
   fades as the particles take over. Used for section changes and the
   hero-reveal → homepage hand-off. Returns a GSAP timeline. */
export function particleDissolve({
  target,
  centerX,
  centerY,
  count = 28,
  duration = MOTION.durParticle,
  ease = MOTION.easeParticle,
  onComplete,
}) {
  if (reduced) {
    if (target) gsap.set(target, { opacity: 1, clearProps: 'opacity,transform' });
    onComplete?.();
    return gsap.timeline();
  }

  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return gsap.timeline();

  const rect = el.getBoundingClientRect();
  const cx = centerX ?? rect.left + rect.width / 2;
  const cy = centerY ?? rect.top + rect.height / 2;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999';
  document.body.appendChild(canvas);

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const w = (canvas.width = window.innerWidth * dpr);
  const h = (canvas.height = window.innerHeight * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const dist = 10 + Math.random() * 120;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * (1.5 + Math.random() * 1.5),
      vy: Math.sin(angle) * (1.5 + Math.random() * 1.5),
      size: 0.8 + Math.random() * 1.2,
      opacity: 0.8,
      life: 0,
      maxLife: 0.6 + Math.random() * 0.6,
    });
  }

  let frameId;
  const paint = () => {
    ctx.clearRect(0, 0, w / dpr, h / dpr);
    let alive = 0;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life += 0.016;
      p.opacity = Math.max(0, 1 - p.life / p.maxLife);
      if (p.opacity > 0) {
        alive++;
        ctx.fillStyle = `rgba(182, 255, 59, ${p.opacity.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (alive > 0) frameId = requestAnimationFrame(paint);
  };
  paint();

  const tl = gsap.timeline({
    onComplete: () => {
      cancelAnimationFrame(frameId);
      canvas.remove();
      onComplete?.();
    },
  });

  tl.to(el, { opacity: 0, duration: duration * 0.6, ease }, 0)
    .to({}, { duration, onUpdate: paint }, 0); // keep canvas alive for duration

  return tl;
}

/* ── 02. Typography mask ──
   Characters expand beyond viewport, separate, rotate, and become masks for
   the next scene. Used for major heading transitions between sections. */
export function typographyMask({
  target,
  duration = MOTION.durTypography,
  stagger = MOTION.staggerChar,
  ease = MOTION.easeTypography,
  onComplete,
}) {
  if (reduced) {
    const els = typeof target === 'string' ? document.querySelectorAll(target) : [target];
    els.forEach((e) => gsap.set(e, { opacity: 1, y: 0, rotation: 0, scale: 1, clearProps: 'all' }));
    onComplete?.();
    return gsap.timeline();
  }

  const els =
    typeof target === 'string' ? document.querySelectorAll(target) : nodeListOrArray(target);

  const tl = gsap.timeline({ onComplete });

  tl.to(els, {
    scale: 1.6,
    y: -60,
    rotation: -8,
    opacity: 0,
    duration,
    ease,
    stagger,
  });

  return tl;
}

function nodeListOrArray(target) {
  if (Array.isArray(target)) return target;
  if (target instanceof NodeList) return [...target];
  return [target];
}

/* ── 03. Circular reveal ──
   A lime circle expands from a point to cover the viewport, then reverses to
   reveal the new scene beneath. Used for project portal transitions. */
export function circularReveal({
  fromX,
  fromY,
  duration = MOTION.durPortal,
  ease = MOTION.easePortal,
  onStart,
  onComplete,
}) {
  if (reduced) {
    onStart?.();
    onComplete?.();
    return gsap.timeline();
  }

  const reveal = document.createElement('div');
  reveal.className = 'ms-circular-reveal';
  reveal.style.position = 'fixed';
  reveal.style.top = '0';
  reveal.style.left = '0';
  reveal.style.width = '100vw';
  reveal.style.height = '100vh';
  reveal.style.background = 'var(--id-bg-0)';
  reveal.style.zIndex = '998';
  reveal.style.pointerEvents = 'none';
  document.body.appendChild(reveal);

  const size = Math.max(window.innerWidth, window.innerHeight) * 2.2;
  const startX = fromX ?? window.innerWidth / 2;
  const startY = fromY ?? window.innerHeight / 2;

  gsap.set(reveal, {
    clipPath: `circle(0px at ${startX}px ${startY}px)`,
  });

  const tl = gsap.timeline({
    onStart,
    onComplete: () => {
      reveal.remove();
      onComplete?.();
    },
  });

  tl.to(reveal, {
    clipPath: `circle(${size}px at ${startX}px ${startY}px)`,
    duration,
    ease,
  })
    .to(reveal, {
      clipPath: `circle(0px at ${startX}px ${startY}px)`,
      duration,
      ease,
    });

  return tl;
}

/* ── 04. Diagonal wipe ──
   A diagonal lime wipes across the viewport from one corner to the opposite,
   used as a section boundary transition. */
export function diagonalWipe({
  from = 'top-left',
  duration = MOTION.durBase,
  ease = MOTION.easePortal,
  onComplete,
}) {
  if (reduced) {
    onComplete?.();
    return gsap.timeline();
  }

  const wipe = document.createElement('div');
  wipe.className = 'ms-diagonal-wipe';
  wipe.style.position = 'fixed';
  wipe.style.top = '0';
  wipe.style.left = '0';
  wipe.style.width = '100vw';
  wipe.style.height = '100vh';
  wipe.style.background = 'linear-gradient(135deg, transparent 49.5%, var(--id-accent) 50%, transparent 50.5%)';
  wipe.style.zIndex = '997';
  wipe.style.pointerEvents = 'none';
  document.body.appendChild(wipe);

  const startX = from === 'top-left' ? '-100%' : '100%';
  const endX = from === 'top-left' ? '200%' : '-100%';

  gsap.set(wipe, { clipPath: `polygon(0 0, 0 0, 0 100%, 0 100%)`, transform: `translateX(${startX})` });

  const tl = gsap.timeline({ onComplete: () => { wipe.remove(); onComplete?.(); } });

  tl.to(wipe, {
    clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
    transform: `translateX(${endX})`,
    duration,
    ease,
  });

  return tl;
}

/* ── 05. Light trail ──
   A tapering lime polyline draws from point A to point B, fading as it goes.
   Used for contact closing convergence and cursor-reactive accents. */
export function lightTrail({
  fromX,
  fromY,
  toX,
  toY,
  duration = MOTION.durLightTrail,
  ease = MOTION.easeParticle,
  onComplete,
}) {
  if (reduced) {
    onComplete?.();
    return gsap.timeline();
  }

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.style.position = 'fixed';
  svg.style.inset = '0';
  svg.style.width = '100vw';
  svg.style.height = '100vh';
  svg.style.zIndex = '996';
  svg.style.pointerEvents = 'none';
  document.body.appendChild(svg);

  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('stroke', 'var(--id-accent)');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-linecap', 'round');
  path.style.strokeDasharray = '1000';
  path.style.strokeDashoffset = '1000';
  svg.appendChild(path);

  const tl = gsap.timeline({ onComplete: () => { svg.remove(); onComplete?.(); } });

  tl.to(path, {
    attr: { d: `M ${fromX} ${fromY} L ${toX} ${toY}` },
    strokeDashoffset: 0,
    duration,
    ease,
  })
    .to(path, { opacity: 0, duration: duration * 0.4, ease }, '-=0.2');

  return tl;
}

/* ── 06. Section transition ──
   Orchestrates a full section change: particle dissolve from outgoing,
   optional circular reveal wipe, fade-in of incoming. Returns a timeline. */
export function sectionTransition({
  outgoing,
  incoming,
  type = 'dissolve', // 'dissolve' | 'circular' | 'diagonal'
  centerX,
  centerY,
  duration = MOTION.durBase,
  onComplete,
}) {
  const tl = gsap.timeline({ onComplete });

  tl.add(() => {
    if (outgoing) gsap.to(outgoing, { opacity: 0, duration: duration * 0.5, ease: 'power2.in' });
  });

  if (type === 'circular') {
    tl.add(() => circularReveal({ fromX: centerX, fromY: centerY, duration }), '-=' + duration * 0.5);
  } else if (type === 'diagonal') {
    tl.add(() => diagonalWipe({ duration }), '-=' + duration * 0.5);
  } else {
    tl.add(() => particleDissolve({ target: outgoing, centerX, centerY, duration }), '-=' + duration * 0.5);
  }

  tl.add(() => {
    if (incoming) gsap.fromTo(incoming, { opacity: 0 }, { opacity: 1, duration: duration * 0.8, ease: 'power2.out' });
  });

  return tl;
}

/* ── 07. Reusable entrance reveal ──
   Staggered fade-up for section headings and content blocks. Owned by motion
   (mount-time lifecycle), not ScrollTrigger. */
export function entranceReveal({
  target,
  duration = MOTION.durBase,
  stagger = MOTION.staggerSection,
  ease = MOTION.easeTypography,
  y = 24,
  onComplete,
}) {
  if (reduced) {
    const els = typeof target === 'string' ? document.querySelectorAll(target) : nodeListOrArray(target);
    els.forEach((e) => gsap.set(e, { opacity: 1, y: 0, clearProps: 'all' }));
    onComplete?.();
    return gsap.timeline();
  }

  const els = typeof target === 'string' ? document.querySelectorAll(target) : nodeListOrArray(target);

  return gsap.timeline({ onComplete }).to(els, {
    opacity: 1,
    y: 0,
    duration,
    ease,
    stagger,
  });
}
