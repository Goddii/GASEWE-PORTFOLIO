/**
 * verify-figures.cjs — GATE 10 (The Traveler, D5/D7) + GATE 9 (The Rider, insp7)
 *
 * Supersedes GATE 8: the v3 band runner is retired (runner.js / runner.css
 * removed), so its band checks are replaced by traveler checks. The GATE 9
 * dial-rider regression checks are untouched.
 *
 * Drives headless Chrome over CDP (raw `ws` client + Chrome launched by
 * hand — no puppeteer/chrome-launcher in this project) against
 * `vite preview`. Same methodology as Gates 0–9: reduced motion is emulated
 * via CDP `Emulation.setEmulatedMedia` (--force-prefers-reduced-motion is
 * ignored by Chrome headless).
 *
 * A repaint counter is injected before navigation
 * (Page.addScriptToEvaluateOnNewDocument wraps clearRect, filtered to the
 * traveler canvas) so "zero repaint at rest" is measured, not inferred.
 *
 * Usage: node scripts/verify-figures.cjs           dist checks + full gate (GATE 10 + 9)
 *        node scripts/verify-figures.cjs mobile    375 px mobile pass appended
 *        (expects `npm run preview` on :4173; `npm run build` already run)
 */

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const { spawn } = require('child_process');

const URL = 'http://localhost:4173/';
const DIST = path.join(__dirname, '..', 'dist');
const ATLAS_REL = path.join('assets', 'figures', 'run-atlas.png');
const ATLAS_MAX_B = 200 * 1000; // D7: ship ≤ 200 KB
const JS_GZ_MAX_B = 200 * 1024; // budget: JS ≤ 200 kB gz
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve(JSON.parse(data)));
      })
      .on('error', reject);
  });
}

/** Launch headless Chrome ourselves and read the port it picks (port 0 →
 *  DevToolsActivePort file). Avoids any npm dependency for the gate. */
