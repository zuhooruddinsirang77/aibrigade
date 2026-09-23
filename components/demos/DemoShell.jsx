"use client";

import { useMemo, useState } from "react";
import { trackSpotlight } from "@/components/demos/labHooks";

/**
 * The console chrome every demo runs inside.
 *
 * It owns the four states a demo can be in so they cannot drift apart
 * between one demo and the next: `idle` prints the empty state, `running`
 * prints the working state, `error` prints the failure with a retry, and
 * `done` hands the panel over to the demo's own result renderer.
 *
 * A re-run does not blank the panel. When there is already a result on
 * screen, `running` keeps it there, dimmed, with a progress line under the
 * chrome — the fraud module re-scores on every slider step, and a panel
 * that emptied to a spinner each time read as a flicker rather than as a
 * system responding. The working state with its step trace is only for a
 * panel that has nothing to show yet.
 *
 * `raw` is the response body. When present the chrome offers a JSON view
 * of it: the audience for this page includes the engineers who will be
 * asked whether any of it is real, and the response itself is the answer.
 *
 * The chrome deliberately quotes `.ax-console` from the contact page — the
 * dot row, the mono path, the live pip — because a reader who has seen the
 * inference console on /contact should recognise this as the same object.
 * It is a separate class (`.ax-demo__panel`) rather than a reuse of
 * `.ax-console` itself so that changing one page's console cannot silently
 * restyle four demos on another.
 */
export default function DemoShell({
  path,
  status,
  error,
  onRetry,
  emptyTitle = "Nothing run yet",
  emptyHint,
  runningLabel = "Running",
  steps,
  raw,
  children,
  footer,
}) {
  const [view, setView] = useState("visual");

  const hasResult = Boolean(children);
  const showResult = hasResult && (status === "done" || status === "running");
  const stale = showResult && status === "running";
  const json = view === "json" && showResult && raw;

  return (
    <div
      className="ax-demo__panel"
      data-status={status}
      data-stale={stale ? "true" : undefined}
      onPointerMove={trackSpotlight}
    >
      <div className="ax-demo__chrome">
        <span className="ax-demo__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="ax-demo__path">{path}</span>

        {raw && showResult && (
          <span className="ax-demo__views" role="group" aria-label="Result view">
            {["visual", "json"].map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
              >
                {v === "visual" ? "Visual" : "JSON"}
              </button>
            ))}
          </span>
        )}

        <span className={`ax-demo__pip ax-demo__pip--${status}`}>
          <i aria-hidden="true" />
          {status === "running"
            ? "working"
            : status === "error"
              ? "error"
              : status === "done"
                ? "complete"
                : "ready"}
        </span>
      </div>

      {/* One live region for the whole panel: a screen reader is told the
          run finished or failed without having to hunt for what changed. */}
      <div
        className="ax-demo__body"
        aria-busy={status === "running" || undefined}
        aria-live="polite"
        aria-atomic="false"
      >
        {status === "idle" && (
          <div className="ax-demo__empty">
            <span className="ax-demo__empty-ring" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path
                  d="M8 5.5v13l10.5-6.5z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="ax-demo__empty-title">{emptyTitle}</p>
            {emptyHint && <p className="ax-demo__empty-hint">{emptyHint}</p>}
          </div>
        )}

        {status === "running" && !showResult && (
          <div className="ax-demo__working">
            <span className="ax-demo__bar" aria-hidden="true">
              <i />
            </span>
            <p>{runningLabel}…</p>
            {steps && (
              <ol className="ax-demo__steps" aria-hidden="true">
                {steps.map((s, i) => (
                  <li key={s} style={{ "--i": i }}>
                    {s}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="ax-demo__error" role="alert">
            <p className="ax-demo__error-title">{error || "Something went wrong."}</p>
            {onRetry && (
              <button type="button" className="ax-demo__retry" onClick={onRetry}>
                Try again
              </button>
            )}
          </div>
        )}

        {/* Kept mounted across a re-run so bars and meters travel to their
            new values instead of re-entering from nothing. */}
        {showResult && (
          <div className="ax-demo__resultwrap">
            {json ? <JsonView value={raw} /> : children}
          </div>
        )}
      </div>

      {footer && showResult && <div className="ax-demo__foot">{footer}</div>}
    </div>
  );
}

/**
 * The response body, pretty-printed and coloured by token.
 *
 * Built as React nodes from a tokenising pass over `JSON.stringify` — the
 * document module's response carries whatever text a visitor pasted, so
 * nothing here goes near `dangerouslySetInnerHTML`.
 */
const TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

function JsonView({ value }) {
  const nodes = useMemo(() => {
    const text = JSON.stringify(value, null, 2) ?? "";
    const out = [];
    let last = 0;
    let n = 0;
    for (const m of text.matchAll(TOKEN)) {
      if (m.index > last) out.push(text.slice(last, m.index));
      const kind = m[1] ? (m[2] ? "key" : "str") : m[3] ? "lit" : "num";
      out.push(
        <span key={n++} className={`ax-json__${kind}`}>
          {m[1] ?? m[0]}
        </span>
      );
      if (m[2]) out.push(m[2]);
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  }, [value]);

  return (
    <pre className="ax-json" tabIndex={0} aria-label="Raw response">
      {nodes}
    </pre>
  );
}
