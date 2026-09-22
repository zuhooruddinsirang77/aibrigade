"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DemoShell from "@/components/demos/DemoShell";
import useDemoRun from "@/components/demos/useDemoRun";

/**
 * Transaction risk scoring, with the reasons.
 *
 * The control set is the demo's argument: a reader changes one thing —
 * the corridor, the step-up, the hour — and watches the decision and the
 * reason codes move with it. A score on its own proves nothing; a score
 * that visibly responds to a single feature, and names that feature in its
 * reasons, is the thing a risk team is actually buying.
 *
 * It re-runs on change rather than on a submit button because the
 * cause-and-effect is the content. The hook supersedes in-flight runs, so
 * dragging the amount slider is one settled answer, not twenty queued.
 */

const PRESETS = [
  {
    id: "typical",
    label: "Everyday spend",
    input: { amount: 42, country: "domestic", channel: "chip", category: "grocery", velocity24h: 2, tenureMonths: 48, hourLocal: 13, avsMatch: true },
  },
  {
    id: "borderline",
    label: "Borderline",
    input: { amount: 890, country: "eea", channel: "ecom", category: "electronics", velocity24h: 5, tenureMonths: 14, hourLocal: 22, avsMatch: true },
  },
  {
    id: "attack",
    label: "Card testing",
    input: { amount: 4300, country: "emerging", channel: "ecom", category: "crypto", velocity24h: 17, tenureMonths: 2, hourLocal: 3, avsMatch: false },
  },
];

const COUNTRIES = [
  { id: "domestic", label: "Domestic" },
  { id: "eea", label: "Established corridor" },
  { id: "emerging", label: "Emerging corridor" },
  { id: "sanctioned", label: "Restricted" },
];

const CHANNELS = [
  { id: "chip", label: "Chip & PIN" },
  { id: "ecom_3ds", label: "E-com · 3-D Secure" },
  { id: "ecom", label: "E-com · no step-up" },
  { id: "moto", label: "Phone order" },
];

const CATEGORIES = [
  { id: "grocery", label: "Grocery" },
  { id: "travel", label: "Travel" },
  { id: "electronics", label: "Electronics" },
  { id: "crypto", label: "Crypto / transfer" },
];

const DECISIONS = {
  approve: { label: "Approve", note: "Straight through — no analyst touch" },
  review: { label: "Refer", note: "Queued for an analyst with the reasons attached" },
  decline: { label: "Decline", note: "Blocked at authorisation" },
};

export default function FraudDecisionDemo() {
  const [input, setInput] = useState(PRESETS[0].input);
  const { status, result, error, run } = useDemoRun("fraud");

  // Keep the latest input in a ref so the debounce effect can fire without
  // re-subscribing on every keystroke.
  const inputRef = useRef(input);
  inputRef.current = input;

  useEffect(() => {
    const t = setTimeout(() => run(inputRef.current), 180);
    return () => clearTimeout(t);
  }, [input, run]);

  const set = useCallback((patch) => setInput((prev) => ({ ...prev, ...patch })), []);

  const decision = result ? DECISIONS[result.decision] : null;

  return (
    <div className="ax-demo__split">
      <form
        className="ax-demo__controls"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Transaction attributes"
      >
        <div className="ax-demo__presets" role="group" aria-label="Example transactions">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className="ax-demo__preset"
              onClick={() => setInput(p.input)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <label className="ax-demo__field">
          <span className="ax-demo__field-label">
            Amount
            <em>{input.amount.toLocaleString("en-GB")}</em>
          </span>
          <input
            type="range"
            min="5"
            max="10000"
            step="5"
            value={input.amount}
            onChange={(e) => set({ amount: Number(e.target.value) })}
          />
        </label>

        <label className="ax-demo__field">
          <span className="ax-demo__field-label">Corridor</span>
          <select value={input.country} onChange={(e) => set({ country: e.target.value })}>
            {COUNTRIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="ax-demo__field">
          <span className="ax-demo__field-label">Channel</span>
          <select value={input.channel} onChange={(e) => set({ channel: e.target.value })}>
            {CHANNELS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="ax-demo__field">
          <span className="ax-demo__field-label">Merchant</span>
          <select value={input.category} onChange={(e) => set({ category: e.target.value })}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <div className="ax-demo__field-row">
          <label className="ax-demo__field">
            <span className="ax-demo__field-label">
              Auths / 24h<em>{input.velocity24h}</em>
            </span>
            <input
              type="range"
              min="0"
              max="25"
              value={input.velocity24h}
              onChange={(e) => set({ velocity24h: Number(e.target.value) })}
            />
          </label>

          <label className="ax-demo__field">
            <span className="ax-demo__field-label">
              Tenure<em>{input.tenureMonths}m</em>
            </span>
            <input
              type="range"
              min="0"
              max="120"
              value={input.tenureMonths}
              onChange={(e) => set({ tenureMonths: Number(e.target.value) })}
            />
          </label>
        </div>

        <div className="ax-demo__field-row">
          <label className="ax-demo__field">
            <span className="ax-demo__field-label">
              Local hour<em>{String(input.hourLocal).padStart(2, "0")}:00</em>
            </span>
            <input
              type="range"
              min="0"
              max="23"
              value={input.hourLocal}
              onChange={(e) => set({ hourLocal: Number(e.target.value) })}
            />
          </label>

          <label className="ax-demo__check">
            <input
              type="checkbox"
              checked={input.avsMatch}
              onChange={(e) => set({ avsMatch: e.target.checked })}
            />
            <span>Address verified</span>
          </label>
        </div>
      </form>

      <DemoShell
        path="risk · POST /score"
        status={status}
        error={error}
        onRetry={() => run(input)}
        emptyTitle="Adjust a control"
        emptyHint="The decision re-runs as you change the transaction."
        runningLabel="Scoring transaction"
        footer={
          result && (
            <>
              <span>
                Record <strong>{result.record.reference}</strong>
              </span>
              <span>{result.ms}ms · not retained</span>
            </>
          )
        }
      >
        {result && (
          <div className="ax-demo__result">
            <div className={`ax-fraud__verdict ax-fraud__verdict--${result.decision}`}>
              <div className="ax-fraud__verdict-head">
                <span className="ax-fraud__decision">{decision.label}</span>
                <span className="ax-fraud__score">
                  {(result.score * 100).toFixed(1)}
                  <em>/100 risk</em>
                </span>
              </div>
              <p className="ax-fraud__note">{decision.note}</p>
              <span className="ax-fraud__meter" aria-hidden="true">
                <i style={{ width: `${Math.min(100, result.score * 100)}%` }} />
              </span>
            </div>

            <div className="ax-demo__block">
              <h3 className="ax-demo__block-title">Why — ranked reason codes</h3>
              <ul className="ax-fraud__reasons">
                {result.reasons.map((r) => (
                  <li key={r.label} data-dir={r.direction}>
                    <span className="ax-fraud__reason-label">{r.label}</span>
                    <span className="ax-fraud__reason-detail">{r.detail}</span>
                    <span className="ax-fraud__reason-weight">
                      {r.weight > 0 ? "+" : ""}
                      {r.weight}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="ax-demo__block">
              <h3 className="ax-demo__block-title">Policy applied after the model</h3>
              <ul className="ax-fraud__rules">
                {result.rules.map((rule) => (
                  <li key={rule.id} data-effect={rule.effect}>
                    <code>{rule.id}</code>
                    <span>{rule.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </DemoShell>
    </div>
  );
}
