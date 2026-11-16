/**
 * motion-core — the site's one motion foundation.
 *
 * ── LAYERING CONTRACT ─────────────────────────────────────────────────────
 * One property, one engine. Never two engines on the same element.
 *
 * | Engine               | Owns                                              | Never touches          |
 * |----------------------|---------------------------------------------------|------------------------|
 * | CSS                  | ambient infinite loops: glow pulse, scanline      | anything scroll-linked |
 * |                      | drift, grain, marquee base                        |                        |
 * | GSAP + ScrollTrigger | page-level scroll choreography: parallax, scrub,  | hover/press, mount-time|
 * |                      | scroll reveals, every Three.js value              | micro-motion           |
 * | motion (this module) | element lifecycle: entrances, staggers, gestures, | scroll-scrubbed values |
 * |                      | panel swaps, SVG pathLength draws, counters       |                        |
 * | Three.js + rAF       | the hero canvas only                              | any DOM                |
 *
 * If a new animation wants two engines, change the plan, not the code.
 *
 * ── REDUCED MOTION ────────────────────────────────────────────────────────
 * This module owns the `prefers-reduced-motion` query. Every other module
 * asks here instead of re-querying `window.matchMedia`, so the preference has
 * exactly one owner and can change live mid-session.
 *
 * Note: `motion/three` exists in v14 and is free — we still drive Three.js
 * values from GSAP, because GSAP already owns the scroll-scrubbed values on
 * those objects. That is the layering contract above, not a licence limit.
 */

import { animate, stagger, inView, hover, press, scroll, spring } from 'motion';

const QUERY = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Current preference. Call it — don't cache it; the OS setting can change. */
export function isReducedMotion() {
  return QUERY.matches;
}

/**
 * Subscribe to preference changes. Returns an unsubscribe function.
 * Used by anything running a loop (hero canvas, cursor filament) so it can
 * stop the moment a visitor turns motion off.
 */
export function onReducedMotionChange(callback) {
  const handler = (event) => callback(event.matches);
  QUERY.addEventListener('change', handler);
  return () => QUERY.removeEventListener('change', handler);
}

/**
 * Guarded animate — identical to motion's `animate()`, but a resolved
 * no-op promise under reduced motion. Use it for anything that moves.
 *
 *   play('.hero__name', { opacity: [0, 1], y: [24, 0] }, { delay: stagger(0.05) });
 */
export function play(target, keyframes, options) {
  if (QUERY.matches) return Promise.resolve();
  return animate(target, keyframes, options).finished;
}

/**
 * Guarded one-shot reveal: animates the element the first time it enters the
 * viewport, then stops observing. Under reduced motion it does nothing at all,
 * leaving the element exactly as CSS renders it (fully visible).
 *
 *   reveal('.project__name', { opacity: [0, 1], y: [24, 0] }, { duration: 0.7 });
 *
 * Returns motion's stop function (a no-op function when reduced).
 */
export function reveal(target, keyframes, { margin = '-10% 0px', amount = 0.15, ...options } = {}) {
  if (QUERY.matches) return () => {};

  const stop = inView(
    target,
    (element) => {
      animate(element, keyframes, options);
      stop(); // one-shot: never replay on scroll-back
    },
    { margin, amount }
  );

  return stop;
}

export { animate, stagger, inView, hover, press, scroll, spring };
