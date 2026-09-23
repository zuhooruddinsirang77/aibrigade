"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DemoShell from "@/components/demos/DemoShell";
import useDemoRun from "@/components/demos/useDemoRun";
import KbdHint from "@/components/demos/KbdHint";
import { submitOnModEnter, useRunOnView } from "@/components/demos/labHooks";

/**
 * Unstructured document in, structured record out — with the source span
 * for every value.
 *
 * The highlight is the honest part of this demo. Anyone can print a JSON
 * object and claim it came from the document; showing which characters
 * produced each field is what makes it checkable, and it is exactly what a
 * reviewer in a revenue-cycle or onboarding team needs in order to accept
 * or correct a value quickly.
 *
 * Highlighting is built from character offsets into React elements — the
 * text is never assembled into an HTML string and never passed through
 * `dangerouslySetInnerHTML`. That matters here more than anywhere else on
 * the page, because the content being rendered is whatever the visitor
 * pasted in.
 *
 * Pointing at a field does more than colour its span: the source pane
 * scrolls to it. Rows are matched to spans by key and offset, not key
 * alone — a remittance has four monetary amounts, and pointing at one
 * should light that one. A highlight below the fold of a scrolled pane is a
 * highlight nobody sees, and "find it in the document" should mean found.
 */

const SAMPLES = [
  {
    id: "remittance",
    label: "Remittance advice",
    text: `REMITTANCE ADVICE
Payer: Northbridge Health Plan
Payment date: 14/03/2026    Check no: 8841207

Provider: *Lakeside Family Practice*
NPI: 1982736450

Claim number: CLM-77421-B
Patient: Dana Whitfield        MRN: MR-449012
Service date: 2026-02-27
Diagnosis: E11.9
CPT code: 99214

Billed amount:        $340.00
Allowed amount:       $212.50
Plan paid:            $170.00
Patient responsibility: $42.50

Remit questions: claims@northbridgehealth.example`,
  },
  {
    id: "clinical",
    label: "Clinical note",
    text: `PROGRESS NOTE
Patient: Marcus Oyelaran        DOB: 04/11/1967
MRN: MR-220841                  Date: 2026-03-02

Chief complaint: follow-up, type 2 diabetes and hypertension.

History of present illness: Patient reports improved adherence since
the last visit. Home readings average 138/84. No hypoglycaemic episodes.

Assessment:
  E11.9  Type 2 diabetes mellitus without complications
  I10    Essential hypertension

Plan: continue metformin 1g BD. Repeat HbA1c in 3 months.
Follow-up: 12 Jun 2026.

Provider: Dr Aisling Brennan    NPI: 1730095512
Contact: +44 20 7946 0112`,
  },
  {
    id: "invoice",
    label: "Supplier invoice",
    text: `INVOICE

Invoice number: INV-2026-04417
Invoice date: 09/03/2026
Due date: 08/04/2026        Terms: Net 30

Bill to: Harrow Logistics Group
Supplier: Kestrel Components Ltd
Purchase order: PO-88213

Item                        Qty    Unit price      Amount
Bearing assembly KC-4410     40        £18.50      £740.00
Drive belt KC-2207           25        £11.20      £280.00

Subtotal:   £1,020.00
VAT (20%):    £204.00
Total due:  £1,224.00

Remit to IBAN GB29NWBK60161331926819
Queries: accounts@kestrelcomponents.example`,
  },
];

const MAX = 6000;

/**
 * Render `text` with `spans` highlighted, as React nodes.
 *
 * Spans arrive sorted by start but may overlap (a date inside a labelled
 * field, say). Overlaps are dropped rather than nested — a partial
 * highlight is a rendering bug waiting to happen and the dropped one is
 * always the lower-value duplicate.
 */
const spanId = (f) => `${f.key}-${f.start}`;

