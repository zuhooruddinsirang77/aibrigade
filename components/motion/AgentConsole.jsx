"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * The hero's right-hand stage.
 *
 * What used to sit here was three screenshots of a stock-trading app —
 * inherited from the Webflow fintech template this site was built on. They
 * were the first thing a visitor saw, they were the largest element on the
 * page, and they said "we made a trading app", which is not what this company
 * sells. Two of the three were also cut off by the right edge of the
 * viewport.
 *
 * This replaces them with the thing the company actually builds: a system
 * making a decision. One inference run per capability, traced stage by stage,
 * with the latency budget adding up as it goes and an auditable verdict at
 * the end. It isn't a screenshot of a product — it's the shape of the product
 * they sell, which is the only honest hero image for a firm that builds
 * bespoke systems rather than a single app.
 *
 * Every number here is taken from copy already on this page (the 40ms
 * scoring claim and the 3x underwriting throughput are in
 * deployments.data.js; the HL7 FHIR and Epic integrations are in
 * components/data.js) so the console is a restatement of existing claims,
 * not a new set of them.
 *
 * Behaviour: runs itself, advances to the next capability when a trace
 * finishes, and stops entirely when scrolled out of view or when the reader
 * takes over by clicking a tab. Under prefers-reduced-motion it renders one
 * completed trace and never animates.
 */

const TRACES = [
  {
    id: "fraud",
    tab: "Fraud",
    request: "POST /score · txn_8f2a41",
    steps: [
      { label: "feature store", detail: "142 features", ms: 4 },
      { label: "risk model v3.2", detail: "score 0.94", ms: 9 },
      { label: "policy engine", detail: "rule FR-118", ms: 2 },
      { label: "explanation", detail: "3 reasons", ms: 6 },
    ],
    verdict: { state: "refer", text: "REFER to analyst", note: "audit trail written" },
  },
  {
    id: "underwriting",
    tab: "Underwriting",
    request: "POST /decision · app_31c7",
    steps: [
      { label: "document intake", detail: "9 documents", ms: 11 },
      { label: "affordability", detail: "DTI 0.31", ms: 5 },
      { label: "policy engine", detail: "within appetite", ms: 3 },
      { label: "decision record", detail: "versioned", ms: 4 },
    ],
    verdict: { state: "pass", text: "APPROVE straight-through", note: "analyst not required" },
  },
  {
    id: "clinical",
    tab: "Clinical",
    request: "POST /draft · enc_5d90",
    steps: [
      { label: "encounter context", detail: "Epic · HL7 FHIR", ms: 12 },
      { label: "note draft", detail: "SOAP format", ms: 18 },
      { label: "PHI guard", detail: "0 leaks", ms: 3 },
      { label: "clinician gate", detail: "awaiting sign-off", ms: 2 },
    ],
    verdict: { state: "hold", text: "HOLD for clinician", note: "nothing writes unreviewed" },
  },
  {
    id: "compliance",
    tab: "Compliance",
    request: "POST /surveil · win_0442",
    steps: [
      { label: "venue feeds", detail: "6 unified", ms: 8 },
      { label: "pattern match", detail: "2 candidates", ms: 7 },
      { label: "evidence bundle", detail: "attached", ms: 5 },
      { label: "alert routing", detail: "desk + legal", ms: 2 },
    ],
    verdict: { state: "alert", text: "ALERT raised", note: "evidence attached, not linked" },
  },
];

const STEP_MS = 620; // one trace row lands every ~0.6s
const HOLD_MS = 2600; // how long a finished trace sits before the next one

