import { projects } from '../data/projects.js';
import { renderFlow, flowSketch } from './flow.js';
import { initCaseStudyMask, initCaseStudyWipes, destroyCaseStudyMask } from './case-study-mask.js';

const arrow = '<span class="project__link-arrow" aria-hidden="true">↗</span>';

function heroMediaMarkup(p) {
  if (p.image) {
    return `
      <div class="casestudy-hero__viewport">
        <div class="casestudy-hero__frame">
          <div class="casestudy-hero__scanline" aria-hidden="true"></div>
          <img
            class="casestudy-hero__image"
            src="${p.image}"
            alt="${p.alt || p.name}"
            width="1280"
            height="800"
            decoding="async"
            fetchpriority="high"
          />
          <div class="casestudy-hero__overlay-bar" aria-hidden="true">
            <span class="casestudy-hero__badge">LIVE ARTIFACT</span>
            <span class="casestudy-hero__coords">SYS.RENDER // 1080P PROJECTION</span>
          </div>
        </div>
      </div>
    `;
  }
  if (p.flow) {
    return `
      <div class="casestudy-hero__viewport">
        <div class="casestudy-hero__frame casestudy-hero__frame--sketch">
          ${flowSketch(p.flow)}
          <div class="casestudy-hero__overlay-bar" aria-hidden="true">
            <span class="casestudy-hero__badge">ARCHITECTURE SCHEMATIC</span>
            <span class="casestudy-hero__coords">SYS.GRAPH // VERIFIED</span>
          </div>
        </div>
      </div>
    `;
  }
  return `
    <div class="casestudy-hero__viewport">
      <div class="casestudy-hero__frame casestudy-hero__frame--sketch" aria-hidden="true">
        <span class="project__api-glyph" style="font-family: var(--id-font-mono); font-size: 3.5rem; color: var(--id-accent); opacity: 0.8;">{ REST API }</span>
      </div>
    </div>
  `;
}

