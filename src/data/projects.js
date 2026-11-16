/**
 * Project data — single source of truth for the "Selected work" and "Engineering map" sections.
 *
 * Flagship builds:
 *   1. The Exodus (Agentic AI workflow system, Jitume Hackathon 1st Place National Winner)
 *   2. Vyloc (Fintech wallet, Safaricom Daraja M-Pesa STK push, JWT auth, PostgreSQL data layer)
 */
export const projects = [
  {
    slug: 'the-exodus',
    name: 'The Exodus',
    tagline: 'Multi-agent AI pipeline transforming client meeting noise into production briefs & pricing proposals',
    meta: '1st Place Champion · Jitume Tech Challenge',
    category: 'ai',
    award: '1st Place Champion · Jitume Tech Challenge',
    featured: true,
    description:
      'The Exodus is an agentic AI system engineered to automate agency client onboarding and proposal modeling. Built for GDF Kenya and awarded 1st Place Champion at the Jitume Tech Challenge, it takes unstructured meeting transcripts and runs a two-stage LLM workflow via NVIDIA NIM APIs: Agent 1 parses messy stakeholder discussions into structured briefs, while Agent 2 cross-references agency rate cards and historical benchmarks to generate scoped client proposals with an interactive human-in-the-loop review workflow.',
    problem:
      'Communications and software agencies lose 15+ hours per client engagement manually reviewing meeting recordings, drafting briefs, and recalculating pricing models against fluctuating rate cards, leading to scope creep and delayed proposals.',
    solution:
      'A dual-agent AI pipeline built on Flask and React. Agent 1 parses raw transcript noise into structured deliverables, timelines, and risk assessments. Agent 2 synthesizes the brief, follow-up transcripts, and internal rate cards into client proposals with scoped pricing tables, backed by human-in-the-loop account manager approval.',
    myContribution:
      'Architected the multi-agent orchestration pipeline, prompt chaining for NVIDIA NIM microservices, structured Pydantic schema validation for deterministic JSON outputs, and the full-stack Flask/React review interface.',
    challenges:
      'Extracting consistent, structured pricing tables and risk matrices from unstructured meeting transcripts required strict JSON schema enforcement via Pydantic and multi-tier prompt chaining to eliminate hallucinated rate-card items.',
    stack: ['React', 'TypeScript', 'Python', 'Flask', 'NVIDIA NIM', 'SQLAlchemy', 'Pydantic'],
    architecture: ['Transcript Ingestion', 'Agent 1: Brief Generator', 'Agent 2: Scoped Proposal', 'Account Manager Approval'],
    live: null,
    repos: [{ label: 'GitHub', url: 'https://github.com/Dapper434/ProjectGen' }],
    flow: {
      title: 'Agentic transcript-to-proposal execution pipeline',
      nodes: [
        { id: 'transcript', label: 'Raw Meeting Audio/Transcript', x: 8, y: 50 },
        { id: 'agent1', label: 'Agent 1: Brief Synthesizer', x: 32, y: 24 },
        { id: 'ratecard', label: 'Rate Cards & Benchmarks', x: 32, y: 76 },
        { id: 'agent2', label: 'Agent 2: Scoped Proposal Engine', x: 64, y: 50 },
        { id: 'approval', label: 'Human-in-the-loop Approval', x: 92, y: 50 },
      ],
      steps: [
        { from: 'transcript', to: 'agent1', label: 'Parse objectives, timeline, deliverables & risk' },
        { from: 'ratecard', to: 'agent2', label: 'Inject agency pricing models' },
        { from: 'agent1', to: 'agent2', label: 'Forward validated Production Brief' },
        { from: 'agent2', to: 'approval', label: 'Generate client proposal with scoped pricing table' },
        { from: 'approval', to: 'agent2', label: 'Account manager inline edit & one-click sign-off' },
      ],
    },
    image: '/assets/projects/the-exodus.png',
    alt: 'The Exodus AI agency workflow sign-in and pipeline dashboard',
    annotations: [
      { x: 22, y: 46, id: 'EXO-1', label: 'Agent 1 Brief Generation' },
      { x: 74, y: 58, id: 'EXO-2', label: 'Scoped Pricing Table' },
    ],
    metrics: [
      { label: 'Award', value: '1st Place' },
      { label: 'Agent count', value: 'Dual-agent NIM' },
    ],
  },
  {
    slug: 'vyloc',
    name: 'Vyloc',
    tagline: 'Money transfer & digital wallet — team capstone',
    meta: 'Team project (4) · Full-stack & Scrum Master',
    category: 'fintech',
    featured: true,
    description:
      'A secure, mobile-friendly digital wallet for sending money, managing beneficiaries and topping up over Safaricom M-Pesa. I served as scrum master on a four-person Moringa School team and built the Flask API — JWT auth, a PostgreSQL data layer and a real Safaricom Daraja STK Push integration — containerized with Docker and covered by an automated pytest suite.',
    problem:
      'Kenyan mobile users transact heavily via M-Pesa but face fragmented interfaces for wallet balancing, beneficiary tracking, and transparent transaction reconciliation.',
    solution:
      'A streamlined full-stack fintech platform integrating Safaricom Daraja STK Push with automated asynchronous webhook callbacks, instant wallet crediting, and robust balance invariants.',
    myContribution:
      'Architected and implemented the entire Flask backend API, Dockerized environment, PostgreSQL database schemas, JWT authentication middleware, and real M-Pesa Daraja STK Push integration with callback verification.',
    challenges:
      'Handling asynchronous payment callbacks from Safaricom reliably required strict database transaction isolation, idempotent callback processing to prevent double-crediting, and handling network drops gracefully.',
    stack: ['React', 'Redux Toolkit', 'Flask', 'PostgreSQL', 'JWT', 'M-Pesa Daraja', 'Docker'],
    architecture: ['React front end', 'Flask API', 'PostgreSQL', 'M-Pesa Daraja'],
    live: 'https://money-transfer-app-three.vercel.app/',
    repos: [
      { label: 'Frontend', url: 'https://github.com/Goddii/Money-Transfer-App' },
      { label: 'Backend', url: 'https://github.com/Goddii/Money-Transfer-App-Backend' },
    ],
    flow: {
      title: 'M-Pesa top-up: STK Push round trip',
      nodes: [
        { id: 'app', label: 'React app', x: 8, y: 62 },
        { id: 'api', label: 'Flask API', x: 36, y: 62 },
        { id: 'daraja', label: 'Safaricom Daraja', x: 62, y: 40 },
        { id: 'phone', label: "User's phone", x: 90, y: 12 },
        { id: 'db', label: 'PostgreSQL', x: 64, y: 90 },
      ],
      steps: [
        { from: 'app', to: 'api', label: 'Top-up request (JWT-guarded)' },
        { from: 'api', to: 'daraja', label: 'STK Push request' },
        { from: 'daraja', to: 'phone', label: 'PIN prompt on the phone' },
        { from: 'daraja', to: 'api', label: 'Callback with the result' },
        { from: 'api', to: 'db', label: 'Credit wallet, record transaction' },
      ],
    },
    image: '/assets/projects/vyloc.webp',
    alt: 'Vyloc wallet app splash screen',
    annotations: [
      { x: 22, y: 38, id: '87701', label: 'STK Push callback' },
      { x: 71, y: 62, id: '87702', label: 'JWT guard' },
    ],
    metrics: [
      { label: 'Auth guard', value: 'JWT + bcrypt' },
      { label: 'Testing', value: 'pytest suite' },
    ],
  },
  {
    slug: 'yfixit',
    name: 'YFixIt',
    tagline: 'Second-hand electronics marketplace with M-Pesa checkout',
    meta: 'Personal project · Full-stack',
    category: 'fintech',
    featured: false,
    description:
      'A marketplace for broken, second-hand and repairable electronics. Sellers run listings from a dashboard; buyers browse with search, filters and sorting, then pay through an automated Safaricom Daraja STK Push checkout — OAuth token generation, STK push prompt, payment callback, order completion — on a Flask API with JWT auth and role-aware routes.',
    problem:
      'E-waste in Nairobi is rampant because repairable electronics lack a verified marketplace with built-in mobile payment escrow and hardware diagnostics.',
    solution:
      'An electronics repair and resale marketplace with structured fault tagging (display, logic board, battery cell) and automated M-Pesa STK push checkout.',
    myContribution:
      'Designed and engineered the full platform: React + Vite frontend with role-aware routes, Flask REST API, SQLAlchemy models, and Safaricom Daraja integration.',
    challenges:
      'Ensuring listings are automatically locked when a checkout begins, and either marked sold on callback success or returned to stock if the user cancels the PIN prompt.',
    stack: ['React', 'Vite', 'React Router', 'Flask', 'SQLAlchemy', 'JWT', 'M-Pesa Daraja'],
    architecture: ['React front end', 'Flask API', 'M-Pesa Daraja', 'Orders database'],
    live: 'https://y-fix-it.vercel.app/',
    repos: [{ label: 'GitHub', url: 'https://github.com/Goddii/YFixIt' }],
    flow: {
      title: 'M-Pesa checkout flow',
      nodes: [
        { id: 'buyer', label: 'Buyer (React)', x: 8, y: 62 },
        { id: 'api', label: 'Flask API', x: 36, y: 62 },
        { id: 'daraja', label: 'Safaricom Daraja', x: 62, y: 40 },
        { id: 'phone', label: "Buyer's phone", x: 90, y: 12 },
        { id: 'db', label: 'Orders database', x: 64, y: 90 },
      ],
      steps: [
        { from: 'buyer', to: 'api', label: 'Start checkout (JWT)' },
        { from: 'api', to: 'daraja', label: 'OAuth token, then STK Push' },
        { from: 'daraja', to: 'phone', label: 'PIN prompt' },
        { from: 'daraja', to: 'api', label: 'Payment callback' },
        { from: 'api', to: 'db', label: 'Order completed, listing marked sold' },
      ],
    },
    image: '/assets/projects/yfixit.png',
    alt: 'YFixIt electronics repair & marketplace interface',
    annotations: [
      { x: 32, y: 35, id: 'YFIX-1', label: 'Hardware diagnosis filter' },
      { x: 74, y: 60, id: 'YFIX-2', label: 'M-Pesa STK checkout' },
    ],
  },
  {
    slug: 'dai',
    name: 'Dai',
    tagline: 'Offline-first credit ledger for Kenyan traders',
    meta: 'Personal project · Full-stack & PWA',
    category: 'fintech',
    featured: false,
    description:
      'Dai — Swahili for "owe" — is a mobile-first credit book for informal market traders: who owes what, tracked and synced even when the connection drops. Built as a PWA with IndexedDB offline sync against a Flask and PostgreSQL API, with eight documented correctness invariants covering idempotent sync and an immutable ledger.',
    problem:
      'Informal traders in open-air markets extend credit daily on paper books. When rain, theft, or network outages occur, records vanish, resulting in catastrophic loss.',
    solution:
      'An offline-first PWA that writes to local IndexedDB instantly with zero latency, queueing sync packets with cryptographic idempotency keys that reconcile seamlessly upon reconnect.',
    myContribution:
      'Designed the offline sync state machine, service worker caching strategy, and the immutable append-only PostgreSQL ledger API.',
    challenges:
      'Guaranteed conflict-free resolution when multiple writes occur offline by enforcing strict monotonically increasing entry sequences and immutable transaction logs.',
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'PWA', 'Flask', 'PostgreSQL'],
    architecture: ['Trader PWA', 'IndexedDB queue', 'Flask API', 'PostgreSQL immutable ledger'],
    live: 'https://dai-sand.vercel.app/',
    repos: [{ label: 'GitHub', url: 'https://github.com/Goddii/DAI' }],
    flow: {
      title: 'Offline-first sync state machine',
      nodes: [
        { id: 'phone', label: "Trader's phone (PWA)", x: 10, y: 50 },
        { id: 'idb', label: 'IndexedDB', x: 36, y: 22 },
        { id: 'queue', label: 'Sync queue', x: 36, y: 78 },
        { id: 'api', label: 'Flask API', x: 66, y: 50 },
        { id: 'db', label: 'PostgreSQL ledger', x: 91, y: 50 },
      ],
      steps: [
        { from: 'phone', to: 'idb', label: 'Write ledger entry — works offline' },
        { from: 'idb', to: 'queue', label: 'Queue until connection returns' },
        { from: 'queue', to: 'api', label: 'Sync with idempotency key' },
        { from: 'api', to: 'db', label: 'Append to immutable ledger' },
        { from: 'api', to: 'phone', label: 'Acknowledge and reconcile' },
      ],
    },
    image: '/assets/projects/dai.webp',
    alt: 'Dai credit ledger sign-in screen',
    annotations: [
      { x: 28, y: 42, id: 'IDXDB-1', label: 'IndexedDB sync' },
      { x: 64, y: 55, id: 'PWA-1', label: 'Service worker' },
    ],
  },
  {
    slug: 'sokomtaani',
    name: 'SokoMtaani',
    tagline: 'Till & inventory system for small shops',
    meta: 'Personal project · Full-stack',
    category: 'fintech',
    featured: false,
    description:
      'A phone-first point-of-sale for Kenyan shopkeepers — PIN-gated attendant logins, FIFO stock costing and sales tracking backed by a Flask and PostgreSQL API with JWT and bcrypt. Documented with 43 tests across six suites, and it refuses to boot without its required environment secrets.',
    problem:
      'Small neighborhood kiosks suffer from inventory shrinkage and incorrect margin calculations because stock bought at different prices gets lumped together.',
    solution:
      'A mobile-first till system tracking First-In-First-Out (FIFO) stock batches, recording exact cost-per-unit at the time of each sale to compute true gross profit in real time.',
    myContribution:
      'Architected the FIFO inventory costing algorithm, attendant PIN authentication, and the comprehensive 43-test automated test suite.',
    challenges:
      'Implementing strict FIFO queue logic in SQL where sales draw across multiple inventory batches with differing purchase prices without race conditions.',
    stack: ['React', 'TypeScript', 'Flask', 'PostgreSQL', 'JWT', 'bcrypt'],
    architecture: ['Attendant till (PWA)', 'FIFO engine', 'Flask API', 'PostgreSQL database'],
    live: 'https://soko-mtaani-sepia.vercel.app/',
    repos: [{ label: 'GitHub', url: 'https://github.com/Goddii/SokoMtaani' }],
    flow: {
      title: 'A sale at the till with FIFO costing',
      nodes: [
        { id: 'till', label: 'Attendant till (PWA)', x: 10, y: 50 },
        { id: 'queue', label: 'Offline sale queue', x: 36, y: 22 },
        { id: 'api', label: 'Flask API', x: 62, y: 50 },
        { id: 'db', label: 'PostgreSQL', x: 90, y: 50 },
      ],
      steps: [
        { from: 'till', to: 'api', label: 'PIN login, JWT issued' },
        { from: 'till', to: 'queue', label: 'Sale recorded — never lost offline' },
        { from: 'queue', to: 'api', label: 'Sale synced when online' },
        { from: 'api', to: 'db', label: 'FIFO batches: cost per unit' },
        { from: 'db', to: 'api', label: 'Per-sale cost and profit snapshot' },
      ],
    },
    image: '/assets/projects/soko-mtaani.jpg',
    alt: 'SokoMtaani attendant sign-in screen',
    annotations: [
      { x: 30, y: 45, id: 'JWT-1', label: 'PIN + JWT' },
      { x: 68, y: 58, id: 'FIFO-1', label: 'FIFO costing' },
    ],
  },
  {
    slug: 'pitchtrack',
    name: 'PitchTrack',
    tagline: 'Amateur football league management platform',
    meta: 'Personal project · Full-stack',
    category: 'fullstack',
    featured: false,
    description:
      'A platform for running an amateur football league — teams, players, fixtures and standings — on a Flask and PostgreSQL backend served over Gunicorn with JWT auth and transactional email. The frontend renders player performance with custom radar-chart visualizations.',
    problem:
      'Community football leagues in Nairobi manage fixtures on spreadsheets and paper sheets, making statistics and disciplinary records hard to verify.',
    solution:
      'A unified league management hub with automated standings calculation, goal tallying, and visual player performance radar charts.',
    myContribution:
      'Built the full-stack architecture: React Router frontend with SVG radar charts, Flask API with Gunicorn, and transactional email notifications.',
    challenges:
      'Automating dynamic table standings (points, goal difference, head-to-head tiebreakers) with atomic database updates upon match result submission.',
    stack: ['React', 'React Router', 'Flask', 'PostgreSQL', 'JWT', 'Gunicorn'],
    architecture: ['React frontend', 'SVG Radar engine', 'Flask backend', 'PostgreSQL database'],
    live: 'https://pitch-track-eight.vercel.app/',
    repos: [
      { label: 'Frontend', url: 'https://github.com/Goddii/PitchTrack' },
      { label: 'Backend', url: 'https://github.com/Goddii/pitchtrack-backend' },
    ],
    image: '/assets/projects/pitchtrack.webp',
    alt: 'PitchTrack landing page',
    annotations: [
      { x: 25, y: 40, id: 'RADAR-1', label: 'Radar charts' },
      { x: 72, y: 55, id: 'EMAIL-1', label: 'Transactional email' },
    ],
  },
  {
    slug: 'shadow-sorceress',
    name: 'The Shadow Sorceress',
    tagline: 'Scroll-linked 3D dark-fantasy WebGL experience',
    meta: 'Personal project · Creative front end & 3D',
    category: 'creative',
    featured: false,
    description:
      'A scroll-driven 3D scene: a dark-fantasy sorceress rotates and reveals as the page scrolls, lit by moody rim light with a bloom-lit ring and staff crystal. React Three Fiber renders it and GSAP ScrollTrigger drives it; the 134 MB source model was optimized down to 9 MB with meshopt compression and WebP textures.',
    problem:
      'Large 3D assets on the web typically cause severe hitching, massive download times, and GPU memory saturation on ordinary consumer devices.',
    solution:
      'Aggressive glTF optimization via Draco and meshopt compression, procedural lighting, and tying camera rotation directly to GSAP ScrollTrigger.',
    myContribution:
      'Engineered the R3F scene graph, lighting shaders, UnrealBloomPass post-processing pipeline, and scroll-scrubbed camera choreography.',
    challenges:
      'Compressing a 134 MB raw 3D mesh down to 9 MB while preserving sharp geometric normals and maintaining 60 FPS across mid-range laptops.',
    stack: ['React', 'Vite', 'React Three Fiber', 'GSAP ScrollTrigger', 'Tailwind CSS'],
    architecture: ['Page scroll', 'GSAP ScrollTrigger', 'R3F scene', 'Bloom pass'],
    live: null,
    repos: [{ label: 'GitHub', url: 'https://github.com/Goddii/shadow-sorceress' }],
    credit: 'Model: “Dark Fantasy Sorceress, Crystal Staff” by Pigcraft, CC-BY-4.0.',
    flow: {
      title: 'Scroll-to-scene WebGL pipeline',
      nodes: [
        { id: 'scroll', label: 'Page scroll', x: 8, y: 50 },
        { id: 'st', label: 'GSAP ScrollTrigger', x: 32, y: 50 },
        { id: 'r3f', label: 'R3F scene', x: 58, y: 50 },
        { id: 'bloom', label: 'Bloom pass', x: 82, y: 22 },
        { id: 'screen', label: 'Canvas frame', x: 82, y: 78 },
      ],
      steps: [
        { from: 'scroll', to: 'st', label: 'Scroll progress scrubbed' },
        { from: 'st', to: 'r3f', label: 'Rotate and reveal model' },
        { from: 'r3f', to: 'bloom', label: 'Ring and crystal glow' },
        { from: 'bloom', to: 'screen', label: 'Composited frame at 60 FPS' },
      ],
    },
    image: '/assets/projects/shadow-sorceress.jpg',
    alt: 'The Shadow Sorceress 3D WebGL scene',
    annotations: [
      { x: 30, y: 35, id: 'R3F-1', label: 'R3F Scene Graph' },
      { x: 70, y: 60, id: 'BLOOM-1', label: 'Selective bloom' },
    ],
  },
  {
    slug: 'yetu-housing',
    name: 'Yetu Housing Agency',
    tagline: 'Real-estate listings platform — team project',
    meta: 'Team project (4) · Frontend & Scrum Master',
    category: 'fullstack',
    featured: false,
    description:
      'A real-estate platform built with a four-person bootcamp team: property listings filtered by location, price and type, detail pages, agent profiles and an inquiry form. I served as scrum master, contributed to the data layer, filtering logic and routing, and led the pull-request and merge-conflict workflow.',
    problem:
      'House hunting in Nairobi is hindered by fake listings, unverified agents, and slow query speeds across unindexed databases.',
    solution:
      'A clean, responsive listings portal powered by React 19 and Firebase Firestore with compound indexing for instant location and price range filtering.',
    myContribution:
      'Led the team as scrum master, structured the Firestore data layer, engineered the client-side multi-parameter filtering, and resolved Git integration workflows.',
    challenges:
      'Coordinating a distributed four-person team with daily standups and strict code reviews while maintaining consistent UI standards.',
    stack: ['React 19', 'React Router', 'Firebase Firestore', 'Tailwind CSS'],
    architecture: ['React front end', 'Router', 'Firestore database', 'Agent gateway'],
    live: 'https://yetu-housing-agency.vercel.app',
    repos: [{ label: 'GitHub', url: 'https://github.com/Goddii/Yetu-Housing-Agency' }],
    image: '/assets/projects/yetu-housing.jpg',
    alt: 'Yetu Housing Agency property platform',
    annotations: [],
  },
  {
    slug: 'digiarts',
    name: 'DigiArts',
    tagline: 'Digital art marketplace with real Stripe checkout',
    meta: 'Personal project · Frontend + Payments',
    category: 'creative',
    featured: false,
    description:
      "A marketplace for browsing and buying digital artwork, built with React and Material UI on the front end and a dedicated Stripe integration on the back — the one payment flow in this list that isn't M-Pesa.",
    stack: ['React', 'Vite', 'Material UI', 'Stripe'],
    architecture: ['React front end', 'Stripe payment gateway', 'Digital asset store'],
    live: 'https://digi-arts.vercel.app/',
    repos: [{ label: 'GitHub', url: 'https://github.com/Goddii/DigiArts' }],
    image: '/assets/projects/digiarts.webp',
    alt: 'DigiArts marketplace homepage',
    annotations: [
      { x: 20, y: 35, id: 'STRIPE-1', label: 'Stripe checkout' },
      { x: 75, y: 60, id: 'MUI-1', label: 'Material UI' },
    ],
  },
  {
    slug: 'jacket-masters',
    name: 'Jacket Masters',
    tagline: 'Cinematic e-commerce product page',
    meta: 'Personal project · Creative Front end',
    category: 'creative',
    featured: false,
    description:
      'A premium single-product storefront for a puffer-jacket brand — a carousel-driven hero, size and colour selection and KSh pricing, staged like a lookbook rather than a generic template.',
    stack: ['React', 'Vite', 'Tailwind CSS'],
    architecture: ['Single-page lookbook', 'Dynamic color swatches', 'Cart manager'],
    live: 'https://jacket-masters-demo.vercel.app/',
    repos: [{ label: 'GitHub', url: 'https://github.com/Goddii/jacket-masters-demo' }],
    image: '/assets/projects/jacket-masters.webp',
    alt: 'Jacket Masters product page',
    annotations: [
      { x: 24, y: 38, id: 'CAR-1', label: 'Carousel hero' },
      { x: 68, y: 52, id: 'SWATCH-1', label: 'Colour swatches' },
    ],
  },
  {
    slug: 'workout-api',
    name: 'Workout API',
    tagline: 'Clean REST API for workout tracking',
    meta: 'Personal project · Backend API',
    category: 'fullstack',
    featured: false,
    description:
      "A backend-only exercise in REST fundamentals: nine endpoints over a SQLAlchemy and Marshmallow data layer, proper 400/404/409 semantics and cascading deletes — no shortcuts on validation because there's no frontend to hide behind.",
    stack: ['Flask', 'SQLAlchemy', 'Marshmallow', 'SQLite', 'Pytest'],
    architecture: ['Flask REST API', 'Marshmallow serialization', 'SQLAlchemy ORM'],
    live: null,
    repos: [{ label: 'GitHub', url: 'https://github.com/Goddii/workout-backend-application' }],
    image: null,
    alt: '',
    annotations: [],
  },
];
