"use client";

import { deployments } from "@/components/deployments.data";
import Counter from "@/components/motion/Counter";

/**
 * The first screen's evidence row.
 *
 * Every number here is read straight out of components/deployments.data.js
 * — the same metrics the Deployments section already prints further down
 * the page. Nothing is invented for the hero: if a metric is cut from the
 * data, it disappears from here too, so the two can never drift into
 * contradicting each other.
 *
 * Each figure is a button, not a caption. Clicking one scrolls to the
 * Deployments console and opens that specific reel (Deployments.jsx
 * listens for `ax:select-reel`), which is the difference between a stat
 * row that decorates the hero and one that is a way into the work.
 */
const SHOWN = deployments.slice(0, 3);

export default function ProofStrip() {
  const go = (id) => () => {
    const section = document.getElementById("reels");
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    window.dispatchEvent(new CustomEvent("ax:select-reel", { detail: { id } }));
  };

  return (
    <ul className="ax-proof" aria-label="Recent deployments">
      {SHOWN.map((d) => (
        <li className="ax-proof__item" key={d.id}>
          <button type="button" className="ax-proof__btn" onClick={go(d.id)}>
            <span className="ax-proof__figure">
              <Counter to={Number(d.metric.value)} />
              <em>{d.metric.unit}</em>
            </span>
            <span className="ax-proof__label">{d.metric.label}</span>
            <span className="ax-proof__where">
              {d.sector} · {d.headline}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