function Highlighted({ text, spans, activeKey }) {
  const preRef = useRef(null);

  // Bring the active span into the middle of the pane. The pane scrolls,
  // never the page — `scrollIntoView` would drag the whole window along.
  useEffect(() => {
    const pre = preRef.current;
    if (!pre || !activeKey) return;
    const mark = pre.querySelector('mark[data-on="true"]');
    if (!mark) return;
    const top = mark.offsetTop - pre.clientHeight / 2 + mark.offsetHeight / 2;
    pre.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [activeKey]);

  const nodes = useMemo(() => {
    const out = [];
    let cursor = 0;

    for (const span of spans) {
      if (span.start < cursor) continue; // overlaps something already drawn
      if (span.start > text.length) break;

      if (span.start > cursor) out.push(text.slice(cursor, span.start));

      out.push(
        <mark
          key={`${span.key}-${span.start}`}
          className="ax-doc__mark"
          data-on={activeKey === spanId(span) ? "true" : undefined}
        >
          {text.slice(span.start, span.end)}
        </mark>
      );
      cursor = span.end;
    }

    if (cursor < text.length) out.push(text.slice(cursor));
    return out;
  }, [text, spans, activeKey]);

  return (
    <pre ref={preRef} className="ax-doc__source">
      {nodes}
    </pre>
  );
}

export default function DocumentExtractionDemo() {
  const [text, setText] = useState(SAMPLES[0].text);
  const [activeKey, setActiveKey] = useState(null);
  const { status, result, ranInput, error, run, reset } = useDemoRun("extraction");
  const rootRef = useRef(null);

  const tooShort = text.trim().length < 20;
  const picked = SAMPLES.find((s) => s.text === text);

  useRunOnView(rootRef, () => {
    if (status === "idle" && !tooShort) run({ text });
  });

  const submit = (e) => {
    e.preventDefault();
    if (tooShort) return;
    run({ text });
  };

  const loadSample = (sample) => {
    setText(sample.text);
    setActiveKey(null);
    run({ text: sample.text });
  };

  // The text the result on screen was extracted from. During a re-run the
  // panel still shows the previous result, and its offsets belong to the
  // previous text.
  const shownText = ranInput?.text ?? text;
  const avg = result ? Math.round(result.stats.avgConfidence * 100) : 0;

  return (
    <div className="ax-demo__split" ref={rootRef}>
      <form className="ax-demo__controls" onSubmit={submit} aria-label="Document text">
        <div className="ax-demo__presets" role="group" aria-label="Sample documents">
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              type="button"
              className="ax-demo__preset"
              aria-pressed={picked?.id === s.id}
              onClick={() => loadSample(s)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <label className="ax-demo__field">
          <span className="ax-demo__field-label">
            Document text
            <em>
              {text.length}/{MAX}
            </em>
          </span>
          <textarea
            className="ax-demo__textarea"
            value={text}
            maxLength={MAX}
            rows={12}
            spellCheck="false"
            onKeyDown={submitOnModEnter}
            onChange={(e) => {
              setText(e.target.value);
              if (status !== "idle") reset();
            }}
            placeholder="Paste a remittance advice, clinical note, invoice or onboarding document…"
          />
        </label>

        <div className="ax-demo__actions">
          <button
            type="submit"
            className="ax-demo__run"
            disabled={tooShort || status === "running"}
          >
            {status === "running" ? "Extracting…" : "Extract fields"}
          </button>
          {tooShort ? (
            <p className="ax-demo__hint">Paste at least 20 characters to run.</p>
          ) : (
            <KbdHint action="to extract" />
          )}
        </div>

        <p className="ax-demo__privacy">
          Text is processed in the request and never stored. Do not paste real
          patient or customer data into a public demo.
        </p>
      </form>

      <DemoShell
        path="docs · POST /extract"
        status={status}
        error={error}
        onRetry={() => run({ text })}
        emptyTitle="No document parsed yet"
        emptyHint="Load a sample or paste your own, then run the extraction."
        runningLabel="Parsing document"
        steps={["Classify document", "Match field patterns", "Score confidence"]}
        raw={result}
        footer={
          result && (
            <>
              <span>
                {result.stats.entities} entities · {result.stats.distinct} field types
              </span>
              <span>{result.ms}ms</span>
            </>
          )
        }
      >
        {result && (
          <div className="ax-demo__result">
            <div className="ax-doc__type">
              <div>
                <span className="ax-doc__type-label">{result.type.label}</span>
                <span className="ax-doc__type-hint">{result.type.hint}</span>
              </div>
              <span className="ax-doc__type-score">
                {Math.round(result.type.confidence * 100)}%
              </span>
            </div>

            <ul className="ax-doc__stats" aria-label="Extraction summary">
              <li>
                <strong>{result.stats.entities}</strong>
                <span>fields found</span>
              </li>
              <li>
                <strong>{avg}%</strong>
                <span>avg confidence</span>
              </li>
              <li data-tone={result.reviewRequired ? "review" : "ok"}>
                <strong>{result.reviewRequired ? "Review" : "Straight through"}</strong>
                <span>{result.reviewRequired ? "a person signs off" : "no touch needed"}</span>
              </li>
            </ul>

            {result.fields.length === 0 ? (
              <p className="ax-demo__none">
                No recognisable fields in that text. The extractor reports nothing
                rather than guessing at values it cannot see.
              </p>
            ) : (
              <>
                <div className="ax-demo__block">
                  <h3 className="ax-demo__block-title">
                    Extracted fields — hover a row to find it in the document
                  </h3>
                  <ul className="ax-doc__fields">
                    {result.fields.map((f) => (
                      <li
                        key={`${f.key}-${f.start}`}
                        data-on={activeKey === spanId(f) ? "true" : undefined}
                        onMouseEnter={() => setActiveKey(spanId(f))}
                        onMouseLeave={() => setActiveKey(null)}
                        onFocus={() => setActiveKey(spanId(f))}
                        onBlur={() => setActiveKey(null)}
                        tabIndex={0}
                      >
                        <span className="ax-doc__field-name">{f.label}</span>
                        <span className="ax-doc__field-value">{f.value}</span>
                        <span className="ax-doc__field-meta">
                          {f.method}
                          <span
                            className="ax-doc__conf"
                            style={{ "--c": `${Math.round(f.confidence * 100)}%` }}
                            aria-hidden="true"
                          />
                          {Math.round(f.confidence * 100)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="ax-demo__block">
                  <h3 className="ax-demo__block-title">Source</h3>
                  <Highlighted text={shownText} spans={result.fields} activeKey={activeKey} />
                </div>
              </>
            )}

            {result.reviewRequired && (
              <p className="ax-doc__review">
                <strong>Human review required.</strong>{" "}
                {result.missing.length > 0
                  ? `Expected but not found: ${result.missing.join(", ")}.`
                  : "Average confidence is below the straight-through threshold."}
              </p>
            )}
          </div>
        )}
      </DemoShell>
    </div>
  );
}
