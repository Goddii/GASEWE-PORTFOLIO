import { projects } from '../data/projects.js';
import { buildStackGraph, coreStack } from './stack-graph.js';

/**
 * Renders the hero's stat rail — real, computed numbers from
 * src/data/projects.js, not decorative placeholders. Replaces the space
 * a 3D visual used to occupy with something that's actually true.
 */
export function renderHeroStats() {
  const list = document.querySelector('[data-hero-stats]');
  if (!list) return;

  const { technologies } = buildStackGraph();
  const liveCount = projects.filter((p) => p.live).length;
  const core = coreStack(3);

  const rows = [
    { value: String(projects.length).padStart(2, '0'), label: 'Shipped projects' },
    { value: String(liveCount).padStart(2, '0'), label: 'Live demos' },
    { value: String(technologies.length).padStart(2, '0'), label: 'Technologies in production' },
  ];

  list.innerHTML = rows
    .map(
      (r) => `
        <li class="hero__stat">
          <span class="hero__stat-value">${r.value}</span>
          <span class="hero__stat-label">${r.label}</span>
        </li>`
    )
    .join('');

  const coreEl = document.querySelector('[data-hero-core]');
  if (coreEl && core.length) {
    coreEl.textContent = core.join(' · ');
  }
}
