"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { environments } from "@/components/video.data";
import AmbientVideo from "@/components/motion/AmbientVideo";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";
import Reveal from "@/components/motion/Reveal";
import MaskHeading from "@/components/motion/MaskHeading";
import Kicker from "@/components/motion/Kicker";
import Curtain from "@/components/motion/Curtain";

/** How long an environment holds before the section moves itself on. */
const DWELL = 7000;
const TICK = 50;

/**
 * "Where it runs" — the four operating environments, one at a time.
 *
 * The problem this solves is that the rest of the page describes systems in
 * the abstract ("automation agents", "decision intelligence") and never
 * shows the room any of it ends up in. Four rooms, and the reader picks.
 *
 * It advances on its own so the section is doing something when you reach
 * it, and stops advancing the moment you touch it — an auto-rotator that
 * keeps moving while you are reading the panel you chose is the reason
 * carousels have the reputation they do. Hover, focus, or a click all count
 * as "the reader has taken over"; it does not resume afterwards, because
 * resuming would yank the panel away from someone who had simply stopped
 * moving their mouse.
 *
 * Clips are mounted as they are first shown rather than all four up front.
 * The four films are ~14MB together and most readers will look at one or
 * two, so the rest are never fetched; once a clip has been shown it stays
 * mounted, so returning to it is instant rather than a second download.
 */
export default function Environments() {
  const [index, setIndex] = useState(0);
  const [taken, setTaken] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [seen, setSeen] = useState(() => new Set([environments[0].film]));

  const sectionRef = useRef(null);
  const inView = useRef(false);

  const active = environments[index];

  const select = useCallback((i, byReader = true) => {
    setIndex(i);
    setElapsed(0);
    if (byReader) setTaken(true);
    setSeen((prev) => {
      const film = environments[i].film;
      if (prev.has(film)) return prev;
      const next = new Set(prev);
      next.add(film);
      return next;
    });
  }, []);

  /* ---- auto-advance -------------------------------------------------- */

  // Only while the section is actually on screen: a timer that rotated
  // through four environments nobody is looking at would have the reader
  // arrive mid-sequence, on a panel chosen at random.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (taken || prefersReducedMotion()) return;

    const id = setInterval(() => {
      if (!inView.current || document.hidden) return;
      setElapsed((e) => {
        if (e + TICK < DWELL) return e + TICK;
        select((index + 1) % environments.length, false);
        return 0;
      });
    }, TICK);

    return () => clearInterval(id);
  }, [taken, index, select]);

  /* ---- keyboard ------------------------------------------------------ */

  // Roving tabindex, same contract as the Deployments index: the arrows
  // move focus as well as selection, or the reader is left focused on a
  // button that is no longer in the tab order.
  const move = (next) => {
    select(next);
    requestAnimationFrame(() => {
      document.getElementById(`env-tab-${environments[next].id}`)?.focus();
    });
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      move((index + 1) % environments.length);
    }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      move((index - 1 + environments.length) % environments.length);
    }
  };

  const pct = taken ? 100 : (elapsed / DWELL) * 100;

  return (
    /* The band arrives inset from the page edges and opens to full
       bleed as it settles — the page's one shared device for "a dark
       scene begins", used identically by Deployments and the closing
       CTA. See Curtain. */
    <Curtain
      as="section"
      id="environments"
      hostRef={sectionRef}
      className="ax-env mt-6"
      onPointerEnter={() => setTaken(true)}
      onFocusCapture={() => setTaken(true)}
    >
      {/* ---------------- stage ---------------- */}
      <div className="ax-env__stage" aria-hidden="true">
        {environments.map((env) =>
          seen.has(env.film) ? (
            <AmbientVideo
              key={env.film}
              film={env.film}
              play={env.id === active.id}
              className="ax-env__film"
              data-on={env.id === active.id}
              /* Already inside a section the reader has reached, so there is
                 nothing to gain by arming a screen early — it would only
                 widen the window in which two clips download at once. */
              rootMargin="0px"
            />
          ) : null
        )}
      </div>

      <div className="padding-global">
        <div className="container-large">
          <div className="ax-env__inner">
            <div className="ax-env__head">
              <Kicker id="environments" label="Where it runs" tone="invert" />
              <h2 className="ax-env__title">
                <MaskHeading text={"A system is only\nreal on the floor"} />
              </h2>
              <Reveal variant="rise" className="ax-env__intro">
                <p>
                  Every engagement ends somewhere specific — a ward, a back
                  office, a line, a network. These are the four rooms we build
                  systems to survive.
                </p>
              </Reveal>
            </div>

            <div className="ax-env__body">
              {/* ---------------- index ---------------- */}
              <div
                className="ax-env__list"
                role="tablist"
                aria-label="Operating environments"
                onKeyDown={onKeyDown}
              >
                {environments.map((env, i) => (
                  <button
                    key={env.id}
                    type="button"
                    role="tab"
                    id={`env-tab-${env.id}`}
                    aria-selected={i === index}
                    aria-controls="env-panel"
                    tabIndex={i === index ? 0 : -1}
                    className="ax-env__tab"
                    onClick={() => select(i)}
                  >
                    <span className="ax-env__tab-rail" aria-hidden="true">
                      <span
                        className="ax-env__tab-fill"
                        style={{ height: i === index ? `${pct}%` : "0%" }}
                      />
                    </span>
                    <span className="ax-env__tab-body">
                      <span className="ax-env__tab-kicker">{env.kicker}</span>
                      <span className="ax-env__tab-label">{env.label}</span>
                    </span>
                  </button>
                ))}
              </div>

              {/* ---------------- panel ---------------- */}
              <div
                className="ax-env__panel"
                id="env-panel"
                role="tabpanel"
                aria-labelledby={`env-tab-${active.id}`}
              >
                {/* Keyed so the copy re-enters on every change rather than
                    swapping text under a static frame — the switch should
                    read as a cut, not a find-and-replace. */}
                <div className="ax-env__copy" key={active.id}>
                  <p className="ax-env__line">{active.line}</p>
                  <ul className="ax-env__tags">
                    {active.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>

                <p className="ax-env__count" aria-hidden="true">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <i />
                  {String(environments.length).padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Curtain>
  );
}
