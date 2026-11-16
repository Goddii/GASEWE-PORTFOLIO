/**
 * dial.js — S6: The Dial (inspiration 7 — a clock-face sweep with a rider)
 *
 * Replaces the plain vertical timeline rail as the section's signature.
 * The needle is scroll-scrubbed across 300° (GSAP owns the scrubbed value);
 * each timeline item owns an arc segment, and as the needle sweeps into it
 * that item's node energises (lime ring + meta brightens) and its body
 * staggers in via `motion` (which owns element lifecycle, per the layering
 * contract in motion-core.js).
 *
 * v3 (F2): the rider is no longer a marker dot — it is a tiny figure glyph
 * hanging off the needle tip by its hands (see index.html). The lag that the
 * marker had now tilts the whole body and swings its legs, so the needle
 * reads as carrying weight, exactly like the clip's silhouette riding the
 * clock hand. Reduced motion / no-JS parks the rider at 12 o'clock via its
 * default transform.
 *
 * Mobile: the dial collapses to a compact ring above the timeline — the
 * needle still scrubs, no hover dependency.
 *
 * Under prefers-reduced-motion the needle parks at the centre, all items
 * render fully visible, and no entrance animation runs.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isReducedMotion, inView, animate } from './motion-core.js';

gsap.registerPlugin(ScrollTrigger);

const DIAL = { cx: 110, cy: 110, r: 82 };
const SWEEP_DEG = 300;
const TICK_COUNT = 24;

export function initDial() {
  const dial = document.querySelector('[data-timeline-dial]');
  if (!dial) return;

  const svg = dial.querySelector('.timeline__dial-svg');
  const segmentsEl = svg?.querySelector('[data-dial-segments]');
  const ticksEl = svg?.querySelector('[data-dial-ticks]');
  const needle = svg?.querySelector('[data-dial-needle]');
  if (!svg || !segmentsEl || !ticksEl || !needle) return;

  const reduced = isReducedMotion();
  const items = [...document.querySelectorAll('[data-dial-segment]')];

  // ---- paper-grain dial face (insp7: the clock face is textured, not flat) ----
  injectGrain(svg);

  // ---- render ticks and arc segments ----
  renderTicks(ticksEl);
  const segments = renderSegments(segmentsEl, items.length);

  // ---- rider figure that hangs off the needle tip and lags behind the
  //      sweep (insp7: the figure rides the hand — it never quite catches up,
  //      so the motion reads as weight rather than a rigid hand). The group
  //      is translated to the lagged position and tilted against the sweep;
  //      the legs swing with the same lag delta. ----
  const rider = needle.querySelector('[data-dial-rider]');
  const legL = rider?.querySelector('[data-rider-leg-l]');
  const legR = rider?.querySelector('[data-rider-leg-r]');
  let riderAngle = 0;

  let energizedIndex = -1;

  // ---- needle scrub: GSAP owns the scroll-scrubbed value ----
  if (!reduced) {
    ScrollTrigger.create({
      trigger: '.timeline',
      start: 'top 75%',
      end: 'bottom 80%',
      scrub: true,
      onUpdate: (self) => {
        const angle = self.progress * SWEEP_DEG;
        needle.style.transform = `rotate(${angle}deg)`;

        // The rider lags: ease toward the needle angle each frame so it
        // reads as a figure riding the sweep rather than pinned to it.
        riderAngle += (angle - riderAngle) * 0.18;
        if (rider) {
          // The rider group lives inside the needle group, so its local
          // position is relative to the group's rotation. Placing it at the
          // lag offset makes it appear at riderAngle from the dial centre
          // after the group rotates by angle. Tilt and leg swing are driven
          // by the same lag, so the figure trails the sweep and settles
          // upright when the scroll rests.
          const lag = riderAngle - angle;
          const grip = polar(DIAL.cx, DIAL.cy, 76, lag);
          const tilt = clamp(lag * 0.9, -22, 22);
          rider.setAttribute(
            'transform',
            `translate(${grip.x.toFixed(2)} ${grip.y.toFixed(2)}) rotate(${tilt.toFixed(2)})`
          );
          const swing = clamp(lag * 1.6, -16, 16);
          legL?.setAttribute('transform', `rotate(${(swing - 3).toFixed(1)} 0 2.6)`);
          legR?.setAttribute('transform', `rotate(${(swing + 3).toFixed(1)} 0 2.6)`);
        }

        updateEnergized(angle, items, segments);
      },
    });

    // ---- node pop + staggered text reveal: motion owns lifecycle ----
    items.forEach((item, i) => {
      const node = item.querySelector('.timeline__node');
      const header = item.querySelector('.timeline__header');
      const title = item.querySelector('.timeline__title');
      const org = item.querySelector('.timeline__org');
      const text = item.querySelector('.timeline__text');
      const tags = item.querySelector('.timeline__tags');

      inView(
        item,
        () => {
          if (node) {
            animate(
              node,
              { scale: [0.6, 1], opacity: [0, 1] },
              { type: 'spring', stiffness: 260, damping: 12, delay: i * 0.1 }
            );
          }
          const bodyEls = [header, title, org, text, tags].filter(Boolean);
          bodyEls.forEach((el, j) => {
            animate(
              el,
              { opacity: [0, 1], y: [12, 0] },
              {
                duration: 0.4,
                ease: 'easeOut',
                delay: 0.08 + i * 0.08 + j * 0.05,
              }
            );
          });
        },
        { margin: '0px 0px -20% 0px', amount: 0.1 }
      );
    });
  } else {
    // Reduced motion: needle parks at centre, everything visible
    needle.style.transform = 'rotate(0deg)';
    items.forEach((item) => item.classList.add('is-visible'));
    segmentsEl.style.opacity = '0.3';
  }

  // ---- energise the item whose arc the needle is currently sweeping ----
  function updateEnergized(angle, items, segments) {
    const segAngle = SWEEP_DEG / items.length;
    const idx = Math.min(Math.max(Math.floor(angle / segAngle), 0), items.length - 1);
    if (idx !== energizedIndex) {
      energizedIndex = idx;
      activateItem(idx, items, segments);
    }
  }

  function activateItem(index, items, segments) {
    items.forEach((item, i) => {
      item.classList.toggle('is-active', i === index);
    });
    segments.forEach((seg, i) => {
      seg.classList.toggle('is-active', i === index);
    });

    // The rider catches the light as it rides the sweep (insp7).
    if (rider) {
      rider.classList.toggle('energised', index >= 0);
    }
  }
}

/* ---- geometry helpers ---- */

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** dial angle (0° = top, clockwise) → SVG point */
function polar(cx, cy, r, angleDeg) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) };
}

