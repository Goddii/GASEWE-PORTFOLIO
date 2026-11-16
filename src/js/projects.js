import { projects } from '../data/projects.js';
import { flowSketch } from './flow.js';
import { isReducedMotion } from './motion-core.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Option A: Spatial Holographic Bento Grid
 * Renders an asymmetrical HUD Bento Grid with mouse spotlight tracking,
 * 3D perspective tilting, and scanline effects.
 */
export function renderProjects() {
  const container = document.querySelector('[data-project-list]');
  if (!container) return;

  // Render filter buttons if container exists
  renderFilterPills();

  // Render bento grid items
  container.className = 'project-bento-grid';
  container.innerHTML = projects.map((p, i) => renderBentoCard(p, i)).join('');

  // Wire React Bits Spotlight + 3D Tilt + Scroll Reveals
  initBentoInteractions();
}

/**
 * Renders domain category filters (Fintech, Agentic AI, Full-Stack, Creative)
 */
function renderFilterPills() {
  const filterContainer = document.querySelector('[data-project-filters]');
  if (!filterContainer) return;

  const counts = {
    all: projects.length,
    fintech: projects.filter((p) => p.category === 'fintech').length,
    ai: projects.filter((p) => p.category === 'ai').length,
    fullstack: projects.filter((p) => p.category === 'fullstack').length,
    creative: projects.filter((p) => p.category === 'creative').length,
  };

  const filters = [
    { key: 'all', label: 'ALL SYSTEMS' },
    { key: 'fintech', label: 'FINTECH & PAYMENTS' },
    { key: 'ai', label: 'AGENTIC AI' },
    { key: 'fullstack', label: 'FULL-STACK & APIS' },
    { key: 'creative', label: 'CREATIVE & 3D' },
  ];

  filterContainer.innerHTML = `
    <nav class="project-filters__nav" aria-label="Filter projects by domain">
      ${filters
        .map(
          (f) => `
        <button
          type="button"
          class="project-filter-btn ${f.key === 'all' ? 'is-active' : ''}"
          data-filter="${f.key}"
          aria-pressed="${f.key === 'all' ? 'true' : 'false'}"
        >
          <span class="project-filter-dot" aria-hidden="true"></span>
          <span class="project-filter-label">${f.label}</span>
          <span class="project-filter-count">${counts[f.key] || 0}</span>
        </button>
      `
        )
        .join('')}
    </nav>
  `;

  filterContainer.querySelectorAll('[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-filter');
      filterProjects(cat);
    });
  });
}

/**
 * Dynamic filtering without DOM teardown
 */
