# What changed in this pass

## Fixed (was broken)
- **Home page was rebuilt from a JS string** in router.js, replacing the real About section with invented
  facts (radios/bicycles, "DevKit", "Kipimo", "DocuFind", running/vinyl hobbies), a wrong email and a wrong
  LinkedIn slug. Home markup is static in index.html again; the router only shows/hides views.
- **Work cards rendered as empty boxes** (`hover is not a function`): the lazy-motion refactor broke
  media-scan/hero/dial/projects modules. Reverted those to the working versions.
- **Duplicate `view-transition-name`** on every card image aborted all transitions. Now one element owns the
  name at a time (`.vt-hero`, added/removed by the router).
- **casestudy.css used CSS variables that don't exist** (--space-lg, --accent...). Rewritten with real tokens.
- Horizontal overflow on About; per-card trail canvases ran forever (now only while on screen).
- Scroll position after Back (Lenis limit was stale while home was hidden).
- Three.js was never imported by shipped code (hero is 2D canvas): removed the phantom `three` chunk; `three`
  is a devDependency again (used only to bake the runner sprite).

## Added
- Animated system diagrams (src/js/flow.js) from data: Vyloc, YFixIt, Dai, SokoMtaani, Shadow Sorceress.
- Case-study pages /work/:slug with shared-element transition (View Transitions) + GSAP shutter fallback,
  direct-load support, 404 "Signal lost.".
- New projects from your GitHub: YFixIt, The Shadow Sorceress, Yetu Housing Agency. (ForestOS excluded.)
- Experience timeline from your CV (src/data/experience.js) driving the dial.
- Contact: email, GitHub, LinkedIn, CV download (src/data/site.js).

## Needs you
- Screenshots: save public/assets/projects/{yfixit,shadow-sorceress,yetu-housing}.webp and set image + alt in
  src/data/projects.js (they show a system sketch until then).
- Verify the five `flow` diagrams against your repos (drawn from README/CV facts only).
- Shadow Sorceress live URL (live: null). Vyloc says "scrum master" (CV) not "architect".
- Hackathon lines come from your CV and notes; confirm wording.
- Not done: traveler v2 chapter-aware clips (needs re-baking from refs/models), hero point-cloud morph.
