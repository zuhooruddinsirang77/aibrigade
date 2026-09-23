"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";
import AmbientVideo from "@/components/motion/AmbientVideo";
import Kicker from "@/components/motion/Kicker";

/**
 * "The difference" — one request, walked through the layer that does
 * something about it.
 *
 * Traditional AI answers and stops; a person still does the work. This
 * section is the other shape, drawn: the same request, slowed down, from
 * the moment it arrives to the record of what the system did about it. The
 * six stages are the page's spine — listen, understand, reason, act, with
 * `decide` split out of reasoning because the threshold is the client's to
 * set, and `audit` after acting because an agent that executes has to be
 * reconstructable.
 *
 * No milliseconds. This used to total 22ms, matching the fraud trace in the
 * hero's console (AgentConsole, via IntelligenceSystem) step for step —
 * which was right while both described the same synchronous score. It isn't
 * any more: these six stages now include placing a call and writing to a
 * system of record, and no millisecond total spans that honestly. The hero
 * console keeps its timings, because what it times really is sub-second.
 * Here the meter counts steps, which is true by construction, and each step
 * carries what governs it instead of how long it takes.
 *
 * Why scroll-driven rather than a looping autoplay: this is the part of
 * the page that has to answer "do these people actually know how to build
 * one of these." A reader who wants that answer will give it scroll; a
 * reader who doesn't will pass through and still see a diagram of a real
 * system. An autoplay loop would make the same claim at a speed nobody
 * chose.
 *
 * Mechanically it is CSS `position: sticky` plus an IntersectionObserver
 * on the six stage blocks — deliberately NOT a ScrollTrigger pin. WhyUs
 * already pins a horizontal scroller on this page, and a second pin is
 * where refresh cycles start fighting each other (the same reasoning is
 * written up in Deployments.jsx). Sticky needs no measurement and cannot
 * desynchronise from the scroll position.
 *
 * Degradation: with no JS, or under reduced motion, every stage renders
 * lit and the route renders fully drawn — it becomes a labelled diagram
 * with six paragraphs beside it, which is what it is underneath.
 */

/* Node centres in the SVG's own coordinate space. A serpentine rather
   than one straight row: six boxes in a line would have to be 90px wide
   to fit, and the whole point is that each one is readable. */
const VB = { w: 640, h: 268 };
const NODE = { w: 158, h: 58 };
const POS = [
  { x: 96, y: 58 },
  { x: 320, y: 58 },
  { x: 544, y: 58 },
  { x: 544, y: 210 },
  { x: 320, y: 210 },
  { x: 96, y: 210 },
];

const STAGES = [
  {
    key: "listen",
    node: "listen",
    title: "The request arrives",
    payload: "POST /intake · req_8f2a41",
    mode: "any channel",
    text: "A call, a message, a transaction, a scheduled event. One endpoint, called from the systems you already run — no migration, no second source of truth.",
  },
  {
    key: "understand",
    node: "understand",
    title: "It reads it against what you know",
    payload: "retrieve · policy_v14 + 3 docs",
    mode: "governed sources",
    text: "Intent and documents resolved against governed enterprise knowledge, so the answer is grounded in your approved sources rather than the model's general impression of your industry.",
  },
  {
    key: "reason",
    node: "reason",
    title: "Models, rules and context together",
    payload: "reason · ctx=account+policy",
    mode: "models + rules",
    text: "The model proposes; your business context constrains. Neither one decides alone, which is what makes the outcome defensible later.",
  },
  {
    key: "decide",
    node: "decide",
    title: "Your policy sets the threshold",
    payload: "policy · auto | review | hold",
    mode: "your policy",
    text: "Risk, confidence and approval limits live in a policy your team owns and can change without a deployment. Where the line sits is a business decision, not a modelling one.",
  },
  {
    key: "act",
    node: "act",
    title: "It executes, or it escalates",
    payload: "execute · 2 calls · 1 escalation",
    mode: "human gate",
    text: "Inside the supported workflow, the agent does the work — updates the record, sends the message, moves the case. Outside it, a person gets the decision with the context already assembled.",
  },
  {
    key: "audit",
    node: "audit",
    title: "Everything is written down",
    payload: "audit · immutable · 6 entries",
    mode: "immutable",
    text: "Inputs, knowledge versions, model version, policy version, what was done and who approved it. Every action this system has ever taken can be reconstructed exactly as it was taken.",
  },
];

