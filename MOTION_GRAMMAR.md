# Motion Grammar: Godwin Portfolio

This document defines the reusable motion language of the portfolio. All animations and transitions must adhere to these principles to maintain the "instrument panel" aesthetic.

## 1. Core Principles

- **Utility over Decoration:** Motion should reveal, orient, or signal—never just decorate.
- **Measured Cadence:** All movements have a clear start, peak, and finish. No chaotic or erratic motions.
- **The One Filament Rule:** Electric lime (`#c8f542`) is reserved for interaction, progression, and signals. It should never fill a background.
- **Reduced Motion:** If `prefers-reduced-motion` is detected, animations are static. The layout must remain functional and clear without JS motion.

## 2. The Vocabulary

### Scan
- **Purpose:** Indicates the system is active and orienting.
- **Implementation:** A horizontal or vertical sweep line, slightly transparent, moving across a framed area.
- **Easing:** Linear or slight ease-in-out.
- **Use:** Hero stage, project media entry.

### Pulse
- **Purpose:** A moment of signal, contact, or importance.
- **Implementation:** A short (≤ 90ms) expansion and fade of a lime light, or a subtle opacity shift on an interactive element.
- **Use:** Project hover, nav link activation, data burst points.

### Sweep
- **Purpose:** Progression through a sequential data set.
- **Implementation:** An arc or linear progression that fills as the user scrolls.
- **Use:** About dial, traveler journey rail, section navigation.

### Trail (Filament)
- **Purpose:** Showing the path of motion; memory.
- **Implementation:** A fading, tapering lime polyline following a moving point (e.g., cursor, traveler, marker).
- **Use:** Traveler path, cursor filament.

### Reveal
- **Purpose:** Introducing content in a controlled manner.
- **Implementation:** Text or elements sliding up/in with a staggered fade, timed with the scan or pulse cadence.
- **Use:** Hero headline, project descriptions, contact rows.

### Arrival / Settle
- **Purpose:** Completing a section, anchoring the viewer.
- **Implementation:** A graceful deceleration to a halt, followed by a slight glow-down (reduction of opacity).
- **Use:** End of section, contact footer.

## 3. Performance Rules
- **Canvas > DOM:** Dense or multi-object motion (particle fields, scans, trails) must run on a 2D canvas, not DOM nodes.
- **Scroll-Driven:** GSAP `ScrollTrigger` is the source of truth for progress.
- **State-Based Repaints:** Idle state = 0 frames painted. Animations should pause when off-screen or reduced motion is active.
