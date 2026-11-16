/**
 * hero-entrance.js — light before form (inspiration op).
 *
 * The reference opens on pure black: a single lamp ignites, *then* the shape
 * resolves around it. Same order here — the lime lamp by the name lights
 * first, the type resolves out of it, the HUD brackets draw themselves, and
 * the real hero stats count up last.
 *
 * Everything is driven by `motion` through motion-core's guards. Under
 * reduced motion this module does nothing at all: the hero is already fully
 * visible in CSS, so the honest static state is simply "no entrance".
 */

import { animate, isReducedMotion, stagger } from './motion-core.js';

export function initHeroEntrance() {
  if (isReducedMotion()) return;

  const ignite = document.querySelector('[data-hero-ignite]');
  const cue = document.querySelector('[data-hero-cue]');
  const stats = document.querySelectorAll('.hero__stat-value');

  // selectors, not NodeLists: motion resolves them against the live DOM and
  // staggers across the match, so this stays correct however many there are
  const hasReveal = document.querySelectorAll('[data-hero-reveal]').length > 0;
  const hasBrackets = document.querySelectorAll('.hud__bracket').length > 0;

  const ease = [0.16, 1, 0.3, 1]; // ease-out-expo, the house entrance curve

  // 1 — the lamp
  const lamp = ignite
    ? animate(
        ignite,
        { opacity: [0, 0.92], scale: [0.55, 1.06] },
        { duration: 0.55, ease: 'easeOut' }
      ).finished
    : Promise.resolve();

  lamp
    .then(() => {
      // 2 — form resolves around the light
      if (hasReveal) {
        animate(
          '[data-hero-reveal]',
          { opacity: [0, 1], y: [26, 0] },
          { duration: 0.75, delay: stagger(0.05), ease }
        );
      }
      if (ignite) {
        animate(ignite, { opacity: 0.26, scale: 1 }, { duration: 1.1, ease: 'easeOut' });
      }
    })
    .then(() => delay(180))
    .then(() => {
      // 3 — the instrument frames itself
      if (hasBrackets) {
        animate(
          '.hud__bracket i:first-child',
          { scaleX: [0, 1] },
          { duration: 0.45, delay: stagger(0.05), ease }
        );
        animate(
          '.hud__bracket i:last-child',
          { scaleY: [0, 1] },
          { duration: 0.45, delay: stagger(0.05, { startDelay: 0.12 }), ease }
        );
      }
    })
    .then(() => delay(220))
    .then(() => {
      // 4 — the numbers land last: they are the point of the hero
      countUp(stats);
      if (cue) animate(cue, { opacity: [0, 1] }, { duration: 0.6, ease: 'easeOut' });
    })
    .catch(() => {
      /* an entrance is never allowed to break the page */
    });
}

/** Counts each stat from 0 to its real value, padded the way it renders. */
function countUp(nodes) {
  nodes.forEach((node, index) => {
    const target = parseInt(node.textContent.trim(), 10);
    if (Number.isNaN(target)) return;
    const pad = node.textContent.trim().length;
    animate(0, target, {
      duration: 1.1,
      delay: index * 0.08,
      ease: 'easeOut',
      onUpdate: (value) => {
        node.textContent = String(Math.round(value)).padStart(pad, '0');
      },
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
