"use client";

import Reveal from "@/components/motion/Reveal";
import StageStrip from "@/components/demos/StageStrip";

/**
 * One module, framed: the explanation first, then the thing itself.
 *
 * The order is deliberate and is the same order the rest of the site uses
 * — a reader should know what a system is for before they are asked to
 * operate it. Dropping a visitor straight into eight controls and a score
 * would be a puzzle rather than a demonstration.
 *
 * The head is two columns: the argument on the left, and on the right a
 * spec card with the facts an evaluator scans for — where the module sits
 * in the stack, what the engine is, how it runs, what it covers. Those
 * used to trail under the description as a tag row and a mono caption,
 * which left the right half of every section empty.
 *
 * Renders as a `<section>` with its own heading level so the page has a
 * real document outline: h1 on the page, h2 per module, h3 inside panels.
 */
export default function DemoSection({ demo, index }) {
  const { id, title, category, stages, engine, description, honesty, technologies, component: Demo } =
    demo;

  return (
    <section className="ax-demo" id={id} aria-labelledby={`${id}-title`}>
      <div className="ax-demo__head">
        <Reveal variant="rise" className="ax-demo__intro">
          <p className="ax-kicker">
            <span>{String(index + 1).padStart(2, "0")}</span>
            {category}
          </p>

          <h2 className="ax-demo__title" id={`${id}-title`}>
            {title}
          </h2>

          <p className="ax-demo__desc">{description}</p>
        </Reveal>

        <Reveal variant="rise" delay={0.12} as="aside" className="ax-demo__spec">
          <div className="ax-demo__spec-row">
            <p className="ax-demo__spec-label">Where it sits</p>
            <StageStrip stages={stages} />
          </div>

          <div className="ax-demo__spec-row">
            <p className="ax-demo__spec-label">Engine</p>
            <p className="ax-demo__spec-engine">{engine}</p>
          </div>

          {/* What a reader is about to operate, stated before they
              operate it. */}
          <div className="ax-demo__spec-row">
            <p className="ax-demo__spec-label">How this runs</p>
            <p className="ax-demo__honesty">{honesty}</p>
          </div>

          <ul className="ax-demo__tags" aria-label="Capabilities demonstrated">
            {technologies.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className="ax-demo__stage">
        <Demo />
      </div>
    </section>
  );
}
