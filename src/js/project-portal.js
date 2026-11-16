/**
 * project-portal.js — Phase 4 project portal (FLIP expansion)
 *
 * Clicking a project thumbnail expands it to full screen (portal transition),
 * then navigates to the case study. Built on GSAP Flip for layout-preserving
 * expansion.
 *
 * Layering contract: GSAP owns this cinematic timeline. The portal is a DOM
 * element, not scroll-linked. Canvas/particle systems are untouched.
 */

import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { isReducedMotion } from './motion-core.js';
import { navigate } from './router.js';

gsap.registerPlugin(Flip);

let expanding = false;
let expandedEl = null;
let state = null;

const PORTAL_CLASS = 'project--expanded';
const EXPANDING_CLASS = 'project--expanding';
const CLOSE_SELECTOR = '.project__close-portal';

/* ── build close button markup ── */
function buildCloseButton() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'project__close-portal';
  btn.setAttribute('aria-label', 'Close project');
  btn.innerHTML = '<span aria-hidden="true">✕</span>';
  return btn;
}

/* ── capture Flip state, expand to full screen ── */
function expandPortal(projectEl) {
  if (expanding || isReducedMotion()) return;
  expanding = true;

  const media = projectEl.querySelector('.project__media');
  const img = media?.querySelector('img');
  if (!img) {
    // no image: just navigate directly
    const slug = projectEl.dataset.slug;
    navigate(`/work/${slug}`);
    expanding = false;
    return;
  }

  // 1. Capture current layout state
  state = Flip.getState(projectEl);

  // 2. Add expanding classes + close button
  projectEl.classList.add(EXPANDING_CLASS);
  const closeBtn = buildCloseButton();
  projectEl.appendChild(closeBtn);

  // 3. Apply expanded styles (the "to" state)
  projectEl.classList.add(PORTAL_CLASS);
  projectEl.classList.remove(EXPANDING_CLASS);

  // Close button fades in
  gsap.to(closeBtn, { opacity: 1, duration: 0.3, ease: 'power2.out' });

  // 4. Animate from captured state to expanded (FLIP)
  const flipAnim = Flip.from(state, {
    duration: 0.8,
    ease: 'power2.inOut',
    onComplete: () => {
      // Remove Flip's inline props so CSS owns the expanded state
      projectEl.removeAttribute('style');
    },
  });

  const tl = gsap.timeline({
    onComplete: () => {
      expandedEl = projectEl;
      expanding = false;
      // After expansion, navigate to case study
      const slug = projectEl.dataset.slug;
      navigate(`/work/${slug}`);
    },
  });

  tl.add(flipAnim, 0);
}

/* ── public: init portal click handlers ── */
export function initProjectPortal() {
  if (isReducedMotion()) return;

  document.querySelectorAll('[data-project]').forEach((el) => {
    const media = el.querySelector('.project__media');
    if (!media) return;

    // Click on media (not on links) triggers portal
    media.addEventListener('click', (e) => {
      // Don't trigger if clicking a link inside
      if (e.target.closest('a')) return;
      if (expanding || expandedEl) return;
      expandPortal(el);
    });
  });
}

export { expandPortal };
