# WOW Motion-Driven Creative Portfolio Implementation Plan

## Vision: The Cinematic Story Machine

This portfolio is not a website. It is a single, continuous cinematic experience. Every scroll is a scene transition. Every component is part of a larger story arc.

The visual language is: Dark matter, electric lime, motion as narrative. The user should feel like they are walking through an interactive film about your work.

---

## Tech Stack: Maximum Wow Factor

### Core Framework
- **React 19** - Component composition for story beats
- **Vite** - Lightning fast development
- **Three.js + React Three Fiber** - The wow factor engine
- **GSAP** - Story timing and scroll orchestration
- **Framer Motion** - React-native micro-interactions
- **Lenis** - Buttery smooth scroll

### React Bits Components (reactbits.dev)
We will integrate specific wow components:
- **MagicBento** - Interactive 3D hover cards for projects
- **Stellar** - Starfield background with parallax
- **Aurora** - Ambient light gradients
- **Glass** - Glassmorphic UI elements
- **ShinyText** - Text reveal effects
- **WavyBackground** - Fluid animated backgrounds
- **DotGrid** - Interactive grids for skill visualization
- **ShootingStars** - Atmospheric particles
- **Checkpoint** - Scroll progress indicators
- **TiltedCard** - 3D project showcases
- **TextPressure** - Dynamic typography
- **SpotlightCard** - Focus reveals
- **TextScramble** - Glitch text effects
- **BackgroundGradientAnimation** - Hero backgrounds
- **RippleButton** - Micro-interaction delight

### Three.js Scenes
- **Hero: Living Geometry** - Morphing mesh with scanlines
- **Background: Particle Universe** - 100k particles reactive to cursor
- **Travel: Procedural Runner** - Custom shader animated figure
- **System Map: Interactive nodes** - Your work visualized as network
- **Contact: Light finale** - Expanding light field

---

## Story Arc: 5 Acts of Motion

### ACT 1: The Awakening (Hero)
**Duration:** First viewport

The page loads to darkness. A single lime pulse appears. From it, a 3D geometric form emerges and begins to rotate.

Three.js scene with scanlines slicing through a point cloud. The scanline moves with scroll velocity. The name types itself with TextPressure animation.

React Bits: Aurora background, ShinyText for name, ShootingStars in periphery.

**From refs:** insp1 (scan specimen), insp8 (light ignition)

### ACT 2: The Journey (Traveler)
**Duration:** Hero to About

A stylized figure emerges from the hero geometry and begins to traverse the page.

Built with React Three Fiber + custom shader. The figure is not a model - it's a procedural line-art runner with trailing filaments.

As user scrolls, the figure moves, leaves particle trails, and the background shifts. Different React Bits components activate zone by zone.

**From refs:** insp4 (running figure), insp5/insp6 (scale pullback)

### ACT 3: The System (Work)
**Duration:** Work Section

Your projects are not cards, they are living systems.

Each project is a MagicBento 3D card. On hover, the card tilts in 3D, reveals an interior with code visualizations rendered in Three.js, and spawns particle connections to related projects.

Grid of cards with DotGrid background. Each card scanline reveals on scroll into view.

React Bits: MagicBento, TiltedCard, DotGrid, SpotlightCard

**From refs:** insp2 (point cloud bust), insp3 (hands approaching orb)

### ACT 4: The Dial (About)
**Duration:** About Section

A massive circular instrument fills the viewport. Clock hands sweep as you scroll.

The dial is a WebGL component with custom shaders. Rider figure from UBC/UAL animations sits on the hand, lagging realistically.

Text appears as the dial segments activate. Each timeline entry triggers a different particle burst pattern.

React Bits: Checkpoint progress ring, WavyBackground in the rim

**From refs:** insp7 (rider on clock), op.mp4

### ACT 5: The Resolution (Contact)
**Duration:** Final viewport

All motion converges to a single point. The particle universe contracts, the runner figure slows and fades, and the screen resolves to a clean contact interface.

A final white beat flashes, then the lime accent fades to a resting state.

