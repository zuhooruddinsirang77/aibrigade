"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The run lifecycle every demo on /demos shares.
 *
 * One hook rather than four copies of the same fetch: each demo component
 * supplies its own input shape and renders its own result, and everything
 * between those two things — the state machine, the abort handling, the
 * error wording, the "is this button allowed to be pressed" question — is
 * identical and lives here.
 *
 * States: `idle` (nothing run yet — the empty state), `running`, `done`,
 * `error`. The components key their whole panel off this one value, which
 * is what keeps the five UI states from drifting apart between demos.
 *
 * On the deliberate floor under `running`: the engines answer in about a
 * millisecond, so without it the processing state would be a single
 * dropped frame — a panel that flickers and then has an answer, which
 * reads as broken rather than fast. The floor holds the state long enough
 * to be legible. It is presentation, and the page is straight about that:
 * the real server time is reported separately, from the engine, and is the
 * number shown in the trace.
 *
 * On `ranInput`: while a new run is in flight the panel keeps showing the
 * last result, dimmed, instead of blanking to a spinner — a slider drag
 * that empties the panel on every step reads as a flicker. That only works
 * if the stale result is drawn against the input that produced it, not
 * whatever is in the controls now; the document demo's highlights are
 * character offsets and would land on the wrong text otherwise.
 */

const FLOOR_MS = 420;

export default function useDemoRun(demo) {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [ranInput, setRanInput] = useState(null);
  const [error, setError] = useState("");

  // The in-flight request, so a second run supersedes the first instead of
  // racing it — dragging a slider fires these faster than they land.
  const abortRef = useRef(null);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const run = useCallback(
    async (input) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus("running");
      setError("");

      const started = Date.now();

      try {
        const res = await fetch("/api/demos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ demo, input }),
          signal: controller.signal,
        });

        const data = await res.json().catch(() => ({}));

        const elapsed = Date.now() - started;
        if (elapsed < FLOOR_MS) {
          await new Promise((r) => setTimeout(r, FLOOR_MS - elapsed));
        }

        // Superseded by a newer run, or the component has gone away.
        if (controller.signal.aborted || !aliveRef.current) return;

        if (!res.ok || !data.ok) {
          setError(data.error || "The demo could not complete that run.");
          setStatus("error");
          return;
        }

        setResult(data.result);
        setRanInput(input);
        setStatus("done");
      } catch (err) {
        if (err?.name === "AbortError" || !aliveRef.current) return;
        setError("Could not reach the demo service. Check your connection and try again.");
        setStatus("error");
      }
    },
    [demo]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
    setResult(null);
    setRanInput(null);
    setError("");
  }, []);

  return { status, result, ranInput, error, run, reset, isRunning: status === "running" };
}
