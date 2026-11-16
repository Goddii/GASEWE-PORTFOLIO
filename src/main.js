import './styles/tokens.css';
import './styles/identity-tokens.css';
import './styles/identity-reveal.css';
import './styles/terminal-boot.css';
import './styles/project-exhibition.css';
import './styles/bento-grid.css';
import './styles/insp3-burst.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/deck.css';
import './styles/hero.css';
import './styles/hud.css';
import './styles/traveler.css';
import './styles/systemmap.css';
import './styles/motion.css';
import './styles/work.css';
import './styles/about.css';
import './styles/contact.css';
import './styles/grain.css';
import './styles/transitions.css';
import './styles/casestudy.css';
import './styles/flow.css';
import './styles/command-palette.css';
import './styles/fintech-sandbox.css';

import { renderProjects } from './js/projects.js';
import { renderContact, initContact } from './js/contact.js';
import { renderExperience } from './js/experience.js';
import { initSystemMap } from './js/systemmap.js';
import { initDial } from './js/dial.js';
import { initSmoothScroll, scrollToLenis } from './js/lenis.js';
import { initNav, drawNavMark } from './js/nav.js';
import { initAnimations } from './js/animations.js';
import { initCursorFilament } from './js/cursor-filament.js';
import { initSectionTitleDraws } from './js/draw.js';
import { initTraveler } from './js/traveler.js';
import { initHero } from './js/hero.js';
import { initStarlight } from './js/starlight.js';
import { initProjectPortal } from './js/project-portal.js';
import { initRouter } from './js/router.js';
import { initGodwinOS } from './js/godwinos.js';
import { initCommandPalette, registerPaletteSound } from './js/command-palette.js';
import { initFintechSandbox } from './js/fintech-sandbox.js';
import { initAudioFX, playTick, playClick, playSuccess } from './js/audio-fx.js';

const idle = (fn, timeout = 1500) =>
  'requestIdleCallback' in window ? requestIdleCallback(fn, { timeout }) : setTimeout(fn, 200);

function boot() {
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  // Film grain off on very low-memory devices to protect 60fps.
  if (navigator.deviceMemory && navigator.deviceMemory <= 2) {
    document.documentElement.classList.add('no-grain');
  }

  // 1. Static content first (cheap, above and below the fold).
  renderProjects();
  renderContact();
  renderExperience(); // must precede initDial
  initGodwinOS();
  initFintechSandbox();

  // Wire project portal (FLIP expansion) after project cards are rendered.
  initProjectPortal();

  // 2. Scroll + nav + router (router needs the single Lenis instance).
  const lenis = initSmoothScroll();
  initNav(lenis);
  initRouter(lenis);
  initAudioFX();
  registerPaletteSound((type) => {
    if (type === 'tick') playTick();
    else if (type === 'click') playClick();
    else if (type === 'success') playSuccess();
  });
  initCommandPalette(lenis);

  // 3. Scroll-linked systems.
  initSystemMap(lenis);
  initAnimations();
  initTraveler();
  initDial();
  initContact();
  initCursorFilament();
  initSectionTitleDraws();

  // 4. Hero & Nav: launch concurrently for seamless synchronized opening
  drawNavMark();
  initStarlight();
  initHero();

  // 5. Scroll progress bar
  const scrollFill = document.querySelector('[data-scroll-progress]');
  if (scrollFill) {
    const updateProgress = (scrolled) => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      scrollFill.style.height = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
    };
    if (lenis) {
      lenis.on('scroll', ({ scroll }) => updateProgress(scroll));
    }
    window.addEventListener('scroll', () => updateProgress(window.scrollY), { passive: true });
  }

  if (import.meta.env.DEV) window.__portfolio = { scrollToLenis, lenis };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