React Bits: BackgroundGradientAnimation, RippleButton for CTA

**From refs:** ds.mp4 (dark system resolve)

---

## Component Architecture

### 1. App Shell
```
<App>
  <ParticleUniverse />        // Persistent Three.js background
  <ScrollController>          // GSAP + Lenis orchestration
    <HeroAwakening />
    <JourneyTraveler />
    <WorkSystems />
    <DialAbout />
    <ContactResolution />
  </ScrollController>
</App>
```

### 2. Key Components

**HeroAwakening:**
- Three.js: MorphingGeometry with scanlines
- React Bits: Aurora, ShinyText, ShootingStars
- Scroll trigger: Scanline moves with scroll progress

**JourneyTraveler:**
- Three.js procedural runner with shader trails
- React Bits: Checkpoint for progress
- WebGL particle system following figure

**WorkSystems:**
- Grid of MagicBento cards
- Each card: 3D tilt, internal Three.js canvas
- DotGrid background
- Connection lines between related projects

**DialAbout:**
- Full-screen Three.js dial
- Rider figure with custom animation
- Timeline segments trigger text reveals

**ContactResolution:**
- Contracting particle field
- Minimal glass panel interface
- Final lime pulse

---

## Implementation Phases

### Phase 1: Foundation (3 days)
1. Set up React + Vite + Three.js + GSAP
2. Create base design system with lime/near-black tokens
3. Build ParticleUniverse background component
4. Set up scroll controller with GSAP + Lenis

### Phase 2: Hero Awakening (2 days)
1. Create MorphingGeometry Three.js component
2. Add scanline system
3. Integrate ShinyText and Aurora
4. Implement hero entrance timing

### Phase 3: Journey System (3 days)
1. Build procedural runner with Three.js
2. Implement trail particle system
3. Add zone-based React Bits backgrounds
4. Create figure shader with lime trails

### Phase 4: Work Systems (4 days)
1. Integrate MagicBento for project cards
2. Build internal Three.js preview for each project
3. Implement DotGrid and connection lines
4. Add hover 3D interactions

### Phase 5: Dial About (3 days)
1. Build Three.js dial component
2. Integrate UBC rider figure
3. Implement scroll-triggered sweep
4. Add timeline segment reveals

### Phase 6: Resolution & Polish (2 days)
1. Build particle contraction effect
2. Implement contact glass interface
3. Add micro-interactions with RippleButton
4. Performance optimization

---

## Specific Ref Integration

From refs/inspiration/:

**insp1.mp4** - Scan specimen
- Hero scanlines
- Work card reveal scan

**insp2.mp4** - Point cloud bust
- Hero geometry
- Work system visualization

**insp3.mp4** - Hands approaching orb
- Project hover interactions
- Contact CTA reveal

**insp4.mp4** - Running figure
- Journey traveler
- Particle trails

**insp5.mp4, insp6.mp4** - Scale pullback
- Work section zoom effects
- Dial transitions

**insp7.mp4** - Rider on clock
- About dial section
- Timeline rider figure

**op.mp4, ds.mp4, ftbl1.mp4** - System states
- Hero ignition
- Contact resolution
- Particle bursts

---

## Performance Targets

- First paint: < 1.5s
- Interactive: < 2.5s
- 60fps on scroll
- Lighthouse score: 95+
- Total JS bundle: < 350KB gzipped
- All Three.js scenes use: 
  - Instancing for particles
  - Frustum culling
  - DPR capped at 1.5
  - Idle state pauses rendering

---

## The Wow Moments

1. **Initial ignition** - Darkness to lime pulse to geometry emerge
2. **First scroll** - Runner appears and starts moving
3. **Work hover** - Cards tilt in 3D revealing internal systems
4. **Dial entrance** - Full screen dial wipe transition
5. **Final fade** - Everything contracts to contact point
6. **Micro-delights** - Every button has ripple, every card has tilt, every scroll has momentum

This is not a portfolio. This is an interactive short film about your work.

Next step: Build the foundation and create the first wow moment in the hero section.
