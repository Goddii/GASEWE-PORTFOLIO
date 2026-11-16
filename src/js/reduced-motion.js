/**
 * reduced-motion.js — Tiny reduced motion check, no dependencies.
 * 
 * This is a synchronous check that doesn't require the motion package.
 * Used by modules that only need to know the preference, not animate.
 */

const QUERY = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Current preference. Call it — don't cache it; the OS setting can change. */
export function isReducedMotion() {
  return QUERY.matches;
}

/**
 * Subscribe to preference changes. Returns an unsubscribe function.
 */
export function onReducedMotionChange(callback) {
  const handler = (event) => callback(event.matches);
  QUERY.addEventListener('change', handler);
  return () => QUERY.removeEventListener('change', handler);
}