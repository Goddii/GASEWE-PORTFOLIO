# GASEWE Portfolio — Brief (Section 2)

PRODUCT: Personal portfolio for Godwin, full-stack developer, Nairobi, Kenya.
Visitors: recruiters, hiring managers, developers. They must understand in 5 seconds who he is,
see real shipped systems with depth, and find contact/GitHub.

CONCEPT — "SIGNAL":
The site is a dark room where one filament of lime light wakes up, scans Godwin's work,
and traces how each real system is built. It is NOT a generic sci-fi HUD. Three ideas make it unique:
  1. LIGHT BEFORE FORM — things ignite from a point of light, then take shape (reference: op.mp4).
  2. A TRAVELER — a small baked silhouette runner (already built) who moves through the page
     and reacts to what he reaches (reference: insp7 clock-hand rider).
  3. SYSTEMS IN MOTION — every project has an animated diagram of how its real architecture
     works (e.g. an M-Pesa STK Push round-trip). This is the portfolio's signature.

CHAPTERS (scroll narrative, one page + case-study routes):
  0 Ignite   — loader: lime point of light blooms, name forms.             (hero)
  1 Specimen — framed scanning instrument with point cloud.                 (hero, exists)
  3 Map      — how technologies connect the projects.                       (#systems, exists)
  3 Work     — project cards; click opens an animated case-study page.      (#work + /work/:slug)
  4 Path     — experience timeline on the dial with the rider.              (#about)
  5 Close    — contact; the machine powers down.                            (#contact)

TOKENS (src/styles/tokens.css is the source of truth): lime #c8f542, ground ~#0a0c08, Montserrat.

FILE MAP (the ONLY architecture — vanilla):
  index.html                 static markup for all sections
  src/main.js                boot order
  src/data/projects.js       projects (single source of truth for work + system map + stats)
  src/data/site.js           name, email, github
  src/js/motion-core.js      motion engines + reduced-motion owner
  src/js/*.js                one module per feature (hero-instrument, traveler, dial, systemmap, ...)
  src/styles/*.css           one stylesheet per feature, imported in src/main.js

IDENTITY RULES:
- Take the person's name ONLY from src/data/site.js (`site.fullName`). Do not hard-code a surname in HTML/JS.
- Real projects (do not rename or add): Vyloc, Dai, SokoMtaani, PitchTrack, DigiArts, Jacket Masters, Workout API.
- Real facts you may use: BSc Information Technology, Maseno University (Dec 2022);
  Software Engineering, Moringa School (completed 2026); earlier career in branch operations
  management and credit roles; freeCodeCamp Scientific Computing with Python (Nov 2023).
  Employer names / dates for the earlier career are [CONFIRM].