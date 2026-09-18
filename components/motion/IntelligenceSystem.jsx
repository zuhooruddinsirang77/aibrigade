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
const H = 560;
const CORE = { x: 330, y: 250, r: 38 };

const SOURCES = [
  { y: 122, label: "Transactions", sub: "real-time" },
  { y: 207, label: "Clinical notes", sub: "EHR · HL7 FHIR" },
  { y: 292, label: "Documents", sub: "underwriting files" },
  { y: 377, label: "Calls", sub: "voice · multilingual" },
];
const SRC_X = 120;

const DECISIONS = [
  { y: 162, label: "Approve", sub: "straight-through", action: "Written back" },
  { y: 250, label: "Refer", sub: "with reasons", action: "Analyst queue" },
  { y: 338, label: "Hold", sub: "human in the loop", action: "Clinician sign-off" },
];
const DEC_X = 530;
const ACT_X = 660;

const STAGES = [
  { x: SRC_X, n: "01", label: "Data" },
  { x: CORE.x, n: "02", label: "Intelligence" },
  { x: DEC_X, n: "03", label: "Decision" },
  { x: ACT_X, n: "04", label: "Action" },
];

/* The log line — AgentConsole's traces, one per beat. */
const EVENTS = [
  "txn_8f2a41 · risk 0.94 · refer to analyst",
  "app_31c7 · within appetite · approve, straight-through",
  "enc_5d90 · note drafted · hold for clinician",
  "call_0e47 · intent: booking · appointment confirmed",
  "win_0442 · 2 candidates · alert raised, evidence attached",
];

const pct = (v, of) => `${(v / of) * 100}%`;

const inPath = (y) =>
  `M ${SRC_X} ${y} C ${SRC_X + 90} ${y}, ${CORE.x - 120} ${CORE.y}, ${CORE.x - CORE.r - 4} ${CORE.y}`;
const outPath = (y) =>
  `M ${CORE.x + CORE.r + 4} ${CORE.y} C ${CORE.x + 110} ${CORE.y}, ${DEC_X - 90} ${y}, ${DEC_X - 8} ${y}`;
