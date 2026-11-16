import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isReducedMotion } from './motion-core.js';

gsap.registerPlugin(ScrollTrigger);

// Single owner of the preference lives in motion-core.js.
const reducedMotion = isReducedMotion();

export function initSmoothScroll() {
  if (reducedMotion) return null;

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
  });

  // Keep Lenis and ScrollTrigger in lockstep.
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function scrollToLenis(lenis, target, offset = 0) {
  if (!lenis) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) el.scrollIntoView({ block: 'start' });
    return;
  }
  lenis.scrollTo(target, { offset });
}
