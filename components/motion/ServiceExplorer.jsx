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

/**
 * `proof.kind` is where the proof is qualified, and the wording is load-bearing.
 * "Proof built" means a named product of ours already does this. "Transferable
 * proof" means the capability is built and shipping, but in an adjacent
 * sector — no client in this one has taken delivery yet. The two are not
 * interchangeable and a later editing pass should not smooth them into one.
 *
 * `headline` is the deck's own sector headline, one per track. The section
 * above this component opens on the general form of the claim ("Imagine your
 * business with a digital workforce"); each of the four sectors states it
 * again in its own terms, and those four sentences are the only place the
 * page says what the workforce actually *does* for a bank as against a
 * hospital as against a shop floor. They were the one part of slides 6–9
 * with nowhere to land when this panel carried only `short` as its title —
 * "AI in Fintech" is a label, not a claim, and the claim is the thing the
 * slide was written for. `short` stays as the eyebrow: it is the tab's own
 * name and the panel has to say which tab you opened. It uses the deck's
 * sector names ("Healthtech", not "AI in Healthcare") so the tabs match the
 * sector row in the hero.
 *
 * `builds` are name + one line, and render as a grid of agent tiles rather
 * than a bullet list of "Name — description" strings: the deck sets each
 * agent as its own card, and a reader scans for the agent's name first.
 * `proof` is split the same way — `kind` is the "Proof built" /
 * "Transferable proof" distinction above, `items` are the named products,
 * and `caveat` holds the one qualifier that is not a product.
 *
 * `accent` is the deck's colour for each sector (teal, green, amber, blue),
 * using hexes the site already uses elsewhere (compose.css, console.css).
 */
const DETAIL = {
  0: {
    headline: "Imagine your bank with a digital workforce.",
    short: "Fintech",
    accent: "#2fd3c0",
    builds: [
      { name: "Customer agent", text: "Handles supported service and banking requests conversationally." },
      { name: "Fraud agent", text: "Scores suspicious activity and creates explainable intervention context." },
      { name: "Collections agent", text: "Contacts customers, captures outcomes and escalates exceptions." },
      { name: "Operations agent", text: "Works disputes, reconciliation and exception queues." },
      { name: "Knowledge agent", text: "Governed access to policies, SOPs and institutional knowledge." },
      { name: "Employee copilot", text: "Assists regulated teams without sending sensitive data to public AI." },
    ],
    proof: {
      kind: "Proof built",
      items: ["AXON", "LIVE Fintech Fraud Detection", "AI Outbound Voice Engagement", "Private Enterprise LLM"],
    },
  },
  1: {
    headline: "Imagine administrative work moving before staff have to chase it.",
    short: "Healthtech",
    accent: "#4ade80",
    builds: [
      { name: "Patient access agent", text: "Scheduling, navigation, FAQs and service requests." },
      { name: "RCM agent", text: "Eligibility, AR follow-up, billing and denial workflow assistance." },
      { name: "Patient financial agent", text: "Multilingual billing support and proactive follow-up." },
      { name: "Knowledge agent", text: "SOP, policy and operational knowledge grounded in approved sources." },
      { name: "Supply agent", text: "Voice-driven stock and availability for pharmacy and clinical supplies." },
      { name: "Workforce copilot", text: "Summaries, document assistance and workflow guidance for staff." },
    ],
    proof: {
      kind: "Transferable proof",
      items: ["Voice AI", "Outbound Voice", "Private RAG/LLM", "Voice Inventory"],
    },
  },
  2: {
    headline: "Imagine every frontline team having an AI operator beside them.",
    short: "Retail & Customer Ops",
    accent: "#f0a83c",
    builds: [
      { name: "Inventory agent", text: "Hands-free stock, location, movement and exception visibility." },
      { name: "Store ops agent", text: "Guides tasks, SOPs and operational issue escalation." },
      { name: "Customer service agent", text: "Resolves supported requests across voice and digital channels." },
      { name: "Outbound agent", text: "Reminders, campaigns, qualification and follow-up." },
      { name: "Agent assist", text: "Retrieves knowledge, summarizes conversations and suggests next actions." },
      { name: "Analytics agent", text: "Surfaces operational exceptions through natural-language interaction." },
    ],
    proof: {
      kind: "Proof built",
      items: ["AI Voice Retail Inventory Manager", "AXON", "AXON 2.0", "AI Outbound Voice Engagement"],
    },
  },
  3: {
    headline: "Imagine field and operations teams with governed AI at the point of work.",
    short: "Industrial & Energy",
    accent: "#4d7cf5",
    builds: [
      { name: "Maintenance agent", text: "Uses manuals, history and SOPs to support troubleshooting." },
      { name: "Field voice copilot", text: "Hands-free procedures, work instructions and knowledge access." },
      { name: "Spares agent", text: "Inventory and availability across parts stores and warehouses." },
      { name: "Work order agent", text: "Creates, enriches, prioritizes and updates maintenance workflows." },
      { name: "Asset knowledge agent", text: "Searches technical documentation and maintenance records." },
      { name: "Exception agent", text: "Classifies operational, meter, billing or process exceptions." },
    ],
    proof: {
      kind: "Transferable proof",
      items: ["Private Enterprise LLM/RAG", "Voice Inventory", "AXON voice stack", "Workflow orchestration"],
      caveat: "Integration depends on the client's OT/SCADA architecture and permitted interfaces.",
    },
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
              <span className="ax-svc__tab-meta">
                {DETAIL[i].builds.length} agents &middot; {DETAIL[i].proof.kind}
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
        style={{ "--svc-accent": detail.accent }}
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
            {/* Eyebrow then claim: the eyebrow confirms which tab is open,
                the heading is the sector's own sentence from the deck. The
                heading used to be the eyebrow's text, which meant the panel
                named itself twice (the tab already says "AI in Fintech" two
                columns to the left) and never said what the track is for. */}
            <p className="ax-svc__panel-eyebrow">{detail.short}</p>
            <h3 className="ax-svc__panel-title">{detail.headline}</h3>
            <ul className="ax-svc__builds">
              {detail.builds.map((b) => (
                <li className="ax-svc__agent" key={b.name}>
                  <h4 className="ax-svc__agent-name">{b.name}</h4>
                  <p className="ax-svc__agent-text">{b.text}</p>
                </li>
              ))}
            </ul>
            <div className="ax-svc__proof">
              <p className="ax-svc__proof-kind">{detail.proof.kind}</p>
              <ul className="ax-svc__proof-items">
                {detail.proof.items.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              {detail.proof.caveat ? (
                <p className="ax-svc__proof-caveat">*{detail.proof.caveat}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
