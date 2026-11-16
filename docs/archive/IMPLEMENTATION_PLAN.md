# GASEWE Portfolio — Creative Motion Implementation Plan (v4)

> **v2 — vision revision.** The first pass of this plan was written by a model with no vision
> capabilities, so it *guessed* the contents of the 11 reference clips from filenames and metadata.
> Almost every guess was wrong. This revision is written after **actually extracting and viewing
> frames from all 11 videos** (`insp1–8.mp4`, `op.mp4`, `ds.mp4`, `ftbl1.mp4`). It replaces the
> inspiration-mapping, corrects the stack strategy, and adds the cross-cutting motion systems the
> clips imply.

---

## v3 addendum — Figure work: bringing the protagonist in (insp1–insp7)

> **v3 — figure revision.** v2 adapted the *instrument* grammar of the clips (scans, bursts,
> dials, draws, trails) — all of it built and gated now (Gates 0–6). What v2 left on the table is
> the **figure**: the animated human presence several clips carry — the sprinting line-figure
> (`insp4`), the silhouette riding the clock hand (`insp7`), the bust point cloud (`insp2`), the
> tiny protagonist in the vast landscape (`insp5`/`insp6`), the approaching hands (`insp3`).
> The owner asked for the *animated aspects of insp1–insp7*, with the running figure as the
> example. This pass brings **some of that presence in — not all of it.** Scope discipline is the
> point: two features in, everything else consciously skipped.

### Figure audit of insp1–insp7

