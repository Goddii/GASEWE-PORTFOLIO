import { scrollToLenis } from './lenis.js';
import { isReducedMotion, play } from './motion-core.js';
import { drawPaths } from './draw.js';
import { getRoute } from './router.js';

export function initNav(lenis) {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  const header = document.querySelector('[data-header]');

  // ---- mobile menu ----
  const openMenu = (open) => {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };

  toggle?.addEventListener('click', () => {
    openMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // close on link click or Escape
  document.querySelectorAll('[data-menu-link]').forEach((link) => {
    link.addEventListener('click', () => openMenu(false));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') openMenu(false);
  });

  // ---- smooth-scroll anchor links ----
  document.querySelectorAll('[data-scroll-to]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      if (getRoute().type !== 'home') return; // router.js handles anchors from case-study / 404 views
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      openMenu(false);
      const headerH = header ? header.offsetHeight : 0;
      scrollToLenis(lenis, target, -headerH + 8);
      history.replaceState(null, '', href);
    });
  });

  // ---- footer year ----
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
}

/**
 * insp8 — Stroke-draw system for nav mark "GW."
 * Draws on first page load (~700 ms) before hero sequence ignites.
 * Under reduced motion, resolves instantly with dot visible.
 */
export async function drawNavMark() {
  const g = document.querySelector('.site-nav__mark-g');
  const o = document.querySelector('.site-nav__mark-o') || document.querySelector('.site-nav__mark-w');
  const dot = document.querySelector('.site-nav__mark-dot');

  if (isReducedMotion()) {
    if (g?.setAttribute) g.setAttribute('pathLength', '1');
    if (o?.setAttribute) o.setAttribute('pathLength', '1');
    if (dot) dot.style.opacity = '1';
    return Promise.resolve();
  }

  if (!g || !o) return Promise.resolve();

  // Draw G and O strokes with a 0.1s stagger
  await drawPaths([g, o], {
    duration: 0.48,
    ease: 'easeInOut',
    stagger: 0.1,
    from: 0,
    to: 1,
  });

  // Dot lands with a momentary lime accent flash
  if (dot) {
    await play(
      dot,
      { opacity: [0, 1], fill: ['var(--glow)', 'var(--ink-0)'] },
      { duration: 0.22, ease: 'easeOut' }
    );
  }
}
