/**
 * The film layer — one manifest for every clip in /public/video.
 *
 * Two families of footage live here, and they are marked because they are
 * used differently.
 *
 * ⚠️  PROVENANCE — read before adding a new clip to this file.
 *
 * `chip-awaken-sample`, `circuit-energy-loop`, `data-stream-loop`,
 * `global-infrastructure-loop`, `modern-healthcare-loop`,
 * `enterprise-operations-loop`, `smart-factory-loop` and
 * `smart-logistics-loop` are text-to-video output — each has a `.json`
 * sidecar recording the model and prompt that produced it. They are
 * atmosphere, not evidence.
 *
 * `agentsInterface`, `geneEditing`, `fintechGrowth`, `consultancy`,
 * `diagnosticSupport` and `aiPartner` are licensed stock footage — real
 * people, real hands, real screens (some Vecteezy, some a commissioned
 * explainer render). They read as evidence in a way generated loops cannot,
 * which is exactly why they are NOT allowed near a specific, falsifiable
 * claim either: nothing here names a client or quotes a result, generated
 * or licensed. `Deployments` ("The work, playing") is the one section that
 * makes that kind of claim. It draws on this library through `filmFor.reels`
 * below, under one condition: the clip is labelled in the frame as reference
 * footage and the slot for real capture of the actual client system stays
 * open and takes precedence. See the longer note at `filmFor.reels` and
 * components/deployments.data.js.
 *
 * No posters exist for these files, so nothing here references one. A clip
 * fades up from the page's own ink instead of flashing a black rectangle —
 * see `.ax-film` in app/film.css.
 *
 * `duration` is a hint used to size scroll distance before metadata
 * arrives; the real value is read from the element on `loadedmetadata`.
 *
 * There is no per-clip grade here, and there should not be one. Every film
 * renders through the same CSS; a surface that needs more contrast under its
 * copy gets a scrim from its own section. See the note at the top of
 * app/film.css for why the per-surface version was removed.
 */

const V = "/video";

export const films = {
  /* ---- the hero -------------------------------------------------- */
  agentsInterface: {
    src: `${V}/vecteezy_professional-working-with-ai-agents-interface-on-digital_81590746.mp4`,
    duration: 8,
    alt: "A person's hands on a laptop and tablet, a holographic AI-agent interface projected above the desk.",
  },

  /* ---- chapter 1 alternate / product texture ---------------------- */
  awaken: {
    src: `${V}/chip-awaken-sample.mp4`,
    duration: 5,
    alt: "A processor die lighting up along its circuit paths.",
  },

  /* ---- the scrubbed interstitial ---------------------------------- */
  infrastructure: {
    src: `${V}/global-infrastructure-loop.mp4`,
    duration: 4,
    alt: "Aerial view of a data centre at night, server rows lit from within.",
  },

  /* ---- behind the deployments console ------------------------------ */
  stream: {
    src: `${V}/data-stream-loop.mp4`,
    duration: 4,
    alt: "Particles of light moving through fibre-optic channels.",
  },

  /* ---- the closing beat --------------------------------------------- */
  energy: {
    src: `${V}/circuit-energy-loop.mp4`,
    duration: 4,
    alt: "Energy travelling outward along circuit traces.",
  },

  /* ---- healthtech: real lab footage, replaces the generated corridor -- */
  geneEditing: {
    src: `${V}/vecteezy_ai-assisted-gene-editing-with-glowing-dna-strands-and_57645578.mp4`,
    duration: 10,
    alt: "A glowing DNA strand rendered above a lab bench, clinicians moving in the background.",
  },

  /* ---- fintech: real footage, coins and live market data ------------- */
  fintechGrowth: {
    src: `${V}/vecteezy_coins-stack-increase-stop-motion-with-ai-technology-on_36054711.mp4`,
    duration: 6,
    alt: "Stacks of coins rising in front of live market charts and an AI processor icon.",
  },

  /* ---- Featured: "a focused, fast-moving AI consultancy" -------------- */
  consultancy: {
    src: `${V}/fastmoving.mp4`,
    duration: 10,
    alt: "A consultant presenting a holographic AI assistant and connected global network to a client.",
  },

  /* ---- WhyUs: purpose-named for the diagnostics card ------------------- */
  diagnosticSupport: {
    src: `${V}/diagnosticsupport.mp4`,
    duration: 8,
    alt: "A wireframe head surrounded by icons for the capabilities an AI diagnostic system draws on.",
  },

  /* ---- the closing beat, in its human register ------------------------- */
  aiPartner: {
    src: `${V}/vecteezy_professional-working-with-artificial-intelligence-and_77466181.mp4`,
    duration: 10,
    alt: "A person at a laptop working alongside a small holographic AI assistant.",
  },

  /* ---- the remaining environments ------------------------------------ */
  healthcare: {
    src: `${V}/modern-healthcare-loop.mp4`,
    duration: 4,
    alt: "A hospital corridor at dusk with a faint interface overlay.",
  },
  operations: {
    src: `${V}/enterprise-operations-loop.mp4`,
    duration: 4,
    alt: "Colleagues working around a table in a modern office.",
  },
  factory: {
    src: `${V}/smart-factory-loop.mp4`,
    duration: 4,
    alt: "Robotic arms moving along a clean manufacturing line.",
  },
  logistics: {
    src: `${V}/smart-logistics-loop.mp4`,
    duration: 5,
    alt: "A logistics hub at dusk with vehicles moving along lit routes.",
  },
};

