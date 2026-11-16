/**
 * draw.js — S3: SVG stroke-draw helper (pathLength animation)
 *
 * Reusable for: nav mark, section-title underlines, contact rules,
 * system-map edges, API glyph { } draws, graph edges.
 *
 * Under prefers-reduced-motion: draws instantly (pathLength = 1).
 */

import { play, isReducedMotion, stagger, inView } from './motion-core.js';

/**
 * Animate one or more SVG paths from 0 → 1 pathLength.
 *
 * @param {string|Element|NodeList|Array<Element>} target - Selector, element, or list of elements
 * @param {Object} options - Animation options
 * @param {number} options.duration - Duration in seconds (default: 0.7)
 * @param {string} options.ease - Easing function (default: 'easeOut')
 * @param {number} options.delay - Base delay in seconds (default: 0)
 * @param {number} options.stagger - Stagger delay between elements in seconds (default: 0)
 * @param {number} options.from - Start pathLength (default: 0)
 * @param {number} options.to - End pathLength (default: 1)
 * @returns {Promise<void>} Resolves when all animations complete
 */
export async function drawPaths(target, {
  duration = 0.7,
  ease = 'easeOut',
  delay = 0,
  stagger: staggerDelay = 0,
  from = 0,
  to = 1,
} = {}) {
  if (isReducedMotion()) {
    const elements = resolveTargets(target);
    elements.forEach((el) => {
      if (el.setAttribute) el.setAttribute('pathLength', '1');
    });
    return Promise.resolve();
  }

  const elements = resolveTargets(target);
  if (elements.length === 0) return Promise.resolve();

  // motion's stagger utility
  const delays = elements.map((_, i) => delay + i * staggerDelay);

  await Promise.all(
    elements.map((el, i) =>
      play(el, { pathLength: [from, to] }, { duration, ease, delay: delays[i] })
    )
  );
}

/**
 * Animate a single path (convenience wrapper).
 */
export async function drawPath(element, options = {}) {
  return drawPaths(element, options);
}

/**
 * Resolve a selector, element, NodeList, or array to an array of elements.
 */
function resolveTargets(target) {
  if (!target) return [];
  if (typeof target === 'string') {
    return [...document.querySelectorAll(target)];
  }
  if (target instanceof Element) {
    return [target];
  }
  if (target instanceof NodeList || Array.isArray(target)) {
    return [...target];
  }
  return [];
}

/**
 * Draw multiple paths in sequence (each starts after the previous finishes).
 * Useful for complex multi-stroke icons like the nav mark.
 */
export async function drawSequence(paths, options = {}) {
  if (isReducedMotion()) {
    paths.forEach((p) => {
      if (p.setAttribute) p.setAttribute('pathLength', '1');
    });
    return Promise.resolve();
  }

  for (const path of paths) {
    await drawPath(path, options);
  }
}

/**
 * S3: Draws section title underlines on enter (insp8).
 * Observes each .section-head and draws its .section-head__path from 0 to 1.
 */
export function initSectionTitleDraws() {
  if (isReducedMotion()) {
    document.querySelectorAll('.section-head__path').forEach((path) => {
      if (path.setAttribute) path.setAttribute('pathLength', '1');
    });
    return;
  }

  document.querySelectorAll('.section-head').forEach((head) => {
    const path = head.querySelector('.section-head__path');
    if (!path) return;

    if (path.setAttribute) path.setAttribute('pathLength', '0');

    let drawn = false;
    inView(
      head,
      () => {
        if (drawn) return;
        drawn = true;
        drawPaths(path, { duration: 0.55, ease: 'easeOut' });
      },
      { margin: '-10% 0px', amount: 0.15 }
    );
  });
}