async function launchChrome() {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gate-chrome-'));
  const proc = spawn(
    'google-chrome',
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--remote-debugging-port=0',
      `--user-data-dir=${userDataDir}`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );
  const portFile = path.join(userDataDir, 'DevToolsActivePort');
  for (let i = 0; i < 100; i++) {
    await sleep(100);
    if (fs.existsSync(portFile)) {
      const port = parseInt(fs.readFileSync(portFile, 'utf8').split('\n')[0], 10);
      if (port) {
        return {
          port,
          kill: () => {
            try {
              proc.kill('SIGTERM');
              // SIGTERM can race Chrome's own shutdown on a loaded host —
              // make sure nothing lingers into the next run
              setTimeout(() => {
                try {
                  proc.kill('SIGKILL');
                } catch {}
              }, 800).unref?.();
            } catch {}
            try {
              fs.rmSync(userDataDir, { recursive: true, force: true });
            } catch {
              /* Chrome may still be flushing its profile — best effort */
            }
          },
        };
      }
    }
  }
  throw new Error('Chrome did not report a debugging port');
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

async function main() {
  const results = [];
  const check = (name, ok, detail = '') => {
    results.push({ name, ok, detail });
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  };

  // ---------- dist checks (static, no browser) ----------
  {
    const exists = fs.existsSync(DIST);
    check('dist exists (npm run build already run)', exists);
    if (exists) {
      const files = walk(DIST);
      const forbidden = files.filter((f) => /\.(glb|zip)$/i.test(f));
      check(
        'dist contains zero .glb/.zip (3.83 MB model fix)',
        forbidden.length === 0,
        forbidden.map((f) => path.basename(f)).join(', ') || `${files.length} files`
      );
      const atlas = path.join(DIST, ATLAS_REL);
      const hasAtlas = fs.existsSync(atlas);
      check('run-atlas.png ships in dist/assets/figures/', hasAtlas);
      if (hasAtlas) {
        const size = fs.statSync(atlas).size;
        check(
          `run-atlas.png ≤ 200 KB (D7 ship budget)`,
          size <= ATLAS_MAX_B,
          `${size} B`
        );
      }
      const js = files.filter((f) => f.endsWith('.js'));
      const gzTotal = js.reduce((s, f) => s + zlib.gzipSync(fs.readFileSync(f)).length, 0);
      check(
        'JS bundle ≤ 200 kB gz',
        gzTotal <= JS_GZ_MAX_B,
        `${(gzTotal / 1024).toFixed(1)} kB gz across ${js.length} file(s)`
      );
    }
  }

  const chrome = await launchChrome();
  process.on('exit', () => chrome.kill());
  const targets = await getJson(`http://127.0.0.1:${chrome.port}/json`);
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl, {
    perMessageDeflate: false,
    maxPayload: 256 * 1024 * 1024,
  });
  await new Promise((r) => ws.on('open', r));

  let id = 0;
  const pending = new Map();
  const consoleErrors = [];
  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
    } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
    } else if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(
        'EXCEPTION: ' +
          (msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text)
      );
    }
  });
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const mid = ++id;
      pending.set(mid, { res, rej });
      ws.send(JSON.stringify({ id: mid, method, params }));
    });
  const evalJs = async (expression, awaitPromise = false) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise });
    if (r.exceptionDetails) throw new Error('eval failed: ' + JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };

  await send('Page.enable');
  await send('Runtime.enable');

  // repaint counter: wraps clearRect, counted only for the traveler canvas.
  // Injected before navigation, so every document carries it.
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `(() => {
      const orig = CanvasRenderingContext2D.prototype.clearRect;
      CanvasRenderingContext2D.prototype.clearRect = function (...a) {
        try {
          if (this.canvas && this.canvas.matches('[data-traveler-canvas]')) {
            window.__tClear = (window.__tClear || 0) + 1;
          }
        } catch {}
        return orig.apply(this, a);
      };
    })();`,
  });

  // canvas probe: ink centroid, ink count, rightmost pixel, lime (energised)
  // pixel count, and ink above the figure inside the gutter column (ribbon /
  // ground-glow trail). `side` picks the gutter so mobile probes its column.
  const probe = (side) =>
    `(() => {
    const c = document.querySelector('[data-traveler-canvas]');
    if (!c || !c.width) return null;
    const W = c.width, H = c.height;
    const d = c.getContext('2d').getImageData(0, 0, W, H).data;
    let sx = 0, sy = 0, n = 0, maxX = -1, lime = 0;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
      // getImageData is UN-premultiplied: a faint glow pixel (a=9) reports
      // full-brightness RGB while being visually invisible. Gate on alpha so
      // "ink" means visible ink (glow ≤ 23, ribbon halo ≤ 30, sprite ≥ 74).
      if (a > 40 && r + g + b > 90) {
        const p = i / 4, x = p % W, y = (p / W) | 0;
        sx += x; sy += y; n++;
        if (x > maxX) maxX = x;
        if (g > b + 80 && g > r + 10) lime++;
      }
    }
    const cx = n ? sx / n : -1, cy = n ? sy / n : -1;
    let above = 0;
    if (n) {
      const x0 = ${side === 'left' ? '0' : '((W * 0.85) | 0)'};
      const x1 = ${side === 'left' ? '((W * 0.25) | 0)' : 'W'};
      const yTop = Math.max(0, (cy - 130) | 0), yBot = Math.max(0, (cy - 24) | 0);
      for (let y = yTop; y < yBot; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * W + x) * 4;
          if (d[i + 3] > 40 && d[i] + d[i + 1] + d[i + 2] > 90) above++;
        }
      }
    }
    return { n, cx, cy, maxX, lime, above, W, H };
  })()`;

  async function load(reduced) {
    // `media` emulates a media *type* (print/screen) — reduced motion is a
    // media *feature* and must go through `features`, or matchMedia never
    // reports `reduce`.
    await send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : '' }],
    });
    await send('Page.navigate', { url: URL });
    for (let i = 0; i < 40; i++) {
      await sleep(250);
      const ready = await evalJs(
        `document.readyState === 'complete' && !!document.querySelector('[data-traveler-canvas]')`
      );
      if (ready) break;
    }
    await sleep(1200); // let the entrance settle
  }

  const scrollTo = async (frac) => {
    await evalJs(
      `window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) * ${frac})`
    );
  };
  // settle the page before any measurement: project images are
  // loading="lazy", so the first scroll pass decodes them and ScrollTrigger
  // refreshes its progress mapping. Measuring fractions against an unsettled
  // doc skews the journey-mapping check.
  const settlePage = async () => {
    await evalJs(`(async () => {
      const H = () => document.documentElement.scrollHeight - window.innerHeight;
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      for (const f of [0.35, 0.7, 1]) { window.scrollTo(0, H() * f); await wait(450); }
      window.scrollTo(0, 0); await wait(600);
    })()`, true);
    await sleep(400);
  };
  // scroll, then wait until the scrub lerp has actually converged (cy stable
  // across two probes) — the 0.12 lerp tail otherwise skews early reads
  const cyAt = async (frac) => {
    await scrollTo(frac);
    let prev = null;
    for (let i = 0; i < 5; i++) {
      await sleep(900);
      const p = await evalJs(probe('right'));
      if (prev !== null && p && Math.abs(p.cy - prev) < 2) return p;
      prev = p ? p.cy : null;
    }
    return await evalJs(probe('right'));
  };

  // ---------- normal mode (desktop metrics, deterministic) ----------
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await load(false);
  await settlePage();

  check(
    'traveler canvas bitmap equals its CSS box × dpr (≤ 1.5)',
    await evalJs(`(() => {
      const c = document.querySelector('[data-traveler-canvas]');
      if (!c) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      // the fixed box is the initial containing block: layout viewport
      // (documentElement.clientWidth), not window.innerWidth (includes the
      // classic scrollbar gutter)
      const de = document.documentElement;
      return c.clientWidth === de.clientWidth && c.clientHeight === de.clientHeight &&
        c.width === Math.round(c.clientWidth * dpr) &&
        c.height === Math.round(c.clientHeight * dpr) &&
        c.width > 500;
    })()`)
  );

  check(
    'run-atlas.png served (HEAD 200, non-empty)',
    await evalJs(
      `fetch('${ATLAS_REL.split(path.sep).join('/').replace('assets', 'assets')}', { method: 'HEAD' })
        .then((r) => r.ok && Number(r.headers.get('content-length')) > 1000)
        .catch(() => false)`,
      true
    )
  );

  const mid = await cyAt(0.5);
  check('figure drawn mid-journey (ink pixels on canvas)', mid && mid.n > 300, `n=${mid && mid.n}`);
  check(
    'x inside the right gutter',
    mid && mid.cx > mid.W * 0.85,
    `cx=${mid && mid.cx | 0} of W=${mid && mid.W}`
  );
  check(
    'sprite not clipped at the viewport edge',
    mid && mid.maxX < mid.W - 4,
    `maxX=${mid && mid.maxX | 0} of W=${mid && mid.W}`
  );

  // run cycle actually plays: under a steady scroll the sprite frame advances,
  // so the ink count changes; a sliding (single-frame) figure would keep it
  // near-constant. Also captures the energised lime state and the ribbon.
  await evalJs(`window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) * 0.55)`);
  await sleep(200);
  const s1 = await evalJs(probe('right'));
  await evalJs(`(() => {
    let t = performance.now();
    const tick = () => { window.scrollBy(0, 3); if (performance.now() - t < 500) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  })()`);
  await sleep(450);
  const s2 = await evalJs(probe('right'));
  check(
    'phase cycles with scroll (runs, does not slide)',
    s1 && s2 && Math.abs(s2.n - s1.n) > 20 && s2.cy > s1.cy + 5,
    `ink ${s1 && s1.n} → ${s2 && s2.n}, cy ${s1 && s1.cy | 0} → ${s2 && s2.cy | 0}`
  );
  check('energised (lime) while scrolling', s2 && s2.lime > 150, `lime=${s2 && s2.lime}`);
  check(
    'ribbon / ground trail above the figure in the gutter column',
    s2 && s2.above > 5,
    `trail px=${s2 && s2.above}`
  );

  // journey y maps to page progress at 25 / 50 / 75 %
  const q1 = await cyAt(0.25);
  const q3 = await cyAt(0.75);
  const step1 = mid.cy - q1.cy;
  const step2 = q3.cy - mid.cy;
  check(
    'journey y maps to page progress (monotonic, ~linear at 25/50/75 %)',
    q1.cy < mid.cy && mid.cy < q3.cy && Math.abs(step1 - step2) < step1 * 0.25 + 20,
    `cy ${q1.cy | 0} → ${mid.cy | 0} → ${q3.cy | 0} (steps ${step1 | 0}/${step2 | 0} px)`
  );

  // bidirectional scrub: scrolling back up returns the figure
  const q1b = await cyAt(0.25);
  check(
    'scrub reverses on scroll-up',
    Math.abs(q1b.cy - q1.cy) < 60,
    `cy ${q1.cy | 0} → ${q1b.cy | 0}`
  );

  // arrival fade: last 3 % of the journey dissolves the figure
  await scrollTo(1);
  await sleep(2000); // settle + ribbon dissolve
  const end = await evalJs(probe('right'));
  check(
    'arrival fade fires in the last 3 % of the journey',
    end && end.n < mid.n * 0.05,
    `ink ${end && end.n} at bottom vs ${mid.n} mid-page`
  );

  // one-filament at rest: lime has fully decayed once the ribbon dissolves
  await cyAt(0.5);
  await sleep(600);
  const rest = await evalJs(probe('right'));
  check(
    'at rest: white, energise decayed (lime ≈ 0)',
    rest && rest.lime < Math.max(30, (s2 ? s2.lime : 0) * 0.1),
    `lime ${rest && rest.lime} at rest vs ${s2 && s2.lime} scrolling`
  );

  // zero repaint at rest (measured via the injected clearRect counter)
  await sleep(600);
  const c1 = await evalJs(`window.__tClear || 0`);
  await sleep(800);
  const c2 = await evalJs(`window.__tClear || 0`);
  check('zero repaint at rest (dirty-frame skip parks the loop)', c2 === c1, `clearRect ${c1} → ${c2}`);

  // fps while visible AND actively scrubbing (the loop must keep repainting)
  const fpsProbe = `(new Promise((res) => {
    let f = 0; const t0 = performance.now();
    const tick = () => {
      f++;
      window.scrollBy(0, 4);
      if (performance.now() - t0 < 2000) requestAnimationFrame(tick);
      else res(f / ((performance.now() - t0) / 1000));
    };
    requestAnimationFrame(tick);
  }))`;
  // Median of 3 scrub samples after an untimed warmup pass (first frames
  // after a fresh scroll settle are unrepresentative). This host runs under
  // desktop load ~5, so a single 2 s rAF window drifts.
  await scrollTo(0.4);
  await evalJs(fpsProbe, true); // warmup, not recorded
  const samples = [];
  for (let s = 0; s < 3; s++) {
    await scrollTo(0.4);
    await sleep(250);
    samples.push(await evalJs(fpsProbe, true));
  }
  const fps = [...samples].sort((a, b) => a - b)[1];
  check(
    '60 fps while scrubbing (median of 3 samples)',
    fps > 55,
    `median ${fps.toFixed(1)} fps (samples ${samples.map((f) => f.toFixed(1)).join(', ')})`
  );

  // elementFromPoint must never land on the traveler (pointer-events: none).
  // Each target is scrolled into view first — elementFromPoint is
  // viewport-relative and returns null for off-screen points.
  const efpDetail = await evalJs(`(async () => {
    const sels = [
      '.hero__name', '.section-head__title', '.project-list > *',
      '.timeline__title', '.contact__title', '.site-footer__meta',
    ];
    const bad = [];
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    for (const sel of sels) {
      const el = document.querySelector(sel);
      if (!el) { bad.push(sel + ':missing'); continue; }
      el.scrollIntoView({ block: 'center' });
      await wait(120); // let Lenis/ScrollTrigger settle the jump
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) { bad.push(sel + ':zero-rect'); continue; }
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (!hit || hit.closest('[data-traveler]')) bad.push(sel + ':' + (hit ? hit.className || hit.tagName : 'null'));
    }
    return bad.length ? bad.join(', ') : 'ok';
  })()`, true);
  check(
    'elementFromPoint at content centres returns content, never the canvas',
    efpDetail === 'ok',
    efpDetail === 'ok' ? '' : efpDetail
  );

  // ---------- GATE 9: dial rider regression (untouched) ----------
  const aboutTop = await evalJs(`document.querySelector('.about').getBoundingClientRect().top + window.scrollY`);
  await evalJs(`window.scrollTo(0, ${aboutTop} - window.innerHeight * 0.6)`);
  await sleep(500);
  const rider1 = await evalJs(`document.querySelector('[data-dial-rider]').getAttribute('transform')`);
  await evalJs(`window.scrollTo(0, ${aboutTop} - window.innerHeight * 0.25)`);
  await sleep(500);
  const rider2 = await evalJs(`document.querySelector('[data-dial-rider]').getAttribute('transform')`);
  check('rider tracks the needle with lag', rider1 !== rider2 && /translate\(\d/.test(rider2), `${rider1} → ${rider2}`);
  check(
    'rider legs swing with the sweep',
    /rotate\(-?\d/.test(await evalJs(`document.querySelector('[data-rider-leg-l]').getAttribute('transform') || ''`)),
    await evalJs(`document.querySelector('[data-rider-leg-l]').getAttribute('transform') || 'none'`)
  );
  check('rider energised with active arc', await evalJs(`document.querySelector('[data-dial-rider]').classList.contains('energised')`));

  // ---------- 375 px mobile pass (Emulation.setDeviceMetricsOverride) ----------
  if (process.argv[2] === 'mobile') {
    const mobileErrorsBefore = consoleErrors.length;
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true,
      screenWidth: 375,
      screenHeight: 812,
      scale: 1,
    });
    await load(false);
    await settlePage();
    // Layout width is documentElement.clientWidth — window.innerWidth also
    // carries the emulated scrollbar gutter under mobile emulation.
    const vcw = await evalJs(`document.documentElement.clientWidth`);
    check('[375] layout viewport applied', vcw === 375, `clientW=${vcw}`);
    check(
      '[375] canvas sized (dpr capped at 1.5)',
      await evalJs(`(() => {
        const c = document.querySelector('[data-traveler-canvas]');
        return c && c.clientWidth === 375 && c.width >= 550 && c.width <= 575;
      })()`)
    );
    const m1 = await cyAt(0.3);
    check('[375] figure drawn', m1 && m1.n > 150, `n=${m1 && m1.n}`);
    check(
      '[375] figure rides the LEFT gutter (small + dim)',
      m1 && m1.cx < m1.W * 0.25,
      `cx=${m1 && m1.cx | 0} of W=${m1 && m1.W}`
    );
    const m2 = await cyAt(0.7);
    check(
      '[375] journey maps to page progress',
      m2 && m1 && m2.cy > m1.cy + 100,
      `cy ${m1 && m1.cy | 0} → ${m2 && m2.cy | 0}`
    );
    check(
      '[375] no console errors (mobile run)',
      consoleErrors.length === mobileErrorsBefore,
      consoleErrors.slice(mobileErrorsBefore).slice(0, 2).join(' | ')
    );

    const failedMobile = results.filter((r) => !r.ok);
    console.log(`\n${results.length - failedMobile.length}/${results.length} mobile checks passed`);
    ws.close();
    chrome.kill();
    process.exit(failedMobile.length ? 1 : 0);
  }

  // ---------- reduced motion ----------
  await load(true);
  check(
    '[reduced] static class set (no loop)',
    await evalJs(`document.querySelector('[data-traveler]').classList.contains('is-static')`)
  );
  const pReduced = await evalJs(probe('right'));
  check('[reduced] one static mid-journey frame drawn', pReduced && pReduced.n > 300, `n=${pReduced && pReduced.n}`);
  const r1 = await evalJs(`window.__tClear || 0`);
  await scrollTo(0.8);
  await sleep(700);
  const r2 = await evalJs(`window.__tClear || 0`);
  check('[reduced] scrolling repaints nothing (no loop at all)', r2 === r1, `clearRect ${r1} → ${r2}`);
  check(
    "[reduced] rider parked at 12 o'clock",
    (await evalJs(`document.querySelector('[data-dial-rider]').getAttribute('transform')`)) === 'translate(110 34)',
    await evalJs(`document.querySelector('[data-dial-rider]').getAttribute('transform')`)
  );
  check(
    '[reduced] no hidden content at a section',
    await evalJs(`(() => {
      const els = [...document.querySelectorAll('.origin, .systemmap__graph, .timeline__item, .contact__links')];
      return els.every((el) => getComputedStyle(el).opacity !== '0' && getComputedStyle(el).visibility !== 'hidden');
    })()`)
  );

  // ---------- no-JS: origin landmark + rail must render without JS ----------
  await send('Emulation.setScriptExecutionDisabled', { value: true });
  await send('Page.navigate', { url: URL });
  await sleep(1200);
  check(
    '[no-js] origin landmark (label + floor hairline) renders without JS',
    await evalJs(`(() => {
      const floor = document.querySelector('.origin__floor');
      const label = document.querySelector('.origin__label');
      if (!floor || !label) return false;
      const f = getComputedStyle(floor);
      return f.display !== 'none' && floor.getBoundingClientRect().height >= 1 &&
        label.textContent.includes('track 00 — origin');
    })()`)
  );
  check(
    '[no-js] journey rail renders alone (canvas additive)',
    await evalJs(`(() => {
      const rail = document.querySelector('.traveler__rail');
      if (!rail) return false;
      const r = rail.getBoundingClientRect();
      return getComputedStyle(rail).display !== 'none' && r.height > 100;
    })()`)
  );
  await send('Emulation.setScriptExecutionDisabled', { value: false });

  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  ws.close();
  chrome.kill();
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
