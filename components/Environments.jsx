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

/* Line glyphs for the estate diagram. Same 24-unit grid and 1.4 stroke as
   the WhyUs icons, so the two sets read as one family. */
const svg = (children) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

const GLYPH = {
  bank: svg(
    <>
      <path d="M3.5 9.2L12 4.5l8.5 4.7" />
      <path d="M5 9.5h14M6.8 10.5v6.5M10.3 10.5v6.5M13.7 10.5v6.5M17.2 10.5v6.5M4.5 19.5h15" />
    </>
  ),
  record: svg(
    <>
      <rect x="5.5" y="3.5" width="13" height="17" rx="1.6" />
      <path d="M12 9v6M9 12h6" />
    </>
  ),
  people: svg(
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.8 19c.6-3 2.7-4.8 5.2-4.8s4.6 1.8 5.2 4.8" />
      <path d="M15.5 5.8a2.8 2.8 0 010 5.4M17 14.4c1.8.5 3 2.1 3.4 4.6" />
    </>
  ),
  modules: svg(
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.3" />
      <rect x="13" y="4" width="7" height="7" rx="1.3" />
      <rect x="4" y="13" width="7" height="7" rx="1.3" />
      <rect x="13" y="13" width="7" height="7" rx="1.3" />
    </>
  ),
  parcel: svg(
    <>
      <path d="M12 3.5l7.5 4v9L12 20.5l-7.5-4v-9L12 3.5z" />
      <path d="M4.5 7.5l7.5 4 7.5-4M12 11.5v9" />
    </>
  ),
  headset: svg(
    <>
      <path d="M5 13v-1a7 7 0 0114 0v1" />
      <rect x="3.8" y="12.5" width="3.4" height="5" rx="1.2" />
      <rect x="16.8" y="12.5" width="3.4" height="5" rx="1.2" />
      <path d="M18.5 17.5v.5a2.5 2.5 0 01-2.5 2.5h-3" />
    </>
  ),
  data: svg(
    <>
      <ellipse cx="12" cy="6" rx="7" ry="2.6" />
      <path d="M5 6v12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6" />
      <path d="M5 12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6" />
    </>
  ),
  chip: svg(
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <rect x="10" y="10" width="4" height="4" rx="0.6" />
      <path d="M10 3.5V7M14 3.5V7M10 17v3.5M14 17v3.5M3.5 10H7M3.5 14H7M17 10h3.5M17 14h3.5" />
    </>
  ),
  person: svg(
    <>
      <circle cx="12" cy="8.5" r="3.3" />
      <path d="M5.5 19.5c.8-3.4 3.4-5.5 6.5-5.5s5.7 2.1 6.5 5.5" />
    </>
  ),
  badge: svg(
    <>
      <rect x="5" y="4" width="14" height="16.5" rx="2" />
      <circle cx="12" cy="10.5" r="2.3" />
      <path d="M8.6 16.8c.6-1.6 1.9-2.5 3.4-2.5s2.8.9 3.4 2.5" />
    </>
  ),
  controls: svg(
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </>
  ),
  chart: svg(<path d="M4 20h16M7 16.5v-5M11.5 16.5v-9M16 16.5V10" />),
  layers: svg(
    <>
      <path d="M12 4l8 4-8 4-8-4 8-4z" />
      <path d="M4 12l8 4 8-4M4 16l8 4 8-4" />
    </>
  ),
};

/* The estate the layer sits on. Eight systems, in the order a buyer
   recognises them: the systems of record first, then the channels, then
   the two that are not always reachable on our terms. The asterisk on
   IoT/OT is load-bearing — see `.ax-estate__foot`. */
const ESTATE = [
  { label: "Core banking", glyph: "bank" },
  { label: "EHR", glyph: "record" },
  { label: "CRM", glyph: "people" },
  { label: "ERP", glyph: "modules" },
  { label: "WMS / POS", glyph: "parcel" },
  { label: "Contact center", glyph: "headset" },
  { label: "Data / APIs", glyph: "data" },
  { label: "IoT / OT", glyph: "chip", note: true },
];

