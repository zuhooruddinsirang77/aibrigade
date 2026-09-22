"use client";

import Reveal from "@/components/motion/Reveal";

/**
 * One demo, framed: the explanation first, then the thing itself.
 *
 * The order is deliberate and is the same order the rest of the site uses
 * — a reader should know what a system is for before they are asked to
 * operate it. Dropping a visitor straight into eight controls and a score
 * would be a puzzle rather than a demonstration.
 *
 * Renders as a `<section>` with its own heading level so the page has a
 * real document outline: h1 on the page, h2 per demo, h3 inside the panels.
 */
export default function DemoSection({ demo, index }) {
  const { id, title, category, capability, description, honesty, technologies, component: Demo } =
    demo;

  return (
    <section className="ax-demo" id={id} aria-labelledby={`${id}-title`}>
      <Reveal variant="rise" className="ax-demo__head">
        <p className="ax-kicker">
          <span>{String(index + 1).padStart(2, "0")}</span>
          {category}
        </p>

        <h2 className="ax-demo__title" id={`${id}-title`}>
          {title}
        </h2>

        <p className="ax-demo__desc">{description}</p>

        <div className="ax-demo__meta">
          <ul className="ax-demo__tags" aria-label="Capabilities demonstrated">
            {technologies.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="ax-demo__capability" aria-label="Pipeline stage">
            {capability}
          </p>
        </div>

        {/* Under the description, above the demo: what a reader is about to
            operate, stated before they operate it. */}
        <p className="ax-demo__honesty">
          <span>How this runs</span>
          {honesty}
        </p>
      </Reveal>

      <div className="ax-demo__stage">
        <Demo />
      </div>
    </section>
  );
}
