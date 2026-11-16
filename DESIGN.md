---
name: Godwin — Full-stack Developer Portfolio
description: One filament of electric lime through near-black — a quiet instrument panel of shipped work.
colors:
  near-black: "#0a0c08"
  raised-surface: "#0f120c"
  raised-surface-2: "#141810"
  ink: "#eef1e6"
  ink-soft: "#c2c9b4"
  ink-muted: "#8d957c"
  electric-lime: "#c8f542"
  electric-lime-deep: "#a9d92e"
  hairline: "rgba(238, 241, 230, 0.14)"
  hairline-soft: "rgba(238, 241, 230, 0.07)"
  glass: "rgba(10, 12, 8, 0.82)"
typography:
  display:
    fontFamily: "'Montserrat', system-ui, sans-serif"
    fontSize: "clamp(3.6rem, 13vw, 7.5rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "'Montserrat', system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 6.5vw, 4.6rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  title:
    fontFamily: "'Montserrat', system-ui, sans-serif"
    fontSize: "clamp(1.8rem, 4vw, 2.7rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  body:
    fontFamily: "'Montserrat', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0"
  label:
    fontFamily: "'Space Mono', ui-monospace, monospace"
    fontSize: "0.78rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.08em"
rounded:
  sm: "10px"
  md: "14px"
  lg: "18px"
spacing:
  gutter: "clamp(1.25rem, 4vw, 4.5rem)"
  section-gap: "clamp(5.5rem, 13vh, 9.5rem)"
  measure: "62ch"
components:
  nav-link:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    height: "1.4rem"
  stack-tag:
    backgroundColor: "{colors.raised-surface}"
    textColor: "{colors.ink-soft}"
    rounded: "999px"
    padding: "0.4rem 0.7rem"
  project-media:
    backgroundColor: "{colors.raised-surface-2}"
    rounded: "{rounded.lg}"
  ghost-link:
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
---

# Design System: Godwin — Full-stack Developer Portfolio

## Overview

**Creative North Star: "The Instrument Panel"**

The site presents a developer's shipped work the way a well-built instrument panel presents a machine: a near-black field, one electric-lime filament of light, hairline rules, and data set in mono. Nothing shouts; everything is legible at a glance. The world is quiet and precise — a Nairobi developer's work shown under a single lime lamp, with whitespace and restraint doing the work that decoration usually does.

The system is deliberately anti-template: no hero-screenshot-plus-card-grid, no gradient text, no glass for decoration. Projects are described in paragraphs (what it does, the stack, the context) rather than thumbnailed into sameness, and motion is orchestrated as one authored system (smooth scroll, scroll-driven reveals, a single light 3D accent) rather than scattered hover effects.

**Key Characteristics:**
- Near-black green-tinted grounds with one electric-lime accent used as a *system*, not decoration
- Hairline rules and mono data labels (indices, tags, coordinates) throughout
- Montserrat variable font for all text (display, headline, title, body); Space Mono reserved for data
- Scroll-driven motion: Lenis smooth scroll, GSAP ScrollTrigger reveals and parallax, one light Three.js accent
- Restraint is the brand: generous whitespace, more space above headings than below

## Colors

One accent filament on a green-tinted near-black ground. The lime appears at every point of interaction (active nav, scroll cue, timeline nodes, tags on hover, link underlines) and nowhere decorative.

### Primary
- **Electric Lime** (`#c8f542`, deep `#a9d92e`): The single accent. Active nav link, project index numerals, tagline separator, timeline nodes and rail, tag hover, link underline, scroll cue. Its rarity is the point — it marks *where to look*.

### Neutral
- **Near-Black** (`#0a0c08`): Page ground. Green-tinted, never pure black.
- **Raised Surface** (`#0f120c`) / **Raised Surface 2** (`#141810`): Tag backgrounds, image frame bases.
- **Ink** (`#eef1e6`): Primary text — near-white with a green cast.
- **Ink Soft** (`#c2c9b4`): Secondary text, tag text.
- **Ink Muted** (`#8d957c`): Tertiary text, meta, coordinates. Meets AA on near-black.
- **Hairline** (`rgba(238,241,230,0.14)` / `0.07`): Rules, borders, dividers.
- **Glass** (`rgba(10,12,8,0.82)`): Scrolled header, image-frame badge — functional translucency, never decorative blur.

### Named Rules
**The One Filament Rule.** Electric lime is reserved for interactive and orienting moments; it never fills backgrounds or borders at rest. If lime is used on more than ~5% of a resting screen, it's decoration.

## Typography

**Display Font:** Space Grotesk (fallback Instrument Sans, system-ui)
**Body Font:** Instrument Sans (fallback system-ui)
**Label/Mono Font:** Space Mono (fallback ui-monospace, SF Mono)

**Character:** A confident geometric grotesque (Space Grotesk) carries the display voice — technical but warm, unmistakably a maker's face. Instrument Sans does quiet body work at generous measure. Space Mono is data-only: project indices, stack tags, coordinates, meta lines — never as a "tech costume."

