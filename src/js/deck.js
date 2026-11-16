/**
 * deck.js — Full-Screen 5-Slide Presentation Engine
 *
 * Coordinates:
 *   - 5 interactive full-viewport slides (Hero, Identity & Systems, Work, Experience, Contact)
 *   - Smooth GSAP slide transitions & camera pan orchestration via starlight.js
 *   - Normalized mouse wheel, touch gestures, and keyboard navigation
 *   - Floating Starlight HUD vertical indicators and active state synchronization
 *   - Full keyboard accessibility and prefers-reduced-motion support
 */

import gsap from 'gsap';
import { isReducedMotion } from './motion-core.js';
import { setStarlightSlide } from './starlight.js';
import { playClick, playTick } from './audio-fx.js';

let currentSlide = 0;
let isAnimating = false;
let slides = [];
let indicators = [];
let navLinks = [];
let totalSlides = 5;

// Hash mapping for URL navigation & direct jump links
const SLIDE_HASHES = ['#hero', '#identity', '#work', '#experience', '#contact'];
const HASH_TO_INDEX = {
  '#hero': 0,
  '#top': 0,
  '#identity': 1,
  '#systems': 1,
  '#about': 3,
  '#experience': 3,
  '#work': 2,
  '#contact': 4,
};

export function getActiveSlide() {
  return currentSlide;
}

export function goToSlide(index, immediate = false) {
  if (index === currentSlide && !immediate) return;
  if (index < 0 || index >= totalSlides) return;
  if (isAnimating && !immediate) return;

  const prevSlide = currentSlide;
  currentSlide = index;
  isAnimating = !immediate;

  // Inform celestial canvas to shift 3D camera
  setStarlightSlide(currentSlide);

  // Play subtle audio feedback
  try {
    playTick();
  } catch (e) {}

  // Update indicators
  updateIndicators();

  // Update URL hash quietly without jump
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, '', SLIDE_HASHES[currentSlide]);
  }

  const reduced = isReducedMotion();
  const currentEl = slides[currentSlide];
  const prevEl = slides[prevSlide];

  if (reduced || immediate) {
    slides.forEach((s, i) => {
      s.classList.toggle('is-active', i === currentSlide);
      s.style.opacity = i === currentSlide ? '1' : '0';
      s.style.visibility = i === currentSlide ? 'visible' : 'hidden';
      s.style.transform = 'none';
      s.style.pointerEvents = i === currentSlide ? 'all' : 'none';
    });
    isAnimating = false;
    dispatchSlideChange(currentSlide, prevSlide);
    return;
  }

  // Direction: 1 if moving down/forward, -1 if moving up/backward
  const direction = currentSlide > prevSlide ? 1 : -1;

  // Animate with GSAP
  const tl = gsap.timeline({
    onComplete: () => {
      slides.forEach((s, i) => {
        s.classList.toggle('is-active', i === currentSlide);
        if (i !== currentSlide) {
          s.style.visibility = 'hidden';
          s.style.pointerEvents = 'none';
        }
      });
      currentEl.style.pointerEvents = 'all';
      isAnimating = false;
      dispatchSlideChange(currentSlide, prevSlide);
    },
  });

  // Prepare incoming slide
  currentEl.style.visibility = 'visible';
  currentEl.style.pointerEvents = 'all';

  tl.set(currentEl, {
    opacity: 0,
    y: direction * 40,
    scale: 0.98,
  });

  // Exit previous slide
  if (prevEl && prevEl !== currentEl) {
    tl.to(prevEl, {
      opacity: 0,
      y: -direction * 40,
      scale: 0.98,
      duration: 0.55,
      ease: 'power3.inOut',
    }, 0);
  }

  // Enter current slide
  tl.to(currentEl, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.65,
    ease: 'power3.out',
  }, 0.1);
}

export function nextSlide() {
  if (currentSlide < totalSlides - 1) {
    goToSlide(currentSlide + 1);
  }
}

export function prevSlide() {
  if (currentSlide > 0) {
    goToSlide(currentSlide - 1);
  }
}

