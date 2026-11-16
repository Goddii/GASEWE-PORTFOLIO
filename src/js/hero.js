/**
 * hero.js — Minimalist Futuristic Hero (Bottom-Left Identity)
 *
 * Implements:
 *   1. Kinetic reveal of "GODWIN ODHIAMBO" in crisp Starlight White
 *   2. Tagline and coordinates fade-in
 *   3. Tactile 3D magnetic cursor tilt on mouse move
 *   4. Seamless scroll cue
 */

import gsap from 'gsap';
import { isReducedMotion } from './motion-core.js';

export function initHero() {
  const heroSection = document.querySelector('[data-hero]');
  const title = document.querySelector('[data-hero-name]');
  const lines = document.querySelectorAll('.hero__name-line');
  const tag = document.querySelector('.hero__status-tag');
  const origin = document.querySelector('.hero__origin');
  const cue = document.querySelector('.hero__cue-bottom');

  if (!title) return;

  const reduced = isReducedMotion();

  if (reduced) {
    if (lines.length) {
      lines.forEach((l) => {
        l.style.opacity = '1';
        l.style.transform = 'none';
      });
    }
    if (tag) tag.style.opacity = '1';
    if (origin) origin.style.opacity = '1';
    if (cue) cue.style.opacity = '0.7';
    return;
  }

  // 1. Kinetic Entrance Timeline
  const tl = gsap.timeline({ delay: 0.15 });

  if (tag) {
    tl.fromTo(
      tag,
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' }
    );
  }

  tl.fromTo(
    lines,
    {
      opacity: 0,
      y: 28,
      filter: 'blur(6px)',
    },
    {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1.0,
      stagger: 0.14,
      ease: 'power3.out',
    },
    '-=0.4'
  );

  if (origin) {
    tl.fromTo(
      origin,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.5'
    );
  }

  if (cue) {
    tl.fromTo(
      cue,
      { opacity: 0, y: 10 },
      { opacity: 0.7, y: 0, duration: 0.8, ease: 'power2.out' },
      '-=0.4'
    );
  }

  // 2. Subtle 3D Magnetic Cursor Tilt
  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;
  let rafId = null;

  function updateTilt() {
    currentRotX += (targetRotX - currentRotX) * 0.08;
    currentRotY += (targetRotY - currentRotY) * 0.08;

    title.style.transform = `perspective(1000px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;
    rafId = requestAnimationFrame(updateTilt);
  }

  window.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth * 0.5;
    const cy = window.innerHeight * 0.5;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    // Subtle tilt: max 4.5 deg
    targetRotY = dx * 5;
    targetRotX = -dy * 4;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    targetRotX = 0;
    targetRotY = 0;
  });

  rafId = requestAnimationFrame(updateTilt);
}
