"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { services } from "@/components/data";
import { filmFor } from "@/components/video.data";
import AmbientVideo from "@/components/motion/AmbientVideo";

/**
 * "What we can help you with", as something you operate rather than
 * something you scroll past.
 *
 * It was four equal cards, each a sentence over a purple 3D render — the
 * layout every agency site uses for a services grid, and the one place a
 * reader learns nothing by looking. The four offers are not
 * interchangeable, so making the reader pick one and see what is actually
 * inside it is both more useful and more honest than showing all four at
 * a depth of one line.
 *
 * Every phrase in `DETAIL` already appears in this page's own copy — the
 * capability strip above this component (`STACK` in Services.jsx), the
 * WhyUs card titles (components/data.js) and the case studies. Nothing
 * here is a new capability claim; it is the same claims, sorted under the
 * offer they belong to.
 *
 * Interaction: hover or focus previews, click pins. Arrow keys move
 * between offers, which matters because this is a tab list — the panel is
 * the only place the detail exists.
 */

const DETAIL = {
  0: {
    short: "AI in Fintech",
    builds: [
      "Real-time fraud scoring",
      "Autonomous underwriting",
      "Compliance monitoring agents",
    ],
    note: "Decisions your risk team can defend line by line, with the policy that made them versioned alongside the model.",
  },
  1: {
    short: "AI in Healthcare",
    builds: [
      "Clinical documentation copilots",
      "Diagnostics and risk stratification",
      "HL7 FHIR / Epic / Cerner integration",
    ],
    note: "HIPAA-compliant infrastructure, and systems that fit the clinical workflow that already exists rather than replacing it.",
  },
  2: {
    short: "Custom AI Development",
    builds: ["GPT platforms", "Decision intelligence", "MLOps and deployment"],
    note: "Discovery through production, including the parts most proposals leave out: evaluation, rollback, and who owns it after launch.",
  },
  3: {
    short: "Automation & Integrations",
    builds: [
      "Automation agents",
      "Middleware across disconnected systems",
      "Explainable risk models",
    ],
    note: "The manual steps between your systems, removed — and the intelligence already sitting in them, surfaced where someone can act on it.",
  },
};

export default function ServiceExplorer() {
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const tabRefs = useRef([]);

  /* Until someone takes over, the panel walks itself through the four
     offers — the section says "there are four of these and they are
     different" without requiring anyone to discover the control first.
     Any hover, focus or click stops it for good; an autoplay that
     resumes and moves the panel out from under a reader is worse than no
     autoplay at all. */
  useEffect(() => {
    if (pinned) return;
    const t = setInterval(() => setActive((i) => (i + 1) % services.length), 4200);
    return () => clearInterval(t);
  }, [pinned]);

  const pick = (i) => {
    setActive(i);
    setPinned(true);
  };

  const onKeyDown = (e) => {
    const last = services.length - 1;
    let next = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    pick(next);
    tabRefs.current[next]?.focus();
  };

  /* Each offer gets the environment it is sold into, behind the panel.
     Mounted as they are first shown rather than all four up front — the
     panel rotates on its own, so a reader who leaves the section alone
     still only pays for the offers that actually appeared. Tracked in
     state, in an effect: a Set mutated during render is read back at a
     different value on React's second pass in development, so the first
     clip would intermittently fail to mount. */
  const [seen, setSeen] = useState(() => new Set([filmFor.services[0]]));
  useEffect(() => {
    const film = filmFor.services[active];
    setSeen((prev) => (prev.has(film) ? prev : new Set(prev).add(film)));
  }, [active]);

  const mounted = useMemo(
    () => [...new Set(filmFor.services)].filter((f) => seen.has(f)),
    [seen]
  );

  const item = services[active];
  const detail = DETAIL[active];

  return (
    <div className="ax-svc">
      <div
        className="ax-svc__list"
        role="tablist"
        aria-orientation="vertical"
        aria-label="What we can help you with"
        onKeyDown={onKeyDown}
      >
        {services.map((s, i) => (
          <button
            key={s.title}
            type="button"
            role="tab"
            id={`svc-tab-${i}`}
            aria-selected={i === active}
            aria-controls="svc-panel"
            tabIndex={i === active ? 0 : -1}
            ref={(el) => (tabRefs.current[i] = el)}
            className="ax-svc__tab"
            onMouseEnter={() => pick(i)}
            onFocus={() => pick(i)}
            onClick={() => pick(i)}
          >
            <span className="ax-svc__tab-index" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="ax-svc__tab-body">
              <span className="ax-svc__tab-short">{DETAIL[i].short}</span>
              {/* The full offer line is the one already written in
                  components/data.js — the short name is a handle for it,
                  not a replacement. */}
              <span className="ax-svc__tab-full">
                {s.title.split("—")[1]?.trim() || s.title}
              </span>
            </span>
            <span className="ax-svc__tab-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      <div
        className="ax-svc__panel"
        id="svc-panel"
        role="tabpanel"
        aria-labelledby={`svc-tab-${active}`}
      >
        <div className="ax-svc__stage" aria-hidden="true">
          {mounted.map((f) => (
            <AmbientVideo
              key={f}
              film={f}
              play={f === filmFor.services[active]}
              data-on={f === filmFor.services[active]}
              className="ax-svc__film"
              rootMargin="0px"
            />
          ))}
        </div>
        {/* `key` remounts on every change so the panel's entrance replays
            — the swap is the feedback that the control did something. */}
        <div className="ax-svc__panel-inner" key={active}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.img} alt={item.alt} className="ax-svc__render" />
          <div className="ax-svc__panel-copy">
            <h3 className="ax-svc__panel-title">{detail.short}</h3>
            <ul className="ax-svc__builds">
              {detail.builds.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <p className="ax-svc__note">{detail.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