### Hierarchy
- **Display** (700, `clamp(3.6rem, 13vw, 7.5rem)`, 0.95, -0.04em): Hero name only.
- **Headline** (600, `clamp(2.4rem, 6.5vw, 4.6rem)`, 1.05, -0.03em): Section titles.
- **Title** (600, `clamp(1.8rem, 4vw, 2.7rem)`, 1.05, -0.03em): Project names, timeline titles.
- **Body** (400, `1rem`, 1.65): Paragraphs, capped at 62ch measure.
- **Label** (400, `0.78rem`, 0.08em tracking, uppercase): Nav links, tags, meta.

### Named Rules
**The Data-Mono Rule.** Mono never decorates. It appears only where the content is data: index numerals, stack tags, coordinates, meta labels. Body copy is never set in mono.

## Layout

A single-column scroll with a `1320px` content max, `clamp(1.25rem, 4vw, 4.5rem)` gutters, and `clamp(5.5rem, 13vh, 9.5rem)` section rhythm. More space above headings than below. Project rows alternate media/body on desktop (`grid-template-columns: 1.1fr 1fr`, flipped on odd rows) and stack image-above-text below `900px`. The hero is a full-`100svh` stage with the type bottom-anchored and the 3D canvas breathing on the right; below `720px` the canvas drops behind the type at low opacity and the scroll cue hides. Nav collapses to a hamburger + full-screen menu below `720px`.

## Elevation & Depth

Tonal layering first: raised surfaces (`--bg-1`, `--bg-2`) against the near-black ground, with hairline borders separating content bands. Shadows are sparse and ambient, used only where an element genuinely sits above the field:

- **Frame lift** (`0 1px 2px rgba(0,0,0,0.4), 0 12px 32px -12px rgba(0,0,0,0.65)`): project image frames.
- **Deep shadow** (`0 24px 64px -24px rgba(0,0,0,0.8)`): reserved for large surfaces.

Depth also comes from motion: the lime timeline rail draws down the page, project images drift inside their frames on scroll, and the 3D hero accent rotates slowly behind the type.

### Named Rules
**The Flat-At-Rest Rule.** Surfaces are flat at rest; shadows appear only on elements that earn elevation (image frames). No hard offset shadows, no glow-as-decoration.

## Shapes

Rounded-rectangle family with tight radii: `10px` (small controls, tags), `14px` (medium), `18px` (project image frames). Pills (999px) are reserved for small data chips — stack tags and the live-site badge. Hairline `1px` borders (`--line-soft`) inset on image frames via a pseudo-element overlay. No other clipping, no shapes-within-shapes.

## Components

### Navigation
- **Style:** Fixed header, transparent until scroll, then glass (`--glass`, blur 14px) with a hairline bottom border.
- **Mark:** "GW." — Space Grotesk 700, lime dot.
- **Links:** Space Mono 0.78rem uppercase; ink-soft at rest, ink on hover, lime when active with a lime underline that draws left-to-right.
- **Mobile:** Hamburger with two bars morphing to an X; full-screen near-black overlay with large Space Grotesk links that translate right on hover.

### Project Rows (signature)
- **Media:** 16/10 aspect frame, `--r-lg` radius, `--shadow-1`, hairline overlay border, "Live site" glass badge with a pulsing lime dot. Inner image is 124% and drifts on scroll (GSAP parallax).
- **Body:** mono index numeral (lime, CSS-counter driven `01`–`05`), Space Grotesk name, tagline, description in ink-muted, stack tags, and link pair.
- **Links:** "Live site" with an arrow that nudges on hover; ghost GitHub link (muted mono) that shows "add link" until a repo URL is supplied.

### Stack Tags
- **Style:** `--bg-1` chip, hairline border, mono 0.72rem uppercase, pill radius.
- **State:** Border and text go lime with a faint lime fill on hover.

### Contact Rows
- **Style:** Full-width rows separated by hairlines; mono label left, Space Grotesk value right.
- **State:** Border-top turns lime, label turns lime, value translates right on hover.

### Timeline (signature)
- Vertical 2px rail on the left with a lime progress fill (scroll-scrubbed); lime-ringed nodes pop in with a back-ease; mono accent meta lines ("Software Engineering · Present").

## Do's and Don'ts

### Do:
- **Do** use electric lime only for interaction and orientation — nav active, links, indices, nodes, tags on hover.
- **Do** set data (indices, tags, coordinates, meta) in Space Mono.
- **Do** keep paragraphs at or under 62ch and set body in Instrument Sans.
- **Do** give more vertical space above headings than below.
- **Do** use hairline rules and tonal layering for separation before reaching for shadows.
- **Do** honor `prefers-reduced-motion`: everything is visible and static without JS or motion.

### Don't:
- **Don't** use gradient text, glass blur as decoration, or hard offset shadows.
- **Don't** add eyebrows/kickers above headings — headings carry their own weight.
- **Don't** set body copy in mono or decorate with emoji/Unicode glyphs.
- **Don't** exceed `-0.04em` display tracking.
- **Don't** ship project rows as equal image+title cards — every project carries a real description.
- **Don't** hard-code colors; the palette lives in `src/styles/tokens.css` and the frontmatter above.
