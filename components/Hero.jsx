"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePopup } from "@/components/PopupContext";
import MaskHeading from "@/components/motion/MaskHeading";
import Magnetic from "@/components/motion/Magnetic";
import Reveal from "@/components/motion/Reveal";
import Kicker from "@/components/motion/Kicker";
import StageDepth from "@/components/motion/StageDepth";
import ScrollCue from "@/components/motion/ScrollCue";
import IntelligenceSystem from "@/components/motion/IntelligenceSystem";

/**
 * The ticker's trust row — our own project clients, not stock Webflow
 * logo files. Where a real logo has been dropped into /public, it's used
 * as an image; the rest fall back to a plain wordmark at the same visual
 * weight (see `.ticker_wordmark` in film.css) until a file exists for them.
 */
const tickerLogos = [
  { name: "Zindagi", src: "/Zindagi.png" },
  { name: "BankIslami", src: "/bank-islami-logo.png" },
  { name: "JS Bank", src: "/js-bank-logo.png" },
  { name: "Easypaisa", src: "/Easypaisa-logo.png" },
   { name: "Zindagi Health", src: "/Zindagi-Health.png" },

  {name:"Crédit Agricole",src: "/creditagricole.png" },
  { name: "Aik Islami", src: "/logo-aik-islamic.svg" },

];

/**
 * The first screen.
 *
 * Two columns on a dark ground: the claim on the left, a system running on
 * the right. What stood here before was centred copy over three
 * crossfading stock clips — hands on a laptop, a hologram reading "AI
 * AGENTS" — with a WebGL mote field over the footage, a tab row cycling
 * the clips, and a proof strip printing placeholder metrics. Every one of
 * those said "AI" the way a stock library says it. This says what the
 * company does: intelligence, engineered for production.
 *
 * The copy is the site's own. "Custom AI systems for Fintech & HealthTech"
 * (the previous H1, and the page title) becomes the eyebrow, so the
 * positioning is still the first thing read; the lede is Featured's own
 * paragraph and the old Overview line, cut to two sentences; the trust
 * line under the buttons is the vocabulary Featured and Services already
 * use. The primary action and its destination are unchanged.
 *
 * `IntelligenceSystem` replaces the footage and the mote field. It is one
 * SVG and a few dozen words — no video, no canvas, no three.js — so the
 * hero no longer downloads a clip or spins up a GPU context before the
 * reader has read a word. `StageDepth` stays: the backdrop, the copy and
 * the visual sit at three depths, part slightly under the pointer and
 * pull apart as the section leaves. Under reduced motion all of that is
 * inert and the layout is exactly what the stylesheet says.
 */
export default function Hero() {
  const { startTransition } = usePopup();
  const sectionRef = useRef(null);

  return (
    <StageDepth
      as="header"
      id="header"
      hostRef={sectionRef}
      className="section_header ax-hero"
      travel={10}
      sway={18}
      push={0.06}
    >
      {/* The ground: the engineering grid the dark bands further down the
          page already carry, with one violet wash behind the visual — the
          hero and the project showcase are the same room. */}
      <div className="ax-hero__backdrop" data-depth="1" aria-hidden="true" />

      {/* No `data-fade` on the copy layer. On a phone the hero runs taller
          than the viewport, so the drawing at its foot was already fading
          out by the time a reader had scrolled far enough to see it. */}
      <div className="ax-hero__body" data-depth="0.1">
        <div className="padding-global">
          <div className="container-large">
            <div className="ax-hero__grid">
              <div className="ax-hero__copy">
                <Kicker id="header" label="Custom AI systems · Fintech & HealthTech" tone="hero" />

                <h1 className="ax-hero__title">
                  <MaskHeading text={"Intelligence,\nengineered\nfor production."} delay={0.15} />
                </h1>

                {/* `immediate`: the first screen reveals as a function of
                    the page having loaded, not of a scroll that may never
                    happen. See the note on the prop in Reveal.jsx. */}
                <Reveal variant="rise" delay={0.45} immediate>
                  <p className="ax-hero__lede">
                    We design and build production-grade AI systems for fintech and
                    healthcare &mdash; copilots, automation agents and decision
                    intelligence &mdash; from first discovery to a system your team runs
                    every day.
                  </p>
                </Reveal>

                <Reveal variant="rise" delay={0.58} immediate className="ax-hero__actions">
                  <Magnetic>
                    <Link
                      id="OpenPop"
                      href="/contact"
                      className="ax-hero__cta"
                      onClick={(e) => {
                        e.preventDefault();
                        startTransition("/contact");
                      }}
                    >
                      {/* Not "Request Free Strategy Session".
                          Three problems in four words: *free* prices the
                          engagement before the buyer does, on a page
                          selling six-figure implementations; *strategy
                          session* is what an agency sells, not what an
                          infrastructure company books; and it did not
                          match the button in the bar directly above it,
                          so the same action had two names on one screen.
                          This is the navigation's label, exactly. */}
                      Book a technical review
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
                  </Magnetic>

                  <a
                    href="#reels"
                    className="ax-hero__ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById("reels")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    See the work
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
                  </a>
                </Reveal>

                {/* What the systems are made of — the vocabulary Featured
                    and Services already use, nothing added. */}
                <Reveal variant="rise" delay={0.72} immediate as="ul" className="ax-hero__trust" aria-label="What we build">
                  <li>AI agents</li>
                  <li>Decision intelligence</li>
                  <li>Automation</li>
                  <li>HIPAA-compliant infrastructure</li>
                </Reveal>
              </div>

              <div className="ax-hero__visual" data-depth="0.32">
                <IntelligenceSystem />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The hero fills the viewport and ends on a logo ticker, which from
          a standing start looks like the bottom of the page rather than the
          top of a long one. This says there is more, and stops saying it
          the moment the reader acts on it. */}
      <ScrollCue targetId="whyus" />

      {/* A row of bank and health marks with nothing saying what they are
          is ambiguous — client, partner, integration, customer of a
          customer. Four words fix it, and they are the same claim the
          `tickerLogos` list above already makes. Hidden on phones, where
          the strip has no room for a label and the logos beside it. */}
      <div className="header_ticker">
        <div className="padding-global">
          {/* The label sits inside the page's own container so it starts on
              the same left edge as the headline; the marquee takes the
              rest of the row. */}
          <div className="container-large ax-hero__ticker-inner">
            <span className="ax-hero__ticker-label" aria-hidden="true">
              Trusted by teams at
            </span>
            <div className="ticker_component">
              <div className="ticker_move">
                {[0, 1].map((row) => (
                  <div className="ticker_wrapper" key={row}>
                    {tickerLogos.map((logo, i) =>
                      logo.src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logo.src}
                          alt={logo.name}
                          className="ticker_image ticker_logo-img"
                          key={i}
                        />
                      ) : (
                        <span className="ticker_image ticker_wordmark" key={i}>
                          {logo.name}
                        </span>
                      )
                    )}
                    <div className="ticker_div-ipad-pro" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StageDepth>
  );
}