const TOTAL_STEPS = STAGES.length;
const LAST = TOTAL_STEPS - 1;

/* What each stage is doing to the request right now, in the words a run
   log would use. Shared by the node, the trace and the tooltip so the
   three never disagree. */
const STATUS = { past: "done", now: "running", next: "queued" };

const stateOf = (i, active) =>
  i < active ? "past" : i === active ? "now" : "next";

/* The two shapes at the top of the section. Same four columns in both, so
   the last link of each — the one where the work actually happens — lines
   up with its counterpart. `link` is how the route leaves a step: solid
   while the system carries the request, dashed once a person has to. */
const TRADITIONAL = [
  { step: "Ask", hint: "Describes the need or question.", icon: "ask", link: "solid", arrow: true },
  { step: "AI answers", hint: "Provides a response or insight.", icon: "brain", link: "dashed" },
  { step: "Value gap", hint: "Context, judgement and execution are missing.", icon: "gap", gap: true, link: "dashed", arrow: true },
  { step: "Human does the work", hint: "Reviews, decides and takes action.", icon: "person" },
];
const AGENTIC = [
  { step: "Request / event", hint: "A goal, a change or an external trigger.", icon: "event" },
  { step: "Understands", hint: "Reads context, gathers information and builds a plan.", icon: "brain" },
  { step: "Reasons", hint: "Weighs the options against your rules and policy.", icon: "reason" },
  { step: "Acts", hint: "Executes across systems, tools and teams — end to end.", icon: "done", end: true },
];

/* Line icons in the same drawn style as the rest of the site (see
   WHYUS_ICONS) — 24px grid, round caps, stroke only. */
const CONTRAST_ICONS = {
  ask: (
    <>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </>
  ),
  brain: (
    <>
      <path d="M12 5a3 3 0 1 0-6 .1 4 4 0 0 0-2.5 5.8 4 4 0 0 0 .6 6.6A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 6 .1 4 4 0 0 1 2.5 5.8 4 4 0 0 1-.6 6.6A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M17.6 6.5a3 3 0 0 0 .4-1.4M6 5.1a3 3 0 0 0 .4 1.4" />
    </>
  ),
  gap: <path d="M17 7 7 17M7 7l10 10" />,
  person: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  event: (
    <path d="M4 14a1 1 0 0 1-.8-1.6l9.9-10.2a.5.5 0 0 1 .9.5l-1.9 6A1 1 0 0 0 13 10h7a1 1 0 0 1 .8 1.6l-9.9 10.2a.5.5 0 0 1-.9-.5l1.9-6A1 1 0 0 0 11 14z" />
  ),
  reason: (
    <>
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="18.5" r="2.5" />
      <circle cx="19" cy="18.5" r="2.5" />
      <path d="M10.8 7.2 6.2 16.3M13.2 7.2l4.6 9.1M7.5 18.5h9" />
    </>
  ),
  done: <path d="M20 6 9 17l-5-5" />,
};

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

/* One mark per stage in the trace, drawn in the same hand as the contrast
   marks so the two diagrams in this section read as one set. */
const STAGE_ICONS = {
  listen: (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4" />
      <path d="M4.9 19.1a10 10 0 0 1 0-14.2M19.1 4.9a10 10 0 0 1 0 14.2" />
    </>
  ),
  understand: (
    <>
      <path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2.5V8h5.5" />
      <circle cx="11.5" cy="14" r="2.5" />
      <path d="m13.3 15.8 1.7 1.7" />
    </>
  ),
  reason: CONTRAST_ICONS.reason,
  decide: (
    <>
      <path d="M16 3h5v5M8 3H3v5" />
      <path d="M12 22v-8.3a4 4 0 0 0-1.2-2.9L3 3M15 9l6-6" />
    </>
  ),
  act: CONTRAST_ICONS.event,
  audit: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
};

