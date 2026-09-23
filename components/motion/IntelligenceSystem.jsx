"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * The hero's visual — a system, running.
 *
 * Four sources of data on the left, one intelligence core in the middle,
 * three decisions on the right, each one carried through to the action
 * that follows it. Signals travel the connections continuously; the core
 * turns slowly; a single line of log at the top names what just happened.
 * It is the shape of every system this company builds — data in, a
 * defensible decision out, an action taken — drawn once, rather than a
 * picture of one product.
 *
 * Deliberately not a dashboard and not a robot. One SVG for the geometry
 * (paths, nodes, rings), HTML for every word, so the labels stay crisp at
 * any size and can be restyled per breakpoint without touching the
 * drawing. Motion is CSS keyframes and SMIL `animateMotion` — no canvas,
 * no WebGL, no per-frame JavaScript. The only script that runs is the
 * pointer tilt (fine pointers only, eased in a short rAF loop that stops
 * when it settles) and a 3.4s interval for the log line.
 *
 * Every phrase on it is already on this site: the sources are the domains
 * WhyUs lists, the decisions are the verdicts the case studies describe,
 * the log lines are AgentConsole's traces. Nothing new is claimed.
 *
 * Under `prefers-reduced-motion`: signals hidden, rings still, no tilt,
 * the log line fixed on its first entry. The picture is complete at rest.
 */

/* ---- geometry (viewBox 720 × 560) ------------------------------------ */

const W = 720;
/* 560 until the rows were laid out: the sources ran 122–377 and the
   decisions 162–338, so everything in the drawing sat inside the top
   two-thirds and the bottom third was empty space between the core's
   caption and the stage rail. 480 crops that band rather than the
   drawing; every row below moves up with it so the composition stays
   centred on the core. `.ax-sys`'s `aspect-ratio` in app/hero.css
   follows this number. */
const H = 480;
const CORE = { x: 356, y: 240, r: 38 };

const SOURCES = [
  { y: 112, label: "Transactions", sub: "real-time" },
  { y: 197, label: "Clinical notes", sub: "EHR · HL7 FHIR" },
  { y: 282, label: "Documents", sub: "underwriting files" },
  { y: 367, label: "Calls", sub: "voice · multilingual" },
];
/* 120 until the source labels were set at a readable size. They are
   right-aligned to `SRC_X - 40`, so the width available to them is
   everything left of that — at 120 that was 80 units of a 720-unit
   drawing, about 60 real pixels, and "underwriting files" and
   "voice · multilingual" ran off the left edge of the section and were
   cut in half. 190 gives that column 150 units, which holds the longest
   of them with room to spare. The core moves 26 units right to keep the
   two halves of the drawing balanced. */
const SRC_X = 190;

const DECISIONS = [
  { y: 152, label: "Approve", sub: "straight-through", action: "Written back" },
  { y: 240, label: "Refer", sub: "with reasons", action: "Analyst queue" },
  { y: 328, label: "Hold", sub: "human in the loop", action: "Clinician sign-off" },
];
/* 530 and 660 until the labels were set at a readable size, and then
   the right-hand side had 130 units — under 100 real pixels — to hold a
   decision label, its qualifier and the rule running out to the action.
   "straight-through" is about 119 of those units on its own, so the
   qualifier line ran straight through the rule beside it in every
   screenshot. The decision column moves left and the action column
   right, which buys the label block 60 more units and leaves the rule a
   clear run. */
const DEC_X = 500;
const ACT_X = 684;

/* The rail is the hero eyebrow's spine — Listen → Understand → Reason →
   Act, slide 1 of the deck — in the deck's colours, under the column each
   step happens in: the sources are listened to, the core understands them
   against what the organisation knows, the decisions are the reasoning's
   verdict, and the trays are where the work is done. It used to read Data
   / Intelligence / Decision / Action, four different words for the same
   four steps the eyebrow named two inches to the left. `SPINE` in Hero.jsx
   carries the same colours. */
const STAGES = [
  { x: SRC_X, n: "01", label: "Listen", color: "#2fd3c0" },
  { x: CORE.x, n: "02", label: "Understand", color: "#6f95ff" },
  { x: DEC_X, n: "03", label: "Reason", color: "#c79bf5" },
  { x: ACT_X, n: "04", label: "Act", color: "#4ade80" },
];

/* The log line — AgentConsole's traces, one per beat. The id stays as a
   quiet reference; the event itself is written as a sentence, because the
   first screen is read by the people who sign off on this, not by the
   people who operate it. */
const EVENTS = [
  { id: "txn_8f2a41", text: "Transaction risk 0.94 — referred to an analyst" },
  { id: "app_31c7", text: "Application within appetite — approved straight-through" },
  { id: "enc_5d90", text: "Clinical note drafted — held for clinician sign-off" },
  { id: "call_0e47", text: "Booking intent recognised — appointment confirmed" },
  { id: "win_0442", text: "Two candidates matched — alert raised with evidence" },
];