/** 24 tick marks evenly spaced across the 300° sweep */
function renderTicks(container) {
  const baseR = DIAL.r + 2;
  const tipR = DIAL.r + 5;
  let html = '';
  for (let i = 0; i < TICK_COUNT; i++) {
    const angle = (i / TICK_COUNT) * SWEEP_DEG;
    const base = polar(DIAL.cx, DIAL.cy, baseR, angle);
    const tip = polar(DIAL.cx, DIAL.cy, tipR, angle);
    html += `<line class="timeline__dial-tick" x1="${base.x.toFixed(1)}" y1="${base.y.toFixed(1)}" x2="${tip.x.toFixed(1)}" y2="${tip.y.toFixed(1)}"/>`;
  }
  container.innerHTML = html;
}

/** one arc segment per timeline item, drawn as a thin ring sector */
function renderSegments(container, count) {
  const segAngle = SWEEP_DEG / count;
  const innerR = DIAL.r - 8;
  const outerR = DIAL.r;
  let html = '';
  for (let i = 0; i < count; i++) {
    const start = i * segAngle;
    const end = (i + 1) * segAngle;
    html += `<path class="timeline__dial-segment" d="${ringSegment(DIAL.cx, DIAL.cy, innerR, outerR, start, end)}"/>`;
  }
  container.innerHTML = html;
  return [...container.querySelectorAll('.timeline__dial-segment')];
}

/** SVG path for an annular sector (ring segment) */
function ringSegment(cx, cy, innerR, outerR, start, end) {
  const s = polar(cx, cy, outerR, start);
  const e = polar(cx, cy, outerR, end - 0.2);
  const si = polar(cx, cy, innerR, start + 0.2);
  const ei = polar(cx, cy, innerR, end - 0.2);
  return `M ${s.x.toFixed(1)} ${s.y.toFixed(1)} A ${outerR} ${outerR} 0 0 1 ${e.x.toFixed(1)} ${e.y.toFixed(1)} L ${ei.x.toFixed(1)} ${ei.y.toFixed(1)} A ${innerR} ${innerR} 0 0 0 ${si.x.toFixed(1)} ${si.y.toFixed(1)} Z`;
}

/**
 * Paper-grain dial face (insp7: the clock face is textured, not flat).
 * A subtle SVG turbulence filter behind the needle — the dial reads as a
 * physical disc rather than a flat vector circle.
 */
function injectGrain(svg) {
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <filter id="dial-grain" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.08"/></feComponentTransfer>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
  `;
  svg.insertBefore(defs, svg.firstChild);

  const face = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  face.setAttribute('class', 'timeline__dial-face');
  face.setAttribute('cx', DIAL.cx);
  face.setAttribute('cy', DIAL.cy);
  face.setAttribute('r', DIAL.r - 2);
  face.setAttribute('fill', 'var(--bg-0)');
  face.setAttribute('filter', 'url(#dial-grain)');
  svg.insertBefore(face, svg.querySelector('[data-dial-segments]'));
}