const CHEVRON = {
  prev: <path d="M15 18 9 12l6-6" />,
  next: <path d="m9 18 6-6-6-6" />,
};

/* The agentic route: one continuous wave through all four nodes, crossing
   the centre line at each. Stretched to the row's width with
   `preserveAspectRatio="none"`, so the stroke is kept from scaling with it.

   The pulse running along it is a bright band in a gradient that slides
   across the path's box, not a dash: dash lengths on a stretched,
   non-scaling stroke don't come out in any unit you can reason about. */
function ContrastWave() {
  const d =
    "M0 20 C33 6 67 34 100 20 C133 6 167 34 200 20 C233 6 267 34 300 20";
  return (
    <svg
      className="ax-path__contrast-wave"
      viewBox="0 0 300 40"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ax-contrast-wave" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f87756" />
          <stop offset="55%" stopColor="#9f48e4" />
          <stop offset="100%" stopColor="#c79bf5" />
        </linearGradient>
        <linearGradient id="ax-contrast-pulse" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.42" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.58" stopColor="#fff" stopOpacity="0" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            from="-0.6 0"
            to="0.6 0"
            dur="3.2s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>
      <path className="ax-path__contrast-wave-line" d={d} vectorEffect="non-scaling-stroke" />
      <path className="ax-path__contrast-wave-pulse" d={d} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function ContrastChain({ links, wave = false }) {
  return (
    <div className="ax-path__contrast-track">
      {wave && <ContrastWave />}
      <ol className="ax-path__contrast-chain">
        {links.map((l, i) => (
          <li
            key={l.step}
            className={l.gap ? "ax-path__contrast-gap" : undefined}
            data-end={l.end || undefined}
            aria-hidden={l.gap || undefined}
          >
            {i < links.length - 1 && (
              <span
                className="ax-path__contrast-link"
                data-style={l.link || "wave"}
                aria-hidden="true"
              >
                <i />
                {l.arrow && (
                  <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 1.5 7.5 5 3 8.5" />
                  </svg>
                )}
              </span>
            )}
            <span className="ax-path__contrast-mark" aria-hidden="true">
              <svg {...ICON_PROPS}>{CONTRAST_ICONS[l.icon]}</svg>
            </span>
            <span className="ax-path__contrast-step">{l.step}</span>
            <span className="ax-path__contrast-hint">{l.hint}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* The route the request travels, as one continuous path through the six
   node centres. Built from POS so the geometry has exactly one source. */
function buildPath() {
  const r = 26; // corner radius on the turn between the two rows
  const [a, b, c, d, e, f] = POS;
  return [
    `M ${a.x} ${a.y}`,
    `L ${b.x} ${b.y}`,
    `L ${c.x - 0} ${c.y}`,
    // down the right edge and around into the second row
    `L ${c.x} ${d.y - r}`,
    `Q ${c.x} ${d.y} ${c.x - r} ${d.y}`,
    `L ${e.x} ${e.y}`,
    `L ${f.x} ${f.y}`,
  ].join(" ");
}

/* The card that opens on a node under the pointer (or under keyboard
   focus on its meter segment). It opens into the channel between the two
   rows, below the top row and above the bottom one, so it never covers
   another stage. The outer columns anchor to their own edge rather than
   centring, which would push the card out of the panel. */
function NodeTip({ i, state }) {
  const s = STAGES[i];
  const p = POS[i];
  const below = p.y < VB.h / 2;
  const align = p.x < VB.w / 3 ? "start" : p.x > (VB.w * 2) / 3 ? "end" : "mid";
  const x =
    align === "start" ? p.x - NODE.w / 2 : align === "end" ? p.x + NODE.w / 2 : p.x;
  const y = below ? p.y + NODE.h / 2 : p.y - NODE.h / 2;
  return (
    <div
      className="ax-path__tip"
      data-align={align}
      data-below={below || undefined}
      style={{ left: `${(x / VB.w) * 100}%`, top: `${(y / VB.h) * 100}%` }}
      aria-hidden="true"
    >
      <span className="ax-path__tip-head">
        <b>{String(i + 1).padStart(2, "0")}</b>
        {s.node}
        <em data-state={state}>{STATUS[state]}</em>
      </span>
      <span className="ax-path__tip-title">{s.title}</span>
      <span className="ax-path__tip-foot">
        <code>{s.mode}</code>
        <i>{state === "now" ? "in progress" : "click to jump"}</i>
      </span>
    </div>
  );
}

export default function DecisionPath() {
  const [active, setActive] = useState(0);
  const [settled, setSettled] = useState(false);
  const [peek, setPeek] = useState(null);
  const sectionRef = useRef(null);
  const stageRefs = useRef([]);
  const pathRef = useRef(null);
  const dotRef = useRef(null);
  const drawRef = useRef(null);
  const maskRef = useRef(null);
  const trailRefs = useRef([]);

  const d = useMemo(buildPath, []);

  /* Every control in the panel moves the page, never the diagram. Scroll
     position stays the single source of truth for which stage is lit, so
     clicking "reason" walks the request there through the same observer a
     reader's own scrolling drives, and the text beside it is always the
     text for the lit node. The step lands at 44% of the viewport: inside
     the observer's middle band, with the step before it clear of it. */
  const goTo = useCallback((i) => {
    const el = stageRefs.current[Math.max(0, Math.min(LAST, i))];
    if (!el) return;
    const y = window.scrollY + el.getBoundingClientRect().top - window.innerHeight * 0.44;
    window.scrollTo({
      top: Math.max(0, y),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, []);

  /* Hover previews are for a mouse; a tap is a click and should just go.
     Keyboard focus only opens the card when it is visibly focused, so a
     mouse click on a segment doesn't leave a card stuck open. */
  const peekOn = (i) => (e) => {
    if (e.pointerType === "mouse") setPeek(i);
  };
  const peekFocus = (i) => (e) => {
    if (e.currentTarget.matches(":focus-visible")) setPeek(i);
  };
  const peekOff = () => setPeek(null);

  /* The panel's idle motion (the flow along the route, the ring on the
     live node, the spinner) is CSS and infinite. Pause all of it while the
     section is off screen. This writes an attribute rather than setting
     state, so scrolling past doesn't re-render the diagram. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      el.toggleAttribute("data-live", e.isIntersecting);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Which stage is being read. A middle-of-viewport band, not a top
     edge: the diagram is pinned to the centre of the screen by `sticky`,
     so the stage that should be lit is the one level with it. */
  useEffect(() => {
    if (prefersReducedMotion()) {
      setActive(STAGES.length - 1);
      setSettled(true);
      return;
    }
    const nodes = stageRefs.current.filter(Boolean);
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!hit) return;
        const i = nodes.indexOf(hit.target);
        if (i >= 0) setActive(i);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.5, 1] }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  /* Move the packet along the route. `getPointAtLength` walks the real
     path geometry, so the dot follows the corner radius instead of
     cutting across it, and the lit route behind it is the same path drawn
     to the same length — one source of truth for both. The flow mask is
     drawn to that length too, so the moving light only ever runs along
     the part of the route the request has already travelled.

     The packet travels *under* the nodes. It used to sit on top, resting
     on the node's centre, where it covered the middle of the longer
     labels ("understand"). Now it shows only between stages, where it is
     moving, and the node it lands in lights up to say it arrived. */
  useEffect(() => {
    const path = pathRef.current;
    const dot = dotRef.current;
    const draw = drawRef.current;
    const mask = maskRef.current;
    if (!path || !dot || !draw) return;

    const len = path.getTotalLength();
    const trail = trailRefs.current.filter(Boolean);
    draw.style.strokeDasharray = `${len}`;
    if (mask) mask.style.strokeDasharray = `${len}`;

    /* `v` is how far the packet moved since the last frame. The trail is
       strung out behind it in proportion (capped, so a fast scroll across
       three stages doesn't draw a streak across the panel) and collapses
       into the packet when it stops. */
    const place = (p, v = 0) => {
      const at = len * p;
      const pt = path.getPointAtLength(at);
      dot.setAttribute("cx", pt.x);
      dot.setAttribute("cy", pt.y);
      dot.dataset.p = String(p);
      const gap = Math.max(-9, Math.min(9, v * 1.1));
      trail.forEach((c, k) => {
        const q = path.getPointAtLength(Math.max(0, Math.min(len, at - gap * (k + 1))));
        c.setAttribute("cx", q.x);
        c.setAttribute("cy", q.y);
      });
      const off = `${len * (1 - p)}`;
      draw.style.strokeDashoffset = off;
      if (mask) mask.style.strokeDashoffset = off;
    };

    const target = LAST > 0 ? active / LAST : 1;

    if (prefersReducedMotion() || settled) {
      place(target);
      return;
    }

    let raf;
    const from = Number(dot.dataset.p || 0);
    const start = performance.now();
    const dur = 620;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    let last = len * from;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const p = from + (target - from) * ease(t);
      place(p, len * p - last);
      last = len * p;
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, settled]);

  const reached = active + 1;
  const done = active === LAST;

  return (
    <section id="inside" className="ax-path ax-band" ref={sectionRef}>
      {/* The section draws a request crossing a chip. The chip is the one
          piece it could not draw, so it plays underneath instead. */}
      <AmbientVideo film="awaken" className="ax-path__film" />
      <div className="padding-global">
        <div className="container-large">
          <div className="ax-path__head">
            <Kicker id="inside" label="The difference" tone="invert" />
            <h2 className="ax-path__title">
              Most AI stops
              <br />
              <span>at the answer</span>
            </h2>
            <p className="ax-path__lede">
              The real value isn't in getting an answer — it's in getting the
              thing done. Agentic AI goes past the response and turns intent
              into action.
            </p>
          </div>

          {/* The two shapes, before the second one is drawn in full below.
              The trace further down this section is one long argument;
              this is the half-second version of it.

              Two tracks on one shared four-column axis rather than two
              panels side by side. Side by side, three boxes against four
              could only be compared by counting; stacked on the same axis,
              the difference is visible at a glance — the agentic route
              runs unbroken to "Acts", while the traditional one breaks
              after the answer and resumes, dashed, at a person. The empty
              column is the value gap the lede names, so it is drawn as
              one. It is a list item only so the grid places it; it is
              hidden from assistive tech, which reads the chain as the
              three steps it is. */}
          <div className="ax-path__contrast">
            <div className="ax-path__contrast-row" data-kind="old">
              <div className="ax-path__contrast-label">
                <p className="ax-path__contrast-kind">Traditional AI</p>
                <h3 className="ax-path__contrast-title">A person finishes it</h3>
                <p className="ax-path__contrast-note">
                  AI provides an answer, but the real work is still human.
                </p>
              </div>
              <ContrastChain links={TRADITIONAL} />
            </div>
            <div className="ax-path__contrast-row" data-kind="new">
              <div className="ax-path__contrast-label">
                <p className="ax-path__contrast-kind">Agentic AI</p>
                <h3 className="ax-path__contrast-title">
                  The <span>system finishes</span> it
                </h3>
                <p className="ax-path__contrast-note">
                  It understands, reasons and acts — turning intent into real
                  outcomes, automatically.
                </p>
              </div>
              <ContrastChain links={AGENTIC} wave />
            </div>
          </div>

          <div className="ax-path__verdict">
            <p className="ax-path__verdict-line">
              We build <span>the second kind.</span>
            </p>
            <p className="ax-path__verdict-sub">
              AI becomes an execution layer — not another screen employees have
              to manage.
            </p>
          </div>

          <div className="ax-path__body">
            {/* ---------------- the diagram ---------------- */}
            <div className="ax-path__stage">
              <div className="ax-path__panel">
                <div className="ax-path__panel-bar">
                  <span className="ax-path__panel-path">
                    aibrigade · decision-path
                  </span>
                  <span className="ax-path__panel-live" data-done={done || undefined}>
                    <i />
                    {done ? "complete" : "live"}
                    <b>txn_8f2a41</b>
                  </span>
                </div>

                <div className="ax-path__canvas">
                  <div className="ax-path__plot">
                    <svg
                      className="ax-path__svg"
                      viewBox={`0 0 ${VB.w} ${VB.h}`}
                      role="img"
                      aria-label="Architecture diagram: listen, understand, reason, decide, act, audit."
                    >
                      <defs>
                        {/* The lit part of the route runs the same coral →
                            violet the scroll-progress bar and the console
                            meter already use, so "how far through" reads the
                            same way everywhere on the site. */}
                        <linearGradient id="ax-path-grad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#f87756" />
                          <stop offset="100%" stopColor="#9f48e4" />
                        </linearGradient>
                        <radialGradient id="ax-path-spot">
                          <stop offset="0%" stopColor="#9248e4" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#9248e4" stopOpacity="0" />
                        </radialGradient>
                        <mask
                          id="ax-path-reveal"
                          maskUnits="userSpaceOnUse"
                          x="-10"
                          y="-10"
                          width={VB.w + 20}
                          height={VB.h + 20}
                        >
                          <path className="ax-path__route-mask" d={d} ref={maskRef} />
                        </mask>
                      </defs>

                      {/* a soft light that follows the live stage */}
                      <g
                        className="ax-path__spot"
                        style={{ transform: `translate(${POS[active].x}px, ${POS[active].y}px)` }}
                      >
                        <circle r="115" fill="url(#ax-path-spot)" />
                      </g>

                      {/* the route: unlit, lit, then light flowing along
                          the lit part */}
                      <path className="ax-path__route" d={d} ref={pathRef} />
                      <path className="ax-path__route-lit" d={d} ref={drawRef} />
                      <path
                        className="ax-path__route-flow"
                        d={d}
                        mask="url(#ax-path-reveal)"
                      />

                      {/* the request itself, and its wake */}
                      {[0, 1, 2].map((k) => (
                        <circle
                          key={k}
                          className="ax-path__trail"
                          ref={(el) => (trailRefs.current[k] = el)}
                          r={4.5 - k * 1.2}
                          cx={POS[0].x}
                          cy={POS[0].y}
                          style={{ opacity: 0.55 - k * 0.16 }}
                        />
                      ))}
                      <circle
                        className="ax-path__dot"
                        ref={dotRef}
                        r="5.5"
                        cx={POS[0].x}
                        cy={POS[0].y}
                      />

                      {/* Nodes are pointer shortcuts only. The same jump
                          is on the keyboard through the meter below, so
                          the diagram doesn't add six more tab stops ahead
                          of the text it illustrates. */}
                      {STAGES.map((s, i) => {
                        const p = POS[i];
                        const state = stateOf(i, active);
                        return (
                          <g
                            key={s.key}
                            className="ax-path__node"
                            data-state={state}
                            data-peek={peek === i || undefined}
                            transform={`translate(${p.x - NODE.w / 2} ${p.y - NODE.h / 2})`}
                            onClick={() => goTo(i)}
                            onPointerEnter={peekOn(i)}
                            onPointerLeave={peekOff}
                          >
                            <g className="ax-path__node-body">
                              <rect
                                className="ax-path__node-ring"
                                width={NODE.w}
                                height={NODE.h}
                                rx="12"
                              />
                              <rect
                                className="ax-path__node-box"
                                width={NODE.w}
                                height={NODE.h}
                                rx="12"
                              />
                              <text className="ax-path__node-meta" x="14" y="22">
                                <tspan className="ax-path__node-index">
                                  {String(i + 1).padStart(2, "0")}
                                </tspan>
                                <tspan className="ax-path__node-status" dx="6">
                                  {STATUS[state]}
                                </tspan>
                              </text>
                              <text className="ax-path__node-label" x="14" y="43">
                                {s.node}
                              </text>
                              <rect
                                className="ax-path__node-tile"
                                x={NODE.w - 44}
                                y="14"
                                width="30"
                                height="30"
                                rx="9"
                              />
                              <svg
                                className="ax-path__node-icon"
                                x={NODE.w - 39}
                                y="19"
                                width="20"
                                height="20"
                                {...ICON_PROPS}
                              >
                                {STAGE_ICONS[s.key]}
                              </svg>
                            </g>
                          </g>
                        );
                      })}
                    </svg>

                    {peek != null && (
                      <NodeTip key={peek} i={peek} state={stateOf(peek, active)} />
                    )}
                  </div>
                </div>

                {/* What the request has been through so far, as a run log.
                    It repeats the step list beside it, so it is hidden from
                    assistive tech. The window shows the last three lines
                    (one on a phone) and the current one types itself in. */}
                <div className="ax-path__trace" aria-hidden="true">
                  <div className="ax-path__trace-view">
                    <ol className="ax-path__trace-list" style={{ "--i": active }}>
                      {STAGES.map((s, i) => {
                        const state = stateOf(i, active);
                        return (
                          <li key={s.key} data-state={state}>
                            <span className="ax-path__trace-mark" />
                            <span className="ax-path__trace-node">{s.node}</span>
                            <span
                              className="ax-path__trace-payload"
                              style={{ "--n": s.payload.length }}
                            >
                              {s.payload}
                            </span>
                            <span className="ax-path__trace-status">{STATUS[state]}</span>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </div>

                <div className="ax-path__readout">
                  <span className="ax-path__nav">
                    {["prev", "next"].map((dir) => (
                      <button
                        key={dir}
                        type="button"
                        className="ax-path__nav-btn"
                        aria-label={dir === "prev" ? "Previous step" : "Next step"}
                        disabled={dir === "prev" ? active === 0 : done}
                        onClick={() => goTo(active + (dir === "prev" ? -1 : 1))}
                      >
                        <svg {...ICON_PROPS} strokeWidth="2">
                          {CHEVRON[dir]}
                        </svg>
                      </button>
                    ))}
                  </span>
                  <span className="ax-path__meter" role="group" aria-label="Jump to a step">
                    {STAGES.map((s, i) => (
                      <button
                        key={s.key}
                        type="button"
                        className="ax-path__seg"
                        data-state={stateOf(i, active)}
                        style={{ "--k": i }}
                        aria-label={`Step ${i + 1}: ${s.title}`}
                        aria-current={i === active ? "step" : undefined}
                        onClick={() => goTo(i)}
                        onPointerEnter={peekOn(i)}
                        onPointerLeave={peekOff}
                        onFocus={peekFocus(i)}
                        onBlur={peekOff}
                      >
                        <span />
                      </button>
                    ))}
                  </span>
                  <span className="ax-path__readout-ms">
                    {reached}
                    <i>/{TOTAL_STEPS} steps</i>
                  </span>
                </div>
              </div>
            </div>

            {/* ---------------- the six beats ---------------- */}
            <ol className="ax-path__steps">
              {STAGES.map((s, i) => (
                <li
                  key={s.key}
                  className="ax-path__step"
                  data-state={stateOf(i, active)}
                  ref={(el) => (stageRefs.current[i] = el)}
                >
                  <span className="ax-path__step-index" aria-hidden="true">
                    <b>{String(i + 1).padStart(2, "0")}</b>
                    <svg {...ICON_PROPS} strokeWidth="2.4">
                      {CONTRAST_ICONS.done}
                    </svg>
                  </span>
                  <h3 className="ax-path__step-title">{s.title}</h3>
                  <p className="ax-path__step-text">{s.text}</p>
                  <span className="ax-path__step-meta">
                    <code>{s.node}</code>
                    <em>{s.mode}</em>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
