"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DemoShell from "@/components/demos/DemoShell";
import useDemoRun from "@/components/demos/useDemoRun";
import { useCountUp } from "@/components/demos/labHooks";

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
 *
 * The meter is drawn against the engine's own thresholds (38 refer, 72
 * decline), so a reader can see not just the score but how close it sits
 * to the line that would change the outcome.
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

/* The engine's cut-offs, as a percentage of the score. Mirrors
   `meta.thresholds` in app/api/demos/_engines/fraud.js. */
const REFER_AT = 38;
const DECLINE_AT = 72;

const sameInput = (a, b) => Object.keys(a).every((k) => a[k] === b[k]);

const DECISIONS = {
  approve: { label: "Approve", note: "Straight through — no analyst touch" },
  review: { label: "Refer", note: "Queued for an analyst with the reasons attached" },
  decline: { label: "Decline", note: "Blocked at authorisation" },
};

export default function FraudDecisionDemo() {
  const [input, setInput] = useState(PRESETS[0].input);
  const { status, result, error, run } = useDemoRun("fraud");
  const score = useCountUp(result ? result.score * 100 : 0);

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
  const preset = PRESETS.find((p) => sameInput(p.input, input));
  const maxWeight = result
    ? Math.max(...result.reasons.map((r) => Math.abs(r.weight)), 0.001)
    : 1;

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
              aria-pressed={preset?.id === p.id}
              onClick={() => setInput(p.input)}
            >
              {p.label}
            </button>
          ))}
          {!preset && <span className="ax-demo__custom">Custom</span>}
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
        steps={["Normalise 8 features", "Score AB-SCORE-1", "Apply policy set PS-4"]}
        raw={result}
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
                <span className="ax-fraud__decision">
                  <i aria-hidden="true" />
                  {decision.label}
                </span>
                <span className="ax-fraud__score">
                  {score.toFixed(1)}
                  <em>/100 risk</em>
                </span>
              </div>
              <p className="ax-fraud__note">{decision.note}</p>

              {/* Three zones at the engine's thresholds, the score as a
                  marker travelling across them. */}
              <div
                className="ax-fraud__meter"
                style={{
                  "--refer": `${REFER_AT}%`,
                  "--decline": `${DECLINE_AT}%`,
                  "--at": `${Math.min(100, Math.max(0, result.score * 100))}%`,
                }}
                aria-hidden="true"
              >
                <span className="ax-fraud__zones">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="ax-fraud__needle" />
                <span className="ax-fraud__ticks">
                  <span style={{ left: "0%" }}>0</span>
                  <span style={{ left: `${REFER_AT}%` }}>{REFER_AT}</span>
                  <span style={{ left: `${DECLINE_AT}%` }}>{DECLINE_AT}</span>
                  <span style={{ left: "100%" }}>100</span>
                </span>
              </div>
            </div>

            <div className="ax-demo__block">
              <h3 className="ax-demo__block-title">Why — ranked reason codes</h3>
              <ul className="ax-fraud__reasons">
                {result.reasons.map((r) => (
                  <li key={r.label} data-dir={r.direction}>
                    <span className="ax-fraud__reason-label">{r.label}</span>
                    <span className="ax-fraud__reason-detail">{r.detail}</span>
                    {/* Diverging from a centre line: left lowers risk,
                        right raises it, length is share of the largest. */}
                    <span className="ax-fraud__reason-bar" aria-hidden="true">
                      <i style={{ "--w": `${(Math.abs(r.weight) / maxWeight) * 50}%` }} />
                    </span>
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
