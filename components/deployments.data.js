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
 * timestamps map the footage onto the five stages the site already claims to
 * run (Discover → Design → Build → Deploy → Scale, see components/data.js
 * `features`). Playing a reel walks a prospect through the process instead of
 * just showing a product demo. Get the timestamps right per video — they are
 * seconds into that clip, and a wrong one makes the whole device feel broken.
 */

export const STAGES = ["Discover", "Design", "Build", "Deploy", "Scale"];

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
      { t: 0, stage: "Discover", caption: "Mapping two years of settled disputes" },
      { t: 9, stage: "Design", caption: "Choosing features the risk team can defend" },
      { t: 19, stage: "Build", caption: "Streaming scorer, shadow-run against live traffic" },
      { t: 31, stage: "Deploy", caption: "Cutover behind a kill switch" },
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
      { t: 0, stage: "Discover", caption: "Shadowing clinicians through a full shift" },
      { t: 11, stage: "Design", caption: "Drafting inside the note, never beside it" },
      { t: 22, stage: "Build", caption: "HL7 FHIR write-back with a human approval gate" },
      { t: 35, stage: "Deploy", caption: "One department first, then the floor" },
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
      { t: 0, stage: "Discover", caption: "Where the current queue actually stalls" },
      { t: 8, stage: "Design", caption: "Drawing the line between auto and referred" },
      { t: 17, stage: "Build", caption: "Policy engine plus model, versioned together" },
      { t: 29, stage: "Deploy", caption: "Parallel run against human decisions" },
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
      { t: 0, stage: "Discover", caption: "Reconciling six incompatible feeds" },
      { t: 7, stage: "Design", caption: "An alert that answers 'and then what?'" },
      { t: 15, stage: "Build", caption: "Middleware and the review interface" },
      { t: 26, stage: "Deploy", caption: "Running alongside the old process" },
      { t: 34, stage: "Scale", caption: "New venue onboarding in days" },
    ],
  },
];