/**
 * The hero's own switcher — "Overview", "Fintech", "HealthTech".
 *
 * Every `line` here is a recombination of phrases already written elsewhere
 * on the page (the WhyUs card text, `STACK` and `DETAIL` in Services.jsx) —
 * nothing new is being claimed, only resurfaced closer to the fold. That is
 * what keeps this next to licensed stock footage rather than in
 * `Deployments`, which is the one section allowed to make a claim this
 * specific: see the provenance note at the top of this file.
 *
 * Reuses `fintechGrowth` and `geneEditing` rather than owning dedicated
 * clips — both are already fetched further down the page, so a reader who
 * switches tabs here and later scrolls to WhyUs or Cases gets an instant
 * cache hit instead of a second download.
 */
export const heroModes = [
  {
    id: "overview",
    label: "Overview",
    film: "agentsInterface",
    // Was "production-grade AI systems — copilots, automation agents, GPT
    // platforms, and decision intelligence workflows — from initial
    // discovery through production deployment." Four pieces of internal
    // vocabulary in one sentence, aimed at a reader who already knows what
    // a "decision intelligence workflow" is. This says the same thing to
    // someone who doesn't: what we build, who for, how far we take it.
    line: "We build custom AI software for banks and healthcare companies — from the first idea to a system your team runs every day.",
  },
  {
    id: "fintech",
    label: "Fintech",
    film: "fintechGrowth",
    // Was "Real-time fraud scoring, autonomous underwriting, and compliance
    // monitoring — decisions your risk team can defend line by line."
    // "Scoring" and "underwriting" are the two words here a non-specialist
    // hesitates on. Replaced with what each one is FOR.
    line: "AI that catches fraud the moment it happens, speeds up loan decisions, and keeps your compliance team ahead of every rule — with a clear reason behind every call.",
  },
  {
    id: "healthtech",
    label: "HealthTech",
    film: "geneEditing",
    // Was "HIPAA-compliant documentation copilots and diagnostics support,
    // built to fit the clinical workflow that already exists." Kept the
    // privacy claim — it is the one line item a healthcare buyer actually
    // checks — but named what it means instead of the acronym.
    line: "AI that helps write clinical notes and catch health issues earlier — built to meet healthcare privacy rules and fit right into the tools your care team already uses.",
  },
];

/**
 * "Where it runs" — the four operating environments, in the order they
 * appear in the section.
 *
 * ⚠️  The copy below describes categories of system this studio builds. It
 * names no client and quotes no outcome, which is the only reason it can sit
 * next to this footage, licensed or generated. If you replace a `line` with
 * a real result, the clip beside it stops being atmosphere and starts being
 * evidence — swap in real capture of that actual engagement at the same
 * time.
 */
