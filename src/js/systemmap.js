/**
 * THE ENGINEERING CONSTELLATION
 * Interactive mapping of systems, architecture, and applied technical domains.
 *
 * Core Architecture & Layout:
 * 1. Central Hub: "GODWIN // CORE ARCHITECTURE"
 * 2. 5 Orbit / Discipline Nodes:
 *    - Product Engineering
 *    - Backend & Systems
 *    - AI & Multi-Agent
 *    - Fintech & Integrations
 *    - Creative Technology
 * 3. 11 Outer Project Satellites connected along domain topology
 * 4. Dynamic Side Panel updating on hover/selection with hard proof metrics
 * 5. Full isolation state management (active paths illuminate in #10b981, unselected dim to 0.15)
 */

import { projects } from '../data/projects.js';
import { isReducedMotion } from './reduced-motion.js';

const reducedMotion = isReducedMotion();

/**
 * 5 Core Engineering Disciplines
 */
export const DISCIPLINES = {
  product: {
    id: 'product',
    label: 'Product Engineering',
    tag: 'PRODUCT // ARCHITECTURE',
    sub: 'OFFLINE-FIRST · PWA · INDEXEDDB',
    summary:
      'Full-lifecycle product engineering combining modular component architecture with fault-tolerant client data persistence. Engineered with monotonic offline write queues and background sync to guarantee unbroken user experiences on unpredictable networks.',
    metric: 'Zero-Latency Client Writes // Monotonic IndexedDB Sync Queue',
    pos: { x: 22, y: 72 },
    projects: ['dai', 'sokomtaani', 'yetu-housing', 'digiarts', 'jacket-masters'],
  },
  backend: {
    id: 'backend',
    label: 'Backend & Systems',
    tag: 'BACKEND // DISTRIBUTED',
    sub: 'POSTGRESQL · FLASK · JWT · REST',
    summary:
      'High-throughput REST API services and relational schemas designed around strict ACID transaction invariants and sub-120ms P99 latencies. Structured with clear service layers, JWT authentication claims, and exhaustive unit and integration testing.',
    metric: 'Sub-120ms P99 Latency // 43+ Automated Pytest Suites',
    pos: { x: 78, y: 28 },
    projects: ['vyloc', 'sokomtaani', 'yfixit', 'workout-api', 'the-exodus', 'pitchtrack'],
  },
  ai: {
    id: 'ai',
    label: 'AI & Multi-Agent',
    tag: 'AGENTIC // ORCHESTRATION',
    sub: 'NVIDIA NIM · LLM PIPELINES · PYDANTIC',
    summary:
      'Autonomous multi-agent orchestration pipelines transforming unstructured conversational audio into deterministic production briefs and pricing models. Built with NVIDIA NIM inference microservices, strict Pydantic JSON schema contracts, and human-in-the-loop validation.',
    metric: '1st Place National Champion // Deterministic Pydantic Schemas',
    pos: { x: 50, y: 18 },
    projects: ['the-exodus'],
  },
  fintech: {
    id: 'fintech',
    label: 'Fintech & Integrations',
    tag: 'FINTECH // TRANSACTION GATEWAYS',
    sub: 'M-PESA DARAJA · STRIPE · WEBHOOKS',
    summary:
      'Mission-critical transaction gateways handling Safaricom Daraja STK Push callbacks with cryptographic HMAC signature verification and idempotent ledger reconciliation. Prevents duplicate charges and state corruption across asynchronous payment lifecycles.',
    metric: '325 Pytest Passing // M-Pesa STK Push Callback Verified',
    pos: { x: 78, y: 72 },
    projects: ['vyloc', 'yfixit', 'sokomtaani', 'digiarts'],
  },
  creative: {
    id: 'creative',
    label: 'Creative Technology',
    tag: 'CREATIVE // GRAPHICS & 3D',
    sub: 'THREE.JS · WEBGL · SHADERS · GSAP',
    summary:
      'GPU-accelerated WebGL runtimes and interactive 3D environments engineered for silky 60 FPS performance budgets. Leverages Draco geometry compression, custom GLSL fragment shaders, and GSAP choreographed micro-interactions.',
    metric: '134MB 3D Mesh Compressed to 9MB // 60 FPS Framerate Budget',
    pos: { x: 22, y: 28 },
    projects: ['shadow-sorceress', 'pitchtrack', 'jacket-masters'],
  },
};