/** @returns {string} HTML for /work/:slug */
export function renderCaseStudy(slug) {
  const i = projects.findIndex((p) => p.slug === slug);
  const p = projects[i];
  if (!p) return render404();

  const next = projects[(i + 1) % projects.length];
  
  const liveLink = p.live
    ? `<a class="cs-btn cs-btn--primary" href="${p.live}" target="_blank" rel="noopener">Launch Live Site${arrow}</a>`
    : '';

  const repoLinks = p.repos
    .map(
      (r) =>
        `<a class="cs-btn cs-btn--ghost" href="${r.url}" target="_blank" rel="noopener">${r.label === 'GitHub' ? 'GitHub Repository' : `${r.label} Repository`}${arrow}</a>`
    )
    .join('');

  const archSteps = p.architecture
    ? p.architecture
        .map((s) => `<span class="cs-flow-step">${s}</span>`)
        .join('<span class="cs-flow-arrow" aria-hidden="true">→</span>')
    : '';

  const problemSection = p.problem
    ? `
      <div class="cs-block cs-block--callout">
        <div class="cs-block__header">
          <span class="cs-block__num">01</span>
          <h2 class="cs-block__title">The Operational Challenge</h2>
        </div>
        <p class="cs-block__body">${p.problem}</p>
        ${p.solution ? `
          <div class="cs-block__subsolution">
            <span class="cs-block__sublabel">Engineered Solution:</span>
            <p class="cs-block__subtext">${p.solution}</p>
          </div>
        ` : ''}
      </div>
    `
    : '';

  const contributionSection = p.myContribution
    ? `
      <div class="cs-block">
        <div class="cs-block__header">
          <span class="cs-block__num">02</span>
          <h2 class="cs-block__title">My Personal Engineering Contribution</h2>
        </div>
        <p class="cs-block__body">${p.myContribution}</p>
      </div>
    `
    : '';

  const challengesSection = p.challenges
    ? `
      <div class="cs-block cs-block--highlight">
        <div class="cs-block__header">
          <span class="cs-block__num">04</span>
          <h2 class="cs-block__title">Architecture Trade-offs &amp; Edge Cases</h2>
        </div>
        <p class="cs-block__body">${p.challenges}</p>
      </div>
    `
    : '';

  const metricsHtml = p.metrics && p.metrics.length > 0
    ? `
      <div class="cs-telemetry__metrics">
        ${p.metrics.map(m => `
          <div class="cs-metric-cell">
            <span class="cs-metric-val">${m.value}</span>
            <span class="cs-metric-lbl">${m.label}</span>
          </div>
        `).join('')}
      </div>
    `
    : '';

  return `
  <article class="casestudy-v2" data-casestudy="${p.slug}">
    <!-- Navigation Bar -->
    <nav class="cs-topbar" aria-label="Case study navigation">
      <a href="/#work" class="cs-topbar__back" data-case-back>
        <span aria-hidden="true">←</span>
        <span>Back to Exhibition</span>
      </a>
      <div class="cs-topbar__telemetry" aria-hidden="true">
        <span>LOC // NAIROBI, KE</span>
        <span class="cs-topbar__sep">·</span>
        <span class="cs-topbar__slug">SYS.ID // ${p.slug.toUpperCase()}</span>
      </div>
    </nav>

    <!-- Header Stage -->
    <header class="cs-header">
      <div class="cs-header__eyebrow">
        <span class="cs-header__badge">${p.featured ? 'FLAGSHIP PRODUCTION BUILD' : 'PRODUCTION CASE STUDY'}</span>
        <span class="cs-header__meta">${p.meta}</span>
      </div>
      <h1 class="cs-header__title" tabindex="-1">${p.name}</h1>
      <p class="cs-header__tagline">${p.tagline}</p>
    </header>

    <!-- Two-Column HUD Stage: Hero Visual + System Telemetry Card -->
    <div class="cs-hero-stage">
      ${heroMediaMarkup(p)}

      <!-- Telemetry Sidebar Card -->
      <aside class="cs-telemetry-hud" aria-label="System specs and actions">
        <div class="cs-telemetry__top">
          <span class="cs-telemetry__indicator">● VERIFIED PRODUCTION INVARIANTS</span>
        </div>

        ${metricsHtml}

        <div class="cs-telemetry__spec-list">
          <div class="cs-spec-row">
            <span class="cs-spec-label">Discipline</span>
            <span class="cs-spec-val">${p.meta}</span>
          </div>
          <div class="cs-spec-row">
            <span class="cs-spec-label">Deployment</span>
            <span class="cs-spec-val">${p.live ? 'Live on Production' : 'Verified Repository'}</span>
          </div>
          <div class="cs-spec-row">
            <span class="cs-spec-label">Core Engine</span>
            <span class="cs-spec-val">${p.stack[0]} + ${p.stack[p.stack.length > 2 ? 3 : 1] || 'PostgreSQL'}</span>
          </div>
        </div>

        <div class="cs-telemetry__actions">
          ${liveLink}
          ${repoLinks}
        </div>
      </aside>
    </div>

    <!-- Deep Technical Content Grid -->
    <div class="cs-body-grid">
      <!-- Section 00: Executive Summary -->
      <div class="cs-block">
        <div class="cs-block__header">
          <span class="cs-block__num">00</span>
          <h2 class="cs-block__title">Executive Summary</h2>
        </div>
        <p class="cs-block__body">${p.description}</p>
      </div>

      <!-- Section 01: The Problem -->
      ${problemSection}

      <!-- Section 02: Personal Contribution -->
      ${contributionSection}

      <!-- Section 03: Architecture & Execution Flow -->
      <div class="cs-block cs-block--flow">
        <div class="cs-block__header">
          <span class="cs-block__num">03</span>
          <h2 class="cs-block__title">System Architecture &amp; Execution Pipeline</h2>
        </div>
        ${p.flow ? '<div class="cs-flow-mount" data-flow></div>' : `<div class="cs-flow-strip">${archSteps}</div>`}
      </div>

      <!-- Section 04: Engineering Trade-offs -->
      ${challengesSection}

      <!-- Section 05: Verified Technology Stack -->
      <div class="cs-block">
        <div class="cs-block__header">
          <span class="cs-block__num">05</span>
          <h2 class="cs-block__title">Verified Technology Stack</h2>
        </div>
        <ul class="cs-tech-pills" aria-label="Verified technologies">
          ${p.stack.map((t) => `<li class="cs-tech-pill">${t}</li>`).join('')}
        </ul>
        ${p.credit ? `<p class="cs-credit-note">${p.credit}</p>` : ''}
      </div>
    </div>

    <!-- Case Study Footer: Sequential Exhibition Step -->
    <footer class="cs-footer">
      <a href="/work/${next.slug}" class="cs-next-card" data-case-link="${next.slug}">
        <span class="cs-next-label">Next Project in Exhibition</span>
        <div class="cs-next-row">
          <span class="cs-next-title">${next.name}</span>
          <span class="cs-next-arrow" aria-hidden="true">→</span>
        </div>
      </a>
    </footer>
  </article>`;
}

export function render404() {
  return `
  <div class="casestudy-v2 casestudy-v2--404">
    <nav class="cs-topbar">
      <a href="/#work" class="cs-topbar__back" data-case-back>← Return to Exhibition</a>
    </nav>
    <div class="cs-header" style="margin-top: 4rem;">
      <h1 class="cs-header__title">404 // Artifact Not Found</h1>
      <p class="cs-header__tagline">The requested project telemetry node does not exist in this catalog.</p>
      <div style="margin-top: 2rem;">
        <a class="cs-btn cs-btn--primary" href="/#work" data-case-back>Return to Portfolio</a>
      </div>
    </div>
  </div>
  `;
}

/**
 * Initializes interactive behaviors for the mounted case study:
 * - Mounts SVG interactive system flow diagram (if project has flow)
 * - Returns a controller object with a destroy method for router cleanup
 */
export function initCaseStudy(root) {
  const mount = root.querySelector('[data-flow]');
  const slug = root.querySelector('[data-casestudy]')?.dataset.casestudy;
  const project = projects.find((p) => p.slug === slug);

  let flowCtl = null;
  if (mount && project?.flow) {
    flowCtl = renderFlow(mount, project.flow);
  }

  return {
    destroy() {
      flowCtl?.destroy?.();
    },
  };
}