export const environments = [
  {
    id: "clinical",
    film: "geneEditing",
    label: "The clinical floor",
    kicker: "HealthTech",
    line: "Documentation copilots and triage support that draft inside the chart the clinician already has open, with a human approving every write-back.",
    tags: ["HL7 FHIR", "Human-in-the-loop", "Audit trail"],
  },
  {
    id: "operations",
    film: "operations",
    label: "The operations floor",
    kicker: "Enterprise",
    line: "Agents that pick up the repeating parts of a back-office process — intake, reconciliation, chasing an exception — and hand a person the decision that needs judgement.",
    tags: ["Workflow agents", "Exception routing", "SSO"],
  },
  {
    id: "production",
    film: "factory",
    label: "The production line",
    kicker: "Industrial",
    line: "Vision and telemetry models that watch a line continuously and raise a defect or a drift long before the shift report would.",
    tags: ["Vision", "Edge inference", "Drift alerts"],
  },
  {
    id: "network",
    film: "logistics",
    label: "The distribution network",
    kicker: "Logistics",
    line: "Dispatch and routing models that re-plan against live conditions, and explain why a route changed to the person who has to defend it.",
    tags: ["Routing", "Live re-planning", "Explainability"],
  },
];

/**
 * Which clip stands behind what, for the sections that reuse the library
 * rather than owning a film of their own.
 *
 * One table instead of a `film="…"` scattered through nine components,
 * because the constraint being managed here is global, not local: there are
 * eleven files and roughly twenty places showing one, so what matters is how
 * often each file is reused. A clip already fetched for the hero costs
 * nothing to show again in a card — same URL, same cache entry, instant —
 * while a new unique clip is a new download. Assignments are made to match
 * subject to context first (fintech copy gets the fintech clip) and to
 * reuse second.
 *
 * Keys are the strings the sections already key on (a WhyUs card title from
 * components/data.js, a stage name from `STAGES`), so nothing needs a new id
 * invented for it.
 */
export const filmFor = {
  /* WhyUs — the six capability cards. Fintech cards get the real fintech
     footage, clinical cards get real footage each — "Diagnostics support"
     has a clip purpose-shot for it rather than sharing Clinical
     documentation's; the two that are neither (Compliance & trading, EHR
     integration) keep the abstract loops that were already carrying them. */
  whyUs: {
    "Fraud detection": "fintechGrowth",
    "Autonomous underwriting": "fintechGrowth",
    "Clinical documentation": "geneEditing",
    "Diagnostics support": "diagnosticSupport",
    "Compliance & trading": "infrastructure",
    "EHR integration": "energy",
  },

  /* Cases — the three media tiles. Matched to the system each case study is
     actually about: ICU and Halyk are both fintech, UUB is clinical. */
  cases: {
    icu: "fintechGrowth",
    halyk: "fintechGrowth",
    uub: "geneEditing",
  },

  /* ServiceExplorer — indexed to `services` in components/data.js:
     0 Fintech, 1 Healthcare, 2 Custom AI Development, 3 Automation. Custom
     AI Development gets the real agents-interface footage — it is the one
     offer that is literally "we build the thing this clip is showing". */
  services: ["fintechGrowth", "geneEditing", "agentsInterface", "factory"],

  /* Deployments — the four reels in "The work, playing", keyed by the id in
     components/deployments.data.js.

     Read the provenance note at the top of this file before changing these.
     That note says this footage is not allowed near a specific, falsifiable
     claim, and the Deployments section is exactly where the page makes one:
     it names a sector, a metric and an outcome per reel. The reason these
     assignments are nonetheless correct is that the section no longer
     presents the clip as capture of that client's system — it labels the
     screen "reference footage" in the frame itself and keeps the real
     capture slot open (`src` in deployments.data.js, which still wins when
     it is filled).

     What changed is that the alternative was worse. Every reel pointed at a
     `/reels/*.mp4` that has never existed, so all four 404'd and the
     section — the one whose entire subject is work playing — showed four
     identical terminal fallbacks and not one moving frame.

     Matched to the system each reel is about: coins and live market data for
     fraud scoring, the lab bench for the clinical copilot, a person working
     an agent interface for autonomous underwriting, and the racks a
     multi-venue feed runs on for compliance monitoring. */
  reels: {
    "fraud-realtime": "fintechGrowth",
    "clinical-copilot": "geneEditing",
    "underwriting-agent": "agentsInterface",
    "compliance-monitor": "infrastructure",
  },

  /* Pipeline — the five engagement stages. Order carries meaning here: a
     room full of people (Discover), a chip coming up (Design), a real
     agent interface taking shape (Build), the racks it lands on (Deploy),
     a network under load (Scale). Read top to bottom it is the same arc
     the page opens and closes on. */
  stages: {
    Discover: "operations",
    Design: "awaken",
    Build: "agentsInterface",
    Deploy: "infrastructure",
    Scale: "logistics",
  },
};