const actPath = (y) => `M ${DEC_X + 9} ${y} L ${ACT_X - 10} ${y}`;

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
            <linearGradient id="ax-sys-line-in" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#c79bf5" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="ax-sys-line-out" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c79bf5" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0.14" />
            </linearGradient>
          </defs>

          {/* The core's light, brightening as the pointer approaches. */}
          <circle className="ax-sys__glow" cx={CORE.x} cy={CORE.y} r="118" fill="url(#ax-sys-glow)" />

          {/* ---- connections ---- */}
          <g className="ax-sys__lines ax-sys__lines--in" stroke="url(#ax-sys-line-in)" strokeWidth="1">
            {SOURCES.map((s, i) => (
              <path key={i} id={`ax-in-${i}`} d={inPath(s.y)} pathLength="1" style={{ "--i": i }} />
            ))}
          </g>
          <g className="ax-sys__lines ax-sys__lines--out" stroke="url(#ax-sys-line-out)" strokeWidth="1">
            {DECISIONS.map((d, i) => (
              <path key={i} id={`ax-out-${i}`} d={outPath(d.y)} pathLength="1" style={{ "--i": i + 4 }} />
            ))}
          </g>
          <g className="ax-sys__lines ax-sys__lines--act" stroke="rgba(255,255,255,0.22)" strokeWidth="1">
            {DECISIONS.map((d, i) => (
              <path key={i} id={`ax-act-${i}`} d={actPath(d.y)} pathLength="1" style={{ "--i": i + 7 }} />
            ))}
          </g>

          {/* ---- the core ---- */}
          <g className="ax-sys__core" style={{ "--cx": `${CORE.x}px`, "--cy": `${CORE.y}px` }}>
            <circle className="ax-sys__ring ax-sys__ring--far" cx={CORE.x} cy={CORE.y} r="110" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
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
            <circle className="ax-sys__disc" cx={CORE.x} cy={CORE.y} r={CORE.r} fill="url(#ax-sys-core)" />
            <circle cx={CORE.x} cy={CORE.y} r={CORE.r} stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
            <circle cx={CORE.x - 12} cy={CORE.y - 12} r="16" fill="rgba(255,255,255,0.09)" />
            <circle cx={CORE.x} cy={CORE.y} r="3.5" fill="#fff" />
          </g>

          {/* ---- nodes ---- */}
          <g className="ax-sys__nodes">
            {SOURCES.map((s, i) => (
              <g key={i}>
                <line x1={SRC_X - 30} y1={s.y} x2={SRC_X - 12} y2={s.y} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                <circle cx={SRC_X} cy={s.y} r="9" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
                <circle cx={SRC_X} cy={s.y} r="3.5" fill="rgba(255,255,255,0.85)" />
              </g>
            ))}
            {DECISIONS.map((d, i) => (
              <g key={i}>
                <circle cx={DEC_X} cy={d.y} r="10" stroke="rgba(199,155,245,0.35)" strokeWidth="1" />
                <circle cx={DEC_X} cy={d.y} r="4" fill="#c79bf5" />
                <rect
                  x={ACT_X - 6}
                  y={d.y - 6}
                  width="12"
                  height="12"
                  rx="2.5"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="1"
                  fill="rgba(5,7,10,0.9)"
                />
                <rect x={ACT_X - 2.5} y={d.y - 2.5} width="5" height="5" rx="1" fill="rgba(255,255,255,0.75)" />
              </g>
            ))}
          </g>

          {/* ---- signals ---- */}
          <g className="ax-sys__pulses">
            {SOURCES.map((s, i) => (
              <circle key={`in-${i}`} r="2.6" fill="#c79bf5" className="ax-sys__pulse">
                <animateMotion dur="3.6s" repeatCount="indefinite" begin={`${i * 0.9}s`} calcMode="spline" keySplines="0.4 0 0.6 1" keyTimes="0;1" keyPoints="0;1">
                  <mpath href={`#ax-in-${i}`} />
                </animateMotion>
              </circle>
            ))}
            {DECISIONS.map((d, i) => (
              <circle key={`out-${i}`} r="2.6" fill="#f87756" className="ax-sys__pulse">
                <animateMotion dur="3s" repeatCount="indefinite" begin={`${1.4 + i * 1.0}s`} calcMode="spline" keySplines="0.4 0 0.6 1" keyTimes="0;1" keyPoints="0;1">
                  <mpath href={`#ax-out-${i}`} />
                </animateMotion>
              </circle>
            ))}
            {DECISIONS.map((d, i) => (
              <circle key={`act-${i}`} r="2" fill="#f87756" fillOpacity="0.9" className="ax-sys__pulse">
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
            style={{ left: pct(CORE.x, W), top: pct(CORE.y + 118, H) }}
          >
            Intelligence core
            <small>models · policy · memory</small>
          </span>

          {DECISIONS.map((d, i) => (
            <span
              key={`d-${i}`}
              className="ax-sys__label ax-sys__label--dec"
              style={{ left: pct(DEC_X + 18, W), top: pct(d.y, H) }}
            >
              {d.label}
              <small>{d.sub}</small>
            </span>
          ))}
          {DECISIONS.map((d, i) => (
            <span
              key={`a-${i}`}
              className="ax-sys__label ax-sys__label--act"
              style={{ left: pct(ACT_X, W), top: pct(d.y + 22, H) }}
            >
              <small>{d.action}</small>
            </span>
          ))}

          <div className="ax-sys__rail">
            {STAGES.map((s) => (
              <span key={s.n} className="ax-sys__stage" style={{ left: pct(s.x, W) }}>
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
        <p className="ax-sys__event" key={event}>
          <span className="ax-sys__event-mark" />
          <code>{EVENTS[event]}</code>
        </p>
        <span className="ax-sys__status">
          <span className="ax-sys__status-dot" />
          system active
        </span>
      </div>
    </div>
  );
}
