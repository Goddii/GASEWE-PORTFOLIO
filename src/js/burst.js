/**
 * burst.js — S4: Expanding ring + particle burst on contact
 *
 * Used by: system-map node hover/focus, graph node interactions.
 * Under prefers-reduced-motion: no-op.
 */

import { play, isReducedMotion, spring } from './motion-core.js';

/**
 * Spawn a burst at the center of a target element.
 *
 * @param {Element} anchor - The element to burst from (uses its center)
 * @param {Object} options
 * @param {number} options.ringMaxScale - Max scale of the ring (default: 2.5)
 * @param {number} options.ringDuration - Ring animation duration in seconds (default: 0.6)
 * @param {number} options.particleCount - Number of particles (default: 8)
 * @param {number} options.particleMaxDistance - Max distance particles travel in px (default: 60)
 * @param {number} options.particleDuration - Particle animation duration in seconds (default: 0.5)
 * @param {string} options.color - Burst color (default: var(--glow))
 * @returns {Promise<void>} Resolves when burst completes
 */
export async function burst(anchor, {
  ringMaxScale = 2.5,
  ringDuration = 0.6,
  particleCount = 8,
  particleMaxDistance = 60,
  particleDuration = 0.5,
  color = 'var(--glow)',
} = {}) {
  if (isReducedMotion()) return Promise.resolve();

  const rect = anchor.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  // Create burst container
  const container = document.createElement('div');
  container.className = 'burst-container';
  container.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999;
    overflow: visible;
  `;
  document.body.appendChild(container);

  // Create ring element
  const ring = document.createElement('div');
  ring.className = 'burst-ring';
  const ringSize = Math.max(rect.width, rect.height) * 0.6;
  ring.style.cssText = `
    position: absolute;
    left: ${cx - ringSize / 2}px;
    top: ${cy - ringSize / 2}px;
    width: ${ringSize}px;
    height: ${ringSize}px;
    border: 1px solid ${color};
    border-radius: 50%;
    opacity: 1;
    transform: scale(0.15);
    transform-origin: center;
    box-shadow: 0 0 12px ${color}, 0 0 24px ${color};
    will-change: transform, opacity;
  `;
  container.appendChild(ring);

  // Create particles
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const distance = particleMaxDistance * (0.6 + Math.random() * 0.4);
    const particle = document.createElement('div');
    particle.className = 'burst-particle';
    particle.style.cssText = `
      position: absolute;
      left: ${cx}px;
      top: ${cy}px;
      width: 3px;
      height: 3px;
      background: ${color};
      border-radius: 50%;
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
      transform-origin: center;
      box-shadow: 0 0 6px ${color};
      will-change: transform, opacity;
    `;
    container.appendChild(particle);
    particles.push({ element: particle, angle, distance });
  }

  // Animate ring: scale up + fade out
  const ringPromise = play(ring, {
    scale: [0.15, ringMaxScale],
    opacity: [1, 0],
  }, {
    duration: ringDuration,
    ease: 'easeOut',
  });

  // Animate particles: shoot out + fade
  const particlePromises = particles.map(({ element, angle, distance }) => {
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    return play(element, {
      translateX: [0, tx],
      translateY: [0, ty],
      scale: [1, 0.3],
      opacity: [1, 0],
    }, {
      duration: particleDuration,
      ease: 'easeOut',
    });
  });

  await Promise.all([ringPromise, ...particlePromises]);

  // Cleanup
  container.remove();
}

/**
 * Burst from a specific coordinate (for non-element anchors).
 */
export async function burstAt(x, y, options = {}) {
  if (isReducedMotion()) return Promise.resolve();

  const {
    ringMaxScale = 2.5,
    ringDuration = 0.6,
    particleCount = 8,
    particleMaxDistance = 60,
    particleDuration = 0.5,
    color = 'var(--glow)',
  } = options;

  const container = document.createElement('div');
  container.className = 'burst-container';
  container.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999;
    overflow: visible;
  `;
  document.body.appendChild(container);

  const ringSize = 32;
  const ring = document.createElement('div');
  ring.className = 'burst-ring';
  ring.style.cssText = `
    position: absolute;
    left: ${x - ringSize / 2}px;
    top: ${y - ringSize / 2}px;
    width: ${ringSize}px;
    height: ${ringSize}px;
    border: 1px solid ${color};
    border-radius: 50%;
    opacity: 1;
    transform: scale(0.15);
    transform-origin: center;
    box-shadow: 0 0 12px ${color}, 0 0 24px ${color};
    will-change: transform, opacity;
  `;
  container.appendChild(ring);

  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const distance = particleMaxDistance * (0.6 + Math.random() * 0.4);
    const particle = document.createElement('div');
    particle.className = 'burst-particle';
    particle.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 3px;
      height: 3px;
      background: ${color};
      border-radius: 50%;
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
      transform-origin: center;
      box-shadow: 0 0 6px ${color};
      will-change: transform, opacity;
    `;
    container.appendChild(particle);
    particles.push({ element: particle, angle, distance });
  }

  const ringPromise = play(ring, {
    scale: [0.15, ringMaxScale],
    opacity: [1, 0],
  }, { duration: ringDuration, ease: 'easeOut' });

  const particlePromises = particles.map(({ element, angle, distance }) => {
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    return play(element, {
      translateX: [0, tx],
      translateY: [0, ty],
      scale: [1, 0.3],
      opacity: [1, 0],
    }, { duration: particleDuration, ease: 'easeOut' });
  });

  await Promise.all([ringPromise, ...particlePromises]);
  container.remove();
}