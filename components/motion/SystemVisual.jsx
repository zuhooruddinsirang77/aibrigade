"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * The three case studies, as the systems they actually are.
 *
 * What stood here was three screenshots of a bond-trading app, inherited
 * from the Webflow fintech template this site was ported from. They were
 * the largest thing in the Evidence section and none of them showed
 * anything the copy beside them described: the card headed "Real-time
 * fraud detection" was illustrated with a screen of UA-prefixed bond
 * listings and YTM percentages. A prospect reading that card and looking
 * at that picture learns that the picture is stock.
 *
 * Each variant here is the system in its own card, running:
 *
 *   stream — transactions arriving and being scored, one referred
 *   split  — an underwriting queue separating auto from referred
 *   draft  — a clinical note being written, then held for approval
 *
 * They are illustrations, not dashboards: the figures are shaped like the
 * outcome each case study already claims in its own copy, and no number
 * appears here that is not already stated in words on the same card.
 *
 * SSR safety: the first frame is a fixed, hand-written state — no
 * Math.random or Date at module scope — so the server and the client
 * render identical markup. Motion starts on mount and only if motion is
 * welcome; under `prefers-reduced-motion` each panel stays on that first
 * frame, which is a complete, readable picture on its own.
 */

/* ---------------------------------------------------------------- */

const SEED_TXNS = [
  { id: "8f2a41", amt: "2,480.00", score: 12, verdict: "pass" },
  { id: "7c19d0", amt: "18,900.00", score: 31, verdict: "pass" },
  { id: "5e30b7", amt: "940.50", score: 94, verdict: "refer" },
  { id: "2a77fc", amt: "6,215.00", score: 8, verdict: "pass" },
  { id: "9b04e2", amt: "312.75", score: 22, verdict: "pass" },
];

/* A fixed ring of rows rather than random ones: the panel loops, and a
   loop you can't predict reads as noise. These repeat on a cycle the way
   a real monitoring feed does. */
const TXN_RING = [
  { id: "4d81a9", amt: "1,105.00", score: 17, verdict: "pass" },
  { id: "6f22c3", amt: "27,400.00", score: 88, verdict: "refer" },
  { id: "1b90ea", amt: "560.20", score: 6, verdict: "pass" },
  { id: "3c58d4", amt: "9,870.00", score: 41, verdict: "pass" },
  { id: "0e47bb", amt: "4,020.00", score: 73, verdict: "refer" },
  { id: "aa16f8", amt: "780.00", score: 14, verdict: "pass" },
];