/**
 * 11 Project Satellite Positions (percentages across the canvas rim)
 */
const PROJECT_POSITIONS = {
  'the-exodus': { x: 50, y: 5 },
  'workout-api': { x: 90, y: 14 },
  'vyloc': { x: 92, y: 48 },
  'yfixit': { x: 90, y: 88 },
  'sokomtaani': { x: 50, y: 93 },
  'dai': { x: 10, y: 88 },
  'yetu-housing': { x: 8, y: 64 },
  'digiarts': { x: 34, y: 86 },
  'jacket-masters': { x: 8, y: 46 },
  'shadow-sorceress': { x: 10, y: 14 },
  'pitchtrack': { x: 30, y: 6 },
};

/**
 * Main initialization entry point
 */
export function initSystemMap(lenis) {
  const section = document.getElementById('systems');
  if (!section) return;

  const stage = section.querySelector('[data-constellation-stage]');
  const svg = section.querySelector('[data-constellation-svg]');
  const hub = section.querySelector('[data-constellation-hub]');
  const panel = section.querySelector('[data-constellation-panel]');

  if (!stage || !svg || !panel) return;

  // Active state tracker
  let activeDisciplineId = null;
  let lockedDisciplineId = null;

  // 1. Build and Mount Discipline Nodes
  const disciplineElements = {};
  Object.values(DISCIPLINES).forEach((disc) => {
    const el = document.createElement('div');
    el.className = 'constellation__node constellation__node--discipline';
    el.dataset.discipline = disc.id;
    el.style.left = `${disc.pos.x}%`;
    el.style.top = `${disc.pos.y}%`;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `Discipline: ${disc.label}`);

    el.innerHTML = `
      <div class="constellation__node-top">
        <span class="constellation__node-dot"></span>
        <span class="constellation__node-title">${disc.label}</span>
      </div>
      <span class="constellation__node-sub">${disc.sub}</span>
    `;

    stage.appendChild(el);
    disciplineElements[disc.id] = el;
  });

  // 2. Build and Mount Project Satellite Nodes
  const projectElements = {};
  projects.forEach((proj) => {
    const pos = PROJECT_POSITIONS[proj.slug] || { x: 50, y: 50 };
    const el = document.createElement('div');
    el.className = 'constellation__project-node';
    el.dataset.project = proj.slug;
    el.style.left = `${pos.x}%`;
    el.style.top = `${pos.y}%`;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `Project: ${proj.name}`);

    el.innerHTML = `
      <span class="constellation__project-dot"></span>
      <span class="constellation__project-title">${proj.name}</span>
    `;

    stage.appendChild(el);
    projectElements[proj.slug] = el;
  });

  // 3. Render Dynamic Explainer Panel
  function renderIdlePanel() {
    panel.classList.remove('is-active');
    panel.innerHTML = `
      <div class="constellation-panel__idle">
        <div class="constellation-panel__status-row">
          <span class="constellation-panel__beacon" aria-hidden="true"></span>
          <span>SYSTEM ARCHITECTURE // READY</span>
        </div>
        <h3 class="constellation-panel__idle-heading">
          Select a core engineering discipline to isolate architecture paths
        </h3>
        <p class="constellation-panel__idle-text">
          Godwin's engineering architecture unites five distinct disciplines into production systems. Hover or select any node in the constellation graph to trace dependency flows, proof metrics, and live project implementations.
        </p>
        <div class="constellation-panel__quick-select">
          <span class="constellation-panel__quick-label">QUICK DISCIPLINE SELECTOR</span>
          <div class="constellation-panel__quick-pills">
            ${Object.values(DISCIPLINES)
              .map(
                (d) => `
              <button class="constellation-pill" type="button" data-select-discipline="${d.id}">
                ${d.label}
              </button>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    panel.querySelectorAll('[data-select-discipline]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.selectDiscipline;
        lockedDisciplineId = id;
        setActive(id);
      });
    });
  }

  function renderActivePanel(disc) {
    panel.classList.add('is-active');
    const linkedProjects = projects.filter((p) => disc.projects.includes(p.slug));

    panel.innerHTML = `
      <div class="constellation-panel__active">
        <div class="constellation-panel__badge-row">
          <span class="constellation-panel__domain-tag">${disc.tag}</span>
          <span class="constellation-panel__active-dot">ACTIVE CLUSTER</span>
        </div>
        <h3 class="constellation-panel__title">${disc.label}</h3>
        <p class="constellation-panel__summary">${disc.summary}</p>
        <div class="constellation-panel__metrics-banner">
          <span class="constellation-panel__metrics-k">HARD PROOF METRIC</span>
          <div class="constellation-panel__metrics-val">
            <span class="constellation-panel__metrics-icon" aria-hidden="true">⚡</span>
            <span>${disc.metric}</span>
          </div>
        </div>
        <div class="constellation-panel__projects">
          <span class="constellation-panel__projects-label">
            LINKED PRODUCTION PLATFORMS (${linkedProjects.length})
          </span>
          <div class="constellation-panel__project-list" role="list">
            ${linkedProjects
              .map(
                (p) => `
              <a href="/work/${p.slug}" class="constellation-card" role="listitem" data-case-link>
                <div class="constellation-card__info">
                  <span class="constellation-card__name">${p.name}</span>
                  <span class="constellation-card__meta">${p.meta} · ${p.stack.slice(0, 3).join(', ')}</span>
                </div>
                <span class="constellation-card__arrow" aria-hidden="true">→</span>
              </a>
            `
              )
              .join('')}
          </div>
        </div>
        <button class="constellation-panel__reset-btn" type="button" data-constellation-reset>
          ← Reset Constellation View
        </button>
      </div>
    `;

    const resetBtn = panel.querySelector('[data-constellation-reset]');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        lockedDisciplineId = null;
        setActive(null);
      });
    }
  }

  function renderProjectPanel(proj) {
    panel.classList.add('is-active');
    const connectedDisciplines = Object.values(DISCIPLINES).filter((d) =>
      d.projects.includes(proj.slug)
    );

    panel.innerHTML = `
      <div class="constellation-panel__active">
        <div class="constellation-panel__badge-row">
          <span class="constellation-panel__domain-tag">PLATFORM // NODE</span>
          <span class="constellation-panel__active-dot">ISOLATED PROJECT</span>
        </div>
        <h3 class="constellation-panel__title">${proj.name}</h3>
        <p class="constellation-panel__summary">${proj.tagline}</p>
        <div class="constellation-panel__metrics-banner">
          <span class="constellation-panel__metrics-k">PRODUCTION STACK</span>
          <div class="constellation-panel__metrics-val">
            <span class="constellation-panel__metrics-icon" aria-hidden="true">⚙</span>
            <span>${proj.stack.join(' · ')}</span>
          </div>
        </div>
        <div class="constellation-panel__projects">
          <span class="constellation-panel__projects-label">
            CONNECTED ARCHITECTURAL DOMAINS (${connectedDisciplines.length})
          </span>
          <div class="constellation-panel__project-list" role="list">
            ${connectedDisciplines
              .map(
                (d) => `
              <div class="constellation-card" style="cursor: pointer;" data-discipline-card="${d.id}">
                <div class="constellation-card__info">
                  <span class="constellation-card__name">${d.label}</span>
                  <span class="constellation-card__meta">${d.tag}</span>
                </div>
                <span class="constellation-card__arrow" aria-hidden="true">→</span>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
        <div style="display: flex; gap: 10px; margin-top: auto; padding-top: 1rem;">
          <a href="/work/${proj.slug}" class="constellation-panel__reset-btn" style="color: #00f0ff; border-color: #00f0ff; text-decoration: none;" data-case-link>
            Open Full Case Study →
          </a>
          <button class="constellation-panel__reset-btn" type="button" data-constellation-reset>
            ← Reset
          </button>
        </div>
      </div>
    `;

    panel.querySelectorAll('[data-discipline-card]').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.dataset.disciplineCard;
        lockedDisciplineId = id;
        setActive(id);
      });
    });

    const resetBtn = panel.querySelector('[data-constellation-reset]');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        lockedDisciplineId = null;
        setActive(null);
      });
    }
  }

  // 4. Construct SVG Lines between Hub, Disciplines, and Project Satellites
  const edges = [];

  function drawConnections() {
    svg.innerHTML = '';
    edges.length = 0;

    const stageRect = stage.getBoundingClientRect();
    if (stageRect.width === 0 || stageRect.height === 0) return;

    function getNodeCenter(el) {
      const r = el.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - stageRect.left,
        y: r.top + r.height / 2 - stageRect.top,
      };
    }

    const hubCenter = getNodeCenter(hub);

    // Hub -> Discipline Lines
    Object.values(DISCIPLINES).forEach((disc) => {
      const discEl = disciplineElements[disc.id];
      if (!discEl) return;
      const discCenter = getNodeCenter(discEl);

      const d = `M ${hubCenter.x} ${hubCenter.y} L ${discCenter.x} ${discCenter.y}`;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', 'constellation-edge');
      path.dataset.discipline = disc.id;
      path.dataset.edgeType = 'hub-discipline';
      svg.appendChild(path);

      const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pulse.setAttribute('d', d);
      pulse.setAttribute('class', 'constellation-edge-pulse');
      pulse.dataset.discipline = disc.id;
      pulse.dataset.edgeType = 'hub-discipline';
      svg.appendChild(pulse);

      edges.push({ path, pulse, discipline: disc.id, project: null });

      // Discipline -> Project Lines
      disc.projects.forEach((projSlug) => {
        const projEl = projectElements[projSlug];
        if (!projEl) return;
        const projCenter = getNodeCenter(projEl);

        const dProj = `M ${discCenter.x} ${discCenter.y} L ${projCenter.x} ${projCenter.y}`;

        const pPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pPath.setAttribute('d', dProj);
        pPath.setAttribute('class', 'constellation-edge');
        pPath.dataset.discipline = disc.id;
        pPath.dataset.project = projSlug;
        svg.appendChild(pPath);

        const pPulse = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pPulse.setAttribute('d', dProj);
        pPulse.setAttribute('class', 'constellation-edge-pulse');
        pPulse.dataset.discipline = disc.id;
        pPulse.dataset.project = projSlug;
        svg.appendChild(pPulse);

        edges.push({ path: pPath, pulse: pPulse, discipline: disc.id, project: projSlug });
      });
    });
  }

  // 5. Isolation State Management
  function setActive(disciplineId) {
    activeDisciplineId = disciplineId;

    if (!disciplineId) {
      stage.classList.remove('has-selection');

      // Clear all active classes
      Object.values(disciplineElements).forEach((el) => el.classList.remove('is-active'));
      Object.values(projectElements).forEach((el) => el.classList.remove('is-active'));
      edges.forEach(({ path, pulse }) => {
        path.classList.remove('is-active', 'is-dim');
        pulse.classList.remove('is-active');
      });

      renderIdlePanel();
      return;
    }

    const disc = DISCIPLINES[disciplineId];
    if (!disc) return;

    stage.classList.add('has-selection');

    // Highlight active discipline node, dim others
    Object.entries(disciplineElements).forEach(([id, el]) => {
      if (id === disciplineId) {
        el.classList.add('is-active');
      } else {
        el.classList.remove('is-active');
      }
    });

    // Highlight connected project nodes, dim others
    Object.entries(projectElements).forEach(([slug, el]) => {
      if (disc.projects.includes(slug)) {
        el.classList.add('is-active');
      } else {
        el.classList.remove('is-active');
      }
    });

    // Highlight connecting edges, dim others
    edges.forEach(({ path, pulse, discipline }) => {
      if (discipline === disciplineId) {
        path.classList.add('is-active');
        path.classList.remove('is-dim');
        pulse.classList.add('is-active');
      } else {
        path.classList.remove('is-active');
        path.classList.add('is-dim');
        pulse.classList.remove('is-active');
      }
    });

    renderActivePanel(disc);
  }

  function setActiveProject(projectSlug) {
    const proj = projects.find((p) => p.slug === projectSlug);
    if (!proj) return;

    stage.classList.add('has-selection');

    const connectedDisciplines = Object.values(DISCIPLINES).filter((d) =>
      d.projects.includes(projectSlug)
    );
    const connectedIds = connectedDisciplines.map((d) => d.id);

    // Highlight project
    Object.entries(projectElements).forEach(([slug, el]) => {
      if (slug === projectSlug) {
        el.classList.add('is-active');
      } else {
        el.classList.remove('is-active');
      }
    });

    // Highlight connected disciplines
    Object.entries(disciplineElements).forEach(([id, el]) => {
      if (connectedIds.includes(id)) {
        el.classList.add('is-active');
      } else {
        el.classList.remove('is-active');
      }
    });

    // Highlight matching edges
    edges.forEach(({ path, pulse, discipline, project }) => {
      if (project === projectSlug || (connectedIds.includes(discipline) && !project)) {
        path.classList.add('is-active');
        path.classList.remove('is-dim');
        pulse.classList.add('is-active');
      } else {
        path.classList.remove('is-active');
        path.classList.add('is-dim');
        pulse.classList.remove('is-active');
      }
    });

    renderProjectPanel(proj);
  }

  // 6. Wire Interactive Event Listeners
  Object.values(DISCIPLINES).forEach((disc) => {
    const el = disciplineElements[disc.id];

    el.addEventListener('mouseenter', () => {
      if (!lockedDisciplineId) {
        setActive(disc.id);
      }
    });

    el.addEventListener('mouseleave', () => {
      if (!lockedDisciplineId) {
        setActive(null);
      }
    });

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (lockedDisciplineId === disc.id) {
        lockedDisciplineId = null;
        setActive(null);
      } else {
        lockedDisciplineId = disc.id;
        setActive(disc.id);
      }
    });

    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });

  // Project satellite listeners
  projects.forEach((proj) => {
    const el = projectElements[proj.slug];
    if (!el) return;

    el.addEventListener('mouseenter', () => {
      if (!lockedDisciplineId) {
        setActiveProject(proj.slug);
      }
    });

    el.addEventListener('mouseleave', () => {
      if (!lockedDisciplineId) {
        setActive(null);
      }
    });

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      setActiveProject(proj.slug);
    });

    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });

  // Clicking empty area on stage clears selection lock
  stage.addEventListener('click', (e) => {
    if (
      !e.target.closest('.constellation__node') &&
      !e.target.closest('.constellation__project-node')
    ) {
      lockedDisciplineId = null;
      setActive(null);
    }
  });

  // Render initial idle panel
  renderIdlePanel();

  // Initial connection drawing with requestAnimationFrame to ensure bounding boxes are computed
  requestAnimationFrame(() => {
    drawConnections();
  });

  // Debounced resize recalculation
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      drawConnections();
      if (activeDisciplineId) {
        setActive(activeDisciplineId);
      }
    }, 120);
  });
}