export function filterProjects(category) {
  const cards = document.querySelectorAll('[data-bento-card]');
  let visibleIndex = 0;

  cards.forEach((card) => {
    const cardCat = card.getAttribute('data-category');
    const matches = category === 'all' || cardCat === category;

    if (matches) {
      card.classList.remove('is-hidden');
      const idxEl = card.querySelector('.bento-card__index');
      if (idxEl) {
        idxEl.textContent = String(visibleIndex + 1).padStart(2, '0');
      }
      visibleIndex++;
    } else {
      card.classList.add('is-hidden');
    }
  });

  document.querySelectorAll('[data-filter]').forEach((btn) => {
    const active = btn.getAttribute('data-filter') === category;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  ScrollTrigger.refresh();
}

/**
 * Determine the Bento span layout for rhythmic asymmetry:
 * 0: ForestOS -> Flagship Wide (12 col)
 * 1: Vyloc -> Featured Half (6 col)
 * 2: YFixIt -> Featured Half (6 col)
 * 3: SokoMtaani -> Compact (4 col)
 * 4: The Shadow Sorceress -> Compact (4 col)
 * 5: Dai -> Compact (4 col)
 * 6: PitchTrack -> Medium (6 col)
 * 7: Yetu Housing Agency -> Medium (6 col)
 * 8+: Compact (4 col)
 */
function getBentoSpanClass(index, p) {
  if (index === 0) return 'bento-card--flagship-wide';
  if (index === 1 || index === 2) return 'bento-card--featured-half';
  if (index === 6 || index === 7) return 'bento-card--medium';
  return 'bento-card--compact';
}

function renderBentoCard(p, index) {
  const spanClass = getBentoSpanClass(index, p);
  const indexStr = String(index + 1).padStart(2, '0');

  // Media preview
  let mediaHtml = '';
  if (p.image) {
    mediaHtml = `
      <div class="bento-card__media-wrap">
        <img
          class="bento-card__img"
          src="${p.image}"
          alt="${p.alt || p.name}"
          loading="lazy"
          decoding="async"
        />
        <div class="bento-card__scanline" aria-hidden="true"></div>
        <div class="bento-card__sweep" aria-hidden="true"></div>
        <div class="bento-card__media-telemetry">
          <span class="bento-card__badge-id">SYS.ID // ${p.slug.toUpperCase()}</span>
          ${p.live ? '<span class="bento-card__badge-status bento-card__badge-status--live">● LIVE PROD</span>' : '<span class="bento-card__badge-status">CASE STUDY</span>'}
        </div>
      </div>
    `;
  } else if (p.flow) {
    mediaHtml = `
      <div class="bento-card__media-wrap">
        ${flowSketch(p.flow)}
        <div class="bento-card__scanline" aria-hidden="true"></div>
        <div class="bento-card__sweep" aria-hidden="true"></div>
        <div class="bento-card__media-telemetry">
          <span class="bento-card__badge-id">SYS.FLOW // ${p.slug.toUpperCase()}</span>
          <span class="bento-card__badge-status">ARCHITECTURE</span>
        </div>
      </div>
    `;
  } else {
    mediaHtml = `
      <div class="bento-card__media-wrap">
        <div style="font-family: var(--id-font-mono); font-size: 2rem; color: var(--id-accent); opacity: 0.6;">{ REST API }</div>
        <div class="bento-card__scanline" aria-hidden="true"></div>
        <div class="bento-card__media-telemetry">
          <span class="bento-card__badge-id">API // ${p.slug.toUpperCase()}</span>
        </div>
      </div>
    `;
  }

  // Pipeline summary
  const pipelineHtml = p.architecture && p.architecture.length > 0
    ? `
      <div class="bento-card__pipeline">
        <span class="bento-card__pipeline-label">Core Pipeline</span>
        <div class="bento-card__pipeline-steps">
          ${p.architecture.map(step => `<span class="bento-card__pipeline-step">${step}</span>`).join('<span class="bento-card__pipeline-arrow" aria-hidden="true">→</span>')}
        </div>
      </div>
    `
    : '';

  // Stack items
  const stackHtml = p.stack
    ? `<ul class="bento-card__stack" aria-label="Technologies used">
        ${p.stack.slice(0, 5).map(t => `<li class="bento-card__stack-item">${t}</li>`).join('')}
       </ul>`
    : '';

  // Action links
  const caseLink = `<a class="bento-card__btn bento-card__btn--primary" href="/work/${p.slug}">Case Study →</a>`;
  const liveLink = p.live
    ? `<a class="bento-card__btn bento-card__btn--ghost" href="${p.live}" target="_blank" rel="noopener">Live ↗</a>`
    : '';
  const githubLink = p.repos && p.repos.length > 0
    ? `<a class="bento-card__btn bento-card__btn--ghost" href="${p.repos[0].url}" target="_blank" rel="noopener">Repo ↗</a>`
    : '';

  return `
    <li class="bento-card ${spanClass}" data-bento-card data-project data-slug="${p.slug}" data-category="${p.category || 'fullstack'}">
      <div class="bento-card__spotlight" aria-hidden="true"></div>
      ${
        p.award
          ? `
        <div class="bento-card__award-ribbon" aria-label="${p.award}">
          <span class="bento-card__award-star" aria-hidden="true">★</span>
          <span class="bento-card__award-badge">JITUME CHALLENGE</span>
          <span class="bento-card__award-text">1st Place Champion</span>
        </div>
      `
          : ''
      }
      ${mediaHtml}
      <div class="bento-card__content">
        <div class="bento-card__top-meta">
          <span class="bento-card__index">${indexStr}</span>
          <span class="bento-card__category">${p.meta || 'FULL-STACK'}</span>
        </div>
        <h3 class="bento-card__title">${p.name}</h3>
        <p class="bento-card__tagline">${p.tagline}</p>
        <p class="bento-card__desc">${p.description}</p>
        ${pipelineHtml}
        ${stackHtml}
        <div class="bento-card__actions">
          ${caseLink}
          ${liveLink}
          ${githubLink}
        </div>
      </div>
    </li>
  `;
}

/**
 * Initializes cursor spotlight position tracking & smooth 3D tilt
 * (React Bits SpotlightCard / TiltedCard)
 */
function initBentoInteractions() {
  const cards = document.querySelectorAll('[data-bento-card]');
  if (!cards.length) return;

  const reduced = isReducedMotion();

  cards.forEach((card) => {
    // 1. Mouse Spotlight tracking
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // 2. Subtle 3D perspective tilt (skip on reduced motion or touch)
      if (!reduced && window.innerWidth > 768) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      if (!reduced) {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      }
    });
  });

  // Staggered scroll entrance using GSAP ScrollTrigger
  if (!reduced) {
    gsap.fromTo(
      cards,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.project-bento-grid',
          start: 'top 80%',
          once: true,
        },
      }
    );
  }
}

export function initFeaturedTabs() {
  // Maintained for backward compatibility
}