function Stream() {
  const [rows, setRows] = useState(SEED_TXNS);
  const cursor = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = setInterval(() => {
      const next = TXN_RING[cursor.current % TXN_RING.length];
      cursor.current += 1;
      // Prefix a fresh key so React animates the entering row rather than
      // re-using the DOM node of the row that just left.
      setRows((r) => [{ ...next, k: `${next.id}-${cursor.current}` }, ...r.slice(0, 4)]);
    }, 1900);
    return () => clearInterval(t);
  }, []);

  const referred = rows.filter((r) => r.verdict === "refer").length;

  return (
    <>
      <div className="ax-sysv__head">
        <span className="ax-sysv__head-label">live scoring</span>
        <span className="ax-sysv__head-stat">
          {referred} referred <i>/ {rows.length}</i>
        </span>
      </div>
      <ul className="ax-sysv__rows">
        {rows.map((r) => (
          <li className="ax-sysv__row" key={r.k || r.id} data-verdict={r.verdict}>
            <span className="ax-sysv__row-id">txn_{r.id}</span>
            <span className="ax-sysv__row-amt">${r.amt}</span>
            <span className="ax-sysv__bar" aria-hidden="true">
              <span className="ax-sysv__bar-fill" style={{ width: `${r.score}%` }} />
            </span>
            <span className="ax-sysv__chip">{r.verdict}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ---------------------------------------------------------------- */

const RULES = [
  { rule: "UW-204", label: "income verified · LTV 61%", to: "auto" },
  { rule: "UW-118", label: "thin file · no bureau match", to: "refer" },
  { rule: "UW-204", label: "income verified · LTV 44%", to: "auto" },
  { rule: "UW-331", label: "DTI above policy ceiling", to: "refer" },
  { rule: "UW-204", label: "income verified · LTV 52%", to: "auto" },
  { rule: "UW-207", label: "clean file · repeat borrower", to: "auto" },
];

function Split() {
  const [i, setI] = useState(0);
  const [tally, setTally] = useState({ auto: 18, refer: 6 });

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = setInterval(() => {
      setI((n) => {
        const next = (n + 1) % RULES.length;
        setTally((c) => {
          const to = RULES[next].to;
          const bumped = { ...c, [to]: c[to] + 1 };
          // Reset before the numbers stop looking like a morning's work.
          return bumped.auto + bumped.refer > 60 ? { auto: 18, refer: 6 } : bumped;
        });
        return next;
      });
    }, 2100);
    return () => clearInterval(t);
  }, []);

  const current = RULES[i];
  const total = tally.auto + tally.refer;
  const autoPct = Math.round((tally.auto / total) * 100);

  return (
    <>
      <div className="ax-sysv__head">
        <span className="ax-sysv__head-label">underwriting queue</span>
        <span className="ax-sysv__head-stat">
          {total} <i>today</i>
        </span>
      </div>

      <div className="ax-sysv__case" data-to={current.to}>
        <span className="ax-sysv__case-rule">{current.rule}</span>
        <span className="ax-sysv__case-label">{current.label}</span>
        <span className="ax-sysv__case-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="ax-sysv__case-dest">
          {current.to === "auto" ? "straight through" : "to analyst"}
        </span>
      </div>

      <div className="ax-sysv__split" aria-hidden="true">
        <span className="ax-sysv__split-bar">
          <span className="ax-sysv__split-auto" style={{ width: `${autoPct}%` }} />
        </span>
      </div>
      <div className="ax-sysv__legend">
        <span data-k="auto">
          <b>{tally.auto}</b> decided automatically
        </span>
        <span data-k="refer">
          <b>{tally.refer}</b> sent to an analyst
        </span>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */

const NOTE =
  "58yo established patient, follow-up for type 2 diabetes. Reports improved adherence since last visit. Denies hypoglycaemic episodes. Plan: continue metformin 1g BD, repeat HbA1c in 12 weeks.";

const FHIR = [
  { res: "Encounter", val: "follow-up · ambulatory" },
  { res: "Condition", val: "E11.9 type 2 diabetes" },
  { res: "MedicationStatement", val: "metformin 1g BD" },
  { res: "ServiceRequest", val: "HbA1c · 12 weeks" },
];

function Draft() {
  // First frame is the finished note, so the server and a reduced-motion
  // reader both get the complete picture rather than an empty box.
  const [n, setN] = useState(NOTE.length);
  const [approved, setApproved] = useState(true);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let i = 0;
    let hold;
    setN(0);
    setApproved(false);

    const t = setInterval(() => {
      i += 2;
      if (i < NOTE.length) {
        setN(i);
        return;
      }
      setN(NOTE.length);
      setApproved(true);
      clearInterval(t);
      // Hold the finished note on screen, then write it again. Bumping
      // `cycle` is what re-runs this effect — deriving the dependency
      // from `n`/`approved` instead would restart the typing on every
      // single character.
      hold = setTimeout(() => setCycle((c) => c + 1), 4200);
    }, 28);

    return () => {
      clearInterval(t);
      clearTimeout(hold);
    };
  }, [cycle]);

  // How many FHIR resources have been extracted so far, revealed as the
  // note reaches the part of the sentence each one comes from.
  const shown = Math.floor((n / NOTE.length) * (FHIR.length + 0.4));

  return (
    <>
      <div className="ax-sysv__head">
        <span className="ax-sysv__head-label">note · draft</span>
        <span className="ax-sysv__head-stat" data-on={approved}>
          {approved ? "awaiting clinician" : "drafting"}
        </span>
      </div>

      <p className="ax-sysv__note">
        {NOTE.slice(0, n)}
        {n < NOTE.length ? <i className="ax-sysv__caret" aria-hidden="true" /> : null}
      </p>

      <div className="ax-sysv__fhir">
        <span className="ax-sysv__fhir-label">HL7 FHIR write-back</span>
        <ul>
          {FHIR.map((f, i) => (
            <li key={f.res} data-on={i < shown}>
              <code>{f.res}</code>
              <span>{f.val}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */

const VARIANTS = {
  stream: {
    Body: Stream,
    chrome: "fraud-scoring · production",
    label:
      "A live transaction feed being scored: five transactions with risk scores, one referred for review.",
  },
  split: {
    Body: Split,
    chrome: "underwriting · production",
    label:
      "An underwriting queue splitting into decisions made automatically and files sent to an analyst.",
  },
  draft: {
    Body: Draft,
    chrome: "clinical-copilot · production",
    label:
      "A clinical note being drafted, with the structured FHIR resources extracted from it, held for clinician approval.",
  },
};

export default function SystemVisual({ variant, className = "", ...rest }) {
  const v = VARIANTS[variant];
  if (!v) return null;
  const { Body } = v;

  return (
    <div
      className={`ax-sysv ax-sysv--${variant} ${className}`.trim()}
      role="img"
      aria-label={v.label}
      /* Carries `data-lift` when a case tile puts this on its own plane
         inside a `TiltCard` — see app/immersive.css §3. */
      {...rest}
    >
      <div className="ax-sysv__bar" aria-hidden="true">
        <span className="ax-sysv__dots">
          <i />
          <i />
          <i />
        </span>
        <span className="ax-sysv__chrome">{v.chrome}</span>
        <span className="ax-sysv__live">
          <i />
          live
        </span>
      </div>
      <div className="ax-sysv__body" aria-hidden="true">
        <Body />
      </div>
    </div>
  );
}