function updateIndicators() {
  indicators.forEach((ind, i) => {
    const isActive = i === currentSlide;
    ind.classList.toggle('is-active', isActive);
    ind.setAttribute('aria-current', isActive ? 'step' : 'false');
  });

  // Update top navigation active links
  const targetTag = ['hero', 'systems', 'work', 'about', 'contact'][currentSlide];
  navLinks.forEach((link) => {
    const attr = link.getAttribute('data-nav-link');
    const isActive = attr === targetTag;
    link.classList.toggle('is-active', isActive);
  });

  // Update HUD counter text if present
  const counterEl = document.querySelector('[data-hud-slide-num]');
  if (counterEl) {
    counterEl.textContent = `0${currentSlide + 1}`;
  }
}

function dispatchSlideChange(current, previous) {
  const event = new CustomEvent('slidechange', {
    detail: { current, previous },
  });
  window.dispatchEvent(event);
}

export function initSlideDeck() {
  const deckContainer = document.querySelector('[data-deck-container]');
  if (!deckContainer) return;

  slides = Array.from(document.querySelectorAll('[data-slide]'));
  totalSlides = slides.length;
  indicators = Array.from(document.querySelectorAll('[data-slide-indicator]'));
  navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));

  if (totalSlides === 0) return;

  // Initial display setup
  slides.forEach((s, i) => {
    if (i === 0) {
      s.classList.add('is-active');
      s.style.opacity = '1';
      s.style.visibility = 'visible';
      s.style.pointerEvents = 'all';
    } else {
      s.classList.remove('is-active');
      s.style.opacity = '0';
      s.style.visibility = 'hidden';
      s.style.pointerEvents = 'none';
    }
  });

  // Check URL hash for initial slide jump
  const initialHash = window.location.hash.toLowerCase();
  if (initialHash && HASH_TO_INDEX[initialHash] !== undefined) {
    goToSlide(HASH_TO_INDEX[initialHash], true);
  } else {
    updateIndicators();
  }

  // 1. Wheel navigation with threshold and internal scroll detection
  let wheelTimeout = null;
  let accumulatedDelta = 0;
  const DELTA_THRESHOLD = 45;

  window.addEventListener('wheel', (e) => {
    // If case study overlay or modal is active, let it scroll naturally
    if (document.body.classList.contains('case-study-open') || document.body.classList.contains('palette-open')) {
      return;
    }

    // Check if the event target is inside an element that can scroll internally
    const activeSlideEl = slides[currentSlide];
    let scrollableChild = e.target.closest('[data-slide-scrollable]');

    if (scrollableChild && activeSlideEl.contains(scrollableChild)) {
      const atTop = scrollableChild.scrollTop <= 2;
      const atBottom = scrollableChild.scrollTop + scrollableChild.clientHeight >= scrollableChild.scrollHeight - 2;

      // If scrolling down and not at bottom, let child scroll
      if (e.deltaY > 0 && !atBottom) return;
      // If scrolling up and not at top, let child scroll
      if (e.deltaY < 0 && !atTop) return;
    }

    e.preventDefault();
    accumulatedDelta += e.deltaY;

    if (wheelTimeout) clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
      accumulatedDelta = 0;
    }, 200);

    if (Math.abs(accumulatedDelta) >= DELTA_THRESHOLD) {
      if (accumulatedDelta > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      accumulatedDelta = 0;
    }
  }, { passive: false });

  // 2. Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    if (document.body.classList.contains('palette-open')) return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'j') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'k') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToSlide(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToSlide(totalSlides - 1);
    }
  });

  // 3. Touch Swipe Navigation
  let touchStartY = 0;
  let touchStartX = 0;
  const SWIPE_THRESHOLD = 50;

  window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (document.body.classList.contains('case-study-open')) return;
    if (e.changedTouches.length === 1) {
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const diffY = touchStartY - touchEndY;
      const diffX = touchStartX - touchEndX;

      // Ensure vertical swipe dominates horizontal swipe
      if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > SWIPE_THRESHOLD) {
        if (diffY > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }
  }, { passive: true });

  // 4. Indicator clicks
  indicators.forEach((ind) => {
    ind.addEventListener('click', () => {
      const targetIdx = parseInt(ind.getAttribute('data-slide-indicator'), 10);
      if (!isNaN(targetIdx)) {
        goToSlide(targetIdx);
      }
    });
  });

  // 5. Intercept nav links & scroll-to links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const hash = anchor.getAttribute('href').toLowerCase();
      if (HASH_TO_INDEX[hash] !== undefined) {
        e.preventDefault();
        goToSlide(HASH_TO_INDEX[hash]);
      }
    });
  });
}
