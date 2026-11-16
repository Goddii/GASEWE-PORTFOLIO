/**
 * flow.js — the portfolio's signature: an animated diagram of how a real system works.
 *
 * Content is DATA only (see `flow` in src/data/projects.js):
 *   { title, nodes: [{id,label,x,y}], steps: [{from,to,label}] }   x,y are 0–100.
 *
 * Nodes are HTML (crisp, readable text at any width); edges are one SVG underneath.
 * A lime packet travels each step in order, the edge draws itself, the destination node
 * pulses once, and the step is logged in a real <ol> (screen readers get the sequence).
 * Reduced motion: the full diagram + log render statically, nothing moves.
 */
import gsap from 'gsap';
import { isReducedMotion } from './reduced-motion.js';

const pos = (n) => ({ x: 15 + n.x * 0.7, y: 14 + n.y * 0.72 }); // keep nodes inside the frame

export function renderFlow(container, flow) {
  if (!container || !flow) return { destroy() {}, replay() {} };
  const byId = Object.fromEntries(flow.nodes.map((n) => [n.id, { ...n, ...pos(n) }]));

  container.innerHTML = `
    <figure class="flow" data-flow-root>
      <figcaption class="flow__title">${flow.title}</figcaption>
      <div class="flow__stage" data-flow-stage>
        <svg class="flow__edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          ${flow.steps
            .map((s) => {
              const a = byId[s.from], b = byId[s.to];
              return `<line class="flow__edge" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" pathLength="1" vector-effect="non-scaling-stroke"/>`;
            })
            .join('')}
        </svg>
        ${flow.nodes
          .map((n) => {
            const p = byId[n.id];
            return `<span class="flow__node" data-node="${n.id}" style="left:${p.x}%;top:${p.y}%">${n.label}</span>`;
          })
          .join('')}
        <span class="flow__packet" data-packet aria-hidden="true"></span>
      </div>
      <p class="flow__caption" data-flow-caption aria-hidden="true"></p>
      <div class="flow__controls">
        <button type="button" class="flow__btn" data-flow-replay>Replay</button>
      </div>
      <ol class="flow__log" data-flow-log>
        ${flow.steps.map((s, i) => `<li class="flow__step" data-step="${i}"><span class="flow__step-n">${String(i + 1).padStart(2, '0')}</span>${s.label}</li>`).join('')}
      </ol>
    </figure>`;

  const root = container.querySelector('[data-flow-root]');
  const edges = [...root.querySelectorAll('.flow__edge')];
  const steps = [...root.querySelectorAll('.flow__step')];
  const caption = root.querySelector('[data-flow-caption]');
  const packet = root.querySelector('[data-packet]');
  const nodeEl = (id) => root.querySelector(`[data-node="${id}"]`);
  let tl = null;
  let played = false;

  function setStatic() {
    edges.forEach((e) => { e.style.strokeDashoffset = '0'; e.classList.add('is-drawn'); });
    steps.forEach((s) => s.classList.add('is-done'));
    gsap.set(packet, { opacity: 0 });
  }

  function reset() {
    tl?.kill();
    edges.forEach((e) => { e.style.strokeDasharray = '1'; e.style.strokeDashoffset = '1'; e.classList.remove('is-live', 'is-drawn'); });
    steps.forEach((s) => s.classList.remove('is-active', 'is-done'));
    root.querySelectorAll('.flow__node').forEach((n) => n.classList.remove('is-pulse'));
    caption.textContent = '';
    gsap.set(packet, { opacity: 0 });
  }

  function play() {
    if (isReducedMotion()) { setStatic(); return; }
    reset();
    const stage = root.querySelector('[data-flow-stage]');
    tl = gsap.timeline({ onComplete: () => { caption.textContent = ''; } });
    flow.steps.forEach((s, i) => {
      const a = byId[s.from], b = byId[s.to];
      tl.add(() => {
        steps.forEach((el, k) => el.classList.toggle('is-active', k === i));
        edges[i].classList.add('is-live');
        caption.textContent = `${String(i + 1).padStart(2, '0')} — ${s.label}`;
      });
      tl.set(packet, { left: a.x + '%', top: a.y + '%', opacity: 1 });
      tl.to(edges[i], { strokeDashoffset: 0, duration: 0.8, ease: 'power1.inOut' }, '<');
      tl.to(packet, { left: b.x + '%', top: b.y + '%', duration: 0.8, ease: 'power1.inOut' }, '<');
      tl.add(() => {
        const n = nodeEl(s.to);
        n?.classList.remove('is-pulse'); void n?.offsetWidth; n?.classList.add('is-pulse');
        steps[i].classList.remove('is-active'); steps[i].classList.add('is-done');
        edges[i].classList.remove('is-live'); edges[i].classList.add('is-drawn');
      });
      tl.to({}, { duration: 0.35 });
    });
    tl.to(packet, { opacity: 0, duration: 0.2 });
    void stage;
  }

  reset();
  if (isReducedMotion()) setStatic();

  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !played) { played = true; play(); io.disconnect(); }
  }, { threshold: 0.35 });
  io.observe(root);

  root.querySelector('[data-flow-replay]').addEventListener('click', () => { played = true; play(); });

  return { destroy() { tl?.kill(); io.disconnect(); }, replay: play };
}

/** Tiny static sketch of a flow (dots + hairlines) for cards/heroes with no screenshot. */
export function flowSketch(flow) {
  if (!flow) return '';
  const byId = Object.fromEntries(flow.nodes.map((n) => [n.id, { ...n, ...pos(n) }]));
  const lines = flow.steps
    .map((s) => `<line x1="${byId[s.from].x}" y1="${byId[s.from].y}" x2="${byId[s.to].x}" y2="${byId[s.to].y}"/>`)
    .join('');
  const dots = flow.nodes.map((n) => `<circle cx="${byId[n.id].x}" cy="${byId[n.id].y}" r="1.6"/>`).join('');
  return `<svg class="flow-sketch" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><g class="flow-sketch__lines">${lines}</g><g class="flow-sketch__dots">${dots}</g></svg>`;
}
