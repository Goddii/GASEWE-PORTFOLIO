# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vanilla HTML/CSS/JS modules + Vite (build/dev server), GSAP + ScrollTrigger, Lenis, Three.js. No React/Vue — static personal site. (User-confirmed stack from the brief.)

## Users

Hiring managers, recruiters, and fellow developers who land on Godwin's portfolio. Job: quickly judge craft, taste, and breadth from real shipped projects, then find a contact path. Primary user is the visitor evaluating the developer; secondary user is Godwin himself, who must be able to add projects by editing one data file.

## Product Purpose

A personal developer portfolio for **Godwin**, a full-stack developer in Nairobi, Kenya. Success = a visitor understands who he is and what he builds within seconds, reads 3–4 real projects with enough depth to assess skill, and can contact him or open his GitHub. More projects get appended over time — the projects section must be data-driven so growth costs one file edit.

## Positioning

Full-stack developer with a design sensibility — he builds complete, cinematic products (storefronts, platforms, marketplaces) for the Kenyan market rather than demo components. The portfolio proves breadth of shipped work: React + Flask + PostgreSQL full-stack platforms alongside polished front-end storefronts.

## Operating Context

Visited on desktop (primary, at 1440px) and mobile (375px). Lightweight static hosting (Vercel-class). The visitor scrolls — smooth scrolling, scroll-driven reveals, and a light 3D/WebGL hero accent are part of the experience; must hold 60fps on mid-range mobile GPUs and degrade gracefully (prefers-reduced-motion, no-JS, slow devices).

## Capabilities and Constraints

- Sections: Hero (name, tagline, subtle 3D accent, scroll cue), Projects (name, 2–3 sentence description, tech tags, live link, GitHub link, preview image), About (bio + education/timeline: Moringa School, self-directed full-stack path), Contact (email, GitHub, LinkedIn — placeholders where links are unconfirmed).
- Seven real projects: Vyloc, Dai, SokoMtaani, PitchTrack, DigiArts, Jacket Masters, Workout API (deployed; GitHub URLs and some contact links are `[add ...]` placeholders to be filled later).
- Fully responsive mobile-first (375 / 768 / 1440). Lazy-loaded images, deferred non-critical JS, lightweight Three.js scene.
- Semantic HTML, alt text, focus states, reduced-motion fallback.
- No inline styles; CSS custom properties for the theme palette.
- Project preview images: placeholder path `/assets/projects/<slug>.png` until real screenshots are supplied.

## Brand Commitments

- Name: Godwin. Tagline: "Full-stack developer — Nairobi, Kenya".
- Design direction (brief-pinned): minimal, clean, lots of whitespace, restrained typography (Montserrat variable font for all text), parallax/scroll-driven motion, subtle 3D or interactive hero element, dark elegant palette with **one accent color** (electric lime #c8f542 as a thin filament), smooth scroll.
- User-confirmed: accent = electric lime; font = Montserrat (self-hosted variable woff2).
- Reference for design language (not to be copied): https://my-portfolio-mu-eight-22.vercel.app/

## Evidence on Hand

- Five live projects with URLs and stacks (supplied in brief). No screenshots yet — placeholders used.
- Education: Moringa School student; self-directed full-stack path.
- No real email / GitHub / LinkedIn URLs supplied — must remain visibly replaceable placeholders, never invented claims.

## Product Principles

1. The work leads: shipped projects with real descriptions and links come before biography; depth over decoration.
2. One authored motion system: smooth scroll + scroll-driven reveals + one light 3D accent, not scattered effects.
3. Restraint is the brand: dark, quiet, one electric accent; whitespace and typography do the talking.
4. Data-driven by construction: adding a project must be a one-file edit, never HTML surgery.
5. Fast and inclusive by default: lazy assets, deferred JS, reduced-motion fallback, semantic markup.

## Accessibility & Inclusion

Reduced-motion support (disable parallax/3D/smooth scroll under `prefers-reduced-motion`), keyboard-focusable nav and links with visible focus states, alt text on all images, semantic landmarks and heading order, sufficient color contrast (electric lime on near-black passes AA for large text and controls; body text uses high-contrast neutrals).
