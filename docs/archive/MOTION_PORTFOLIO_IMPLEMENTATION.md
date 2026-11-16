# Motion-Driven Creative Portfolio Implementation

## Vision

This portfolio should feel like a living instrument panel, not a static website with decoration. The aesthetic is: near-black, lime-light, measured motion, restrained graphics, and a story that unfolds as the user scrolls. The reference videos in `refs/inspiration/` are not to be copied literally—they are a library of motion grammar: scans, pulses, sweeps, trails, reveals, and arrivals.

The portfolio should feel like a machine waking up, reading the viewer, and then slowly powering down at the end.

---

## Recommended free model stack

### Best free model choice for this project

The best fit is the stylized humanoid base from the Quaternius `UBC` pack, paired with an animation from the `UAL` pack.

Why this is the strongest option:
- clean silhouette
- low-poly, readable under a strong monochrome palette
- works beautifully with a lime-only accent system
- animation clips are already in a motion-friendly, looping style
- it matches the runner/traveler concept without requiring realistic detail
- it keeps the site elegant rather than gimmicky

In your repo, the relevant directories already hint at this direction:
- `refs/models/ubc/`
- `refs/models/ual/`

### Best practical recommendation

Use:
- `UBC` = body / figure / base character
- `UAL` = run, jog, or sprint loop

Then bake the animation into a sprite sheet or frame atlas for runtime rendering. That gives you:
- Light runtime cost
- Crisp silhouette readability
- A more premium “crafted” look than a live glTF viewer in the browser
- A result that fits the site’s instrument aesthetic

### Why not use the monkey-king model as the primary figure

The monkey-king model is strong visually, but it is a more character-specific silhouette. It is great for a hero accent or an expressive detail, but it is less universal for a clean “traveler” across the site. The UBC runner gives a much nicer baseline for a minimal, cinematic motion-driven portfolio.

---

## Creative objective

The portfolio should tell a story in motion:
1. Wake up
2. Discover the system
3. Move through work
4. Feel the process
5. Fade into a thoughtful close

The narrative is more important than the individual effects.

---

## Implementation phases

### Phase 1 — Define the motion vocabulary

Before adding animation, define the visual motion rules:
- scan line = the system is active
- pulse = a moment of signal or contact
- sweep = progression through an instrument or data screen
- trail = movement memory, not direct motion
- reveal = content emerges on a measured cadence
- arrival = the user reaches a section and the system settles

Create a small design sheet with these motions and their use cases.

Deliverables:
- motion grammar document
- reduced-motion rules
- allowed animation speeds
- performance rules (no heavy animation everywhere)

---

### Phase 2 — Hero sequence: the machine wakes up

Build the hero as the first “wow” moment.

Structure:
- dark backdrop with fine grain
- framed instrument panel or object stage
- lime scan line crossing the object
- rotating or shifting specimen / point-cloud figure
- headline reveals in time with the object motion
- subtle nav and CTA fade-in

The hero should feel like the site is booting and coming alive.

Creative twist:
- Add a small stagger between the object motion and the text reveal
- Keep the hero smooth and controlled; do not overdrive it
- Use one strong lime signal at key moments, not constant glow

---

### Phase 3 — Add the page-traveler / runner

This is the story spine of the portfolio.

Use a stylized runner figure that:
- starts in the hero region
- moves through the page with scroll progress
- becomes brighter while scrolling
- dims when the page is resting
- fades near the footer

This is the main narrative device and gives the site a clear sense of journey.

Important aesthetic rule:
- The runner should not feel like a cartoon mascot
- It should feel like a system marker or signal figure
- This keeps it aligned with the instrument-panel design language

---

### Phase 4 — About section: instrument logic and rider motion

The About section should use a dial / arc system inspired by the clock-sweep references.

Use:
- a subtle circular or semi-circular sweep
- one rider or marker that lags behind motion
- active segment highlighted in lime
- text reveal timed to the rider settling

This section should read like the system is evaluating the story of the maker.

Creative twist:
- Add subtle asymmetry to the rider motion so it feels human, not mechanical
- Let the highlight arc travel with the scroll for a tactile sense of progress

---

### Phase 5 — Work section: project cards as living systems

Each project card should behave like a small instrument, not a static tile.

For each project:
- media frame reveals on scroll
- slight parallax when the section is in view
- accent line or filament pulse on hover
- tags emerge on a measured rhythm
- body copy appears with staggered reveal

Design principle:
- the project should feel exhibited by a machine, not just displayed on a grid

Creative twist:
- Add a thin lime trace or underlight behind the media block when it becomes active
- Keep the glow low-opacity and measured so it stays premium

---

### Phase 6 — System-map / abstract motion layer

Introduce a lightweight “data layer” made of abstraction rather than literal UI:
- signal lines
- particle movement
- faint orbits
- subtle pulses
- minimal rings or traces

This is where the references like `insp2`, `insp3`, and `ftbl1` become useful.

Use this layer sparingly:
- one or two recurring abstract patterns are enough
- let the real content remain readable

---

### Phase 7 — Contact section: soft shutdown and final glow

The final section should not scream. It should resolve.

Use:
- soft underline draw
- final accent fade
- contact rows sliding in cleanly
- subdued glow that fades into the dark field

This is where the portfolio closes like a machine powering down gracefully.

---

### Phase 8 — Performance, reduced motion, and polish

Before calling the build complete, verify:
- no unnecessary animation loops
- GSAP controls the scroll state
- canvas is used where dense motion is required
- CSS handles micro-interactions
- reduced motion collapses into a readable, static experience
- the portfolio still feels good without JS

This is a design and engineering requirement, not a final tweak.

---

## Recommended build order

1. Base layout and dark theme
2. Hero stage and instrument motion
3. Scroll-driven state system
4. Traveler/runner narrative
5. About dial and rider section
6. Project card motion system
7. Abstract data motion layer
8. Contact close sequence
9. Reduced-motion pass
10. Performance tuning and polish

---

## Strong creative direction for this portfolio

The most compelling version of this project is not a portfolio with effects layered on top. It is a portfolio that behaves like an intelligent system.

The user should feel:
- the page is alive
- the system is scanning and revealing work
- motion belongs to the story, not to decoration
- the site is high-end and intentional

This is exactly the kind of portfolio that feels unforgettable.

---

## Best asset recommendation for the final prototype

Use a stylized humanoid runner from the `UBC` pack, coupled with a `UAL` run loop. This is the best match for your current aesthetic and the strongest free solution for a motion-driven portfolio.

If you want a more iconic silhouette, the Monkey King model can be used as a secondary accent, but it should not be the primary motion figure for the full narrative arc.

### Final recommendation

Primary model: `UBC` humanoid base character
Secondary motion: `UAL` run / jog / sprint loop
Render method: baked sprite sheet or frame atlas
Purpose: page traveler / runner / motion-led narrative figure

This gives you the cleanest implementation path and the best visual alignment with your motion-driven portfolio vision.
