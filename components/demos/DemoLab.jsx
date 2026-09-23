"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePopup } from "@/components/PopupContext";
import MaskHeading from "@/components/motion/MaskHeading";
import Reveal from "@/components/motion/Reveal";
import DemoSection from "@/components/demos/DemoSection";
import LabMap from "@/components/demos/LabMap";
import LabRail from "@/components/demos/LabRail";
import { demos } from "@/components/demos/demos.data";

/**
 * /demos — the AI Lab, page body.
 *
 * Structurally this is the contact page's shape: a dark hero band stating
 * what the page is, then content on the light ground the rest of the site
 * uses. The hero carries the module map on its right — the four modules
 * drawn against the one capability stack — which also serves as the table
 * of contents. Below it, a rail sticks under the navigation for as long as
 * the modules run, so the page never loses its place.
 */

/* Where each module ends up in production. The closing band's argument is
   that these are parts, not products; this is the list of wholes. */
const WHOLES = [
  { part: "Transaction scoring", whole: "Card fraud and AML decisioning" },
  { part: "Document extraction", whole: "Revenue-cycle and onboarding automation" },
  { part: "Intent routing", whole: "Voice and chat agents with human handoff" },
  { part: "Grounded retrieval", whole: "Internal policy and knowledge assistants" },
];

function Arrow({ d = "M5 12h13M13 6l6 6-6 6" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DemoLab() {
  const { startTransition } = usePopup();
  const bodyRef = useRef(null);

  const toContact = (e) => {
    e.preventDefault();
    startTransition("/contact");
  };

  return (
    <main className="ax-lab">
      {/* ---------------- hero ---------------- */}
      <header className="ax-lab__hero">
        <div className="ax-lab__hero-grid" aria-hidden="true" />
        <div className="ax-lab__hero-glow" aria-hidden="true" />

        <div className="padding-global">
          <div className="container-large">
            <div className="ax-lab__hero-layout">
              <div className="ax-lab__hero-inner">
                <p className="ax-kicker ax-kicker--invert">
                  <span>AI</span>
                  Lab · Live systems
                </p>

                <h1 className="ax-lab__title">
                  <MaskHeading text={"See the reasoning,\n*not just the answer.*"} delay={0.1} />
                </h1>

                <Reveal variant="rise" delay={0.35} immediate>
                  <p className="ax-lab__lede">
                    Four working modules from the systems we build — transaction
                    decisioning, document intelligence, conversational routing and
                    grounded retrieval. Each runs live against our own service and
                    shows its working: the reason codes, the source spans, the
                    confidence, the citations. Change the input and watch the
                    reasoning move.
                  </p>
                </Reveal>

                <Reveal variant="rise" delay={0.5} immediate className="ax-lab__hero-actions">
                  <a href={`#${demos[0].id}`} className="ax-lab__cta">
                    Enter the lab
                    <Arrow d="M12 5v13M6 13l6 6 6-6" />
                  </a>

                  <Link href="/contact" className="ax-lab__ghost" onClick={toContact}>
                    Bring us your workflow
                    <Arrow d="M9 5l7 7-7 7" />
                  </Link>
                </Reveal>
              </div>

              <Reveal variant="rise" delay={0.6} immediate className="ax-lab__hero-map">
                <LabMap />
              </Reveal>
            </div>
          </div>
        </div>
      </header>

      {/* ---------------- the modules ---------------- */}
      <div className="ax-lab__body" ref={bodyRef}>
        <LabRail watchRef={bodyRef} />

        <div className="padding-global">
          <div className="container-large">
            <div className="ax-lab__demos">
              {demos.map((demo, i) => (
                <DemoSection key={demo.id} demo={demo} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- close ---------------- */}
      <section className="ax-lab__close" aria-labelledby="lab-close-title">
        <div className="ax-lab__hero-grid" aria-hidden="true" />
        <div className="padding-global">
          <div className="container-large">
            <div className="ax-lab__close-layout">
              <Reveal variant="rise" className="ax-lab__close-inner">
                <p className="ax-kicker ax-kicker--invert">
                  <span>→</span>
                  From module to system
                </p>
                <h2 id="lab-close-title">These are capabilities, not products.</h2>
                <p>
                  Each module above is one piece of something larger. What we build
                  is the whole of it — wired into your systems, governed by your
                  policy, and accountable to the people who sign off its output.
                </p>
                <Link href="/contact" className="ax-lab__close-cta" onClick={toContact}>
                  Tell us the workflow
                  <Arrow />
                </Link>
              </Reveal>

              <Reveal variant="stagger" selector="li" className="ax-lab__wholes-wrap">
                <ol className="ax-lab__wholes">
                  {WHOLES.map((w, i) => (
                    <li key={w.part}>
                      <span className="ax-lab__wholes-n">{String(i + 1).padStart(2, "0")}</span>
                      <span className="ax-lab__wholes-part">{w.part}</span>
                      <span className="ax-lab__wholes-arrow" aria-hidden="true">
                        <Arrow />
                      </span>
                      <span className="ax-lab__wholes-whole">{w.whole}</span>
                    </li>
                  ))}
                </ol>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