export default function AgentConsole() {
  const reduced = typeof window !== "undefined" && prefersReducedMotion();

  const [index, setIndex] = useState(0);
  // How many rows of the current trace have landed. Starts complete under
  // reduced motion so the panel is never a half-drawn skeleton.
  const [revealed, setRevealed] = useState(0);
  const [manual, setManual] = useState(false);
  const [visible, setVisible] = useState(true);

  const rootRef = useRef(null);
  const trace = TRACES[index];
  const stepCount = trace.steps.length;

  const done = revealed >= stepCount;

  const elapsed = useMemo(
    () => trace.steps.slice(0, revealed).reduce((sum, s) => sum + s.ms, 0),
    [trace, revealed]
  );
  const total = useMemo(
    () => trace.steps.reduce((sum, s) => sum + s.ms, 0),
    [trace]
  );

  const select = useCallback((i) => {
    setManual(true);
    setIndex(i);
    setRevealed(0);
  }, []);

  /* A reel playing to nobody costs battery for nothing — and an interval
     that keeps firing while the hero is three screens above you will still
     be re-rendering this subtree on every tick. */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Reveal one row at a time.
  useEffect(() => {
    if (reduced) {
      setRevealed(stepCount);
      return;
    }
    if (!visible || done) return;
    const t = setTimeout(() => setRevealed((n) => n + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [reduced, visible, done, revealed, stepCount]);

  // Once a trace completes, move to the next capability — unless the reader
  // has picked one themselves, in which case the panel stays put.
  useEffect(() => {
    if (reduced || manual || !visible || !done) return;
    const t = setTimeout(() => {
      setIndex((i) => (i + 1) % TRACES.length);
      setRevealed(0);
    }, HOLD_MS);
    return () => clearTimeout(t);
  }, [reduced, manual, visible, done]);

  return (
    <div className="ax-console" ref={rootRef}>
      <div className="ax-console__chrome">
        <span className="ax-console__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="ax-console__path">aibrigade · inference</span>
        <span className="ax-console__live">
          <span className="ax-console__live-dot" aria-hidden="true" />
          live
        </span>
      </div>

      <div className="ax-console__tabs" role="tablist" aria-label="Example systems">
        {TRACES.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            className="ax-console__tab"
            onClick={() => select(i)}
          >
            {t.tab}
          </button>
        ))}
      </div>

      {/* The trace itself. `aria-live` is deliberately off: this is an
          ambient illustration, and a screen reader announcing four rows
          every few seconds for the whole time someone is on the page would
          be unusable. The completed verdict below carries the meaning. */}
      <div className="ax-console__body">
        <p className="ax-console__request">{trace.request}</p>

        <ol className="ax-console__steps">
          {trace.steps.map((s, i) => (
            <li
              /* Keyed by trace, not by label. "policy engine" is a step in
                 both the fraud trace and the underwriting one, so a bare
                 label key let React reuse that one <li> across a trace
                 change while its siblings remounted — the reused row kept
                 the entrance animation it had already finished and stayed
                 lit while the rows above it were still invisible, which
                 rendered as a hole in the middle of the trace. */
              key={`${trace.id}-${i}`}
              className="ax-console__step"
              data-state={i < revealed ? "done" : i === revealed ? "running" : "idle"}
            >
              <span className="ax-console__step-mark" aria-hidden="true" />
              <span className="ax-console__step-label">{s.label}</span>
              <span className="ax-console__step-detail">{s.detail}</span>
              <span className="ax-console__step-ms">{s.ms}ms</span>
            </li>
          ))}
        </ol>

        <div className="ax-console__foot">
          <div className="ax-console__meter" aria-hidden="true">
            <span
              className="ax-console__meter-fill"
              style={{ width: `${(revealed / stepCount) * 100}%` }}
            />
          </div>
          <span className="ax-console__elapsed">
            {elapsed}
            <em>/{total}ms</em>
          </span>
        </div>

        <p className="ax-console__verdict" data-state={trace.verdict.state} data-on={done}>
          <span className="ax-console__verdict-text">{trace.verdict.text}</span>
          <span className="ax-console__verdict-note">{trace.verdict.note}</span>
        </p>
      </div>
    </div>
  );
}
