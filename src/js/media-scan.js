/**
 * media-scan.js — Phase 3 Work section media effects
 *
 * Sources: insp2 (annotation + glitch), ftbl1 (hologram scan),
 * insp4 (white beat), insp5 (bloom)
 *
 * Systems used:
 *   S1 Scan — media scanline reveal, hologram rest state
 *   S2 Light — white beat on Product panel open
 *   S3 Draw — annotation leader lines via pathLength
 *   S4 Burst — not used here (project hover uses spring)
 */

import { play, isReducedMotion, inView, hover, press, spring } from './motion-core.js';
import { drawPaths } from './draw.js';

// ---- Module-level state ----
let glitchFired = new WeakSet(); // track which media elements have fired glitch
let lastGlitchTime = 0; // site-wide glitch throttle (1 per second)
const GLITCH_THROTTLE_MS = 1000;
const GLITCH_DURATION_MS = 240;
const MAX_GLITCHES_PER_SECOND = 1;

// ---- Hologram rest state & scan reveal ----
/**
 * Initialize hologram effect on a project media element.
 * Rest state: grayscale(1) contrast(0.85) + drifting scanline overlay.
 * On enter: scanline sweeps top→bottom once, image resolves to full contrast.
 * Hover: re-energises lime hairline.
 */
export function initMediaScan(mediaEl) {
  if (!mediaEl || isReducedMotion()) return;

  const img = mediaEl.querySelector('.project__img, .project__tab-image img');
  if (!img) return;

  // Create scanline overlay
  const scanline = document.createElement('div');
  scanline.className = 'project__scanline';
  scanline.setAttribute('aria-hidden', 'true');
  scanline.style.cssText = `
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--glow), transparent);
    opacity: 0.6;
    pointer-events: none;
    top: -2px;
    transform: translateY(-100%);
    will-change: transform, opacity;
    z-index: 10;
  `;

  // Create hologram wrapper if needed
  let imgWrap = mediaEl.querySelector('.project__img-wrap');
  if (!imgWrap) {
    imgWrap = document.createElement('span');
    imgWrap.className = 'project__img-wrap';
    img.parentNode.insertBefore(imgWrap, img);
    imgWrap.appendChild(img);
  }
  imgWrap.appendChild(scanline);

  // Set initial hologram rest state via CSS custom properties (blur-up placeholder)
  img.style.setProperty('--holo-grayscale', '1');
  img.style.setProperty('--holo-contrast', '0.85');
  img.style.setProperty('--holo-blur', '6px');
  img.style.filter = 'grayscale(var(--holo-grayscale)) contrast(var(--holo-contrast)) blur(var(--holo-blur))';

  // Drift animation (ambient, CSS-owned)
  let driftRaf;
  function startDrift() {
    let pos = -100;
    function tick() {
      pos += 0.15; // slow drift speed
      if (pos > 100) pos = -100;
      scanline.style.transform = `translateY(${pos}%)`;
      scanline.style.opacity = '0.35';
      driftRaf = requestAnimationFrame(tick);
    }
    driftRaf = requestAnimationFrame(tick);
  }

  function stopDrift() {
    if (driftRaf) cancelAnimationFrame(driftRaf);
  }

  // Scan reveal on enter viewport
  let revealed = false;
  const stopInView = inView(mediaEl, (el) => {
    if (revealed) return;
    revealed = true;
    stopDrift();
    revealScan(el, scanline, img);
  }, { margin: '-15% 0px', amount: 0.15 });

  // Hover: re-energise lime hairline
  const stopHover = hover(mediaEl, (el, isHovering) => {
    if (isHovering && revealed) {
      scanline.style.opacity = '1';
      scanline.style.background = 'linear-gradient(90deg, transparent, var(--glow), transparent)';
      scanline.style.boxShadow = '0 0 8px var(--glow), 0 0 16px var(--glow)';
      // Reset position to top for hover re-scan
      scanline.style.transform = 'translateY(-100%)';
      scanline.style.transition = 'transform 0.8s easeOut, opacity 0.2s';
      // Trigger a quick re-scan
      requestAnimationFrame(() => {
        scanline.style.transform = 'translateY(100%)';
      });
      setTimeout(() => {
        scanline.style.transition = '';
        scanline.style.boxShadow = '';
      }, 900);
    } else if (!isHovering) {
      scanline.style.opacity = '0.35';
      scanline.style.background = 'linear-gradient(90deg, transparent, var(--glow), transparent)';
      scanline.style.boxShadow = '';
      // Resume drift after hover
      if (revealed) startDrift();
    }
  });

  // --- Signal Trail (Filament) ---
  const signalTrail = document.createElement('canvas');
  signalTrail.className = 'project__signal-trail';
  mediaEl.appendChild(signalTrail);
  const trailCtx = signalTrail.getContext('2d');
  let trailPoints = [];
  let trailFrame = 0;
  let trailActive = false;
  let trailVisible = false; // idle = 0 frames: loop runs only while the card is on screen

  function resizeTrail() {
    if (!signalTrail || !trailCtx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(mediaEl.clientWidth || 1, 1);
    const height = Math.max(mediaEl.clientHeight || 1, 1);
    signalTrail.width = Math.round(width * dpr);
    signalTrail.height = Math.round(height * dpr);
    signalTrail.style.width = `${width}px`;
    signalTrail.style.height = `${height}px`;
    trailCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function updateTrail() {
    if (!trailActive || !trailCtx || !trailVisible) { trailFrame = 0; return; }
    const width = mediaEl.clientWidth || 1;
    const height = mediaEl.clientHeight || 1;
    const t = performance.now() * 0.0025;
    const x = width * (0.3 + 0.4 * (0.5 + Math.sin(t)));
    const y = height * (0.45 + 0.15 * Math.cos(t * 1.7));
    trailPoints.push({ x, y });
    if (trailPoints.length > 16) trailPoints.shift();

    trailCtx.clearRect(0, 0, width, height);
    for (let i = 1; i < trailPoints.length; i++) {
      const prev = trailPoints[i - 1];
      const curr = trailPoints[i];
      const alpha = (i / trailPoints.length) * 0.6;
      trailCtx.beginPath();
      trailCtx.moveTo(prev.x, prev.y);
      trailCtx.lineTo(curr.x, curr.y);
      trailCtx.strokeStyle = `rgba(200, 245, 66, ${alpha.toFixed(3)})`;
      trailCtx.lineWidth = 1 + (i / trailPoints.length) * 2;
      trailCtx.stroke();
    }

    trailFrame = requestAnimationFrame(updateTrail);
  }

  resizeTrail();
  window.addEventListener('resize', resizeTrail, { passive: true });

  const trailIO = new IntersectionObserver((entries) => {
    trailVisible = entries[0].isIntersecting;
    if (trailVisible && trailActive && !trailFrame) trailFrame = requestAnimationFrame(updateTrail);
  });
  trailIO.observe(mediaEl);

  if (revealed) {
    trailActive = true;
    if (trailVisible && !trailFrame) trailFrame = requestAnimationFrame(updateTrail);
  }

  startDrift();

  // Return cleanup
  return () => {
    stopInView();
    stopHover();
    stopDrift();
    trailActive = false;
    if (trailFrame) cancelAnimationFrame(trailFrame);
    window.removeEventListener('resize', resizeTrail);
    scanline.remove();
    signalTrail.remove();
  };
}

/**
 * One-shot scanline sweep top→bottom, resolving image behind it.
 */
async function revealScan(mediaEl, scanline, img) {
  if (isReducedMotion()) {
    // Instant resolve
    img.style.filter = 'grayscale(0) contrast(1)';
    scanline.style.opacity = '0';
    return;
  }

  // Animate scanline down while image resolves from blurred placeholder to sharp
  const scanPromise = play(scanline, { transform: ['translateY(-100%)', 'translateY(100%)'] }, {
    duration: 0.9,
    ease: 'easeInOut',
  });

  const imgPromise = play(img, {
    '--holo-grayscale': [1, 0],
    '--holo-contrast': [0.85, 1],
    '--holo-blur': ['6px', '0px'],
  }, {
    duration: 0.75,
    ease: 'easeOut',
  });

  await Promise.all([scanPromise, imgPromise]);

  // Fade out scanline
  await play(scanline, { opacity: [0.6, 0] }, {
    duration: 0.3,
    ease: 'easeOut',
  });
}

// ---- Annotation callouts (insp2) ----
/**
 * Render annotation callouts on a project media element.
 * Only on pointer:fine + viewport ≥ 900px.
 * On hover: leader lines draw (pathLength), labels fade in with stagger.
 */
export function initAnnotations(mediaEl, project) {
  if (!project.annotations || project.annotations.length === 0) return () => {};

  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  const isWideViewport = window.innerWidth >= 900;
  if (!isFinePointer || !isWideViewport) {
    // Render as static caption row on touch/narrow
    renderStaticCaptions(mediaEl, project.annotations);
    return () => {};
  }

  const annotations = project.annotations.map((ann, i) => createAnnotation(ann, i, mediaEl));
  let active = false;

  const stopHover = hover(mediaEl, (el, isHovering) => {
    if (isHovering && !active) {
      activateAnnotations(annotations);
      active = true;
    } else if (!isHovering && active) {
      deactivateAnnotations(annotations);
      active = false;
    }
  });

  // Also activate on focus (keyboard)
  mediaEl.addEventListener('focusin', () => {
    if (!active) {
      activateAnnotations(annotations);
      active = true;
    }
  }, true);

  mediaEl.addEventListener('focusout', () => {
    // Check if focus is leaving the media entirely
    setTimeout(() => {
      if (!mediaEl.contains(document.activeElement) && active) {
        deactivateAnnotations(annotations);
        active = false;
      }
    }, 0);
  }, true);

  return () => {
    stopHover();
    annotations.forEach((a) => a.remove());
  };
}

function createAnnotation(ann, index, mediaEl) {
  const imgWrap = mediaEl.querySelector('.project__img-wrap') || mediaEl;
  const img = mediaEl.querySelector('.project__img, .project__tab-image img');

  // Create leader line (SVG path)
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'project__annotation-svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = `
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 20;
    overflow: visible;
  `;

  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('class', 'project__annotation-line');
  path.style.cssText = `
    fill: none;
    stroke: var(--ink-1);
    stroke-width: 1;
    stroke-opacity: 0;
    transition: stroke-opacity 0.3s var(--ease-out);
  `;
  path.setAttribute('pathLength', '0');
  svg.appendChild(path);

  // Create label chip
  const label = document.createElement('span');
  label.className = 'project__annotation-label';
  label.innerHTML = `<span class="project__annotation-id">${ann.id}</span><span class="project__annotation-text">${ann.label}</span>`;
  label.style.cssText = `
    position: absolute;
    pointer-events: none;
    z-index: 21;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.25s var(--ease-out), transform 0.25s var(--ease-out);
  `;

  // Create dot at anchor point
  const dot = document.createElement('span');
  dot.className = 'project__annotation-dot';
  dot.style.cssText = `
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--glow);
    box-shadow: 0 0 6px var(--glow), 0 0 12px var(--glow);
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
    pointer-events: none;
    z-index: 22;
    transition: opacity 0.2s, transform 0.3s var(--ease-out);
  `;

  imgWrap.appendChild(svg);
  imgWrap.appendChild(label);
  imgWrap.appendChild(dot);

  // Position elements (will be updated on resize)
  function updatePosition() {
    const rect = img.getBoundingClientRect();
    const wrapRect = imgWrap.getBoundingClientRect();
    const cx = ann.x / 100 * rect.width;
    const cy = ann.y / 100 * rect.height;
    const labelOffsetX = 16;
    const labelOffsetY = -8;

    // Path from dot to label
    const pathD = `M ${cx} ${cy} L ${cx + labelOffsetX} ${cy + labelOffsetY}`;
    path.setAttribute('d', pathD);
    path.style.strokeDasharray = `${path.getTotalLength()} 10000`;

    // Position label
    label.style.left = `${cx + labelOffsetX + 8}px`;
    label.style.top = `${cy + labelOffsetY}px`;

    // Position dot
    dot.style.left = `${cx}px`;
    dot.style.top = `${cy}px`;
  }

  updatePosition();
  window.addEventListener('resize', updatePosition);

  return {
    path,
    label,
    dot,
    updatePosition,
    remove() {
      svg.remove();
      label.remove();
      dot.remove();
      window.removeEventListener('resize', updatePosition);
    },
  };
}

function activateAnnotations(annotations) {
  annotations.forEach((ann, i) => {
    // Draw leader line
    drawPaths(ann.path, {
      duration: 0.5,
      ease: 'easeOut',
      delay: i * 0.06,
      from: 0,
      to: 1,
    });

    // Fade in dot
    setTimeout(() => {
      ann.dot.style.opacity = '1';
      ann.dot.style.transform = 'translate(-50%, -50%) scale(1)';
    }, i * 60);

    // Fade in label
    setTimeout(() => {
      ann.label.style.opacity = '1';
      ann.label.style.transform = 'translateY(0)';
    }, i * 60 + 100);
  });
}

function deactivateAnnotations(annotations) {
  annotations.forEach((ann, i) => {
    ann.path.style.strokeOpacity = '0';
    ann.path.style.pathLength = '0';
    ann.dot.style.opacity = '0';
    ann.dot.style.transform = 'translate(-50%, -50%) scale(0.5)';
    ann.label.style.opacity = '0';
    ann.label.style.transform = 'translateY(8px)';
  });
}

function renderStaticCaptions(mediaEl, annotations) {
  const captionRow = document.createElement('div');
  captionRow.className = 'project__annotation-captions';
  captionRow.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--line-soft);
  `;

  annotations.forEach((ann) => {
    const chip = document.createElement('span');
    chip.className = 'project__annotation-caption';
    chip.innerHTML = `<span class="project__annotation-id">${ann.id}</span> ${ann.label}`;
    chip.style.cssText = `
      font-family: var(--font-body);
      font-size: 0.68rem;
      font-weight: var(--text-meta-weight);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ink-1);
      padding: 4px 10px;
      border: 1px solid var(--line);
      border-radius: var(--r-pill);
      background: var(--bg-1);
    `;
    captionRow.appendChild(chip);
  });

  const body = mediaEl.closest('.project')?.querySelector('.project__body');
  if (body) {
    body.appendChild(captionRow);
  }
}

// ---- Slice glitch (insp2) ----
/**
 * One-shot slice displacement on media enter.
 * 3 horizontal bands offset ±8px, then snap.
 * Fires once per element, never on hover, never on reduced motion,
 * max once per second site-wide.
 */
export function initSliceGlitch(mediaEl) {
  if (isReducedMotion()) return () => {};

  const img = mediaEl.querySelector('.project__img, .project__tab-image img');
  if (!img) return () => {};

  let fired = false;

  const stopInView = inView(mediaEl, (el) => {
    if (fired) return;
    const now = Date.now();
    if (now - lastGlitchTime < GLITCH_THROTTLE_MS) return;

    fired = true;
    lastGlitchTime = now;
    glitchFired.add(mediaEl);
    fireGlitch(img);
  }, { margin: '-10% 0px', amount: 0.2 });

  return () => {
    stopInView();
  };
}

function fireGlitch(img) {
  const bands = 3;
  const maxOffset = 8;
  const duration = GLITCH_DURATION_MS / 1000;

  // Create slice elements
  const slices = [];
  for (let i = 0; i < bands; i++) {
    const slice = document.createElement('div');
    slice.style.cssText = `
      position: absolute;
      left: 0;
      right: 0;
      top: ${(i / bands) * 100}%;
      height: ${100 / bands}%;
      clip-path: inset(${i / bands * 100}% 0 ${(bands - i - 1) / bands * 100}% 0);
      background: inherit;
      transform: translateX(0);
      will-change: transform;
      pointer-events: none;
      z-index: 5;
    `;
    // Copy the image into the slice
    const imgClone = img.cloneNode(true);
    imgClone.style.cssText = `
      width: 100%;
      height: ${bands * 100}%;
      top: ${-i * 100}%;
      position: absolute;
    `;
    slice.appendChild(imgClone);
    img.parentNode.appendChild(slice);
    slices.push(slice);
  }

  // Animate slices
  const promises = slices.map((slice, i) => {
    const offset = (Math.random() - 0.5) * 2 * maxOffset;
    return play(slice, { translateX: [0, offset, 0] }, {
      duration,
      ease: 'easeOut',
    });
  });

  Promise.all(promises).then(() => {
    slices.forEach((s) => s.remove());
  });
}

// ---- White beat (insp4) ----
/**
 * Full-frame white overlay flash ~90ms at ≤35% peak opacity.
 * Called when Product panel opens on featured project.
 */
let whiteBeatActive = false;

export function triggerWhiteBeat() {
  if (whiteBeatActive || isReducedMotion()) return Promise.resolve();
  whiteBeatActive = true;

  const overlay = document.createElement('div');
  overlay.className = 'project__white-beat';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: white;
    opacity: 0;
    pointer-events: none;
    z-index: 9999;
    will-change: opacity;
  `;
  document.body.appendChild(overlay);

  // Quick flash: 0 → 0.35 → 0 in ~90ms
  return play(overlay, { opacity: [0, 0.35, 0] }, {
    duration: 0.09,
    ease: 'easeOut',
  }).finally(() => {
    overlay.remove();
    whiteBeatActive = false;
  });
}

// ---- Tag springs (stiffness 500, damping 20) ----
/**
 * Apply spring animation to project stack tags on hover/press.
 */
export function initTagSprings() {
  if (isReducedMotion()) return;

  const springConfig = { type: 'spring', stiffness: 500, damping: 20 };

  press('.project__stack-item', (el) => {
    play(el, { scale: [1, 1.08] }, springConfig);
  });

  hover('.project__stack-item', (el, isHovering) => {
    if (isHovering) {
      play(el, { scale: [1, 1.04] }, springConfig);
      el.style.borderColor = 'var(--glow)';
      el.style.background = 'rgba(200, 245, 66, 0.08)';
      el.style.color = 'var(--glow)';
    } else {
      play(el, { scale: [1.04, 1] }, springConfig);
      el.style.borderColor = '';
      el.style.background = '';
      el.style.color = '';
    }
  });
}

// ---- Featured panel swap with motion (crossfade + y-slide) ----
/**
 * Enhanced tab panel swap for featured project.
 * Crossfade + 8px y-slide with layout-style sizing.
 */
export function initFeaturedPanelSwap() {
  if (isReducedMotion()) return;

  document.querySelectorAll('.project__media--featured').forEach((media) => {
    const tabs = [...media.querySelectorAll('.project__tab')];
    const panels = [...media.querySelectorAll('.project__panel')];

    tabs.forEach((tab) => {
      tab.addEventListener('click', async () => {
        const targetPanelName = tab.dataset.tab;
        const targetPanel = media.querySelector(`[data-panel="${targetPanelName}"]`);
        const activePanel = media.querySelector('.project__panel.is-active');

        if (!targetPanel || targetPanel === activePanel) return;

        // Update tab states immediately
        tabs.forEach((t) => {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');

        // Animate out current panel
        if (activePanel) {
          await play(activePanel, { opacity: [1, 0], y: [0, -8] }, {
            duration: 0.25,
            ease: 'easeIn',
          });
          activePanel.classList.remove('is-active');
          activePanel.style.display = 'none';
        }

        // Prepare target panel
        targetPanel.style.display = 'flex';
        targetPanel.style.opacity = '0';
        targetPanel.style.transform = 'translateY(8px)';

        // White beat on Product panel open
        if (targetPanelName === 'product') {
          triggerWhiteBeat();
        }

        // Animate in target panel
        await play(targetPanel, { opacity: [0, 1], y: [8, 0] }, {
          duration: 0.35,
          ease: 'easeOut',
        });
        targetPanel.classList.add('is-active');
        targetPanel.style.display = '';
        targetPanel.style.opacity = '';
        targetPanel.style.transform = '';
      });
    });

    // WAI-ARIA tablist keyboard navigation (ArrowLeft / ArrowRight)
    const tablist = media.querySelector('[role="tablist"]');
    tablist?.addEventListener('keydown', (e) => {
      const activeTab = document.activeElement;
      const idx = tabs.indexOf(activeTab);
      if (idx === -1) return;

      let nextIdx = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIdx = (idx + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIdx = (idx - 1 + tabs.length) % tabs.length;
      }

      if (nextIdx !== -1) {
        e.preventDefault();
        tabs[nextIdx].focus();
        tabs[nextIdx].click();
      }
    });
  });
}

// ---- Entrance choreography for project rows ----
/**
 * Staggered entrance per row: index → name → desc → tags → links.
 */
export function initProjectEntrances() {
  if (isReducedMotion()) return;

  const rows = document.querySelectorAll('[data-project]');

  rows.forEach((row, rowIndex) => {
    const indexEl = row.querySelector('.project__index');
    const nameEl = row.querySelector('.project__name');
    const taglineEl = row.querySelector('.project__tagline');
    const metaEl = row.querySelector('.project__meta');
    const descEl = row.querySelector('.project__desc');
    const stackItems = [...row.querySelectorAll('.project__stack-item')];
    const linkEls = [...row.querySelectorAll('.project__link, .project__link--ghost')];
    const eyebrowEl = row.querySelector('.project__eyebrow');
    const mediaEl = row.querySelector('.project__media');

    const sequence = [
      { el: indexEl, delay: 0, y: 16, opacity: [0, 1] },
      { el: eyebrowEl, delay: 0.05, y: 12, opacity: [0, 1] },
      { el: mediaEl, delay: 0.08, y: 20, opacity: [0, 1] },
      { el: nameEl, delay: 0.12, y: 16, opacity: [0, 1] },
      { el: taglineEl, delay: 0.16, y: 12, opacity: [0, 1] },
      { el: metaEl, delay: 0.18, y: 8, opacity: [0, 1] },
      { el: descEl, delay: 0.22, y: 12, opacity: [0, 1] },
      ...stackItems.map((item, i) => ({ el: item, delay: 0.26 + i * 0.05, y: 10, opacity: [0, 1] })),
      ...linkEls.map((link, i) => ({ el: link, delay: 0.26 + stackItems.length * 0.05 + i * 0.05, y: 10, opacity: [0, 1] })),
    ];

    inView(row, () => {
      sequence.forEach(({ el, delay, y, opacity }) => {
        if (!el) return;
        const keyframes = opacity ? { opacity, y: [y, 0] } : { y: [y, 0] };
        play(el, keyframes, {
          duration: 0.6,
          ease: 'easeOut',
          delay: delay + rowIndex * 0.03, // slight row stagger
        });
      });
    }, { margin: '-15% 0px', amount: 0.1 });
  });
}