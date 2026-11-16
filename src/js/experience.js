import { experience } from '../data/experience.js';

/**
 * Renders the Professional Journey timeline from src/data/experience.js.
 * Must run BEFORE initDial(), which binds [data-dial-segment] items to the 300° sweep.
 */
export function renderExperience() {
  const list = document.querySelector('[data-timeline-list]');
  if (!list) return;

  list.innerHTML = experience
    .map((e, i) => {
      const tags = e.highlights
        ? e.highlights.map((h) => `<span class="timeline__tag">${h}</span>`).join('')
        : '';

      return `
      <li class="timeline__item" data-dial-segment="${i}">
        <div class="timeline__node" aria-hidden="true">
          <span class="timeline__node-dot"></span>
        </div>
        <div class="timeline__body">
          <div class="timeline__header">
            <span class="timeline__category">${e.category || 'MILESTONE'}</span>
            <span class="timeline__period">${e.period}</span>
          </div>
          <h3 class="timeline__title">${e.title}</h3>
          <p class="timeline__org">${e.org}</p>
          <p class="timeline__text">${e.summary}</p>
          <div class="timeline__tags" aria-label="Key competencies">
            ${tags}
          </div>
        </div>
      </li>`;
    })
    .join('');
}
