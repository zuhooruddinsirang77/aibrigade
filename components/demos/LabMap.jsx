"use client";

import { useEffect, useRef, useState } from "react";
import StageStrip from "@/components/demos/StageStrip";
import { demos } from "@/components/demos/demos.data";
import { trackSpotlight } from "@/components/demos/labHooks";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * The hero's right-hand panel: the four modules, and where each one sits
 * in the capability stack.
 *
 * It answers the question the old four-card index could not — "are these
 * four unrelated toys?" — by drawing every module against the same five
 * stages. Pointing at a module lights its stages; with nothing pointed at,
 * the panel walks through the four on its own so a reader who never
 * touches it still sees the idea. The walk stops for good the first time
 * a reader takes over, and never starts under reduced motion.
 *
 * Every row is a link to its module further down the page, so the panel
 * doubles as the table of contents.
 */

const CYCLE_MS = 3200;

export default function LabMap() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(false);
  const rootRef = useRef(null);

  // Start the walk only once the panel is on screen and motion is welcome.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setAuto(entry.isIntersecting), {
      threshold: 0.35,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [touched, setTouched] = useState(false);
  const cycling = auto && !touched;

  useEffect(() => {
    if (!cycling) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % demos.length), CYCLE_MS);
    return () => clearTimeout(t);
  }, [cycling, active]);

  const take = (i) => {
    setTouched(true);
    setActive(i);
  };

  const current = demos[active];

  return (
    <div
      ref={rootRef}
      className="ax-labmap"
      data-cycling={cycling ? "true" : undefined}
      onPointerMove={trackSpotlight}
    >
      <div className="ax-labmap__chrome">
        <span className="ax-demo__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="ax-labmap__path">lab · modules</span>
        <span className="ax-labmap__live">
          <i aria-hidden="true" />
          {demos.length} online
        </span>
      </div>

      <div className="ax-labmap__stack">
        <p className="ax-labmap__label">
          Where <strong>{current.short}</strong> sits in the stack
        </p>
        <StageStrip stages={current.stages} tone="dark" />
      </div>

      <ol className="ax-labmap__list">
        {demos.map((d, i) => (
          <li key={d.id}>
            <a
              href={`#${d.id}`}
              data-on={i === active ? "true" : undefined}
              onPointerEnter={() => take(i)}
              onFocus={() => take(i)}
            >
              <span className="ax-labmap__n">{String(i + 1).padStart(2, "0")}</span>
              <span className="ax-labmap__body">
                <span className="ax-labmap__title">{d.title}</span>
                <span className="ax-labmap__engine">{d.engine}</span>
              </span>
              <svg className="ax-labmap__go" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 5v13M6 13l6 6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* The walk's timer, drawn. Keyed on the index so it restarts
                  with each step rather than continuing from the last row. */}
              {i === active && cycling && (
                <span key={`t-${active}`} className="ax-labmap__timer" aria-hidden="true" />
              )}
            </a>
          </li>
        ))}
      </ol>

      <p className="ax-labmap__foot">
        <span>Deterministic</span>
        <span>Explainable</span>
        <span>Nothing retained</span>
      </p>
    </div>
  );
}