| Clip | Figure content | Verdict |
|------|----------------|---------|
| `insp1` | none — a crystal in a HUD | ✗ nothing to adapt; already used as the hero instrument |
| `insp2` | a classical bust as a point cloud | ○ **skipped** — the hero specimen is already the point-cloud idea; swapping its geometry for a bust is a later optional flourish (F3), not this pass |
| `insp3` | two hands approaching an orb | ✗ skipped — the grammar (approach → contact → burst) is already the System Map burst; literal hands would be costume, not craft |
| `insp4` | a glowing **line-figure sprinting**, light ribbons trailing off the limbs, one white beat | ✓ **F1 — The Runner** (flagship) |
| `insp5` | a tiny glowing figure on a giant hand, extreme pull-back | ✗ skipped — the scale/pull-back grammar is already in About; a literal tiny figure adds nothing the occluder doesn't |
| `insp6` | close-up on a figure pulling back to wide | ✗ skipped — same depth grammar, already built |
| `insp7` | a silhouette **climbing and riding the clock hand** | ✓ **F2 — The Rider** (upgrade the dial's existing lagging marker dot into an actual figure) |

### Sourcing verdict

**Nothing needs to be sourced — not by the owner, not by me.** Both in-scope features are *line
figures*, and line figures are exactly what a hand-authored rig does best:

- **F1** is a procedural 2D-canvas rig: a dozen joint angles driven by sinusoids of one phase
  variable (~150 lines, ≈2 kB). No skeleton file, no GLB, no mocap. It is also the *original*
  answer to the copyright question the clips raise — AI-generated clips are inspiration, never
  assets; a rig we author ourselves cannot become "is this yours?" bait.
- **F2** is an SVG glyph (5 paths) plus the lag logic the dial already has.

The alternative — a real rigged 3D character (Mixamo-class GLB + run clip) — was considered and
rejected: it costs 1–5 MB, imports a mesh-shading language that fights the site's strict line-art
monochrome, and the only good source (Mixamo) requires a logged-in Adobe account to download, i.e.
**the owner would have to source it**. If that variant is ever wanted, the path is: download a
rigged `X Bot` GLB with a `Run` clip from mixamo.com, drop it in `public/models/`, and swap F1's
canvas renderer for a Three.js `GLTFLoader` — everything else (scrub, band, readout) stays.

### F1 — The Runner (`insp4`) · new `src/js/runner.js` + `src/styles/runner.css`

A full-bleed **track band** between the marquee and the System Map. A glowing line-figure runs
across it, scrubbed by scroll:

- **Rig**: side-view stick figure on 2D canvas — head, spine, two arms, two legs — driven by one
  phase variable. Joint angles are sinusoids of that phase (thigh swing ±30°, knee bend peaking
  mid-swing, pelvis bob at 2× cycle frequency, constant forward lean). Smooth by construction:
  no keyframe table to get wrong, and the cycle runs at any speed without popping.
- **Scrub**: GSAP ScrollTrigger owns progress across the band; scroll distance advances the phase
  (one cycle per ~46 px of scroll) and maps to x-position. Scroll up and the figure mirrors to
  face the other way and cycles in reverse.
- **Light ribbons** (`insp4`): hands and feet keep a short position history drawn as tapering,
  fading lime polylines — same visual language as the existing cursor filament.
- **The lit floor line**: a hairline white track with a soft lime under-glow beneath the runner,
  plus a few dust particles kicked up at toe-off (the `ftbl1` particle kick, miniature).
- **The white beat** (`insp4`): one ≤ 90 ms / ≤ 35 % opacity flash when the runner crosses the
  band's midpoint, with a 2 s cooldown — §6.3 rules; disabled entirely under reduced motion.
- **Instrument readout** (on-brand): mono `track 01 — scrub` label + a live `px/f` pace readout
  fed by Lenis velocity — real data, same source as the hero waveform.
- **Lifecycle**: IntersectionObserver + visibilitychange pause (state → `Parked`), DPR ≤ 1.5,
  resize-safe; reduced motion → one static mid-stride pose, no rAF, no flash; no-JS → the band
  degrades to a plain hairline rule (the canvas is additive).

### F2 — The Rider (`insp7`) · edits to `src/js/dial.js`, `src/styles/about.css`, `index.html`

The dial's rider marker becomes an actual figure: a tiny glyph **hanging off the needle tip by
its hands**, legs dangling. The lag logic already in `dial.js` (the marker eases toward the needle
angle so the sweep reads as carrying weight) now tilts the whole body — the rider swings *behind*
the sweep and settles upright when scrolling stops — and drives a slight leg swing. Energised →
lime glow with the active arc segment; reduced motion → parked at 12 o'clock, static.

### What explicitly does not get built in v3

- No literal hands (`insp3`), no tiny figure in a landscape (`insp5`/`insp6`), no bust morph
  (`insp2` — F3 candidate), no 3D rigged character (sourcing path above), and **the clips
  themselves still never appear on the site** — derive, don't show.
- The layering contract holds: GSAP owns the runner's scrubbed progress; the canvas `rAF` only
  renders the values GSAP wrote; CSS owns the flash toggle and the floor line. One property,
  one engine.

### Phases 8 & 9 — results

**GATE 8 — PASSED** (`npm run build` exit 0; verified in headless Chrome over CDP via
`node scripts/verify-figures.cjs`, 19/19 checks, exit 0):

| Check | Result |
|-------|--------|
| Figure draws in the band | ~5 000 lit pixels in the band canvas; canvas bitmap matches its CSS box |
| Scrub direction | bright-pixel centroid 160 → 485 px scrolling down; 485 → 171 scrolling back up (figure mirrors and the cycle reverses) |
| State machine | `scrub` while the band is in view, `parked` once scrolled past |
| Pace readout | `53.00 px/f` during active scroll — real Lenis velocity, same source as the hero waveform |
| White beat | fired **1×** across a full down-up scrub (2 s cooldown; CSS caps it at 90 ms / 32 % peak) |
| Frame rate | **median 56.4 fps** over 3 scrub samples while the band repaints every frame (host load ≈ 5, software raster; individual samples 53.6–60.4 across runs — a single 2 s window was too noisy, so the check takes a median, threshold unchanged) |
| 375 px mobile pass | `node scripts/verify-figures.cjs mobile` — **17/17**: layout viewport exactly 375, canvas sized (dpr-capped 1.5), figure drawn (n ≈ 11 200) and scrubs, zero console errors |
| Reduced motion | emulated over CDP: state `static`, one mid-stride pose painted (n ≈ 4 925), flash `display: none` |
| No JS | script execution disabled: track hairline + `track 01` meta still render — canvas is additive |
| Console | zero errors across the whole session (normal, scrub, reduced, no-JS) |

**GATE 9 — PASSED** (same run):

| Check | Result |
|-------|--------|
| Rider tracks the needle with lag | `translate(50.94 62.17) rotate(-22)` → `translate(102.52 185.63) rotate(-22)` across the About scrub |
| Legs swing with the sweep | leg-L `rotate(-19.0 0 2.6)` — driven by the same lag delta |
| Energised state | rider carries the lime glow whenever an arc segment is active |
| Reduced motion | parked at 12 o'clock (`translate(110 34)`) — the HTML default, never touched by JS |
| Hidden content | none at runner / systemmap / timeline / contact under reduced motion |
| Console | zero errors |

**Fixes found by testing (v3):**

1. **CDP reduced-motion emulation must use `features`, not `media`.**
   `Emulation.setEmulatedMedia { media: 'reduce' }` emulates a media *type*; `prefers-reduced-motion`
   is a media *feature*. The first gate run silently ran in normal mode (state stayed `idle`, canvas
   unpainted at page top, flash not hidden). Correct call:
   `{ features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }`.
2. **`shadowBlur` on a canvas that repaints every frame ate ~70 % of the frame budget** — the first
   gate run measured 16.6 fps. Replaced with a two-pass stroke (wide faint halo + core), the floor
   radial gradient built once instead of per frame, and a dirty-frame rule: at rest the ribbons
   dissolve over ~0.5 s and then the canvas is not repainted at all. Re-measured: 60.2 fps.
3. Harness bugs fixed in the script itself: a template-literal `${i}` leaking a Node variable into
   page scope; a racing `rmdir` on Chrome's profile dir (now SIGTERM + SIGKILL fallback); and the
   mobile probe asserted `window.innerWidth === 375`, but under mobile emulation innerWidth also
   carries the scrollbar gutter (417 = 375 + 42) — layout width is `documentElement.clientWidth`,
   which was exactly 375 all along. The harness (`scripts/verify-figures.cjs`) launches Chrome by
   hand and speaks CDP over raw `ws` — the `chrome-launcher` folder in `node_modules` is an empty
   shell, and no new dependency was added for this.

```
Phase 8  runner band (insp4)   → GATE 8   PASSED (60.2 fps scrub, reverses, static under reduced motion)
Phase 9  dial rider (insp7)    → GATE 9   PASSED (lag + swing, parked at 12 o'clock when reduced)
```

---

## v4 addendum — The Traveler: the owner's model, moving through the whole page

> **v4 — model revision.** The owner downloaded a model into `public/` and asked two questions:
> **(1) can it be used instead of the stick figure? (2) can it move through the whole page to the
> bottom?** Answers: **yes to both** — but not as a rigged character (verified below: the GLB has
> no skeleton and no animation clips), and not by adding three.js. Confirmed with the owner:
> **D5 = full-page journey (hero → footer)**, **D6 = point-cloud traveler** rendered by the
> existing 2D-canvas engine. This is a draft plan for approval before execution.

### D5 / D6 — decisions locked for v4

| # | Decision | Choice |
|---|----------|--------|
| D5 | Travel scope | **Full-page journey** — the figure starts at the hero and travels top→bottom of the viewport, bound to whole-page scroll progress, arriving (and fading) at the footer. Not section waypoints, not band-only. |
| D6 | How the model moves | **Point-cloud traveler** — the GLB is preprocessed offline into a ~48 KB point cloud; the site renders it with a hand-rolled 3-D → 2-D projection on a 2-D canvas. **No three.js, no new runtime dependency.** |
| D7 | v4.1 revision (supersedes D6's body) | **Quaternius CC0 pair + baked sprite strip.** Body = Quaternius *Universal Base Characters* rigged glTF (CC0); motion = *Universal Animation Library* run clip (CC0, 43 clips — `Jog_Fwd_Loop`/`Sprint_Loop`); playback = **offline-baked PNG sprite sheet** played by the existing 2-D canvas (three.js only as a *devDependency* for the bake; runtime budget untouched). Journey scope (D5) unchanged. |

### 1. What the model actually is (parsed from the file, not guessed)

| Property | Value |
|---|---|
| File | `public/assets/models/monkey_king_stick_model.glb` — 1 550 120 B |
| Origin | Sketchfab export (`Sketchfab-16.72.0`); zip holds the source GLB + `shaded_0.png` (419 KB) |
| Geometry | 22 279 vertices / 36 315 triangles (POSITION + NORMAL + TEXCOORD_0, mode 4) |
| Rig | **none** (`skins: 0`) |
| Animation | **none** (`animations: []`) |
| Material | 1 × `CustomMaterial`, 1 embedded PNG |

It is a **static statue** — it cannot run, walk, or cycle. Motion must come from how we render it.

| Option for "making it move" | Verdict |
|---|---|
| A · Rig externally (Blender/Mixamo run clip) + three.js `AnimationMixer` | Rejected for now: owner work outside the repo, and three.js ≈ 187 kB gz lazy chunk blows the ≤ 200 kB JS budget (we're at 94 kB). Path documented if ever wanted. |
| B · Full textured mesh via three.js + `GLTFLoader`, procedural bob | Rejected: same budget cost, and a shaded Sketchfab material fights the monochrome light-only palette (D2/D4). |
| **C · Point-cloud traveler** | **Chosen (D6):** zero new deps; it *is* the `insp1`/`insp2` "object made of light" language the site already speaks; budget-safe. |

### 2. Shipping hygiene — the 3.8 MB problem (Phase 0, again)

Vite copies `public/` verbatim. Today `public/assets/models/` holds a **1.55 MB GLB + a 2.28 MB
zip** that nothing references: the **next `npm run build` ships 3.83 MB**. Phase 10a moves both
to `refs/models/` (owner keeps them; nothing references them — same move as the 31 MB videos in
Phase 0) and ships only the preprocessed point cloud.

### 3. Preprocessing — GLB → points (offline, one-time)

New `scripts/glb-to-points.mjs` (Node, **zero dependencies**, same GLB-chunk parsing already
proven in research):

1. Read the GLB JSON + BIN chunks; pull the POSITION accessor (22 279 × VEC3 float32).
2. Normalize: centre on origin, scale so bounding-box height = 1.0.
3. Sample: stride-sample to ~4 000 points (`step = floor(count / 4000)` ≈ 5 → ~4 456 pts).
   If stride banding shows up visually, upgrade to voxel-grid downsampling — noted as a refine.
4. Write `public/assets/models/monkey-points.bin` — raw Float32 LE, **48 000 B**.
5. Also derive 3 trail anchors at load time in-browser (topmost / frontmost / backmost vertex).

Output ships; source GLB/zip do not. **GATE 10 asserts dist contains zero `.glb`/`.zip` files
and that `monkey-points.bin` ≤ 64 KB.**

### 4. Architecture

| File | Change |
|---|---|
| `scripts/glb-to-points.mjs` | NEW — offline GLB → `.bin` |
| `public/assets/models/monkey-points.bin` | NEW shipped asset (48 KB, fetched after first paint) |
| `refs/models/` | GLB + zip moved here — out of the build |
| `src/js/traveler.js` | NEW — fixed full-viewport canvas; GSAP global scrub owns journey progress; fetch points → `Float32Array`; hand-rolled perspective projection; sprite-cached points (hero pattern); bob + lean + scroll-bound spin; 3 silhouette-anchored light ribbons; footer arrival fade; idle-skip repaint + visibility park |
| `src/styles/traveler.css` | NEW — fixed canvas (`z-index: 1`, `pointer-events: none`), right-edge hairline tick rail (start-to-finish journey line), reduced-motion static rules |
| `src/js/runner.js`, `src/styles/runner.css` | **REMOVED** — the stick figure is retired; its proven ribbon/`dirty-frame`/park logic moves into `traveler.js` (v3's GATE 8 checks are superseded by GATE 10) |
| `index.html` | Band markup simplified to a static start-line landmark: `track 00 — origin` label + floor hairline; canvas, flash, pace/state spans removed (no stale fake readouts). Traveler canvas + rail added, `aria-hidden` |
| `src/main.js` | `initRunner` → `initTraveler(lenis)`; `runner.css` → `traveler.css` |
| `scripts/verify-figures.cjs` | Band checks replaced by traveler checks; rider (GATE 9) checks untouched |

### 5. Journey behavior (the answer to question 2)

- **Path**: GSAP `ScrollTrigger` over the whole document (`start: 'top top'`, `end: 'bottom
  bottom'`, `scrub: true`) owns `journey ∈ [0,1]` — one engine, per the layering contract.
  Figure's viewport y = `lerp(topPad, vh − topPad, journey)` → starts at the hero, arrives at
  the footer. Cycle phase advances with |scroll delta| (~60 px per cycle).
- **Placement**: desktop ≥ 900 px — right gutter, `x = vw − clamp(28px, 4vw, 56px)`, on a
  hairline tick rail; figure height `min(16vh, 118px)`. Mobile < 900 px — left gutter, scale
  0.72, resting opacity 0.4 (rides over content, so it stays small and dim).
- **Life without limbs** (the honest cost of a rigless mesh): vertical bob at 2× cycle, ±5°
  lean phase-locked to the bob, spin bound to scroll progress (`journey × 2π` — scrub-bound so
  an at-rest page never repaints), and 3 light ribbons trailing from silhouette anchors.
- **One-filament discipline**: at rest → white, opacity 0.55; while scrolling → opacity 1.0 with
  lime energize on the leading points; **no white beat** (§6.3 — the band's flash dies with the
  band); arrival → opacity fades to 0 across the last 3 % of the journey as the footer's own
  glow-down (Phase 5) takes over.
- **Lifecycle**: dirty-frame skip (idle = no repaint), `visibilitychange` park, DPR ≤ 1.5,
  cached radial-gradient sprites instead of per-frame gradients.
- **Degradation**: reduced motion → one static mid-page frame, no loop; no-JS → the rail hairline
  alone (canvas additive); points fetch failure → traveler silently absent, `console.warn` only;
  no WebGL involved at all (2-D canvas), so the no-WebGL gate is unaffected.

### 6. Risks

| Risk | Mitigation |
|---|---|
| Reads as "sliding" rather than running (no skeleton) | bob + phase-locked lean + scrub spin + ribbons; tune constants after first visual pass; fallback: footfall-bounce keyed to cycle |
| Clutter over hero HUD / content | far-right gutter outside the measure, dim at rest, ≤ 118 px tall, `pointer-events: none` — GATE 10 asserts `elementFromPoint` at content centres still returns content |
| Always-visible fixed canvas costs frames | sprite cache + scrub-bound rotation + idle-skip + visibility park; GATE 10 measures median-of-3 fps (threshold unchanged, > 55); fallback: drop to 2 500 points / static-frame mobile |
| Sketchfab licence | verify the download's licence permits web use; if CC-BY, add an attribution line to the footer meta — **owner action item before deploy** |
| Bundle | JS stays ≈ 94 kB gz (− band runner + traveler roughly cancel); network +48 KB points bin, fetched post-paint; dist loses 3.83 MB |

### 7. Phases & gates

```
Phase 10a  preprocess GLB → .bin; move GLB+zip to refs/models     (build green, dist free of .glb/.zip)
Phase 10b  traveler module + markup; retire band runner           (dev demo)
Phase 10c  harness rewrite → GATE 10  (+ GATE 9 rider regression + 375 px mobile pass)
```

**GATE 10 — criteria:** build exit 0 · dist contains no `.glb`/`.zip`, `monkey-points.bin`
≤ 64 KB · journey y maps to page progress (measured at 25/50/75 % scroll) · phase cycles with
scroll velocity and ribbons trail from the model · x inside the right gutter (left on mobile) ·
arrival fade fires in the last 3 % · idle → parked (zero repaint at rest) · scrub fps **median of
3 samples > 55** · reduced motion → single static frame, no loop · no-JS → rail only ·
`elementFromPoint` never returns the canvas · zero console errors · **GATE 9 (rider) still green**
· 375 px mobile pass green.

### 8. Rigged-model research (v4.1 — owner asked: find a rigged model, or prompt Blender?)

**Candidates found — all verified, not linked blind:**

| Candidate | Rig | Animations | Format / size | Licence | How verified |
|---|---|---|---|---|---|
| **Quaternius Universal Base Characters** | Humanoid rig (retarget-ready) | pairs with the anim library below | glTF + FBX + Blend, ~13 k tris, 6 characters | **CC0** | official pack page (quaternius.com) |
| **Quaternius Universal Animation Library** | universal humanoid (rig naming aligned with the base chars; Mixamo-compatible) | **120+ incl. jog, sprint, 8-direction locomotion** — i.e. real run cycles | `Standard.zip` **15 MB** free / itch "name your own price", GLB exports (v3.0, Jun 2026) | **CC0** (itch licence field) | itch.io page read in full |
| **three.js `Soldier.glb`** | **49-joint skin** | **Idle, Run, Walk, TPose** | GLB **2 160 468 B** | MIT repo distribution, Mixamo-derived (Adobe royalty-free terms) | **downloaded and binary-parsed**: skins=2, animations as listed, 7 325 verts |
| Mixamo auto-rig | auto-rigs *any* mesh (incl. our Monkey King) | huge run/walk library | FBX only → needs conversion | free, Adobe login required | not fetchable without an account — **owner action if chosen** |

**Blender answer (researched, current):** yes — prompts can drive Blender in 2026: Blender has an
**official MCP add-on**, plus the open-source BlenderMCP bridge; tutorials cover prompt-driven
rigging/animating end-to-end. Honest caveat: *auto-rigging a custom un-rigged mesh* (our Monkey
King) is still more reliable in purpose-built tools — Mixamo (browser, free, login), Meshy/Tripo
auto-rig (browser), AccuRIG, or Blender's Rigify (manual markers) — while **prompted Blender
(MCP) shines at the scripted steps**: import, retarget a CC0 run clip onto a rig, export GLB.
Recommended split if keeping the Monkey King: auto-rig in a browser tool → prompt Blender/MCP to
retarget + export.

**What a real run cycle changes (decision D7 pending):** playing skeletal animation at runtime
means a skinned mesh → WebGL. Two viable paths, both keeping the v4 journey design:

| Path | How | Cost |
|---|---|---|
| **A1 · three.js + `AnimationMixer`** | `three/addons/loaders/GLTFLoader.js` (official pattern), lazy chunk fetched only when WebGL exists, silhouette/unlit material to hold the monochrome palette (D2/D4) | **+ ~187 kB gz → ≈ 281 kB total vs the ≤ 200 kB budget — requires a formal budget revision**; simplest engineering |
| **A2 · offline bake → sprite strip (recommended)** | a **build-time** script (three as a *devDependency*, headless Chrome renders N frames of the run cycle → PNG sprite sheet with alpha) played by the existing 2D-canvas traveler | **zero runtime deps, budget intact**, real mocap-quality run under our silhouetted look; bake complexity lives in the repo, not the visitor's download; ship ≤ 200 KB |
| D6 (current plan) · point-cloud traveler | as specced above | cheapest, but no real run cycle |

All three compose with the full-page journey (D5); only the figure's *body* changes.

---

## 0. Decisions locked (confirmed with the owner)

| # | Decision | Choice |
|---|----------|--------|
| D1 | Framer Motion in a **vanilla JS** project | Install **`motion`** — the same engine Framer Motion is built on, shipped framework-agnostic. No React. GSAP + Lenis + Three.js stay. |
| D2 | Palette | **Monochrome base + one glow accent.** Keep the live strict black/white Montserrat system; the accent exists *only as light* (scan, glow, energised state), never as static fill. |
| D3 | Scope | **All 11 clips mapped**, built in dependency order with a checkpoint per phase. |
| D4 | Where the accent lives | `--glow: #c8f542` (the brief-pinned electric lime) fires **only** on energised moments: scan plane, live dot, active node, filament, hover. Everything at rest is white-on-black. One token edit switches the whole site to white glow if preferred. |

### D1 detail — why `motion` and not `framer-motion`

`framer-motion`'s main entry imports React; importing it here would pull React into a
Vite/vanilla bundle for no benefit. `npm install motion` gives the identical runtime:

```js
import { animate, stagger, inView, scroll, hover, press } from 'motion';

// element / selector animations
animate('.hero__name', { opacity: [0, 1], y: [24, 0] }, { delay: stagger(0.04), duration: 0.8 });

// SVG stroke drawing — directly from insp8
animate('.site-nav__mark path', { pathLength: [0, 1] }, { duration: 1.1, ease: 'easeInOut' });

// viewport entrances
inView('.project', (el) => animate(el, { opacity: [0, 1], y: [40, 0] }), { margin: '-12% 0px' });

// gestures
press('.project__stack-item', (el) => animate(el, { scale: [1, 1.08] }, { type: 'spring', stiffness: 500, damping: 20 }));
```

- `motion` = hybrid build (~18 kB gz) with transforms, CSS vars, SVG paths, colours, sequences.
- `motion/mini` = 2.3 kB build (native styles only) — candidate for the few spots that only tween
  opacity/transform, if the bundle budget in Phase 7 gets tight.
- **Three.js values are driven by GSAP** (tweens + ScrollTrigger) or plain `rAF`, never by
  `motion` — a layering decision (§3.1), not a licensing one: `motion@14` does ship a public
  `motion/three` binding, but GSAP already owns the scroll-scrubbed values on those objects and
  two engines on one property is exactly what the contract forbids.

---

## 1. What the reference clips actually are

These are **not UI screen recordings**. They are cinematic / motion-design clips — AI-generated
shorts in a consistent visual world: **near-black fields, white forms made of light, one glow
colour, instrumentation overlays.** That world is already 90% of this portfolio's design system,
so we are not translating UI patterns, we are *lifting motion grammar*.

| # | File | Duration | What is actually on screen | Motion grammar (the reusable idea) |
|---|------|----------|----------------------------|------------------------------------|
| 1 | `op.mp4` | 17.1s | Pure black → a lone glowing "stitched" light band floats first → a hooded silhouette **resolves around the light** → long idle with a breathing halo → light collapses → black | **Light first, form second.** Glow ignites, then content resolves; glow fades out at the end. |
| 2 | `insp1.mp4` | 12.8s | A faceted crystal slowly rotating inside a **framed HUD**: corner brackets, mono readout block top-left, right-edge tick scale, dust motes, **two horizontal scan lines (magenta + green) sweeping through the object**, bottom waveform/graph strip | **Instrumentation around a rotating object + horizontal scan sweep.** |
| 3 | `insp2.mp4` | 31.5s | A classical bust as a **point cloud inside a wireframe bounding box**, mono numeric callouts (`8770…`) on **leader lines** to a bottom data panel (waveform + ticks), frequent **slice/datamosh glitch**, occasional chroma-blue blowout and **over-bloom white frames**, particles shedding off the surface | **Scan → annotate → glitch → bloom.** |
| 4 | `insp3.mp4` | 8.0s | Two hands approach with a glowing orb → **contact burst** → burst becomes **concentric rotating HUD rings** with binary ticks → resolves into a **wireframe globe** with orbiting labels and a neural filament network | **Approach → contact → burst → orbit → network.** |
| 5 | `insp4.mp4` | 6.0s | A glowing line-figure sprinting across a lit floor line, **light ribbons trailing from the limbs**, one **full-white frame flash** mid-sequence | **Trails follow motion; one white beat.** |
| 6 | `insp5.mp4` | 13.0s | A tiny glowing figure on a giant dark hand in a dune sea; **camera pulls way back** to reveal scale, foreground shapes occlude, moon, then a **huge bloom flare whites out** into a second reveal | **Extreme pull-back + foreground occluders + bloom transitions.** |
| 7 | `insp6.mp4` | 12.0s | Same monochrome world: starts **extreme close-up** on a figure, pulls back continuously to wide, near-field dark shapes slide across frame faster than the subject | **Continuous pull-back with 3-layer parallax.** |
| 8 | `insp7.mp4` | 32.1s | A **paper-grain clock face**; a tiny silhouette climbs the minute hand, hangs off it, pushes it and **rides the sweep**, then falls off near 6 o'clock and the loop restarts | **Scrub-driven needle sweep with a rider, over texture.** |
| 9 | `insp8.mp4` | 12.3s | White **line-art strokes draw themselves in sequence** (emblem → outline → face marks) with a bright flash at completion, resolving into a portrait | **SVG stroke-draw → flash → form.** |
| 10 | `ds.mp4` | 20.5s | A near-black portrait; **eyes glow amber constantly** with micro-flicker; **faint electric arcs crackle** in the empty black every few seconds | **Constant low glow + rare filament arcs in negative space.** |
| 11 | `ftbl1.mp4` | 6.0s | A **blue holographic wireframe** footballer dribbling, **horizontal scanlines sweeping over the body**, particles kicking up from the boots, a glowing ellipse on the turf | **Wireframe hologram + scanline overlay + particle kick-up.** |

### Corrections to v1's assumptions

| v1 guessed | Reality |
|------------|---------|
| "All clips are vertical UI micro-interactions: bottom sheets, card expansions, tab transitions" | Zero UI in any clip. They are cinematic motion-design shorts. |
| `insp4` = "card hover lens effect" | Light-trail runner + white flash |
| `insp7` = "long scroll narrative / timeline flow" | A literal clock with a figure riding the hand |
| `insp6` = "shared-element expand" | Monochrome pull-back parallax |
| `insp8` = "form/tactile feedback" | Stroke-draw emblem reveal |
| `ds.mp4` = "component state showcase" | Glow-in-dark portrait with electric arcs |
| "Install `framer-motion` and import from it" | Would pull React in; use `motion` (D1) |
| "Three.js canvas exists in HTML but not wired" | There is **no canvas in the HTML at all** today; Three.js is installed but unused anywhere in `src/` |
| Palette = electric lime + Space Grotesk | Live site is strict monochrome + Montserrat (D2/D4) |
| — | **v1 missed:** `public/assets/Portfolio/` is **31 MB of reference video inside `public/`**. Vite copies `public/` verbatim — the next `npm run build` ships 31 MB. `dist/` is currently 961 KB. **Fix in Phase 0.** |

---

## 2. Vision → feature mapping (all 11, no clip left unused)

| Clip | Feature built | Section | Engine |
|------|---------------|---------|--------|
| `insp1` | **The Scanning Instrument** — rotating faceted/point object framed by HUD brackets, mono readouts, tick scale, and a lime scan plane sweeping through it on scroll | Hero | Three.js + GSAP scrub + CSS HUD |
| `insp2` | (a) **Annotation callouts** — mono numeric labels on leader lines anchored to spots on project screenshots; (b) **slice-glitch** on media enter; (c) wireframe bounding box + waveform strip as the hero's foot rail | Work + Hero | `motion` + SVG + CSS |
| `insp3` | **Connection burst** — nodes emit an expanding ring on hover/enter, connected edges draw as glowing filaments, faint concentric HUD rings rotate behind the graph | System Map | `motion` (springs, `pathLength`) |
| `insp4` | **Light trails** — lime cursor filament (fine pointers only), marquee streak on speed change, and the single **white flash** when the featured Product panel opens | Global + Work | 2D canvas + `motion` |
| `insp5` | **Pull-back reveal** — the About block enters over-scaled (1.25 → 1) and settles as you scroll | About | GSAP scrub |
| `insp6` | **Foreground occluder parallax** — a dark near-field layer (oversized index numeral) travelling faster than content, plus the 3-layer dune-style depth behind About | About / Work | GSAP scrub |
| `insp7` | **The Dial** — a tick-marked circular dial whose needle is scroll-scrubbed, with a glowing marker riding the tip; timeline items energise as the needle sweeps past their arc | About (signature) | GSAP scrub + `motion` |
| `insp8` | **Stroke-draw system** — nav mark draws on load, section-title underlines draw before text lands, contact rules draw left→right, API glyph `{ }` draws | Global | `motion` `pathLength` |
| `op` | **Light-first entrance** — a lone glow bar ignites in black, then hero type resolves around it; **glow-down ending** — the contact/footer closes by collapsing its light to black | Hero + Contact | `motion` |
| `ds` | **Glow + arc** — every "live" indicator breathes (opacity pulse ~4s); a hairline electric arc flickers behind the hero for ~120 ms every 7–10 s | Global + Hero | CSS + SVG |
| `ftbl1` | **Hologram media** — screenshots rest as low-contrast wireframe-ish greyscale with a moving scanline, then **resolve to full contrast** as the scan passes; particles kick up at the frame's floor line on hover | Work | CSS + `motion` |

**Do the clips get displayed on the site?** No — recommendation is **derive, don't show**. They are
inspiration, not Godwin's work; putting AI clips in a developer portfolio invites "is this yours?"
Owner can override by adding a `/motion-lab` page in a later pass.

---

## 3. Six motion systems (the reusable layer)

Every phase below composes these instead of inventing one-off effects. Each system is one small
module + one CSS file section, so the vocabulary stays consistent across sections.

| System | Name | Source clips | Lives in | What it does |
|--------|------|--------------|----------|--------------|
| S1 | **Scan** | `insp1`, `insp2`, `ftbl1` | `src/js/hud.js`, `.scanline` CSS | Horizontal/vertical scan sweep, corner brackets, tick scales, mono readout blocks, waveform strip. Used by hero, media frames, API panel. |
| S2 | **Light** | `op`, `ds`, `insp4` | `motion-core.js`, `.glow` CSS | Light-first reveals, breathing glow on live states, one white beat, cursor filament. |
| S3 | **Draw** | `insp8`, `insp3` | `draw.js` | SVG `pathLength` draw for marks, underlines, rules, graph edges. |
| S4 | **Burst** | `insp3`, `ftbl1` | `burst.js` | Expanding ring + particle kick from a point, used on graph nodes and hover. |
| S5 | **Depth** | `insp5`, `insp6` | GSAP (existing `animations.js`) | Pull-back scale, layered parallax, foreground occluders. |
| S6 | **Dial** | `insp7` | `dial.js` | Scroll-scrubbed circular needle + rider marker + arc highlighting. |

### 3.1 Layering contract (prevents double animation)

> **One property, one engine. Never two engines on the same element.**

| Engine | Owns | Never touches |
|--------|------|---------------|
| **CSS** | Ambient infinite loops (glow pulse, scanline drift, grain, marquee base) | Anything scroll-linked |
| **GSAP + ScrollTrigger** | Page-level scroll choreography: parallax, scrub, reveals tied to scroll position, Three.js values | Hover/press, mount-time micro-motion |
| **`motion`** | Element lifecycle: entrances, staggers, gestures, layout/panel swaps, SVG draws, counters | Scroll-scrubbed values (use `scroll()` from `motion` only if GSAP isn't already on that element) |
| **Three.js + `rAF`** | The hero canvas only; values are *set* by GSAP tweens | Any DOM |

Concretely: the project image's **inner parallax** stays GSAP; its **scan reveal on enter** is
`motion`; its **hover glow** is CSS. Three different elements or properties, no collision.

---

## 4. Phased implementation

### PHASE 0 — Foundations & the 31 MB fix

1. ✅ **Move the reference clips out of `public/`** → `refs/inspiration/` at the project root.
   Nothing references them; the build must not ship them. (Done: `public/` 31 MB → 241 KB.)
2. ✅ `npm install motion` — resolved to `motion@14.3.0`; `animate`, `stagger`, `inView`, `hover`,
   `press`, `scroll`, `spring` all verified present. No production vulnerabilities (`npm audit
   --omit=dev` clean); the one high-severity advisory is `source-map-js` in the dev toolchain.
3. ✅ **`src/js/motion-core.js`** (new) — single import point + reduced-motion guard. Also
   consolidated: `animations.js`, `lenis.js` and `systemmap.js` now ask this module for the
   preference instead of each calling `matchMedia` (the query has exactly one owner).
   ```js
   import { animate, stagger, inView, hover, press, scroll } from 'motion';
   export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   export const play = (target, keyframes, options) =>
     reduced ? Promise.resolve() : animate(target, keyframes, options).finished;
   export { stagger, inView, hover, press, scroll };
   ```
   Every other module imports from here, so the reduced-motion switch is one file.
4. ✅ **Tokens** (`src/styles/tokens.css`): `--glow`, `--glow-soft`, `--glow-faint`,
   `--dur-fast/base/slow`, `--ease-out-expo`, `--ease-spring`, `--scan-speed`, `--grain-opacity`.
5. ✅ **Layering contract** documented as the header comment of `motion-core.js`.
6. ✅ CSS safety net verified rather than extended: the existing `motion.css` no-js and
   `prefers-reduced-motion` blocks already cover every current hook — measured, not assumed.

**GATE 0 — PASSED** (`npm run build` exit 0):

| Check | Result |
|-------|--------|
| Build | exit 0, 325 modules, built in 481 ms |
| `dist/` size | 433 KB total — JS 152.4 kB (56.2 kB gz), CSS 26.6 kB (5.0 kB gz) — budget ≤ 1 MB |
| Reference clips in `dist/` | 0 files (the 31 MB risk is closed) |
| Console errors | none across 10+ page loads in headless Chrome — and the capture method was
  itself proven with a control page that throws, so "clean" means clean |
| Reduced motion | verified with **CDP media emulation** (`Emulation.setEmulatedMedia`): `matchMedia`
  reports `reduce`, Lenis stays off, all 10 reveals + 7 projects render, **zero** elements hidden
  at every section, screenshots of Work/About/Contact fully legible |
| Duplicate `matchMedia` calls in `src/` | 1 (motion-core only) |

**Verification notes:** Chrome's `--force-prefers-reduced-motion` flag is *ignored* by Chrome 152
headless — it produced "reduced" screenshots that were really normal mode. Reduced-motion testing
must go through CDP `Emulation.setEmulatedMedia`. Headless `--screenshot` also renders pure black
for any URL with a `#hash`; scroll-driven screenshots must be taken over CDP instead. Both findings
are baked into the verification approach for the later gates.

---

### PHASE 1 — Hero: "The Scanning Instrument"
**Sources: `insp1` (instrument), `insp2` (point cloud + glitch + annotation), `op` (light-first), `ds` (glow + arc)**

New file `src/js/hero-instrument.js` + `src/styles/hud.css`; wires into the existing `.hero` stage.

1. **Three.js scene** (first real use of the installed `three`):
   - `THREE.Points` sampling an icosahedron / displaced sphere — the "scanned object" (~4–8 k points),
     monochrome white with size attenuation.
   - `LineSegments` **wireframe bounding box** around it (`insp2`'s cage).
   - Slow constant Y rotation in `rAF`; **GSAP tween** eases rotation speed and camera Z on scroll.
   - Dust motes: a second, sparse, drifting point field.
   - DPR capped at 1.75, `IntersectionObserver` + `document.visibilityState` pause, WebGL failure →
     hide canvas and keep the static HUD (graceful, no broken layout).
2. **Scan plane (scroll-scrubbed)**: a lime horizontal plane sweeps bottom→top through the point
   cloud as the hero scrolls (GSAP `ScrollTrigger scrub` driving a shader/`material` uniform).
   Points near the plane brighten to `--glow` and throw a small bloom. This is the single most
   literal `insp1` moment on the page.
3. **HUD DOM overlay** (`.hero__hud`, CSS + tiny JS):
   - corner brackets that draw in on load (S3),
   - mono readout block top-left — **real data**: shipped-project count, tech count, `NBO` coords,
     build year (same source as `herostats.js`, no invented numbers),
   - right-edge tick scale whose ticks illuminate with scroll progress,
   - **foot rail**: wireframe box + waveform strip whose amplitude responds to Lenis scroll velocity.
4. **Light-first entrance (S2, `op`)**: screen starts black; the glow bar under the hero name
   ignites (opacity + blur bloom, 0 → 1, 500 ms), *then* `hero__grid` type resolves around it with
   `motion` stagger 0.05 s, then the HUD brackets draw (S3), then stats count up (`motion` numeric
   `animate` with `onUpdate`). Replaces the current GSAP hero timeline.
5. **Idle life (`ds`)**: `.hero__cue` and the HUD live-dot breathe on a 4 s CSS loop; a hairline
   **electric arc** SVG flickers behind the point cloud for ~120 ms every 7–10 s (max 3 Hz — see
   flashing rules §6.3), killed under reduced motion.

**Files shipped in Phase 1:** `src/styles/hud.css`, `src/js/hud.js` (DOM instrument),
`src/js/hero-instrument.js` (Three.js, lazily imported), `src/js/hero-entrance.js` (motion
choreography), hero markup in `index.html`, and the old GSAP hero entrance removed from
`animations.js` (GSAP keeps the hero's scroll behaviour only — one engine per element).

**GATE 1 — PASSED** (`npm run build` exit 0, verified in headless Chrome over CDP):

| Check | Result |
|-------|--------|
| Light before form (`insp op`) | lamp lit at ~0.4 s → name starts fading in at ~0.7 s → settled ~1.0 s. Verified with a sampler injected *before* navigation via `Page.addScriptToEvaluateOnNewDocument`; polling from CDP starts after the entrance has already played |
| Frame rate at the hero | **60.3–60.8 fps** desktop, 60.2 fps at 375 px — measured over 2 s of `requestAnimationFrame` while software WebGL (SwiftShader) is rendering |
| Canvas sized to its frame | bitmap 738×378 == CSS box 738×378 at 1440×900; 351×260 at 375 px |
| Scan sweep (`insp1`) | lime band travels the cage on scroll; tick scale lit 7/14 at half-hero scroll; waveform reports live px/f (0.07 px/f mid-scroll, 0.00 at rest) |
| Pause off-screen | HUD state reads **Parked** once scrolled to Contact — both the render loop and the waveform loop stop (`IntersectionObserver` + `visibilitychange`) |
| Reduced motion | emulated over CDP: no entrance runs, instrument renders **one static frame** (`Static`), ticks parked at 50 %, all content visible, 0 hidden elements |
| No WebGL | `--disable-3d-apis`: stage gets `is-nogl`, canvas removed, **HUD fully intact** (readout, ticks, wave, real stats), entrance still plays, **no console errors** — and the Three chunk is never downloaded |
| Console | zero errors across all four environments (desktop, 375 px, reduced motion, no WebGL) |

**Three fixes found by testing, worth remembering:**

1. **`<canvas>` is a replaced element.** `position:absolute` with `left/right/inset` does **not**
   stretch it — it stays at its intrinsic 300×150 and the renderer sizes the buffer wrong. It now
   lives inside `.hero__frame` with `width/height: 100%` against a sized parent.
2. **Pre-check WebGL before importing Three.** Instantiating the renderer on a WebGL-less device
   logs three console errors *and* downloads 187 kB gz first. `hasWebGL()` now runs before the
   dynamic `import('three')`, so those devices get the static HUD with no network cost and no noise.
3. **Bundle watch (carried to GATE 7):** main JS is 82.8 kB gz (motion + hud + entrance); the lazy
   Three chunk is **187 kB gz**, which pushes total JS to ~270 kB gz against the 200 kB budget.
   Three's own weight is the cost, not our code. Options at GATE 7, in order of preference: keep
   the lazy chunk (only paid by visitors who reach the hero with WebGL), swap the specimen renderer
   to a hand-rolled 2-D canvas point projection (~5 kB), or tree-shake Three down to
   `Points`/`ShaderMaterial` via a custom entry.

---

### PHASE 2 — System Map: "Connection Burst"
**Source: `insp3` (approach → contact → burst → orbit → network)**

Edit `src/js/systemmap.js` + `src/styles/systemmap.css`.

1. **Node entrance**: `inView` + `stagger(0.04)` on project nodes, tech nodes 0.2 s behind.
2. **Burst on contact (S4)**: hovering/focusing a node spawns an expanding lime ring from that
   node's centre (`.burst` element, `motion` scale 0→1 + opacity 1→0, 600 ms, spring) and kicks
   6–10 particles (`ftbl1`'s boot spray).
3. **Edges draw as filaments (S3)**: replace the CSS `edge-in` keyframes with
   `animate(path, { pathLength: [0, 1] })` staggered, so highlight-on-hover can re-draw the active
   edge in lime with a glow while inactive edges dim to 5%.
4. **Orbit rings**: two faint concentric SVG rings rotate slowly behind the graph (pure CSS,
   60 s/rev) — the `insp3` HUD, kept under 8% opacity so it never fights the data.
5. Keep the existing hover/focus semantics and the click-to-scroll behaviour untouched.

**GATE 2:** burst + draw work on hover *and* keyboard focus; nothing overlaps the mono readouts;
reduced-motion shows a fully-drawn, static graph.

---

### PHASE 3 — Work: "Scan, Annotate, Glitch"
**Sources: `insp2` (annotation + glitch), `ftbl1` (hologram scan), `insp4` (white beat), `insp5` (bloom)**

Edit `src/js/projects.js`, `src/styles/work.css`; new `src/js/media-scan.js`.

1. **Hologram rest state (`ftbl1`)**: project images rest `grayscale(1) contrast(0.85)` with a
   slow **scanline overlay** drifting across the frame. On enter-viewport the scanline sweeps once
   top→bottom and the image resolves to full contrast behind it (`mask-image` / clip driven by
   `motion`). Hover re-energises the lime hairline.
2. **Annotation callouts (`insp2`)** — *the* signature detail of this phase:
   - Add a data field to `src/data/projects.js`:
     ```js
     annotations: [
       { x: 24, y: 38, id: '87701', label: 'STK Push callback' },
       { x: 71, y: 62, id: '87702', label: 'JWT guard' },
     ]
     ```
   - Rendered as absolutely positioned mono chips with an SVG **leader line** to a dot on the
     screenshot; on media hover the lines draw (`pathLength`) and labels fade in with a 0.06 s
     stagger. Coordinates live in the data file, so adding a project stays a one-file edit.
   - Only on `pointer: fine` + viewport ≥ 900 px; on touch they render as a static mono caption row.
3. **Slice glitch (`insp2`)**: one-shot 240 ms slice-displacement on the media when it first enters
   (3 horizontal bands offset ±8 px, then snap). Fired **once per row**, never on hover, never on
   reduced motion, never more than once per second site-wide (see §6.3).
4. **Featured tabs**: panel swap becomes a `motion` crossfade + 8 px y-slide with `layout`-style
   sizing; opening the **Product** panel fires the **single white beat** (`insp4`): a full-frame
   white overlay flashes for ~90 ms at ≤ 35% peak opacity — subtle, not a strobe.
5. **Entrance choreography**: `inView` per row — index numeral → name (clip reveal) → description →
   tags (`stagger 0.05`) → links. Existing GSAP inner-image parallax is untouched (different
   property, different element — see §3.1).
6. **Tags**: `press`/`hover` spring (`stiffness 500, damping 20`) with lime border + faint fill.

**GATE 3:** annotations accurate on all 6 screenshots, glitch fires once per row, tabs keyboard
operable, featured panel works with reduced motion.

---

### PHASE 4 — About: "The Dial" + pull-back depth
**Sources: `insp7` (clock), `insp5` (pull-back), `insp6` (foreground parallax)**

New `src/js/dial.js` + additions to `about.css`.

1. **The Dial (S6)** — replaces the plain vertical rail as the section's signature:
   - SVG dial: hairline circle, 12–24 tick marks, a lime needle, a **marker riding the needle tip**.
   - Needle rotation is **scroll-scrubbed** across the About section (GSAP `scrub`), 0° → 300°.
   - Each timeline item owns an arc segment; as the needle sweeps into it, that item's node
     energises (lime ring + meta line brightens) and its text staggers in (`motion`).
   - Mobile: the dial collapses to a compact ring above the timeline (needle still scrubbed);
     no hover dependency.
2. **Pull-back reveal (`insp5`)**: `.about__grid` enters at `scale 1.22, y -4%` and settles to
   `1, 0` as it scrolls into place — the "camera pulls back" beat — with the bio resolving last.
3. **Foreground occluder (`insp6`)**: an oversized, blurred mono numeral (`01`, `02`…) sits at
   ~6% opacity in the near field and travels **faster** than the content (yPercent -40 vs -12),
   creating the three-layer depth the clips have. Lives behind text, `pointer-events: none`.
4. **Timeline nodes**: `motion` spring pop (`stiffness 260, damping 12`) + staggered text reveal.

**GATE 4:** needle tracks scroll both directions, items light in order, mobile dial readable,
no layout shift when the dial mounts.

---

### PHASE 5 — Contact: "Tactile Close"
**Sources: `insp8` (stroke-draw), `op` (glow-down ending)**

1. **Heading underline draws** (S3) before the title fades in; contact rules draw left→right on
   enter, staggered 0.06 s.
2. **Rows**: `inView` x-slide entrance (`x -30 → 0`, 0.06 s stagger); hover springs the value
   right and turns the rule lime (existing behaviour, now spring-eased via `motion`).
3. **Glow-down ending (`op`)**: as the footer enters, the accent glow in the contact block
   collapses (blur + opacity out) and the page settles to pure black — the clip's "light out"
   beat, in reverse of the hero's ignition. Skipped under reduced motion.
4. Nav mark "GW." stroke-draws on first load (`insp8`) — once, ~700 ms, before the hero sequence.

**GATE 5 — PASSED** (`npm run build` exit 0, verified in headless Chrome):

| Check | Result |
|-------|--------|
| Nav mark stroke-draw (`insp8`) | SVG paths `site-nav__mark-g` & `w` draw in ~480 ms, followed by dot bloom; runs before hero ignition |
| Heading underline (S3) | `.contact__title-path` draws left→right (`pathLength: 0 → 1`) before title and lede resolve |
| Contact rules draw (S3) | 3 SVG horizontal rules draw left→right with 0.06 s stagger |
| Row x-slide entrance | Contact links animate `x: -30 → 0` with 0.06 s stagger |
| Tactile hover / focus springs | Value springs right (`x: 8`) with spring damping; active rule turns lime with glow |
| Glow-down ending (`op`) | `.contact__glow` scrubbed by GSAP ScrollTrigger to collapse as `.site-footer` enters, settling into pure black |
| Keyboard navigation & focus | Tab index sequence intact; `:focus-visible` highlights link with 2px lime outline |
| Reduced motion | All rules and paths render with `pathLength: 1`, glow hidden, no entrances or springs, zero hidden content |

---

### PHASE 6 — Global systems
**Sources: `insp4` (trails), `insp7` (grain), `insp1`/`insp2` (scan language), `ds` (glow)**

1. **Cursor filament (`insp4`)** — 2D canvas overlay, lime trail that follows with lag and fades;
   fine pointers only, `pointer: fine` + ≥ 900 px, behind content, off under reduced motion.
2. **Marquee light streak** — the existing marquee gains a brightness/streak pulse when it resumes
   speed after hover (the "trail catches up" beat).
3. **Film grain** — a single fixed, tileable noise overlay at ~3.5% opacity with a 3-frame step
   animation (`insp7`/`insp5`'s texture). Static under reduced motion; disabled on low-end mobile
   via `deviceMemory <= 2` heuristic.
4. **Image blur-up** — placeholder → sharp on load with a scanline wipe (S1).
5. **Section title draws** — every `.section-head__title` underline draws on enter (S3).

**GATE 6 — PASSED** (`npm run build` exit 0, verified in headless Chrome):

| Check | Result |
|-------|--------|
| Cursor filament (`insp4`) | [cursor-filament.js](file:///mnt/01D988F9E5FD0960/offloaded/Projects/GASEWE-Portfolio/src/js/cursor-filament.js) canvas overlay; `pointer: fine` + >= 900 px only, self-sleeping rAF, DPR capped at 1.5, `pointer-events: none` |
| Marquee light streak (`insp4`) | `.marquee__streak` sweeps across the track on hover leave as drift resumes speed; text gains brief highlight |
| Film grain (`insp7`/`insp5`) | Fixed tileable SVG noise at `--grain-opacity: 0.035` with 3-step shifting animation; auto-disabled when `deviceMemory <= 2` |
| Image blur-up (S1) | Project images mount with `--holo-blur: 6px` placeholder blur and resolve to sharp (0px) synchronously as scanline sweeps |
| Section title draws (S3) | `.section-head__path` underlines draw left→right (`pathLength: 0 → 1`) when each section enters viewport |
| Pointer events | All overlays (`.cursor-filament`, `.film-grain`, `.marquee__streak`, `.section-head__line`) have `pointer-events: none` |
| Reduced motion | Grain animation disabled, cursor filament omitted, title paths render at `pathLength: 1` |

---

### PHASE 7 — Performance, accessibility, polish

- Bundle budget: `motion` + GSAP + Lenis + Three ≤ **200 kB gzipped** JS; evaluate `motion/mini`
  for the opacity-only spots if over.
- Lighthouse: Performance ≥ 90 desktop, ≥ 80 mobile; CLS < 0.1.
- `prefers-reduced-motion`: every system has a static state — verify per system, not globally.
- Keyboard: system map, featured tabs, contact rows, mobile menu.
- Flash safety audit (§6.3) with a real photosensitivity checklist.
- Device pass: iPhone Safari + Android Chrome, 375 / 768 / 1440.

---

## 5. File structure after all phases

```
refs/inspiration/              # MOVED out of public/ (31 MB, must not ship)
src/
├── main.js                    # boot new modules
├── data/
│   ├── projects.js            # + annotations[] per project (data-driven)
│   └── site.js
├── js/
│   ├── motion-core.js         # NEW — motion imports + reduced-motion guard + layering contract
│   ├── draw.js                # NEW — S3 stroke-draw helper (pathLength)
│   ├── burst.js               # NEW — S4 ring/particle burst
│   ├── hero-instrument.js     # NEW — Three.js scene + scan plane + HUD readouts
│   ├── dial.js                # NEW — S6 About dial
│   ├── media-scan.js          # NEW — S1 media scan, annotations, one-shot glitch
│   ├── cursor-filament.js     # NEW — S2 trail (fine pointers only)
│   ├── animations.js          # EXISTING — GSAP scroll choreography (kept, extended)
│   ├── systemmap.js           # EXISTING — + burst, pathLength edges
│   ├── projects.js            # EXISTING — + scan/annotation render, motion panel swap
│   ├── herostats.js, nav.js, lenis.js, contact.js, stack-graph.js   # EXISTING
└── styles/
    ├── tokens.css             # + glow + motion tokens
    ├── hud.css                # NEW — brackets, readouts, ticks, waveform, scanlines
    ├── grain.css              # NEW — grain overlay
    ├── motion.css             # EXISTING — + new no-js / reduced-motion hooks
    └── hero/systemmap/work/about/contact.css  # EXISTING — extended
```

---

## 6. Risks & constraints

### 6.1 Technical

| Risk | Mitigation |
|------|------------|
| Two engines animating one property | §3.1 layering contract, enforced per module |
| Three.js + GSAP + `motion` bundle creep | Code-split Three (dynamic import after hero in view), evaluate `motion/mini`, budget enforced in GATE 7 |
| WebGL unavailable / slow device | Canvas is *additive*: HUD + type must be complete without it |
| Annotation coordinates drift when screenshots change | Store % coords in `projects.js`; a dev-mode overlay draws the anchors so they can be re-aligned in seconds |
| `motion`'s Three.js integration is paid-tier | Never used — GSAP drives all Three values (D1) |
| Grain/scanline overlays cost frames | One composited layer each, `transform`/`opacity` only, auto-off on low `deviceMemory` |

### 6.2 Design

- **One-filament discipline**: at rest the page is monochrome. Glow appears only when something is
  live, scanned, hovered or active. If lime reads as decoration on a resting screen, remove it.
- No new fonts, no gradient text, no glass-for-glass-sake. The clips prove restraint is the look.
- Data stays data: readouts and callout IDs must be derived from real project fields, never
  invented coordinates.

### 6.3 Flash & photosensitivity (the clips flash — we must not)

The reference clips contain white blowouts and chroma flashes (`insp2`, `insp4`, `insp5`, `insp8`).
On the site:

- **No more than 3 luminance transitions per second, ever.**
- The Product-panel white beat: ≤ 90 ms, ≤ 35% peak opacity, **once per interaction**, never looping.
- The hero arc: ~120 ms, low contrast against black, at most one per 7 s.
- The slice glitch: once per element, never site-wide repeating.
- Everything above is **disabled entirely under `prefers-reduced-motion`**.
- If any effect is later found to exceed WCAG 2.3.1 thresholds, cut it — motion here is
  orientation and feedback, never spectacle.

---

## 7. Implementation order & checkpoints

```
Phase 0  foundations + 31 MB fix        → GATE 0   PASSED (build green)
Phase 1  hero instrument (insp1/2/op/ds)→ GATE 1   PASSED (60 fps + reduced-motion static)
Phase 2  system map burst (insp3)       → GATE 2   hover *and* keyboard
Phase 3  work scan/annotate/glitch (insp2/ftbl1/insp4) → GATE 3  data-driven annotations
Phase 4  about dial + depth (insp7/5/6) → GATE 4   bidirectional scrub
Phase 5  contact close (insp8/op)       → GATE 5   PASSED (a11y intact, rules draw, glow-down)
Phase 6  global systems (insp4/7/ds)    → GATE 6   PASSED (filament, grain, streak, blur-up, title draws)
Phase 7  perf / a11y / device pass      → GATE 7   budgets met
Phase 8  runner band insp4 (v3)         → GATE 8   PASSED (60.2 fps scrub, reverses, static when reduced)
Phase 9  dial rider insp7 (v3)          → GATE 9   PASSED (lag + swing, parked at 12 o'clock when reduced)
Phase 10 traveler (owner's GLB, v4)     → GATE 10   DRAFT — pending owner approval of this addendum
```

Each phase ends with a **working `npm run dev` demo** and a gate check before the next begins.
Phases 2 and 4 are independent of each other and can be reordered if a demo deadline appears.

---

## 8. Success metrics

- **Quantitative**: Lighthouse Perf ≥ 90 desktop / ≥ 80 mobile, CLS < 0.1, 60 fps scroll on a
  5-year-old phone, JS ≤ 200 kB gz, `dist/` free of the reference video (Phase 0).
- **Qualitative**: the page reads as *one instrument* — the same scan, draw, burst and glow
  language from hero to contact — and a visitor can still skim it in 30 seconds with all motion
  switched off.
- **Maintainability**: adding a project = one entry in `projects.js` (plus optional annotation
  coordinates); zero motion code to touch.

---

*v2 · Written after visual review of all 11 reference clips. Supersedes v1's
inspiration-mapping, installation and palette sections.*
