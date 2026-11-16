/**
 * router.js — History API routes with view transitions.
 *   /            home (static markup in index.html, never re-rendered)
 *   /work/:slug  case study (rendered into [data-case])
 *   anything else → "Signal lost." view
 *
 * Transitions: View Transitions API (shared element: card media -> case hero), with a GSAP
 * "shutter" wipe as the fallback. Reduced motion: instant swap.
 * Home stays mounted (just hidden) so scroll position, ScrollTriggers and canvases survive.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '../data/projects.js';
import { isReducedMotion } from './reduced-motion.js';
import { scrollToLenis } from './lenis.js';
import { renderCaseStudy, render404, initCaseStudy } from './casestudy.js';

let lenis = null;
let homeEl, caseEl, travelerEl, shutter;
let caseCtl = null;
let savedY = 0;
let route = { type: 'home' };

const TITLE = 'Godwin Otieno Odhiambo — Full-stack Developer · Nairobi, Kenya';

function parse(pathname = location.pathname) {
  if (pathname === '/' || pathname === '') return { type: 'home' };
  const m = pathname.match(/^\/work\/([^/]+)\/?$/);
  if (m && projects.some((p) => p.slug === m[1])) return { type: 'work', slug: m[1] };
  return { type: 'lost' };
}

function cardMedia(slug) {
  return document.querySelector(`[data-project][data-slug="${slug}"] .project__media`);
}

function jumpTo(y) {
  // Home was display:none, so Lenis' cached scroll limit is stale: re-measure first.
  lenis?.resize?.();
  const go = () => (lenis ? lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
  go();
  requestAnimationFrame(() => { lenis?.resize?.(); go(); });
}

function show(next, { hash } = {}) {
  const leavingHome = route.type === 'home' && next.type !== 'home';
  if (leavingHome) savedY = lenis ? lenis.scroll : window.scrollY;
  caseCtl?.destroy?.();
  caseCtl = null;

  if (next.type === 'home') {
    caseEl.hidden = true;
    caseEl.innerHTML = '';
    homeEl.hidden = false;
    if (travelerEl) travelerEl.hidden = false;
    document.title = TITLE;
    ScrollTrigger.refresh();
    const target = hash && document.querySelector(hash);
    if (target) {
      const headerH = document.querySelector('[data-header]')?.offsetHeight || 0;
      jumpTo(Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerH + 8));
    } else {
      jumpTo(savedY);
    }
  } else {
    homeEl.hidden = true;
    if (travelerEl) travelerEl.hidden = true;
    caseEl.hidden = false;
    if (next.type === 'work') {
      caseEl.innerHTML = renderCaseStudy(next.slug);
      caseCtl = initCaseStudy(caseEl);
      const p = projects.find((x) => x.slug === next.slug);
      document.title = `${p.name} — Godwin Otieno Odhiambo`;
    } else {
      caseEl.innerHTML = render404();
      document.title = 'Signal lost — Godwin Otieno Odhiambo';
    }
    jumpTo(0);
    caseEl.querySelector('h1')?.focus({ preventScroll: true });
  }
  route = next;
}

async function shutterWipe(update) {
  if (isReducedMotion()) { update(); return; }
  await new Promise((res) => {
    shutter.querySelector('.shutter__line').style.opacity = '1';
    gsap.timeline({ onComplete: res })
      .fromTo(shutter, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.45, ease: 'power3.inOut' })
      .call(update)
      .to(shutter, { clipPath: 'inset(100% 0 0% 0)', duration: 0.45, ease: 'power3.inOut' })
      .set(shutter.querySelector('.shutter__line'), { opacity: 0 });
  });
}

function transition(update, { from, to } = {}) {
  if (document.startViewTransition && !isReducedMotion()) {
    from?.classList.add('vt-hero');
    const vt = document.startViewTransition(() => {
      from?.classList.remove('vt-hero');
      update();
      (typeof to === 'function' ? to() : to)?.classList.add('vt-hero');
    });
    vt.finished.finally(() => document.querySelectorAll('.vt-hero').forEach((el) => el.classList.remove('vt-hero')));
    return vt.finished.catch(() => {});
  }
  return shutterWipe(update);
}

/** Navigate to a URL: "/", "/#about", "/work/vyloc". */
export function navigate(url, { replace = false } = {}) {
  const u = new URL(url, location.origin);
  const next = parse(u.pathname);
  const hash = u.hash || '';
  const same = next.type === route.type && next.slug === route.slug;
  const push = () => (replace ? history.replaceState : history.pushState).call(history, {}, '', u.pathname + hash);

  if (same && next.type === 'home') {
    push();
    show(next, { hash });
    return;
  }
  const fromCard = route.type === 'home' && next.type === 'work' ? cardMedia(next.slug) : null;
  const fromHero = route.type === 'work' && next.type === 'home' ? caseEl.querySelector('.casestudy__hero') : null;
  const leavingSlug = route.type === 'work' ? route.slug : null;
  transition(() => { push(); show(next, { hash }); }, {
    from: fromCard || fromHero,
    to: () => (next.type === 'work' ? caseEl.querySelector('.casestudy__hero') : leavingSlug && !hash ? cardMedia(leavingSlug) : null),
  });
}

export function initRouter(lenisInstance) {
  lenis = lenisInstance;
  homeEl = document.querySelector('[data-home]');
  caseEl = document.querySelector('[data-case]');
  travelerEl = document.querySelector('[data-traveler]');
  shutter = document.createElement('div');
  shutter.className = 'shutter';
  shutter.setAttribute('aria-hidden', 'true');
  shutter.innerHTML = '<div class="shutter__line"></div>';
  document.body.appendChild(shutter);

  // Intercept internal links: case-study links and nav anchors while on a non-home view.
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (a.matches('[data-case-link]') || href.startsWith('/work/')) {
      e.preventDefault();
      navigate(href);
    } else if (a.matches('[data-case-back]')) {
      e.preventDefault();
      navigate(savedY > 0 ? '/' : '/#work');
    } else if (a.matches('[data-case-home]')) {
      e.preventDefault();
      navigate('/');
    } else if (route.type !== 'home' && (href.startsWith('#') || href === '/')) {
      e.preventDefault();
      navigate(href === '/' ? '/' : '/' + href);
    }
  });

  window.addEventListener('popstate', () => {
    const next = parse();
    const fromCard = null;
    transition(() => show(next, { hash: location.hash }), { from: fromCard });
  });

  route = { type: 'home' };
  const initial = parse();
  if (initial.type !== 'home') show(initial);
}

export const getRoute = () => route;
export { scrollToLenis };
