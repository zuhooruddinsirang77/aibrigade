"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";
import AmbientVideo from "@/components/motion/AmbientVideo";

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

export default function DecisionPath() {
  const [active, setActive] = useState(0);
  const [settled, setSettled] = useState(false);
  const stageRefs = useRef([]);
  const pathRef = useRef(null);
  const dotRef = useRef(null);
  const drawRef = useRef(null);

  const d = useMemo(buildPath, []);

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
     cutting across it, and the trail behind it is the same path drawn to
     the same length — one source of truth for both. */
  useEffect(() => {
    const path = pathRef.current;
    const dot = dotRef.current;
    const draw = drawRef.current;
    if (!path || !dot || !draw) return;

    const len = path.getTotalLength();
    draw.style.strokeDasharray = `${len}`;

    const target = STAGES.length > 1 ? active / (STAGES.length - 1) : 1;

    if (prefersReducedMotion() || settled) {
      const p = path.getPointAtLength(len * target);
      dot.setAttribute("cx", p.x);
      dot.setAttribute("cy", p.y);
      draw.style.strokeDashoffset = `${len * (1 - target)}`;
      return;
    }

    let raf;
    const from = Number(dot.dataset.p || 0);
    const start = performance.now();
    const dur = 520;
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const p = from + (target - from) * ease(t);
      const pt = path.getPointAtLength(len * p);
      dot.setAttribute("cx", pt.x);
      dot.setAttribute("cy", pt.y);
      dot.dataset.p = String(p);
      draw.style.strokeDashoffset = `${len * (1 - p)}`;
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, settled]);

  const reached = active + 1;

  return (
    <section id="inside" className="ax-path ax-band">
      {/* The section draws a request crossing a chip. The chip is the one
          piece it could not draw, so it plays underneath instead. */}
      <AmbientVideo film="awaken" className="ax-path__film" />
      <div className="padding-global">
        <div className="container-large">
          <div className="ax-path__head">
            <p className="ax-kicker ax-kicker--invert">
              <span>03</span> The difference
            </p>
            <h2 className="ax-path__title">
              Most AI stops
              <br />
              at the answer
            </h2>
            <p className="ax-path__lede">
              The value gap appears after the model responds — when a human
              still has to do the work.
            </p>
          </div>

          {/* The two shapes, side by side, before the second one is drawn
              in full below. The trace further down this section is one
              long argument; this is the half-second version of it, and
              without it the diagram has to carry a comparison it never
              actually shows. The last link on the left is marked because
              that link is the whole point: it is the one a person does. */}
          <div className="ax-path__contrast">
            <div className="ax-path__contrast-col" data-kind="old">
              <p className="ax-path__contrast-label">Traditional AI</p>
              <ol className="ax-path__contrast-chain">
                <li>Ask</li>
                <li>AI answers</li>
                <li data-stop="true">Human does the work</li>
              </ol>
            </div>
            <div className="ax-path__contrast-col" data-kind="new">
              <p className="ax-path__contrast-label">Agentic AI</p>
              <ol className="ax-path__contrast-chain">
                <li>Request / event</li>
                <li>Understands</li>
                <li>Reasons</li>
                <li>Acts</li>
              </ol>
            </div>
          </div>

          <div className="ax-path__verdict">
            <p className="ax-path__verdict-line">We build the second kind.</p>
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
                  <span className="ax-path__panel-live">
                    <i />
                    txn_8f2a41
                  </span>
                </div>

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
                  </defs>

                  {/* the route, unlit then lit */}
                  <path className="ax-path__route" d={d} ref={pathRef} />
                  <path className="ax-path__route-lit" d={d} ref={drawRef} />

                  {STAGES.map((s, i) => {
                    const p = POS[i];
                    const state =
                      i < active ? "past" : i === active ? "now" : "next";
                    return (
                      <g
                        key={s.key}
                        className="ax-path__node"
                        data-state={state}
                        transform={`translate(${p.x - NODE.w / 2} ${p.y - NODE.h / 2})`}
                      >
                        <rect
                          className="ax-path__node-box"
                          width={NODE.w}
                          height={NODE.h}
                          rx="12"
                        />
                        <text
                          className="ax-path__node-index"
                          x="14"
                          y="22"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </text>
                        <text className="ax-path__node-label" x="14" y="42">
                          {s.node}
                        </text>
                      </g>
                    );
                  })}

                  {/* the request itself */}
                  <circle
                    className="ax-path__dot"
                    ref={dotRef}
                    r="7"
                    cx={POS[0].x}
                    cy={POS[0].y}
                  />
                </svg>

                <div className="ax-path__readout">
                  <span className="ax-path__readout-payload">
                    {STAGES[active].payload}
                  </span>
                  <span className="ax-path__meter" aria-hidden="true">
                    <span
                      className="ax-path__meter-fill"
                      style={{ width: `${(reached / TOTAL_STEPS) * 100}%` }}
                    />
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
                  data-state={i === active ? "now" : i < active ? "past" : "next"}
                  ref={(el) => (stageRefs.current[i] = el)}
                >
                  <span className="ax-path__step-index" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
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
