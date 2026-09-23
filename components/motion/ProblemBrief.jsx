"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";
import { PROBLEM_ICONS, PROBLEMS } from "@/components/problems.data";

/**
 * "Give us a business problem. Not an AI requirement." — shown rather than
 * illustrated.
 *
 * On the left, a problem as a client would actually put it: plain
 * language, no model, no architecture. On the right, what comes back —
 * laid out along the deck's own route (slide 10), `Business problem →
 * Workflow design → Agent architecture → Integration → Measurable pilot`,
 * so every brief is seen travelling it. The route used to be drawn a
 * second time as a separate strip under this panel; carrying it here is
 * what lets the chapter say it once.
 *
 * The briefs are illustrative and labelled as such. They are drawn from
 * the four tracks ServiceExplorer already describes (fraud and disputes,
 * patient access, contact centre, field maintenance), and they carry no
 * figures: an outcome number next to a made-up brief would be exactly the
 * fabricated-specifics problem the README warns about.
 *
 * Height: every brief is rendered, stacked in one grid cell, with only the
 * active one visible — so the panel is always as tall as its tallest brief
 * and nothing under it moves when the brief changes.
 *
 * Rotation: the timer is a CSS animation on the bar under the tabs, and
 * its `animationend` advances to the next brief. So pausing is just
 * `animation-play-state` — it holds while the pointer or focus is inside
 * the panel, and while the panel is off screen. Under reduced motion, and
 * below the desktop breakpoint, it never starts; the tabs still work.
 */

/* The deck's route, verbatim. Each stage is one step of the assessment. */
const STAGES = [
  "Business problem",
  "Workflow design",
  "Agent architecture",
  "Integration",
  "Measurable pilot",
];

const BRIEFS = [
  {
    id: "fintech",
    sector: "Fintech",
    who: "Head of disputes, retail bank",
    brief:
      "Card disputes come in by email, phone and the app. Someone reads each one, finds the transaction, pulls statements from two systems and decides who owns it. The queue is always a week behind.",
    kinds: ["slow", "manual"],
    helps:
      "Read every dispute, match it to the transaction and assemble the evidence before an analyst opens it.",
    flow: ["Intake agent", "Transaction match", "Evidence pack"],
    human: "Analyst decides",
    systems: ["Card processor", "Core banking", "Case management"],
    measure: "Days from a dispute arriving to a decision, against your current queue.",
  },
  {
    id: "healthtech",
    sector: "Healthtech",
    who: "Practice manager, specialty clinic",
    brief:
      "Our front desk spends hours on hold with payers chasing prior authorizations, and patients only find out their procedure is delayed when they call us to ask.",
    kinds: ["slow", "frustrating"],
    helps:
      "Assemble each request from the chart, track payer status and tell patients where things stand.",
    flow: ["Chart extraction", "Payer submission", "Status tracking"],
    human: "Staff approves",
    systems: ["EHR", "Payer portals", "Patient messaging"],
    measure: "Staff hours per authorization, and patient calls asking for a status.",
  },
  {
    id: "customer-ops",
    sector: "Customer ops",
    who: "Contact center director, insurer",
    brief:
      "Our contact center answers the same questions all day. New agents take months to get up to speed, and customers wait on hold for answers that are already written down somewhere.",
    kinds: ["expensive", "frustrating"],
    helps:
      "Resolve routine requests end to end, and put the right answer in front of agents on the harder ones.",
    flow: ["Voice agent", "Knowledge lookup", "Resolve or route"],
    human: "Agent takes over",
    systems: ["Telephony", "CRM", "Knowledge base"],
    measure: "Share of contacts resolved without a handoff, and time to answer.",
  },
  {
    id: "industrial",
    sector: "Industrial & energy",
    who: "Maintenance lead, water utility",
    brief:
      "When a pump trips, the technician on site digs through manuals and old work orders to find out what fixed it last time. The knowledge exists — finding it takes most of the shift.",
    kinds: ["slow", "risky"],
    helps:
      "Put the right manual page, past fix and safety procedure in front of the technician, hands-free.",
    flow: ["Field voice copilot", "Manuals & history", "Work order draft"],
    human: "Supervisor approves",
    systems: ["Maintenance system", "Document library", "Field devices"],
    measure: "Time from a fault to a confirmed fix, and repeat call-outs.",
  },
];

/* What a client does not have to arrive with — the lede's own list. */
const NOT_NEEDED = ["Model choice", "RAG design", "Agent framework"];

const KIND = Object.fromEntries(PROBLEMS.map((p) => [p.icon, p]));

