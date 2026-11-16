/**
 * hero-instrument.js — the canvas half of the scanning instrument.
 *
 * Inspiration 1: a faceted specimen rotating inside a framed panel while a
 * scan line sweeps through it. Inspiration 2: a point cloud inside a wireframe
 * cage. The object is monochrome; the only colour on the page is the lime scan
 * plane and what it lights up as it passes.
 *
 * GATE 7 revision: this scene used to render through Three.js, which cost a
 * 132 kB gzipped lazy chunk — over half the JS budget by itself. It is now a
 * hand-rolled 2-D canvas projection (~5 kB): the same displaced icosahedron,
 * the same cage, the same scan plane, driven by the same state values. The
 * layering contract is unchanged: GSAP owns every scroll-scrubbed value — the
 * scan height, the camera push, the rotation offset. This module only owns the
 * render loop and object spin.
 *
 * The stage is still decorative: no canvas context, no instrument — the HUD
 * still renders and the hero still reads.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isReducedMotion, onReducedMotionChange } from './motion-core.js';

gsap.registerPlugin(ScrollTrigger);

const POINT_RADIUS = 1.15;
const SCAN_FROM = -1.95;
const SCAN_TO = 1.95;
const CAGE = 3.4;
const FOV_DEG = 34;      // matches the old PerspectiveCamera
const BASE_CAM_Z = 6;
const DUST_COUNT = 320;
const DUST_SPREAD = { x: 10, y: 6, z: 6, zOffset: -1 };
const SCAN_WIDTH = 0.34;

/* ---------------------------------------------------------------- *
 * Geometry: a displaced icosahedron, same shape as the old
 * THREE.IcosahedronGeometry(POINT_RADIUS, 4) + the same 3-term
 * sine displacement the old vertex loop applied.
 * ---------------------------------------------------------------- */

function buildSpecimen() {
  const t = (1 + Math.sqrt(5)) / 2;
  const base = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].map((v) => normalize(v, 1));
  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];

  // four rounds of midpoint subdivision, projected back onto the sphere
  let verts = base;
  let tris = faces;
  const cache = new Map();
  const midpoint = (a, b) => {
    const key = a < b ? `${a}_${b}` : `${b}_${a}`;
    let idx = cache.get(key);
    if (idx !== undefined) return idx;
    const va = verts[a]; const vb = verts[b];
    const m = normalize([(va[0] + vb[0]) / 2, (va[1] + vb[1]) / 2, (va[2] + vb[2]) / 2], 1);
    idx = verts.length;
    verts.push(m);
    cache.set(key, idx);
    return idx;
  };
  for (let round = 0; round < 4; round++) {
    const next = [];
    for (const [a, b, c] of tris) {
      const ab = midpoint(a, b);
      const bc = midpoint(b, c);
      const ca = midpoint(c, a);
      next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    tris = next;
  }

  // displace + scale into a flat xyz buffer (the GLSL/JS loop from the
  // Three.js version, transcribed exactly)
  const out = new Float32Array(verts.length * 3);
  for (let i = 0; i < verts.length; i++) {
    const n = verts[i];
    const displacement =
      0.2 * Math.sin(n[0] * 5.1 + n[1] * 3.7) +
      0.13 * Math.sin(n[1] * 8.3 - n[2] * 6.1) +
      0.08 * Math.sin(n[2] * 13.7 + n[0] * 9.3);
    const k = 1 + displacement;
    out[i * 3] = n[0] * k * POINT_RADIUS;
    out[i * 3 + 1] = n[1] * k * POINT_RADIUS;
    out[i * 3 + 2] = n[2] * k * POINT_RADIUS;
  }
  return out;
}

function normalize(v, scale) {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [(v[0] / len) * scale, (v[1] / len) * scale, (v[2] / len) * scale];
}

