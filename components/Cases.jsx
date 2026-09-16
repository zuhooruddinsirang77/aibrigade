"use client";

import { usePopup } from "@/components/PopupContext";
import Reveal from "@/components/motion/Reveal";
import Parallax from "@/components/motion/Parallax";
import Kicker from "@/components/motion/Kicker";
import SystemVisual from "@/components/motion/SystemVisual";
import TiltCard from "@/components/motion/TiltCard";
import GemCore from "@/components/motion/GemCore";
import AmbientVideo from "@/components/motion/AmbientVideo";
import ActReveal from "@/components/motion/ActReveal";
import { filmFor } from "@/components/video.data";

const CDN = "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617";

/**
 * The three cases, as data.
 *
 * `title` and `body` are the homepage's own copy, moved out of the markup
 * unchanged — deliberately NOT sourced from `casestudies.data.js`, whose
 * `dek` for each client is written differently for the long-form page.
 * `sector` and `client` are the only things read across from there, and
 * both are facts that file already states and both case-study pages
 * already print; nothing is claimed here that wasn't claimed before.
 *
 * `decs` are the Webflow decoration classes each row already carried —
 * large blurred colour blobs (coral, violet, green) that sit behind the
 * film inside the media panel. They are this section's existing colour
 * atmosphere and they stay exactly as they were.
 */
const ACTS = [
  {
    id: "icu",
    href: "/icu",
    sector: "Fintech",
    client: "ICU Capital",
    title: "Real-time fraud detection for a regional bank",
    body: "AIBrigade built an autonomous fraud detection system for ICU Capital, a self-contained asset and investment management company. It provides real-time transaction monitoring, explainable risk scoring, and multi-factor authentication for a secure, flawless user experience.",
    film: filmFor.cases.icu,
    visual: "stream",
    decs: ["cases_dec-1", "cases_dec-2"],
  },
  {
    id: "halyk",
    href: "/halyk",
    sector: "Fintech",
    client: "Meridian Capital",
    title: "Autonomous underwriting for a leading investment bank",
    body: "Meridian Capital is a leading investment bank serving clients nationwide. AIBrigade built a decision intelligence workflow that automates underwriting while keeping every decision auditable and compliant.",
    film: filmFor.cases.halyk,
    visual: "split",
    decs: ["cases_dec-3", "cases_dec-4"],
  },
  {
    id: "uub",
    href: "/uub",
    sector: "Healthtech",
    client: "UUB Health",
    title: "A HIPAA-compliant clinical documentation copilot",
    body: "UUB Health is a growing multi-site clinical network. AIBrigade built a HIPAA-compliant documentation copilot, integrated with Epic via HL7 FHIR, that reduces clinician charting time and improves clinical efficiency.",
    film: filmFor.cases.uub,
    visual: "draft",
    decs: [],
  },
];

/**
 * Evidence — three acts.
 *
 * This was a 2×4 grid of `.cases_item` boxes, and the Webflow class doing
 * the work was `padding: 18rem 4.375rem 6.25rem` with `text-align: center`
 * and a 1px border. Three consequences, all of them the reason the section
 * read as filler rather than as the strongest thing on the page:
 *
 *   - Every row was a bordered rounded rectangle on white — the visual
 *     grammar of a blog index, applied to the only proof this company has.
 *   - 18rem of top padding inside each box, plus 6.25rem above and below
 *     each row, put the better part of a screen of empty white between one
 *     case and the next. Not negative space: dead space. It had no
 *     compositional job and nothing was placed against it.
 *   - Centred copy in a half-width column, which is neither the most
 *     readable setting nor a confident one.
 *
 * What replaces it is the same three cases and the same words, composed:
 * each is a full act with the media panel running off the edge of the
 * screen, the copy set against it in the opposite gutter on a real
 * typographic hierarchy, and the two sides alternating down the page. The
 * bleed is the point — it is the difference between a picture in a box and
 * a frame that continues past the window — and it needs `--ax-bleed`
 * (measured in MotionProvider) because CSS cannot work that distance out
 * for a grid item on its own.
 *
 * `ActReveal` then ties the two halves together on scroll, so an act
 * arrives as one move rather than as two boxes fading in side by side.
 */
