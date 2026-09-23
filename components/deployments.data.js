/**
 * Content for the Deployments section.
 *
 * ⚠️  EVERYTHING BELOW IS PLACEHOLDER. Replace client names, outcomes and
 * metrics with work AIBrigade actually shipped, or cut the entry. A reel is
 * the most load-bearing claim on a studio site — it is the one section a
 * prospect will check against your references.
 *
 * Videos: drop MP4s in /public/reels/ and set `src` (plus `poster`) on the
 * entry. Keep them short (25–60s), muted-safe (no essential audio), and
 * H.264 so Safari plays them inline. Re-encode to ~1280px wide and under
 * ~6MB each; this section loads one at a time, but a 40MB hero reel will
 * still ruin the first impression on mobile.
 *
 * Until that capture exists, `film` names a clip from the shared library in
 * components/video.data.js and the section labels the screen as reference
 * footage. `src` wins whenever it is set, so filling one in is the only step
 * needed to swap a stand-in for the real thing — and the `film` line can
 * then be deleted. Every entry below carried a `src` pointing at a
 * /public/reels/ file that was never added, which meant all four reels 404'd
 * and the section about work playing had nothing playing in it.
 *
 * `chapters` is the mechanism that makes this section worth building: the
 * timestamps map the footage onto the four stages the site already claims to
 * run (Identify → Prove → Measure → Scale, see components/data.js
 * `features`). Playing a reel walks a prospect through the process instead of
 * just showing a product demo. Get the timestamps right per video — they are
 * seconds into that clip, and a wrong one makes the whole device feel broken.
 *
 * Each reel used to have a fifth `Design` chapter between Identify and
 * Prove. The deck has no such step, so it was folded into Prove: Prove now
 * starts at the old Design timestamp and its caption carries both beats.
 */

export const STAGES = ["Identify", "Prove", "Measure", "Scale"];

export const deployments = [
  {
    id: "fraud-realtime",
    client: "Regional bank · client confidential",
    sector: "Fintech",
    headline: "Real-time fraud detection",
    outcome:
      "Transaction scoring in under 40ms, with an explainable trail the compliance team can read.",
    metric: { value: "40", unit: "ms", label: "median scoring latency" },
    // Was "fintechGrowth" (the generic coins/chip stock clip) — the real
    // fraud-detection footage added for WhyUs and the ICU case study
    // (components/video.data.js `films.fraudReal`) belongs here too, not
    // just on those two, now that it exists.
    film: "fraudReal",
    duration: 48,
    chapters: [
      { t: 0, stage: "Identify", caption: "Mapping two years of settled disputes" },
      { t: 9, stage: "Prove", caption: "Defensible features, shadow-run against live traffic" },
      { t: 31, stage: "Measure", caption: "Cutover behind a kill switch" },
      { t: 41, stage: "Scale", caption: "Retraining loop on reviewer feedback" },
    ],
  },
  {
    id: "clinical-copilot",
    client: "Health network · client confidential",
    sector: "Healthtech",
    headline: "Clinical documentation copilot",
    outcome:
      "Note drafting inside the existing Epic workflow, so nobody had to learn a second system.",
    metric: { value: "11", unit: "min", label: "saved per encounter" },
    film: "geneEditing",
    duration: 52,
    chapters: [
      { t: 0, stage: "Identify", caption: "Shadowing clinicians through a full shift" },
      { t: 11, stage: "Prove", caption: "Drafting inside the note, FHIR write-back behind a human gate" },
      { t: 35, stage: "Measure", caption: "One department first, then the floor" },
      { t: 45, stage: "Scale", caption: "Specialty-specific templates" },
    ],
  },
  {
    id: "underwriting-agent",
    client: "Lender · client confidential",
    sector: "Fintech",
    headline: "Autonomous underwriting",
    outcome:
      "Straight-through decisions on the clear cases, so analysts only see the files that need judgement.",
    metric: { value: "3", unit: "×", label: "throughput per analyst" },
    film: "agentsInterface",
    duration: 44,
    chapters: [
      { t: 0, stage: "Identify", caption: "Where the current queue actually stalls" },
      { t: 8, stage: "Prove", caption: "The auto/referred line, as policy and model versioned together" },
      { t: 29, stage: "Measure", caption: "Parallel run against human decisions" },
      { t: 38, stage: "Scale", caption: "New products onboarded by config" },
    ],
  },
  {
    id: "compliance-monitor",
    client: "Trading desk · client confidential",
    sector: "Fintech",
    headline: "Compliance monitoring agent",
    outcome:
      "One view across venues, with alerts that carry the evidence instead of pointing at it.",
    metric: { value: "6", unit: "venues", label: "unified in one feed" },
    film: "infrastructure",
    duration: 39,
    chapters: [
      { t: 0, stage: "Identify", caption: "Reconciling six incompatible feeds" },
      { t: 7, stage: "Prove", caption: "Middleware and alerts that answer 'and then what?'" },
      { t: 26, stage: "Measure", caption: "Running alongside the old process" },
      { t: 34, stage: "Scale", caption: "New venue onboarding in days" },
    ],
  },
];
