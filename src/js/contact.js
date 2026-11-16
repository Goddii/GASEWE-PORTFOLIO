/**
 * contact.js — High-Impact Transmission Grid & Closing Scene
 *
 * Renders prominent, immediately visible contact channels & direct CV download,
 * complemented by the ambient closing canvas and kinetic headline.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { site } from '../data/site.js';
import { isReducedMotion } from './motion-core.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * Renders the high-impact transmission grid into [data-contact-list].
 */
export function renderContact() {
  const container = document.querySelector('[data-contact-list]');
  if (!container) return;

  container.innerHTML = `
    <div class="contact-grid">
      <!-- 1. Direct CV / Resume Card -->
      <div class="contact-card contact-card--primary">
        <div class="contact-card__header">
          <span class="contact-card__badge">
            <span class="contact-card__badge-dot"></span>
            VERIFIED CREDENTIAL // PDF
          </span>
          <span class="contact-card__tag">CV 2026</span>
        </div>
        <h3 class="contact-card__title">Curriculum Vitae</h3>
        <p class="contact-card__desc">
          Full track record spanning 11+ shipped production platforms, credit risk operations, and multi-agent AI systems.
        </p>
        <div class="contact-card__actions">
          <a href="${site.cv}" class="btn-electric" download="Godwin_Odhiambo_CV.pdf" target="_blank" rel="noopener">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M 8 2 V 10 M 8 10 L 5 7 M 8 10 L 11 7 M 2 13 H 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Download Full CV [PDF]</span>
          </a>
        </div>
      </div>

      <!-- 2. Direct Signal / Email Card -->
      <div class="contact-card">
        <div class="contact-card__header">
          <span class="contact-card__badge">DIRECT SIGNAL</span>
          <span class="contact-card__tag">EMAIL</span>
        </div>
        <h3 class="contact-card__title">Initiate Contact</h3>
        <p class="contact-card__desc">
          ${site.email}
        </p>
        <div class="contact-card__actions">
          <a href="mailto:${site.email}" class="btn-electric-ghost">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.6"/>
              <path d="M 2 5 L 8 9 L 14 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
            <span>Send Direct Email</span>
          </a>
        </div>
      </div>

      <!-- 3. GitHub Card -->
      <div class="contact-card">
        <div class="contact-card__header">
          <span class="contact-card__badge">CODE REPOSITORIES</span>
          <span class="contact-card__tag">GITHUB</span>
        </div>
        <h3 class="contact-card__title">GitHub Codebase</h3>
        <p class="contact-card__desc">
          11+ public and private production repositories, microservices, and experiments.
        </p>
        <div class="contact-card__actions">
          <a href="${site.github}" class="btn-electric-ghost" target="_blank" rel="noopener">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38v-1.34c-2.22.48-2.69-1.07-2.69-1.07-.36-.92-.89-1.16-.89-1.16-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 014 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span>Open github.com/Goddii</span>
          </a>
        </div>
      </div>

      <!-- 4. LinkedIn Card -->
      <div class="contact-card">
        <div class="contact-card__header">
          <span class="contact-card__badge">PROFESSIONAL NETWORK</span>
          <span class="contact-card__tag">LINKEDIN</span>
        </div>
        <h3 class="contact-card__title">LinkedIn Network</h3>
        <p class="contact-card__desc">
          Professional background, career milestones, endorsements, and project updates.
        </p>
        <div class="contact-card__actions">
          <a href="${site.linkedin}" class="btn-electric-ghost" target="_blank" rel="noopener">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 01.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
            </svg>
            <span>Connect on LinkedIn</span>
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Initializes entrance triggers and animations for the contact section.
 */
export function initContact() {
  const section = document.querySelector('.contact');
  if (!section) return;

  const cards = section.querySelectorAll('.contact-card');
  const title = section.querySelector('[data-contact-title]');
  const lede = section.querySelector('[data-contact-lede]');
  const closing = section.querySelector('[data-contact-closing]');

  // Ensure always visible immediately (no blank page bug)
  if (cards.length) {
    cards.forEach((c) => {
      c.style.opacity = '1';
      c.style.transform = 'none';
    });
  }
  if (title) title.style.opacity = '1';
  if (lede) lede.style.opacity = '1';
  if (closing) closing.style.opacity = '1';

  if (isReducedMotion()) return;

  // Subtle ScrollTrigger entrance
  try {
    gsap.from(cards, {
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
      },
      opacity: 0,
      y: 30,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power2.out',
    });
  } catch (e) {}
}