/* Column accents, from the rail above. */
const LISTEN = STAGES[0].color;
const ACT = STAGES[3].color;

const pct = (v, of) => `${(v / of) * 100}%`;

/* Both control points run forward along the path. They used to be
   `SRC_X + 90` then `CORE.x - 120`, which with the columns this close
   together put the second control point behind the first — the curve
   doubled back on itself just before the core, and four of them doing it
   at once made the tangle left of the core in every screenshot.
 
   The other half of that tangle was the destination: all four lines
   ended on the same pixel, so they arrived as a knot rather than as a
   convergence. Each one now lands on its own point of the core's edge,
   fanned across it in source order and sitting on the circle rather than
   beside it — `dock` is just the x of a circle of radius `r` at height
   `dy`, which is what keeps the lines touching the sphere instead of
   stopping short of it or running under it. */
const DOCK_R = CORE.r + 6;
const dock = (dy) => Math.sqrt(Math.max(0, DOCK_R * DOCK_R - dy * dy));

const IN_FAN = [-13.5, -4.5, 4.5, 13.5];
const OUT_FAN = [-9, 0, 9];

const inPath = (y, i) => {
  const dy = IN_FAN[i] ?? 0;
  const ey = CORE.y + dy;
  return `M ${SRC_X} ${y} C ${SRC_X + 72} ${y}, ${CORE.x - 92} ${ey}, ${(CORE.x - dock(dy)).toFixed(2)} ${ey}`;
};
const outPath = (y, i) => {
  const dy = OUT_FAN[i] ?? 0;
  const sy = CORE.y + dy;
  return `M ${(CORE.x + dock(dy)).toFixed(2)} ${sy} C ${CORE.x + 88} ${sy}, ${DEC_X - 72} ${y}, ${DEC_X - 10} ${y}`;
};
/* A short lead-in rather than a rule spanning the whole gap: the label
   block sits in that gap, and a line drawn across three lines of type
   reads as a strike-through, not as a connection. It starts clear of the
   longest of them. */
const actPath = (y) => `M ${ACT_X - 40} ${y} L ${ACT_X - 12} ${y}`;

