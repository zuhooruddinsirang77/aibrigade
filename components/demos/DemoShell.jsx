"use client";

/**
 * The console chrome every demo runs inside.
 *
 * It owns the four states a demo can be in so they cannot drift apart
 * between one demo and the next: `idle` prints the empty state, `running`
 * prints the working state, `error` prints the failure with a retry, and
 * `done` hands the panel over to the demo's own result renderer.
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
  children,
  footer,
}) {
  const live = status === "running";

  return (
    <div className="ax-demo__panel" data-status={status}>
      <div className="ax-demo__chrome">
        <span className="ax-demo__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="ax-demo__path">{path}</span>
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
        aria-busy={live || undefined}
        aria-live="polite"
        aria-atomic="false"
      >
        {status === "idle" && (
          <div className="ax-demo__empty">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M5 12h14M12 5v14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <p className="ax-demo__empty-title">{emptyTitle}</p>
            {emptyHint && <p className="ax-demo__empty-hint">{emptyHint}</p>}
          </div>
        )}

        {status === "running" && (
          <div className="ax-demo__working">
            <span className="ax-demo__bar" aria-hidden="true">
              <i />
            </span>
            <p>{runningLabel}…</p>
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

        {status === "done" && children}
      </div>

      {footer && status === "done" && <div className="ax-demo__foot">{footer}</div>}
    </div>
  );
}
