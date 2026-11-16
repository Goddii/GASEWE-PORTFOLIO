/**
 * case-study-mask.js — Phase 4 cinematic image masking
 *
 * Drives the circular mask on case-study hero images: starts as a small
 * circle (15% radius), expands to full frame as the visitor scrolls.
 * Also triggers diagonal wipe reveals between content sections.
 *
 * Layering contract: GSAP + ScrollTrigger owns scroll-linked values. The
 * mask clip-path is a CSS property, not scroll-scrubbed per-frame — GSAP
 * tweens it based on scroll progress.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isReducedMotion } from './motion-core.js';

gsap.registerPlugin(ScrollTrigger);

let maskTl = null;
let wipeTl = null;

/* ── circular mask expansion on scroll ── */
export function initCaseStudyMask() {
  if (isReducedMotion()) return;

  const mask = document.querySelector('[data-case-mask]');
  if (!mask) return;

  maskTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.casestudy__hero',
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: true,
    },
  });

  maskTl.to(mask, {
    clipPath: 'circle(100% at 50% 50%)',
    duration: 1,
    ease: 'none',
  });
}

/* ── diagonal wipe between content sections ── */
export function initCaseStudyWipes() {
  if (isReducedMotion()) return;

  document.querySelectorAll('.casestudy__section').forEach((section, i) => {
    const wipe = section.querySelector('.casestudy__wipe');
    if (!wipe) {
      const w = document.createElement('div');
      w.className = 'casestudy__wipe';
      section.style.position = 'relative';
      section.insertBefore(w, section.firstChild);
    }
  });

  wipeTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.casestudy__content',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    },
  });

  wipeTl.to('.casestudy__wipe', {
    transform: 'translateX(100%)',
    opacity: 0,
    duration: 1,
    ease: 'none',
    stagger: 0.1,
  });
}

/* ── cleanup on route change ── */
export function destroyCaseStudyMask() {
  if (maskTl) {
    maskTl.scrollTrigger?.kill();
    maskTl.kill();
    maskTl = null;
  }
  if (wipeTl) {
    wipeTl.scrollTrigger?.kill();
    wipeTl.kill();
    wipeTl = null;
  }
}