/* cage: 12 edges of a CAGE-sized box, as index pairs into the 8 corners */
const CAGE_CORNERS = [];
for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
  CAGE_CORNERS.push([sx * CAGE / 2, sy * CAGE / 2, sz * CAGE / 2]);
}
const CAGE_EDGES = [
  [0, 1], [2, 3], [4, 5], [6, 7],
  [0, 2], [1, 3], [4, 6], [5, 7],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

/* dust field (insp 1: motes drifting in the panel) */
const DUST = new Float32Array(DUST_COUNT * 3);
for (let i = 0; i < DUST_COUNT; i++) {
  DUST[i * 3] = (Math.random() - 0.5) * DUST_SPREAD.x;
  DUST[i * 3 + 1] = (Math.random() - 0.5) * DUST_SPREAD.y;
  DUST[i * 3 + 2] = (Math.random() - 0.5) * DUST_SPREAD.z + DUST_SPREAD.zOffset;
}

/* a soft round sprite so points glow instead of reading as hard squares */
function makeSprite(rgb) {
  const size = 32;
  const cv = document.createElement('canvas');
  cv.width = size;
  cv.height = size;
  const c2 = cv.getContext('2d');
  const grad = c2.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.42, `rgba(${rgb},0.55)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  c2.fillStyle = grad;
  c2.fillRect(0, 0, size, size);
  return cv;
}

/**
 * Builds the scene and wires it to scroll. Returns a destroy() for cleanup.
 * `hud` is the DOM instrument's api (from hud.js) — scan state is mirrored
 * onto the tick scale so the frame and the object stay in sync.
 */
export function initHeroInstrument(hud) {
  const stage = document.querySelector('[data-hero-stage]');
  const canvas = document.querySelector('[data-hero-canvas]');
  if (!stage || !canvas) return noop;

  const reduced = isReducedMotion();

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    stage.classList.add('is-nogl');
    hud.setState('Static');
    return noop;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  const specimen = buildSpecimen();
  const pointCount = specimen.length / 3;
  const spriteWhite = makeSprite('238,241,230');
  const spriteLime = makeSprite('200,245,66');

  const state = { scan: reduced ? 0 : SCAN_FROM, camZ: BASE_CAM_Z, rot: 0 };

  function resize() {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  /* ---- scroll: GSAP owns the scrubbed values (layering contract) ---- */

  let scrubTween = null;
  if (!reduced) {
    scrubTween = gsap.to(state, {
      scan: SCAN_TO,
      camZ: BASE_CAM_Z - 0.7,
      rot: 0.55,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => hud.setScanProgress(self.progress),
      },
    });
  } else {
    hud.setScanProgress(0.5);
  }

  /* ---- loop ---- */

  let running = false;
  let rafId = 0;
  let inView = true;
  let elapsed = 0;
  let last = performance.now();

  function applyFrame() {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) resize();

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // camera: the old PerspectiveCamera(34, aspect) at state.camZ, pulled
    // further back on narrow frames so the specimen is never cropped
    const aspect = width / height;
    const camZ = state.camZ * Math.min(Math.max(1.7 / aspect, 1), 2.4);
    const focal = (height / 2) / Math.tan((FOV_DEG * Math.PI) / 360);
    const cx = width / 2;
    const cy = height / 2;

    // group rotation: slow Y spin + a hint of X wobble (as before)
    const rotY = elapsed * 0.12 + state.rot;
    const rotX = Math.sin(elapsed * 0.15) * 0.05;
    const cosY = Math.cos(rotY); const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX); const sinX = Math.sin(rotX);

    /*
     * The projection writes scalars into `out` (screen x, screen y, view z)
     * and returns 0 when the point is behind the camera. No allocations in
     * the hot loop — that was costing ~4 ms/frame of GC at 2.5 k points.
     * Ry then Rx; the wobble is ±0.05 rad, order is imperceptible.
     */
    const out = projOut;
    const project = (x, y, z) => {
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      const viewZ = camZ - z2;
      if (viewZ < 0.1) return 0;
      const s = focal / viewZ;
      out[0] = cx + x1 * s;
      out[1] = cy - y2 * s;
      out[2] = viewZ;
      return 1;
    };

    /* ---- the scan plane: a hairline of light sweeping the cage ----
     *
     * The plane brightens with how far the scrubbed scan moved since the
     * last rendered frame — same 0.28 → 0.60 opacity swing as the old
     * shader-driven version.
     */

    const planeOpacity = 0.28 + Math.min(Math.abs(state.scan - lastScan) * 22, 0.32);
    lastScan = state.scan;

    const py = state.scan;
    const quad = quadOut;
    let quadOk = 1;
    for (let i = 0; i < 4; i++) {
      const qx = i % 2 === 0 ? -CAGE / 2 : CAGE / 2;
      const qz = i < 2 ? -CAGE / 2 : CAGE / 2;
      quadOk &= project(qx, py, qz);
      quad[i * 2] = out[0];
      quad[i * 2 + 1] = out[1];
    }
    if (quadOk) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = planeOpacity;
      ctx.fillStyle = '#c8f542';
      ctx.beginPath();
      ctx.moveTo(quad[0], quad[1]);
      ctx.lineTo(quad[2], quad[3]);
      ctx.lineTo(quad[4], quad[5]);
      ctx.lineTo(quad[6], quad[7]);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    /* ---- wireframe cage (insp 2) ---- */

    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#eef1e6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const corners = cornersOut;
    for (let i = 0; i < 8; i++) {
      const c = CAGE_CORNERS[i];
      if (!project(c[0], c[1], c[2])) { corners[i * 3 + 2] = 0; continue; }
      corners[i * 3] = out[0];
      corners[i * 3 + 1] = out[1];
      corners[i * 3 + 2] = 1;
    }
    for (let e = 0; e < CAGE_EDGES.length; e++) {
      const a = CAGE_EDGES[e][0] * 3;
      const b = CAGE_EDGES[e][1] * 3;
      if (!corners[a + 2] || !corners[b + 2]) continue;
      ctx.moveTo(corners[a], corners[a + 1]);
      ctx.lineTo(corners[b], corners[b + 1]);
    }
    ctx.stroke();
    ctx.restore();

    /* ---- dust (insp 1) ---- */

    ctx.save();
    const dustRotY = -elapsed * 0.02;
    const dCosY = Math.cos(dustRotY); const dSinY = Math.sin(dustRotY);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#eef1e6';
    ctx.beginPath();
    for (let i = 0; i < DUST_COUNT; i++) {
      const x = DUST[i * 3]; const y = DUST[i * 3 + 1]; const z = DUST[i * 3 + 2];
      if (!project(x * dCosY + z * dSinY, y, -x * dSinY + z * dCosY)) continue;
      ctx.rect(out[0], out[1], 1, 1);
    }
    ctx.fill();
    ctx.restore();

    /* ---- the specimen: points, lime where the scan passes ----
     *
     * Points are bucketed into one white and one lime set so the canvas
     * state changes twice per frame instead of 2.5 k times.
     */

    const whitePts = whiteBucket;
    const limePts = limeBucket;
    let nw = 0; let nl = 0;
    for (let i = 0; i < pointCount; i++) {
      const x = specimen[i * 3];
      const objectY = specimen[i * 3 + 1];
      const z = specimen[i * 3 + 2];
      if (!project(x, objectY, z)) continue;
      const band = 1 - Math.min(Math.abs(objectY - state.scan) / SCAN_WIDTH, 1);
      const depth = Math.max(0.25, Math.min(1 - (out[2] - 3) / 8, 1));
      const alpha = (0.3 + band * 0.7) * depth;
      if (alpha < 0.04) continue;
      const size = 4.5 * (1 + band * 1.5) * (6 / out[2]);
      const entry = nl * 4;
      if (band > 0.02) {
        limePts[entry] = out[0]; limePts[entry + 1] = out[1];
        limePts[entry + 2] = size; limePts[entry + 3] = alpha;
        nl++;
      } else {
        whitePts[entry] = out[0]; whitePts[entry + 1] = out[1];
        whitePts[entry + 2] = size; whitePts[entry + 3] = alpha;
        nw++;
      }
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < nw; i++) {
      const o = i * 4;
      ctx.globalAlpha = whitePts[o + 3];
      const s = whitePts[o + 2];
      ctx.drawImage(spriteWhite, whitePts[o] - s / 2, whitePts[o + 1] - s / 2, s, s);
    }
    for (let i = 0; i < nl; i++) {
      const o = i * 4;
      ctx.globalAlpha = limePts[o + 3];
      const s = limePts[o + 2];
      ctx.drawImage(spriteLime, limePts[o] - s / 2, limePts[o + 1] - s / 2, s, s);
    }
    ctx.restore();
  }

  // the scan value most recently rendered — the plane-opacity velocity
  // proxy above reads it.
  let lastScan = reduced ? 0 : SCAN_FROM;

  // scratch buffers for the frame loop (see applyFrame)
  const projOut = new Float64Array(3);
  const quadOut = new Float64Array(8);
  const cornersOut = new Float64Array(24);
  const whiteBucket = new Float64Array(pointCount * 4);
  const limeBucket = new Float64Array(pointCount * 4);

  function loop(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;
    applyFrame();
    rafId = requestAnimationFrame(loop);
  }

  function sync() {
    const should =
      !reduced && inView && document.visibilityState === 'visible' && !document.hidden;
    if (should && !running) {
      running = true;
      last = performance.now();
      hud.setState('Scanning');
      rafId = requestAnimationFrame(loop);
    } else if (!should && running) {
      running = false;
      cancelAnimationFrame(rafId);
      hud.setState(reduced ? 'Static' : 'Parked');
    }
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      sync();
    },
    { rootMargin: '120px' }
  );
  io.observe(stage);

  const onVisibility = () => sync();
  document.addEventListener('visibilitychange', onVisibility);
  const offReduced = onReducedMotionChange(() => {
    applyFrame();
    sync();
  });

  // first frame immediately, before any rAF settles — reduced motion gets
  // the same static instrument, it just never spins.
  applyFrame();
  stage.classList.add('is-live');
  if (reduced) {
    hud.setState('Static');
  } else {
    sync();
  }

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    offReduced();
    resizeObserver.disconnect();
    scrubTween?.scrollTrigger?.kill();
    scrubTween?.kill();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}

function noop() {}