export default function IntelligenceSystem({ className = "" }) {
  const hostRef = useRef(null);
  const [event, setEvent] = useState(0);

  /* ---- the log line --------------------------------------------------- */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = setInterval(() => setEvent((e) => (e + 1) % EVENTS.length), 3400);
    return () => clearInterval(t);
  }, []);

  /* ---- pointer tilt ----------------------------------------------------
     Target follows the pointer; the current value eases toward it in a
     rAF loop that runs only while there is distance left to cover. Written
     as CSS custom properties, so the CSS decides what each layer does with
     them — the scene tilts a few degrees, the labels drift a few pixels,
     the core brightens as the pointer nears it. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host || prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const target = { x: 0, y: 0, near: 0 };
    const current = { x: 0, y: 0, near: 0 };
    let raf = 0;

    const write = () => {
      host.style.setProperty("--sys-rx", current.x.toFixed(4));
      host.style.setProperty("--sys-ry", current.y.toFixed(4));
      host.style.setProperty("--sys-near", current.near.toFixed(4));
    };
    const step = () => {
      raf = 0;
      let moving = false;
      for (const k of ["x", "y", "near"]) {
        const d = target[k] - current[k];
        if (Math.abs(d) > 0.0015) {
          current[k] += d * 0.085;
          moving = true;
        } else {
          current[k] = target[k];
        }
      }
      write();
      if (moving) raf = requestAnimationFrame(step);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };

    const onMove = (e) => {
      const r = host.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      target.x = Math.max(-1, Math.min(1, nx));
      target.y = Math.max(-1, Math.min(1, ny));
      /* Distance from the core, in the visual's own space. */
      const cx = ((e.clientX - r.left) / r.width) * W;
      const cy = ((e.clientY - r.top) / r.height) * H;
      const d = Math.hypot(cx - CORE.x, cy - CORE.y);
      target.near = Math.max(0, 1 - d / 190);
      kick();
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      target.near = 0;
      kick();
    };

    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={`ax-sys ${className}`.trim()}
      role="img"
      aria-label="Diagram of an AI system: transactions, clinical notes, documents and calls flow into an intelligence core, which returns approve, refer or hold decisions, each carried through to an action."
    >
      <div className="ax-sys__scene" aria-hidden="true">
        <svg className="ax-sys__svg" viewBox={`0 0 ${W} ${H}`} fill="none" focusable="false">
          <defs>
            <radialGradient id="ax-sys-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#9248e4" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#9248e4" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#9248e4" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ax-sys-core" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9f48e4" />
              <stop offset="60%" stopColor="#672ca9" />
              <stop offset="100%" stopColor="#3f166e" />
            </linearGradient>
            {/* Each connection runs from one step's colour into the next:
                listen (teal) into the core, the core (violet) out to the
                decisions. */}
            <linearGradient id="ax-sys-line-in" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={LISTEN} stopOpacity="0.35" />
              <stop offset="100%" stopColor="#c79bf5" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="ax-sys-line-out" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c79bf5" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#c79bf5" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* The core's light, brightening as the pointer approaches. */}
          <circle className="ax-sys__glow" cx={CORE.x} cy={CORE.y} r="118" fill="url(#ax-sys-glow)" />

          {/* ---- connections ---- */}
          <g className="ax-sys__lines ax-sys__lines--in" stroke="url(#ax-sys-line-in)" strokeWidth="1">
            {SOURCES.map((s, i) => (
              <path key={i} id={`ax-in-${i}`} d={inPath(s.y, i)} pathLength="1" style={{ "--i": i }} />
            ))}
          </g>
          <g className="ax-sys__lines ax-sys__lines--out" stroke="url(#ax-sys-line-out)" strokeWidth="1">
            {DECISIONS.map((d, i) => (
              <path key={i} id={`ax-out-${i}`} d={outPath(d.y, i)} pathLength="1" style={{ "--i": i + 4 }} />
            ))}
          </g>
          <g className="ax-sys__lines ax-sys__lines--act" stroke={ACT} strokeOpacity="0.5" strokeWidth="1">
            {DECISIONS.map((d, i) => (
              <path key={i} id={`ax-act-${i}`} d={actPath(d.y)} pathLength="1" style={{ "--i": i + 7 }} />
            ))}
          </g>

          {/* ---- the core ---- */}
          <g className="ax-sys__core" style={{ "--cx": `${CORE.x}px`, "--cy": `${CORE.y}px` }}>
            <circle className="ax-sys__ring ax-sys__ring--far" cx={CORE.x} cy={CORE.y} r="110" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <g className="ax-sys__ring ax-sys__ring--arcs">
              <circle
                cx={CORE.x}
                cy={CORE.y}
                r="84"
                stroke="#c79bf5"
                strokeOpacity="0.55"
                strokeWidth="1.25"
                strokeDasharray="132 396"
                strokeLinecap="round"
              />
              <circle
                cx={CORE.x}
                cy={CORE.y}
                r="84"
                stroke="#c79bf5"
                strokeOpacity="0.55"
                strokeWidth="1.25"
                strokeDasharray="132 396"
                strokeDashoffset="-264"
                strokeLinecap="round"
              />
            </g>
            <circle
              className="ax-sys__ring ax-sys__ring--dash"
              cx={CORE.x}
              cy={CORE.y}
              r="60"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
              strokeDasharray="1.5 7"
              strokeLinecap="round"
            />
            {/* The sphere, in four passes rather than one flat disc and a
                dot: a thin shell just outside it so it has an edge against
                the glow, the graded body, a soft highlight where the light
                falls, and a small bright centre with its own halo. Flat,
                it read as a purple ball with a white pixel on it. */}
            <circle
              cx={CORE.x}
              cy={CORE.y}
              r={CORE.r + 7}
              fill="none"
              stroke="rgba(199,155,245,0.22)"
              strokeWidth="1"
            />
            <circle className="ax-sys__disc" cx={CORE.x} cy={CORE.y} r={CORE.r} fill="url(#ax-sys-core)" />
            <circle cx={CORE.x} cy={CORE.y} r={CORE.r} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <circle cx={CORE.x - 13} cy={CORE.y - 13} r="17" fill="rgba(255,255,255,0.14)" />
            <circle cx={CORE.x - 17} cy={CORE.y - 17} r="7" fill="rgba(255,255,255,0.2)" />
            <circle cx={CORE.x} cy={CORE.y} r="9" fill="rgba(255,255,255,0.16)" />
            <circle cx={CORE.x} cy={CORE.y} r="3.75" fill="#fff" />
          </g>

          {/* ---- nodes ---- */}
          <g className="ax-sys__nodes">
            {SOURCES.map((s, i) => (
              <g key={i}>
                <line x1={SRC_X - 28} y1={s.y} x2={SRC_X - 13} y2={s.y} stroke="rgba(255,255,255,0.32)" strokeWidth="1" />
                <circle cx={SRC_X} cy={s.y} r="10" fill="rgba(5,7,10,0.85)" stroke={LISTEN} strokeOpacity="0.5" strokeWidth="1" />
                <circle cx={SRC_X} cy={s.y} r="3.5" fill={LISTEN} />
              </g>
            ))}
            {DECISIONS.map((d, i) => (
              <g key={i}>
                <circle cx={DEC_X} cy={d.y} r="11" fill="rgba(5,7,10,0.85)" stroke="rgba(199,155,245,0.65)" strokeWidth="1" />
                <circle cx={DEC_X} cy={d.y} r="4" fill="#c79bf5" />
                {/* A square inside a square said nothing. This is the
                    thing the decision is written into: a tray with the
                    result dropping into it. */}
                <rect
                  x={ACT_X - 8}
                  y={d.y - 8}
                  width="16"
                  height="16"
                  rx="3.5"
                  stroke={ACT}
                  strokeOpacity="0.55"
                  strokeWidth="1"
                  fill="rgba(5,7,10,0.9)"
                />
                <path
                  d={`M ${ACT_X} ${d.y - 4.5} v 5.5 m -2.6 -2.4 2.6 2.6 2.6 -2.6`}
                  fill="none"
                  stroke={ACT}
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={`M ${ACT_X - 4} ${d.y + 4} h 8`}
                  stroke={ACT}
                  strokeOpacity="0.5"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>

          {/* ---- signals ---- */}
          <g className="ax-sys__pulses">
            {SOURCES.map((s, i) => (
              <circle key={`in-${i}`} r="2.6" fill={LISTEN} className="ax-sys__pulse">
                <animateMotion dur="3.6s" repeatCount="indefinite" begin={`${i * 0.9}s`} calcMode="spline" keySplines="0.4 0 0.6 1" keyTimes="0;1" keyPoints="0;1">
                  <mpath href={`#ax-in-${i}`} />
                </animateMotion>
              </circle>
            ))}
            {DECISIONS.map((d, i) => (
              <circle key={`out-${i}`} r="2.6" fill="#c79bf5" className="ax-sys__pulse">
                <animateMotion dur="3s" repeatCount="indefinite" begin={`${1.4 + i * 1.0}s`} calcMode="spline" keySplines="0.4 0 0.6 1" keyTimes="0;1" keyPoints="0;1">
                  <mpath href={`#ax-out-${i}`} />
                </animateMotion>
              </circle>
            ))}
            {DECISIONS.map((d, i) => (
              <circle key={`act-${i}`} r="2" fill={ACT} fillOpacity="0.9" className="ax-sys__pulse">
                <animateMotion dur="1.5s" repeatCount="indefinite" begin={`${3.2 + i * 1.0}s`}>
                  <mpath href={`#ax-act-${i}`} />
                </animateMotion>
              </circle>
            ))}
          </g>
        </svg>

        {/* ---- every word, as HTML ---- */}
        <div className="ax-sys__labels">
          {SOURCES.map((s, i) => (
            <span
              key={i}
              className="ax-sys__label ax-sys__label--src"
              style={{ right: pct(W - (SRC_X - 40), W), top: pct(s.y, H) }}
            >
              {s.label}
              <small>{s.sub}</small>
            </span>
          ))}

          <span
            className="ax-sys__label ax-sys__label--core"
            style={{ left: pct(CORE.x, W), top: pct(CORE.y + 124, H) }}
          >
            Intelligence core
            <small>models · policy · memory</small>
          </span>

          {/* Decision, qualifier, and where it lands — one block, three
              lines, one left edge. The third line used to be a label of
              its own, centred under the tray at `ACT_X`, which put it
              half over the qualifier above it and left it reading as a
              caption for an icon rather than as the end of the
              sentence. */}
          {DECISIONS.map((d, i) => (
            <span
              key={`d-${i}`}
              className="ax-sys__label ax-sys__label--dec"
              style={{ left: pct(DEC_X + 20, W), top: pct(d.y, H) }}
            >
              {d.label}
              <small>{d.sub}</small>
              <em className="ax-sys__action">{d.action}</em>
            </span>
          ))}

          <div className="ax-sys__rail">
            {STAGES.map((s) => (
              <span key={s.n} className="ax-sys__stage" style={{ left: pct(s.x, W), "--c": s.color }}>
                <b>{s.n}</b>
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* The readout: one line of what the system just did, and that it is
          running. Both decorative — the `role="img"` label above carries
          the meaning for assistive tech. */}
      <div className="ax-sys__hud" aria-hidden="true">
        {/* Green, not coral: coral is this site's "needs a human" colour
            (see sysv.css), and a pulsing coral dot beside "system active"
            read as an alarm. */}
        <span className="ax-sys__status">
          <span className="ax-sys__status-dot" />
          Live
        </span>
        <p className="ax-sys__event" key={event}>
          <code>{EVENTS[event].id}</code>
          <span>{EVENTS[event].text}</span>
        </p>
      </div>
    </div>
  );
}