export default function Cases() {
  const { openPopup, startTransition } = usePopup();

  const go = (href) => (e) => {
    e.preventDefault();
    startTransition(href);
  };

  return (
    <div id="cases" className="section_cases position-relative ax-cases">
      <div className="padding-global">
        <div className="container-large">
          <div className="ax-cases__head">
            <Kicker id="cases" label="Evidence" />
            <Reveal variant="rise" className="ax-cases__headline">
              <h2 className="gradient-background heading-gradient-60pt-ipad-pro">
                Prominent <br />
                Cases
              </h2>
              <p className="p2 max-width-medium _3 _4 text-16pt-ipad_pro margin-top-zero-ipad-pro">
                Production-grade AI systems we&rsquo;ve deployed for fintech and healthtech
                organizations nationwide.
              </p>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="padding-global">
        <div className="container-large">
          <div className="ax-acts">
        {ACTS.map((act, i) => (
          <ActReveal
            key={act.id}
            className="ax-act"
            /* Which side the media runs off. Alternating is what keeps the
               eye moving down the page instead of settling into a column,
               and it is what makes the three read as a sequence. */
            data-side={i % 2 === 0 ? "right" : "left"}
          >
            <div className="ax-act__copy">
              <p className="ax-act__meta">
                <span className="ax-act__index">{String(i + 1).padStart(2, "0")}</span>
                <span className="ax-act__rule" aria-hidden="true" />
                <span>
                  {act.sector} &middot; {act.client}
                </span>
              </p>

              <h3 className="ax-act__title">{act.title}</h3>
              <p className="ax-act__body">{act.body}</p>

              <a href={act.href} className="ax-act__link" onClick={go(act.href)}>
                <span>learn more</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M5 12h13M13 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>

            {/* `max` is lower than the old tiles used: these panels are much
                larger now and run off the screen edge, and a big surface
                rotating by the same angle as a small one reads as the whole
                page tipping rather than as one object leaning. */}
            <TiltCard max={3.5} lift={6} depth={30} perspective={1400}>
              <a
                href={act.href}
                className="ax-act__media"
                data-cursor="view"
                aria-label={`${act.title} — read the case study`}
                onClick={go(act.href)}
              >
                <AmbientVideo film={act.film} className="ax-case__film" data-lift="far" />
                {act.decs.map((d) => (
                  <div className={d} key={d} />
                ))}
                <SystemVisual variant={act.visual} data-lift="" />
              </a>
            </TiltCard>
          </ActReveal>
        ))}
          </div>
        </div>
      </div>

      <div className="padding-global">
        <div className="container-large">
          {/* The closing invitation is not a fourth case study, so it keeps
              a block of its own rather than pretending to be one. */}
          <div className="ax-cases__cta">
            <div className="cases_item grad1">
              {/* This card was the one full-bleed flat image left on the
                  page — a static violet gradient .webp behind a 3D gem
                  render, next to three case tiles that had all just been
                  given real footage. It keeps its identity as the site's
                  one flagship violet-brand block (the gradient wash below
                  is still the dominant thing you see) but now has actual
                  motion under that wash instead of a flat PNG-shaped
                  gradient. */}
              <AmbientVideo film="energy" className="ax-cases-cta__film" />
              {/* Was a still of this object. It is the largest brand render
                  on the page and sits on the one card that asks for a
                  decision, so it is the right place for the crystal to
                  actually be a crystal — turning, catching the palette,
                  leaning toward the pointer. `Parallax` still drives its
                  drift; `GemCore` only replaces what is inside the frame,
                  and falls back to this exact still wherever WebGL can't or
                  shouldn't run. */}
              <Parallax speed={-22}>
                <GemCore
                  className="cases_dec-5"
                  src={`${CDN}/642d51c99450cf1e66ed1397_pisma_glass_1.webp`}
                  alt="Transparent purple faceted gem."
                  size={360}
                  spin={120}
                />
              </Parallax>
              <div className="cases_text_wrapper text-color-white">
                <div className="cases_text_top">
                  <div className="heading-style-h1 big heading-80pt-ipad_pro">Will</div>
                </div>
                <div className="heading-style-h1 _2">
                  your <span className="text-color-black">&lt;</span>app
                  <span className="text-color-black">&gt;</span>
                </div>
                <div className="heading-style-h1 _2">be next?</div>
                <div className="div-block-3">
                  <a
                    href="#"
                    className="link fill w-inline-block"
                    onClick={(e) => {
                      e.preventDefault();
                      openPopup();
                    }}
                  >
                    <div className="link_fill_text_wrapper">
                      <div className="body20 text-weight-medium _20">Request Free Strategy Session</div>
                      <div className="button_line_box">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`${CDN}/641c7d69b358b24cc0dac8fe_Vector%20(6).svg`}
                          alt=""
                          className="button_line_arrow arrow"
                        />
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              {/* Was the `bg_corner45_violet.webp` flat gradient image this
                  card used before the film above replaced it. Kept as a
                  pure CSS wash now — see `.ax-cases-cta__wash` — rather
                  than a second image, since its whole job is colour, not
                  content. */}
              <div className="ax-cases-cta__wash" aria-hidden="true" />
            </div>
          </div>
          <div id="cases-end" className="anchor-cases" />
        </div>
      </div>
    </div>
  );
}