function Glyph({ children, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* One stage of the route: its number on the rail, its name, its answer. */
function Stage({ n, children }) {
  const end = n === STAGES.length - 1;
  return (
    <li className="ax-brief__stage" data-end={end ? "true" : undefined} style={{ "--i": n }}>
      <span className="ax-brief__node" aria-hidden="true">
        {String(n + 1).padStart(2, "0")}
      </span>
      <div className="ax-brief__stage-body">
        <p className="ax-brief__stage-name">{STAGES[n]}</p>
        {children}
      </div>
    </li>
  );
}

export default function ProblemBrief() {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [held, setHeld] = useState(false);
  const [still, setStill] = useState(true);
  const rootRef = useRef(null);

  /* Read after mount, not during render: there is no `window` on the
     server, and a server/client disagreement here is a hydration mismatch
     (see TerminalFeed for the same trap). Desktop only — stacked on a
     phone the panel is taller than the screen, so a brief would change
     under a reader halfway down its assessment; there the tabs decide. */
  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia("(min-width: 992px)").matches) return;
    setStill(false);
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const b = BRIEFS[active];
  const running = !still && inView && !held;
  const next = () => setActive((i) => (i + 1) % BRIEFS.length);

  return (
    <div
      ref={rootRef}
      className="ax-brief"
      data-running={running ? "true" : "false"}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHeld(false);
      }}
    >
      <div className="ax-brief__bar">
        <p className="ax-brief__bar-label">Example briefs</p>
        <div className="ax-brief__tabs" role="tablist" aria-label="Example briefs">
          {BRIEFS.map((x, i) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              id={`ax-brief-tab-${x.id}`}
              aria-selected={i === active}
              aria-controls="ax-brief-panel"
              tabIndex={i === active ? 0 : -1}
              className="ax-brief__tab"
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                e.preventDefault();
                const to = (i + (e.key === "ArrowRight" ? 1 : -1) + BRIEFS.length) % BRIEFS.length;
                setActive(to);
                document.getElementById(`ax-brief-tab-${BRIEFS[to].id}`)?.focus();
              }}
            >
              {x.sector}
            </button>
          ))}
        </div>
        {/* The rotation clock. Keyed on the active brief so the animation
            restarts from zero whenever the brief changes, by timer or by
            click; its end is what advances the rotation. */}
        {!still && (
          <span
            key={b.id}
            className="ax-brief__timer"
            aria-hidden="true"
            onAnimationEnd={next}
          />
        )}
      </div>

      <div
        className="ax-brief__body"
        role="tabpanel"
        id="ax-brief-panel"
        aria-labelledby={`ax-brief-tab-${b.id}`}
      >
        <div className="ax-brief__ask">
          <p className="ax-brief__label">The brief, in your words</p>
          <div className="ax-brief__stack ax-brief__ask-stack">
            {BRIEFS.map((x, i) => (
              <figure
                key={x.id}
                className="ax-brief__quote"
                data-active={i === active ? "true" : "false"}
                aria-hidden={i === active ? undefined : "true"}
              >
                <svg className="ax-brief__mark" viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M13 7C7.8 9.3 5 13.4 5 18.6V25h8.5v-8.4H9.4c.2-3.3 1.8-5.6 4.9-7.3L13 7Zm14 0c-5.2 2.3-8 6.4-8 11.6V25h8.5v-8.4h-4.1c.2-3.3 1.8-5.6 4.9-7.3L27 7Z" />
                </svg>
                <blockquote>
                  <p>{x.brief}</p>
                </blockquote>
                <figcaption>{x.who}</figcaption>
              </figure>
            ))}
          </div>
          <div className="ax-brief__not">
            <p className="ax-brief__label">Not needed from you</p>
            <ul>
              {NOT_NEEDED.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="ax-brief__out">
          <span className="ax-brief__seam" aria-hidden="true">
            <Glyph>
              <path d="M5 12h13M13 6l6 6-6 6" />
            </Glyph>
          </span>

          <div className="ax-brief__out-head">
            <p className="ax-brief__label">What we come back with</p>
            <p className="ax-brief__verdict">
              <span className="ax-brief__check" aria-hidden="true">
                <Glyph>
                  <path d="M5 12.5l4.2 4.2L19 7" />
                </Glyph>
              </span>
              AI can materially improve this
            </p>
          </div>

          <div className="ax-brief__stack">
            {BRIEFS.map((x, i) => (
              <ol
                key={x.id}
                className="ax-brief__route"
                data-active={i === active ? "true" : "false"}
                aria-hidden={i === active ? undefined : "true"}
              >
                <Stage n={0}>
                  <ul className="ax-brief__kinds">
                    {x.kinds.map((k) => (
                      <li key={k} className="ax-kind" data-tone={KIND[k].tone}>
                        <Glyph>{PROBLEM_ICONS[k]}</Glyph>
                        {KIND[k].k}
                      </li>
                    ))}
                  </ul>
                </Stage>
                <Stage n={1}>
                  <p className="ax-brief__text">{x.helps}</p>
                </Stage>
                <Stage n={2}>
                  <ol className="ax-brief__flow">
                    {x.flow.map((step) => (
                      <li key={step}>
                        <span>{step}</span>
                      </li>
                    ))}
                    {/* The last step is always a person. */}
                    <li data-human="true">
                      <span>
                        <Glyph>
                          <circle cx="12" cy="8" r="3.5" />
                          <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
                        </Glyph>
                        {x.human}
                      </span>
                    </li>
                  </ol>
                </Stage>
                <Stage n={3}>
                  <ul className="ax-brief__systems">
                    {x.systems.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </Stage>
                <Stage n={4}>
                  <p className="ax-brief__text">{x.measure}</p>
                </Stage>
              </ol>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
