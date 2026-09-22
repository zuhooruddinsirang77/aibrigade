"use client";

import Link from "next/link";
import { usePopup } from "@/components/PopupContext";
import MaskHeading from "@/components/motion/MaskHeading";
import Reveal from "@/components/motion/Reveal";
import DemoSection from "@/components/demos/DemoSection";
import { demos } from "@/components/demos/demos.data";

/**
 * /demos — the page body.
 *
 * Structurally this is the contact page's shape: a dark hero band stating
 * what the page is, then content on the light ground the rest of the site
 * uses. Nothing here introduces a new layout idiom; the demos themselves
 * are the only new object on the page and they reuse the console chrome
 * from /contact.
 *
 * The index between the hero and the first demo exists because these
 * sections are long. Four full-height demos with no way to see what is
 * below them is a page a reader leaves at the second one.
 */
export default function DemoLab() {
  const { startTransition } = usePopup();

  return (
    <main className="ax-lab">
      {/* ---------------- hero ---------------- */}
      <header className="ax-lab__hero">
        <div className="ax-lab__hero-grid" aria-hidden="true" />

        <div className="padding-global">
          <div className="container-large">
            <div className="ax-lab__hero-inner">
              <p className="ax-kicker ax-kicker--invert">
                <span>AI</span>
                Demo lab
              </p>

              <h1 className="ax-lab__title">
                <MaskHeading text={"Explore our\nAI demos"} delay={0.1} />
              </h1>

              <Reveal variant="rise" delay={0.35} immediate>
                <p className="ax-lab__lede">
                  Interactive demonstrations of the capabilities behind the systems
                  we build — decisioning, document understanding, conversational
                  routing and grounded retrieval. Each one runs live in your
                  browser against our own service. Read what it does, then put your
                  own input through it.
                </p>
              </Reveal>

              <Reveal variant="rise" delay={0.5} immediate className="ax-lab__hero-actions">
                <a href={`#${demos[0].id}`} className="ax-lab__cta">
                  Start with the first demo
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 5v13M6 13l6 6 6-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>

                <Link
                  href="/contact"
                  className="ax-lab__ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    startTransition("/contact");
                  }}
                >
                  Bring us your workflow
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M9 5l7 7-7 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </header>

      {/* ---------------- index ---------------- */}
      <nav className="ax-lab__index" aria-label="Demos on this page">
        <div className="padding-global">
          <div className="container-large">
            <ol>
              {demos.map((d, i) => (
                <li key={d.id}>
                  <a href={`#${d.id}`}>
                    <span className="ax-lab__index-n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="ax-lab__index-body">
                      <span className="ax-lab__index-title">{d.title}</span>
                      <span className="ax-lab__index-summary">{d.summary}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </nav>

      {/* ---------------- the demos ---------------- */}
      <div className="padding-global">
        <div className="container-large">
          <div className="ax-lab__demos">
            {demos.map((demo, i) => (
              <DemoSection key={demo.id} demo={demo} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- close ---------------- */}
      <section className="ax-lab__close" aria-labelledby="lab-close-title">
        <div className="padding-global">
          <div className="container-large">
            <Reveal variant="rise" className="ax-lab__close-inner">
              <h2 id="lab-close-title">
                These are capabilities, not products.
              </h2>
              <p>
                Each demo above is one piece of something larger — the scoring
                under a fraud system, the extraction under a revenue-cycle
                workflow, the routing under a voice agent, the retrieval under an
                internal assistant. What we build is the whole of it, against your
                systems and your policy.
              </p>
              <Link
                href="/contact"
                className="ax-lab__close-cta"
                onClick={(e) => {
                  e.preventDefault();
                  startTransition("/contact");
                }}
              >
                Tell us the workflow
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M5 12h13M13 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
