"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * A small terminal panel that types out a loop of pipeline log lines —
 * the concrete counterpart to the hero's neural network. A diagram says
 * "this is AI infrastructure" in the abstract; a terminal that's visibly
 * *running something* says it in the way engineers actually recognize,
 * the same reason cerebrium.ai's own hero includes a real
 * `cerebrium run training_script.py` session rather than only 3D art.
 *
 * The lines describe the five stages this site already claims to run
 * (Discover → Design → Build → Deploy → Scale, see `components/data.js`
 * `features` and the reels' chapter markers in `deployments.data.js`) as
 * generic pipeline steps — illustrative of the process, not a transcript
 * of any specific client engagement, so it doesn't add to the fabricated-
 * specifics problem the README already flags elsewhere on this site.
 *
 * Types one character at a time while motion is welcome; under reduced
 * motion or before mount, renders the full log immediately so there's
 * never a load-bearing animation between a visitor and the content.
 *
 * `lines` / `title` override the default pipeline log — `Deployments.jsx`
 * uses this to show each reel's own chapter captions as its "not uploaded
 * yet" state, so a visitor sees that specific case's process running
 * instead of a raw placeholder message.
 */
const DEFAULT_LINES = [
  { prompt: true, text: "aibrigade run discover.pipeline --client=intake" },
  { text: "> mapping data sources, workflows, compliance constraints" },
  { text: "✓ discovery brief generated (14 touchpoints, 3 systems)" },
  { prompt: true, text: "aibrigade run design.architecture" },
  { text: "> evaluating model + framework fit against risk profile" },
  { text: "✓ architecture approved — 2 reviewers, 0 blockers" },
  { prompt: true, text: "aibrigade run build.agent --target=production" },
  { text: "> tests: 128 passed, 0 failed · coverage 94%" },
  { text: "✓ build artifact signed and versioned" },
  { prompt: true, text: "aibrigade deploy --env=production --canary=10%" },
  { text: "> health checks green · latency p95 312ms" },
  { text: "✓ promoted to 100% traffic" },
];

export default function TerminalFeed({ className, lines: linesProp, title = "agent — production" }) {
  const LOG_LINES = linesProp || DEFAULT_LINES;
  const [lines, setLines] = useState([]);
  const [cursorOn, setCursorOn] = useState(true);
  /* `prefersReducedMotion()` cannot be consulted during render. There is no
     `window` on the server, so it is always false there — which meant a
     reader with the OS setting on got a server paint of nothing and a first
     client paint of the whole log, i.e. a hydration mismatch, on the one
     code path that exists specifically to serve them. React responded by
     discarding and re-rendering the tree, which is the opposite of what
     reduced motion is asking for. The setting is read in an effect instead
     and mirrored into state, so server and first client paint agree and the
     static log lands one frame later. */
  const [still, setStill] = useState(false);
  const rootRef = useRef(null);
  const runningRef = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setStill(true);
      setLines(LOG_LINES.map((l) => l.text));
      return;
    }
    const root = rootRef.current;
    if (!root) return;

    // Don't start typing until the panel has actually scrolled into view —
    // this loops forever, and there's no reason to run it off-screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !runningRef.current) {
          runningRef.current = true;
          start();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(root);

    let cancelled = false;
    let timeouts = [];
    const after = (ms, fn) => {
      const id = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timeouts.push(id);
    };

    function typeLine(li, ci, buffer) {
      if (cancelled) return;
      const line = LOG_LINES[li];
      if (ci <= line.text.length) {
        const next = [...buffer];
        next[li] = line.text.slice(0, ci);
        setLines(next);
        after(line.prompt ? 34 : 14, () => typeLine(li, ci + 1, next));
      } else {
        after(line.prompt ? 260 : 420, () => {
          if (li + 1 < LOG_LINES.length) {
            typeLine(li + 1, 0, buffer);
          } else {
            // Hold the finished log, then clear and loop.
            after(2200, () => {
              setLines([]);
              after(500, () => typeLine(0, 0, []));
            });
          }
        });
      }
    }

    function start() {
      setLines([]);
      typeLine(0, 0, []);
    }

    const blink = setInterval(() => setCursorOn((v) => !v), 530);

    return () => {
      cancelled = true;
      io.disconnect();
      clearInterval(blink);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div ref={rootRef} className={`ax-terminal ${className || ""}`}>
      <div className="ax-terminal__bar">
        <span className="ax-terminal__dot" />
        <span className="ax-terminal__dot" />
        <span className="ax-terminal__dot" />
        <span className="ax-terminal__title">{title}</span>
      </div>
      <div className="ax-terminal__body" aria-hidden="true">
        {lines.map((text, i) => {
          const meta = LOG_LINES[i];
          const isLast = i === lines.length - 1;
          return (
            <div
              key={i}
              className={`ax-terminal__line${meta?.prompt ? " is-prompt" : ""}`}
            >
              {meta?.prompt && <span className="ax-terminal__prompt">$</span>}
              <span>{text}</span>
              {isLast && !still && (
                <span className={`ax-terminal__cursor${cursorOn ? " on" : ""}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
