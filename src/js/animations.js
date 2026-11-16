import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isReducedMotion } from './motion-core.js';

gsap.registerPlugin(ScrollTrigger);

// Single owner of the preference lives in motion-core.js.
const reducedMotion = isReducedMotion();

export function initAnimations() {
  if (reducedMotion) return;

  // ---------- Hero entrance ----------
  // Moved out of GSAP: the hero now opens light-first (insp op) via `motion`
  // in src/js/hero-entrance.js — one engine per element, per the layering
  // contract in motion-core.js. GSAP keeps the hero's *scroll* behaviour only.

  // ---------- Hero parallax on scroll ----------
  const heroIntro = document.querySelector('[data-hero-intro]');
  if (heroIntro) {
    gsap.to(heroIntro, {
      yPercent: -14,
      opacity: 0.2,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  const avatarStage = document.querySelector('[data-hero-avatar-stage]');
  if (avatarStage) {
    gsap.to(avatarStage, {
      yPercent: -10,
      scale: 0.94,
      opacity: 0.35,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  // ---------- Marquee: infinite drift ----------
  const rail = document.querySelector('[data-marquee-rail]');
  const track = document.querySelector('[data-marquee-track]');
  if (rail && track) {
    // duplicate the track once so the rail can loop seamlessly
    rail.appendChild(track.cloneNode(true));

    const loop = gsap.to(rail, {
      xPercent: -50,
      duration: 28,
      ease: 'none',
      repeat: -1,
    });

    // slow on hover, resume on leave with light streak (insp4)
    const streak = rail.parentElement?.querySelector('[data-marquee-streak]');
    const speed = () => {
      gsap.to(loop, { timeScale: 1, duration: 0.4, overwrite: 'auto' });
      // Marquee light streak (insp4: the "trail catches up" beat)
      if (streak && !reducedMotion) {
        gsap.fromTo(
          streak,
          { xPercent: -100, opacity: 0.8 },
          {
            xPercent: 350,
            opacity: 0,
            duration: 0.7,
            ease: 'power2.out',
            overwrite: 'auto',
          }
        );
      }
    };
    const slow = () => gsap.to(loop, { timeScale: 0.35, duration: 0.6, overwrite: 'auto' });
    rail.parentElement.addEventListener('mouseenter', slow);
    rail.parentElement.addEventListener('mouseleave', speed);
  }

  // ---------- Reveals ----------
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 32,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
    });
  });

  // ---------- Project rows ----------
  // Phase 3: entrance choreography (index → name → desc → tags → links) is
  // owned by motion in src/js/media-scan.js → initProjectEntrances(). GSAP
  // keeps the inner-image parallax only (yPercent, a different property on a
  // child element — layering contract §3.1).
  // gsap.from(row.querySelector('.project__media'), { ... });
  // gsap.from(row.querySelector('.project__body'), { ... });
  // → removed: initProjectEntrances() in media-scan.js now owns these entrances.
  gsap.utils.toArray('[data-project]').forEach((row) => {
    const img = row.querySelector('.project__img');
    const wrap = row.querySelector('.project__img-wrap');

    // inner image parallax — subtle drift inside the frame
    if (img && wrap) {
      gsap.fromTo(
        img,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: wrap,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }
  });

  // ---------- Timeline nodes ----------
  // The node spring pop + staggered text reveal is handled in dial.js.
  // The About grid flows cleanly without unnatural y-shifts or scaling
  // so the editorial text and dial timeline align smoothly on scroll.

  // ---------- Nav active state on scroll ----------
  const links = gsap.utils.toArray('[data-nav-link]');
  const sections = links
    .map((l) => document.getElementById(l.dataset.navLink))
    .filter(Boolean);

  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => {
        const link = links.find((l) => l.dataset.navLink === section.id);
        if (!link) return;
        if (self.isActive) {
          links.forEach((l) => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      },
    });
  });

  // ---------- GODWIN.OS modules stagger-reveal ----------
  const osModules = gsap.utils.toArray('[data-godwinos-module]');
  if (osModules.length) {
    gsap.fromTo(
      osModules,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: '.godwinos__modules',
          start: 'top 80%',
          once: true,
        },
      }
    );
  }

  // ---------- GODWIN.OS Signature card reveal ----------
  const sigCard = document.querySelector('[data-godwinos-signature]');
  if (sigCard) {
    gsap.fromTo(
      sigCard,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sigCard,
          start: 'top 85%',
          once: true,
        },
      }
    );
    // Stagger the telemetry pills
    const pills = sigCard.querySelectorAll('.godwinos__sig-pill');
    if (pills.length) {
      gsap.fromTo(
        pills,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power1.out',
          stagger: 0.1,
          delay: 0.3,
          scrollTrigger: {
            trigger: sigCard,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }
  }

  // ---------- Header state ----------
  const header = document.querySelector('[data-header]');
  if (header) {
    ScrollTrigger.create({
      start: 40,
      onUpdate: (self) => {
        header.classList.toggle('is-scrolled', self.scroll() > 40);
      },
    });
  }

  // Refresh triggers after fonts settle so measurements are accurate.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}
