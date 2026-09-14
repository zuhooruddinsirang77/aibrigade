/**
 * Content for the Deployments section.
 *
 * ⚠️  EVERYTHING BELOW IS PLACEHOLDER. Replace client names, outcomes and
 * metrics with work AIBrigade actually shipped, or cut the entry. A reel is
 * the most load-bearing claim on a studio site — it is the one section a
 * prospect will check against your references.
 *
 * Videos: drop MP4s in /public/reels/. Keep them short (25–60s), muted-safe
 * (no essential audio), and H.264 so Safari plays them inline. Re-encode to
 * ~1280px wide and under ~6MB each; this section loads one at a time, but a
 * 40MB hero reel will still ruin the first impression on mobile.
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
    client: "Regional bank — PLACEHOLDER",
    sector: "Fintech",
    headline: "Real-time fraud detection",
    outcome:
      "Transaction scoring in under 40ms, with an explainable trail the compliance team can read.",
    metric: { value: "40", unit: "ms", label: "median scoring latency" },
    src: "/reels/fraud-detection.mp4",
    poster: "/reels/fraud-detection.jpg",
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
    client: "Health network — PLACEHOLDER",
    sector: "Healthtech",
    headline: "Clinical documentation copilot",
    outcome:
      "Note drafting inside the existing Epic workflow, so nobody had to learn a second system.",
    metric: { value: "11", unit: "min", label: "saved per encounter" },
    src: "/reels/clinical-copilot.mp4",
    poster: "/reels/clinical-copilot.jpg",
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
    client: "Lender — PLACEHOLDER",
    sector: "Fintech",
    headline: "Autonomous underwriting",
    outcome:
      "Straight-through decisions on the clear cases, so analysts only see the files that need judgement.",
    metric: { value: "3", unit: "×", label: "throughput per analyst" },
    src: "/reels/underwriting.mp4",
    poster: "/reels/underwriting.jpg",
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
    client: "Trading desk — PLACEHOLDER",
    sector: "Fintech",
    headline: "Compliance monitoring agent",
    outcome:
      "One view across venues, with alerts that carry the evidence instead of pointing at it.",
    metric: { value: "6", unit: "venues", label: "unified in one feed" },
    src: "/reels/compliance.mp4",
    poster: "/reels/compliance.jpg",
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
