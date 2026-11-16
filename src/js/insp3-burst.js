/**
 * insp3-burst.js — INSP3 Contact Burst & Concentric HUD Ripple Engine
 * 
 * Recreates the exact grammar from insp3.mp4:
 * 1. Approach & Contact: Point of interaction generates a luminous orb core
 * 2. Contact Burst: Energy flash explodes outward in a high-speed shockwave
 * 3. Concentric HUD Rings: Multi-tiered rotating geometric telemetry rings with tick-marks
 * 4. Neural Filament Network: Emits luminous electric lime filaments connecting active nodes
 */

import { isReducedMotion } from './motion-core.js';

let container = null;

function getOrCreateContainer() {
  if (container && document.body.contains(container)) return container;
  container = document.createElement('div');
  container.className = 'insp3-burst-layer';
  container.setAttribute('aria-hidden', 'true');
  container.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 999;
    overflow: hidden;
  `;
  document.body.appendChild(container);
  return container;
}

/**
 * Triggers the insp3 Contact Burst at the center of the specified DOM element
 * @param {HTMLElement} anchor 
 * @param {Object} options 
 */
export function triggerInsp3Burst(anchor, options = {}) {
  if (isReducedMotion()) return;

  const rect = anchor.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const root = getOrCreateContainer();

  // Create isolated burst instance
  const instance = document.createElement('div');
  instance.className = 'insp3-instance';
  instance.style.cssText = `
    position: absolute;
    left: ${cx}px;
    top: ${cy}px;
    width: 0;
    height: 0;
  `;

  // 1. Core Glowing Orb Flash
  const coreOrb = document.createElement('div');
  coreOrb.className = 'insp3-core-orb';
  instance.appendChild(coreOrb);

  // 2. Shockwave Contact Ring
  const shockwave = document.createElement('div');
  shockwave.className = 'insp3-shockwave';
  instance.appendChild(shockwave);

  // 3. Concentric HUD Ring (Outer with ticks)
  const hudOuter = document.createElement('div');
  hudOuter.className = 'insp3-hud-ring insp3-hud-ring--outer';
  instance.appendChild(hudOuter);

  // 4. Concentric HUD Ring (Inner dotted)
  const hudInner = document.createElement('div');
  hudInner.className = 'insp3-hud-ring insp3-hud-ring--inner';
  instance.appendChild(hudInner);

  // 5. Orbital Filament Spark Particles
  const particleCount = options.particles || 12;
  for (let i = 0; i < particleCount; i++) {
    const spark = document.createElement('span');
    spark.className = 'insp3-spark';
    const angle = (i / particleCount) * Math.PI * 2 + (Math.random() * 0.2);
    const dist = 45 + Math.random() * 55;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    spark.style.setProperty('--tx', `${tx.toFixed(1)}px`);
    spark.style.setProperty('--ty', `${ty.toFixed(1)}px`);
    instance.appendChild(spark);
  }

  root.appendChild(instance);

  // Auto clean-up after animation cycle completes (750ms)
  setTimeout(() => {
    instance.remove();
  }, 800);
}
