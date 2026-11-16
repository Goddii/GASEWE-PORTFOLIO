/**
 * bake-run.cjs — build-time run-cycle bake (D7, decision A2).
 *
 * Serves the repo with a throwaway `vite` dev server (bare `three` /
 * `three/addons` imports resolve there; /refs/... is served from the
 * project root), drives bake/bake.html in headless Chrome over CDP
 * (raw `ws` client + Chrome launched by hand — same pattern as
 * verify-figures.cjs, no puppeteer), then writes:
 *
 *   public/assets/figures/run-atlas.png   the baked sprite strip
 *   src/data/runAtlas.js                  module metadata for the runtime
 *
 * three.js is a devDependency used ONLY by this script's page — the
 * runtime stays plain 2-D canvas and the JS budget is untouched.
 * Sources are CC0 (Quaternius Universal Base Characters + Universal
 * Animation Library, `Jog_Fwd_Loop`).
 *
 * Usage: node scripts/bake-run.cjs
 */

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 5199;
const BASE = `http://127.0.0.1:${PORT}`;
const PAGE = `${BASE}/bake/bake.html`;
const ROOT = path.resolve(__dirname, '..');
const OUT_PNG = path.join(ROOT, 'public/assets/figures/run-atlas.png');
const OUT_JS = path.join(ROOT, 'src/data/runAtlas.js');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

/** Any HTTP answer at all counts as "server up" (vite's / returns HTML). */
function probe(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startVite() {
  const proc = spawn(
    'node',
    [path.join(ROOT, 'node_modules/vite/bin/vite.js'), '--port', String(PORT), '--strictPort'],
    { cwd: ROOT, stdio: 'ignore' }
  );
  for (let i = 0; i < 80; i++) {
    await sleep(250);
    if (await probe(`${BASE}/`)) {
      return {
        kill: () => {
          try {
            proc.kill('SIGTERM');
          } catch {}
        },
      };
    }
  }
  proc.kill('SIGKILL');
  throw new Error('vite dev server did not start');
}

async function launchChrome() {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bake-chrome-'));
  const proc = spawn(
    'google-chrome',
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--enable-unsafe-swiftshader', // software WebGL in headless (Chrome >= 137 gates it)
      '--use-angle=swiftshader',
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
              setTimeout(() => {
                try {
                  proc.kill('SIGKILL');
                } catch {}
              }, 800).unref?.();
            } catch {}
            try {
              fs.rmSync(userDataDir, { recursive: true, force: true });
            } catch {}
          },
        };
      }
    }
  }
  throw new Error('Chrome did not report a debugging port');
}

async function main() {
  const vite = await startVite();
  const chrome = await launchChrome();
  process.on('exit', () => {
    chrome.kill();
    vite.kill();
  });

  const targets = await getJson(`http://127.0.0.1:${chrome.port}/json`);
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl, {
    perMessageDeflate: false,
    maxPayload: 512 * 1024 * 1024, // the atlas dataURL is tens of MB of base64
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
  const evalJs = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true });
    if (r.exceptionDetails) {
      throw new Error('eval failed: ' + JSON.stringify(r.exceptionDetails));
    }
    return r.result.value;
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: PAGE });

  // ---- wait for the bake to finish (or fail) ----
  let bake = null;
  for (let i = 0; i < 240; i++) {
    await sleep(500);
    bake = await evalJs('window.__bake ? JSON.parse(JSON.stringify(window.__bake)) : null');
    if (bake && bake.done) break;
  }
  if (!bake || !bake.done) throw new Error('bake never reported done');
  if (bake.error) throw new Error('bake failed in page:\n' + bake.error);
  if (consoleErrors.length) {
    throw new Error('console errors during bake:\n' + consoleErrors.join('\n'));
  }

  // ---- validate: every frame inked, figure consistently framed in-cell ----
  const { frames, cellW, cellH, frameInk, bbox } = bake;
  const inked = frameInk.filter((n) => n > 500);
  if (inked.length !== frames) {
    throw new Error(
      `only ${inked.length}/${frames} frames carry ink (min ${Math.min(...frameInk)})`
    );
  }
  for (let i = 0; i < frames; i++) {
    if (bbox.x0[i] < 2 || bbox.x1[i] > cellW - 3 || bbox.y0[i] < 2 || bbox.y1[i] > cellH - 3) {
      throw new Error(
        `frame ${i} escapes its cell or touches the border: ` +
          `x[${bbox.x0[i]},${bbox.x1[i]}] y[${bbox.y0[i]},${bbox.y1[i]}] of ${cellW}x${cellH}`
      );
    }
  }
  const heights = frameInk.map((_, i) => bbox.y1[i] - bbox.y0[i]);
  const medH = [...heights].sort((a, b) => a - b)[frames >> 1];
  for (let i = 0; i < frames; i++) {
    if (Math.abs(heights[i] - medH) > medH * 0.12) {
      throw new Error(`frame ${i} height ${heights[i]} deviates > 12% from median ${medH}`);
    }
  }

  // ---- write PNG ----
  const b64 = bake.png.replace(/^data:image\/png;base64,/, '');
  const png = Buffer.from(b64, 'base64');
  fs.mkdirSync(path.dirname(OUT_PNG), { recursive: true });
  fs.writeFileSync(OUT_PNG, png);

  // ---- write the runtime metadata module ----
  const meta = [
    '/**',
    ' * runAtlas.js — GENERATED by scripts/bake-run.cjs. Do not edit by hand.',
    ' *',
    ' * Baked run cycle: Quaternius Universal Base Character (CC0) playing',
    ` * Universal Animation Library \`${bake.clipName}\` (CC0, ${frames} frames,`,
    ` * ${bake.duration.toFixed(3)} s cycle), rendered offline by three.js (a`,
    ' * devDependency — never shipped) into a grayscale sprite strip with',
    ' * alpha. Facing is baked screen-right; the runtime mirrors the strip',
    ' * when scrolling up.',
    ' */',
    'export const RUN_ATLAS = {',
    "  url: '/assets/figures/run-atlas.png',",
    `  frames: ${frames},`,
    `  cellW: ${cellW},`,
    `  cellH: ${cellH},`,
    '};',
    '',
  ].join('\n');
  fs.writeFileSync(OUT_JS, meta);

  // ---- report ----
  console.log('bake ok');
  console.log(`  clip        ${bake.clipName} (${bake.duration.toFixed(3)} s)`);
  console.log(`  frames      ${frames} @ ${cellW}x${cellH}`);
  console.log(`  facing      [${bake.facing.join(', ')}] (baked screen-right)`);
  console.log(
    `  ink/frame   min ${Math.min(...frameInk)} / max ${Math.max(...frameInk)} px`
  );
  console.log(`  atlas png   ${OUT_PNG.replace(ROOT + path.sep, '')} — ${png.length} B`);
  console.log(`  runtime js  ${OUT_JS.replace(ROOT + path.sep, '')}`);

  ws.close();
  chrome.kill();
  vite.kill();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
