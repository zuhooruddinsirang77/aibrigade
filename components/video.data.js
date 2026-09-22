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

  /* ---- WhyUs: real footage for the fraud detection card --------------
     Re-encoded from a 90MB ProRes-style export (yuvj420p, ~52 Mbps) down
     to libx264 CRF 18 with audio stripped (the card plays muted anyway) —
     same 1920x1080 resolution and 13.84s length, ~9x smaller with no
     visible quality loss. Original kept out of the repo; see the
     scratchpad backup if the source is ever needed again. */
  fraudReal: {
    src: `${V}/fraud-detection-real.mp4`,
    duration: 13.84,
    alt: "A person reviewing a credit card and paperwork at a desk while flagging a transaction.",
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
/* Four rooms, re-aimed at the estate rather than at the industry: the
   section's argument is that the layer sits across systems a client
   already owns, so each `kicker` names one of those systems (core banking,
   EHR, WMS/POS, IoT/OT) and the `label` names the place it is running.
   Same four films — the room each one shows did not change, only what the
   copy claims is happening in it. */
export const environments = [
  {
    id: "banking",
    film: "operations",
    label: "The banking floor",
    kicker: "Core banking",
    line: "Agents that work supported service requests, disputes, reconciliation and exception queues against the core you already run — and hand a person the file that needs judgement.",
    tags: ["Core banking", "Contact center", "Audit trail"],
  },
  {
    id: "clinical",
    /* `healthcare`, not `geneEditing`. This tab's kicker is "EHR" and its
       line is scheduling, eligibility, billing follow-up and documentation
       — hospital administration. The gene-editing clip is a glowing DNA
       strand on a lab bench, which is research imagery: it illustrated a
       claim this tab does not make and left the claim it does make with
       no picture. A hospital corridor is the room this copy is set in.
       `geneEditing` is still the right clip for the UUB case and the
       clinical reel, both of which are about care rather than admin. */
    film: "healthcare",
    label: "The clinical floor",
    kicker: "EHR",
    line: "Scheduling, eligibility, billing follow-up and documentation that move before staff have to chase them, drafted inside the chart the clinician already has open.",
    tags: ["HL7 FHIR", "Human-in-the-loop", "Approval gate"],
  },
  {
    id: "floor",
    film: "logistics",
    label: "The store and the warehouse",
    kicker: "WMS / POS",
    line: "Hands-free stock, location and movement for the people actually standing in front of the shelf, plus the exception that would otherwise surface a shift later.",
    tags: ["Voice", "WMS / POS", "Exception routing"],
  },
  {
    id: "field",
    film: "factory",
    label: "The plant and the field",
    kicker: "IoT / OT",
    line: "Manuals, work orders and spares reachable by voice at the point of work, and operational exceptions classified before the shift report would have caught them.",
    tags: ["Edge", "Work orders", "Drift alerts"],
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
  /* WhyUs — the eight capability cards.

     Keyed by card title, and the titles changed when this row stopped
     being six vertical use cases and became the eight capabilities. Every
     key here has to match a `title` in `whyUs` (components/data.js)
     exactly — a miss returns undefined, AmbientVideo renders nothing, and
     the card is a black box with a paragraph at the bottom of it. That is
     what happened for one build after the rename.

     Assignment is by what the clip actually shows, not by what is left —
     and this list has been wrong twice, both times because the comment
     described an intention the assignment never carried out:

       - `Understand` said "documents" and pointed at `geneEditing`, which
         is a DNA strand over a lab bench. No documents, no knowledge, and
         a healthtech image under a card that is explicitly cross-sector.
         `diagnosticSupport` is a head with the sources it draws on
         resolving around it, which is the card's sentence exactly.
       - `Escalate` said "clinicians" and pointed at `diagnosticSupport`,
         which has no people in it at all — it is a wireframe head. The
         card is about handing a decision to a person, so it needs a clip
         with a person in it: `operations`, colleagues working a problem
         around a table.

     The rest stand: a person and an assistant for Listen, the chip coming
     up for Reason, markets for Decide (where the threshold is set), the
     agent interface for Act, the network for Communicate, the data centre
     for Operate privately. */
  whyUs: {
    Listen: "aiPartner",
    Understand: "diagnosticSupport",
    Reason: "awaken",
    Decide: "fintechGrowth",
    Act: "agentsInterface",
    Communicate: "stream",
    Escalate: "operations",
    "Operate privately": "infrastructure",
  },

  /* Cases — the three media tiles. ICU's card is literally titled "Real-time
     fraud detection", so it gets the real fraud-detection footage rather
     than the generic coins/chip clip; Halyk (underwriting) keeps that clip,
     UUB (clinical) stays on the real lab footage. */
  cases: {
    icu: "fraudReal",
    halyk: "fintechGrowth",
    uub: "geneEditing",
  },

  /* ServiceExplorer — indexed to `services` in components/data.js. The
     four tracks are now the deck's four sectors: 0 Fintech, 1 Healthtech,
     2 Retail and customer operations, 3 Industrial and energy. (This
     comment named "Custom AI Development" and "Automation" for a while
     after the tracks were rewritten, and the films underneath it were
     still assigned to those two offers.)

     Each track gets the room it is sold into, which is the only test this
     table has to pass:
       0  markets — the bank
       1  a hospital corridor, not the gene-editing lab: the track is
          scheduling, eligibility, RCM and billing, i.e. administration
       2  the logistics hub, not the agent interface: this track is
          inventory, store ops and the shelf, and a laptop on a desk shows
          none of it
       3  the line — the plant and the field */
  services: ["fintechGrowth", "healthcare", "logistics", "factory"],

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
     multi-venue feed runs on for compliance monitoring.

     `fraud-realtime` is now the exception to the "reference footage, not
     capture" note above — deployments.data.js sets its own `film:
     "fraudReal"` directly (real footage, not stock), which wins over this
     entry. Kept in sync here anyway so this table stays accurate as a
     fallback rather than describing a clip this reel no longer shows. */
  reels: {
    "fraud-realtime": "fraudReal",
    "clinical-copilot": "geneEditing",
    "underwriting-agent": "agentsInterface",
    "compliance-monitor": "infrastructure",
  },

  /* Pipeline — the five engagement stages. Order carries meaning here: a
     room full of people (Identify), a chip coming up (Design), a real
     agent interface taking shape (Prove), the racks it lands on
     (Measure), a network under load (Scale). Read top to bottom it is the
     same arc the page opens and closes on.

     Keyed by stage title, read by Pipeline.jsx as `filmFor.stages[s.title]`,
     so these five strings must match `STAGE_TITLES` in Features.jsx and the
     `title` fields in data.js exactly. They were renamed from Discover /
     Build / Deploy and this table has to move with them — a miss here is
     silent, and the stage simply plays no film. */
  stages: {
    Identify: "operations",
    Design: "awaken",
    Prove: "agentsInterface",
    Measure: "infrastructure",
    Scale: "logistics",
  },
};