/* What the layer is made of. Same eight capabilities the cards in WhyUs
   argue in full sentences, named here as parts of one thing rather than
   as a list of features. Eight, so at full width they sit on the same
   columns as the eight systems above them. */
const LAYER = [
  "Reasoning",
  "RAG",
  "Voice",
  "Rules",
  "Workflow",
  "Tool use",
  "Human control",
  "Audit",
];

/* Who is on the other side of it. The section is otherwise entirely about
   systems, and a diagram of systems with no people in it quietly makes
   the case that this is an IT project. */
const AUDIENCES = [
  { label: "Customers", glyph: "person" },
  { label: "Employees", glyph: "badge" },
  { label: "Operations", glyph: "controls" },
  { label: "Management", glyph: "chart" },
];

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
              <Kicker id="environments" label="Low-disruption transformation" tone="invert" />
              <h2 className="ax-env__title">
                <MaskHeading text={"Don't replace your systems.\nPut intelligence across them."} />
              </h2>
              <Reveal variant="rise" className="ax-env__intro">
                <p>
                  Agentic AI can sit across the technology estate you already
                  own — reasoning, retrieval, voice, rules, workflow, tool use,
                  human control and audit, in one layer above the systems that
                  already hold your data.
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
                  {/* The OT/SCADA qualifier used to sit here, on the
                      plant-and-field tab. It now sits under the estate
                      diagram below, bound to the asterisk on IoT / OT —
                      which is where the deck puts it, and which stops a
                      reader on that one tab from being told the same thing
                      twice inside one screen. */}
                </div>

                <p className="ax-env__count" aria-hidden="true">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <i />
                  {String(environments.length).padStart(2, "0")}
                </p>
              </div>
            </div>

            {/* The estate, drawn.
                The four tabs above are rooms you can watch; this is the
                whole surface the layer sits on, and without it the
                section's own headline ("across them") points at four
                things rather than at an estate. Read top to bottom: the
                systems a client already owns, the layer between, and the
                four constituencies that feel the difference. It is drawn
                as one framed panel, numbered tier by tier, so it reads as
                a reference architecture rather than as three loose rows
                floating over the footage. */}
            <Reveal
              variant="stagger"
              selector=".ax-estate__tier, .ax-estate__foot"
              className="ax-estate"
            >
              <div className="ax-estate__tier">
                <div className="ax-estate__tier-head">
                  <span className="ax-estate__tier-no">01</span>
                  <p className="ax-estate__tier-name">Systems you already own</p>
                </div>
                <ul className="ax-estate__grid">
                  {ESTATE.map((s, i) => (
                    <li
                      className="ax-estate__cell"
                      key={s.label}
                      style={{ "--i": i }}
                    >
                      <span className="ax-estate__icon">{GLYPH[s.glyph]}</span>
                      <span className="ax-estate__cell-label">
                        {s.label}
                        {s.note ? <sup className="ax-estate__mark">*</sup> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ax-estate__tier">
                <div className="ax-estate__tier-head">
                  <span className="ax-estate__tier-no">02</span>
                  <p className="ax-estate__tier-name">One layer across them</p>
                </div>
                <div className="ax-estate__layer">
                  <div className="ax-estate__layer-head">
                    <span className="ax-estate__layer-mark">{GLYPH.layers}</span>
                    <p className="ax-estate__layer-name">
                      <span>AIBrigade</span>
                      Agentic intelligence + execution layer
                    </p>
                  </div>
                  <ul className="ax-estate__layer-parts">
                    {LAYER.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="ax-estate__tier">
                <div className="ax-estate__tier-head">
                  <span className="ax-estate__tier-no">03</span>
                  <p className="ax-estate__tier-name">Who it reaches</p>
                </div>
                <ul className="ax-estate__audience">
                  {AUDIENCES.map((a, i) => (
                    <li key={a.label} style={{ "--i": i }}>
                      <span className="ax-estate__icon">{GLYPH[a.glyph]}</span>
                      {a.label}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="ax-estate__foot">
                <sup className="ax-estate__mark">*</sup>
                Industrial/energy integration depends on the client&rsquo;s
                OT/SCADA architecture and permitted interfaces.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </Curtain>
  );
}
