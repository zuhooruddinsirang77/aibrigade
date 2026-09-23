"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePopup } from "@/components/PopupContext";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";
import Reveal from "@/components/motion/Reveal";
import Parallax from "@/components/motion/Parallax";
import Kicker from "@/components/motion/Kicker";
import SystemVisual from "@/components/motion/SystemVisual";
import TiltCard from "@/components/motion/TiltCard";
import GemCore from "@/components/motion/GemCore";
import AmbientVideo from "@/components/motion/AmbientVideo";
import ActReveal from "@/components/motion/ActReveal";
import { filmFor } from "@/components/video.data";
import { useCaseHref } from "@/components/usecases.data";

const CDN = "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617";

/**
 * The three acts, as data — three of the flagship builds, each told as
 * the chain it runs and linking to its own use-case page.
 *
 * These were three client case studies (ICU Capital, Meridian Capital,
 * UUB Health) whose clients and metrics were placeholders. The acts now
 * tell products we have built: `body` is each product's own copy (its
 * overview document where there is one, components/projects.data.js
 * otherwise), and `title` is the same chain the flagship strip above and
 * the use-case page both draw.
 *
 * `decs` are the Webflow decoration classes each row already carried —
 * large blurred colour blobs (coral, violet, green) that sit behind the
 * film inside the media panel. They are this section's existing colour
 * atmosphere and they stay exactly as they were.
 */
/* The four flagship builds, each stated as the chain it actually runs.
   These are products, not engagements — they are what lets the three
   client stories below read as delivery rather than as the only four
   things we have ever done. The chains are deliberately terse: a reader
   scanning this strip should be able to tell in one line what the system
   takes in and what it does about it.

   `steps` is that chain split into its stages so the card can draw it as
   a pipeline — input at the top, outcome at the bottom — rather than as
   a sentence with arrows typed into it. `icon` is one or more 24×24
   stroke paths, the same line weight as the act links' arrow. */
const PROOF = [
  {
    name: "AXON",
    steps: ["Voice", "Understand", "Execute supported banking workflows"],
    tone: "teal",
    // waveform
    icon: ["M4 10v4", "M8 7v10", "M12 4v16", "M16 7v10", "M20 10v4"],
  },
  {
    name: "Live Fraud",
    steps: ["Transaction", "Score", "Explain", "Intervene / route"],
    tone: "coral",
    // shield
    icon: ["M12 3l7 3v5c0 4.5-3 8.4-7 10-4-1.6-7-5.5-7-10V6l7-3z", "M9 12l2 2 4-4"],
  },
  {
    name: "Outbound AI",
    steps: ["Call", "Converse", "Capture", "Update", "Escalate"],
    tone: "blue",
    // outgoing call
    icon: [
      "M5 4h3.5l1.8 4.5-2.3 1.4a11 11 0 005.1 5.1l1.4-2.3 4.5 1.8V18a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z",
      "M15 3h6v6",
      "M21 3l-6 6",
    ],
  },
  {
    name: "Private LLM",
    steps: ["Retrieve private knowledge", "Reason", "Assist"],
    tone: "violet",
    // lock
    icon: [
      "M7 11h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2z",
      "M8.5 11V8a3.5 3.5 0 017 0v3",
    ],
  },
];

/* How long the signal takes to travel from one stage to the next. Passed
   to the stylesheet as `--step`, so the CSS delays and the JS hold below
   are working from the same number. */
const STEP_MS = 240;
/* How long each card stays lit during the intro. One value for all four,
   sized to the longest chain, so the wave leaves left to right in the
   same order it arrived instead of the short chains dropping out first. */
const INTRO_HOLD_MS = Math.max(...PROOF.map((p) => p.steps.length)) * STEP_MS + 600;

/**
 * One flagship build, as a pipeline that can be run.
 *
 * "Running" is a single `data-run` flag; everything it does — the stages
 * lighting in order, the thread filling between them, the outcome node
 * pinging, the icon redrawing — is CSS keyed off it and off each stage's
 * `--i`. What this component decides is only WHEN it runs:
 *
 *   - Fine pointer: while hovered. And once, unprompted, the first time
 *     the strip comes into view — the four cards run one after another
 *     and settle — because a card that only moves under the cursor gives
 *     no sign it will until someone happens to cross it.
 *   - Touch: while the card sits in the middle band of the screen, which
 *     is the closest thing a phone has to pointing at something.
 *
 * Under reduced motion the one-time intro is skipped, and the stylesheet
 * turns the rest into an instant state change rather than a sequence.
 */
function ProofCard({ p, i }) {
  const ref = useRef(null);
  const hovered = useRef(false);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const timers = [];
    let io;

    if (fine) {
      if (prefersReducedMotion()) return;
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          timers.push(
            setTimeout(() => {
              setRun(true);
              timers.push(
                setTimeout(() => {
                  if (!hovered.current) setRun(false);
                }, INTRO_HOLD_MS)
              );
            }, 450 + i * 380)
          );
        },
        { threshold: 0.6 }
      );
    } else {
      io = new IntersectionObserver(([entry]) => setRun(entry.isIntersecting), {
        rootMargin: "-32% 0px -32% 0px",
      });
    }

    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [i]);

  /* Touch fires enter/leave around every tap; on touch the observer above
     is the only thing that should be driving this. */
  const onEnter = (e) => {
    if (e.pointerType === "touch") return;
    hovered.current = true;
    setRun(true);
  };
  const onLeave = (e) => {
    if (e.pointerType === "touch") return;
    hovered.current = false;
    setRun(false);
  };

  return (
    <li className="ax-proof__item" data-tone={p.tone}>
      <TiltCard max={5} lift={6} perspective={1200} glare={false}>
        <div
          ref={ref}
          className="ax-proof__card"
          data-run={run ? "" : undefined}
          style={{ "--step": `${STEP_MS}ms` }}
          onPointerEnter={onEnter}
          onPointerLeave={onLeave}
        >
          <div className="ax-proof__top">
            <span className="ax-proof__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                {p.icon.map((d) => (
                  <path
                    key={d}
                    d={d}
                    pathLength="1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
              </svg>
            </span>
            <span className="ax-proof__index">{String(i + 1).padStart(2, "0")}</span>
          </div>

          <h3 className="ax-proof__name">{p.name}</h3>

          <ol className="ax-proof__steps" aria-label={`${p.name} pipeline`}>
            {p.steps.map((s, n) => (
              <li className="ax-proof__step" key={s} style={{ "--i": n }}>
                <span className="ax-proof__node" aria-hidden="true" />
                {s}
              </li>
            ))}
          </ol>
        </div>
      </TiltCard>
    </li>
  );
}

const ACTS = [
  {
    id: "fraud-detection",
    href: useCaseHref("fraud-detection"),
    sector: "Fintech",
    name: "Fraud Detection",
    title: "Transaction → score → explain → intervene",
    body: "Real-time fraud detection for banks and financial platforms. Every transaction is scored as it is submitted, the factors behind the score are written out in plain language, and risky activity is blocked, sent for review or stepped up to multi-factor authentication — without slowing a legitimate trade.",
    film: filmFor.cases["fraud-detection"],
    visual: "stream",
    decs: ["cases_dec-1", "cases_dec-2"],
  },
  {
    id: "axon",
    href: useCaseHref("axon"),
    sector: "Banking",
    name: "Axon",
    title: "Voice → understand → execute",
    body: "An AI assistant inside a mobile banking app. Customers ask about balances, transactions and spending in their own words, then move money and settle bills by voice or chat — in English, Arabic or Urdu.",
    film: filmFor.cases.axon,
    visual: "assist",
    decs: ["cases_dec-3", "cases_dec-4"],
  },
  {
    id: "incall",
    href: useCaseHref("incall"),
    sector: "Call center",
    name: "InCall",
    title: "Call → converse → capture → update → escalate",
    body: "An outbound voice agent that speaks naturally across languages and reads intent in real time — qualifying leads, booking appointments and answering queries, and transferring the calls that need a person to the right representative.",
    film: filmFor.cases.incall,
    visual: "call",
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
  const { startTransition } = usePopup();

  const go = (href) => (e) => {
    e.preventDefault();
    startTransition(href);
  };

  return (
    <div id="cases" className="section_cases position-relative ax-cases">
      <div className="padding-global">
        <div className="container-large">
          <div className="ax-cases__head">
            <Kicker id="cases" label="Proof before promise" />
            <Reveal variant="rise" className="ax-cases__headline">
              <h2 className="gradient-background heading-gradient-60pt-ipad-pro">
                Built. <br />
                Not conceptual.
              </h2>
              <p className="p2 max-width-medium _3 _4 text-16pt-ipad_pro margin-top-zero-ipad-pro">
                Our product portfolio demonstrates the core capabilities required to make
                enterprise agents useful in the real world &mdash; not in a pitch.
              </p>
            </Reveal>

            <p className="ax-proof__label">
              <span>Flagship builds</span>
              <span className="ax-proof__label-rule" aria-hidden="true" />
            </p>

            <Reveal variant="stagger" selector=".ax-proof__item" className="ax-proof" as="ul">
              {PROOF.map((p, i) => (
                <ProofCard key={p.name} p={p} i={i} />
              ))}
            </Reveal>

            <Reveal variant="rise" className="ax-proof__note">
              <p>
                Eight demo-ready AI products. Reusable engineering capabilities. New
                workflows built on proven components.
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
                  {act.sector} &middot; {act.name}
                </span>
              </p>

              <h3 className="ax-act__title">{act.title}</h3>
              <p className="ax-act__body">{act.body}</p>

              <a href={act.href} className="ax-act__link" onClick={go(act.href)}>
                <span>see the use case</span>
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
              {/* No `data-cursor="view"` — that state's opaque, labelled
                  badge (app/immersive.css) kept sitting over the console's
                  live numbers no matter how small or translucent it got.
                  Falling through to the plain "link" ring (a thin outline,
                  no fill, no label) says "clickable" without ever
                  obscuring the thing it's pointing at. */}
              <a
                href={act.href}
                className="ax-act__media"
                aria-label={`${act.name}: ${act.title} — see the use case`}
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
                  <div className="heading-style-h1 big heading-80pt-ipad_pro">Bring</div>
                </div>
                <div className="heading-style-h1 _2">
                  us one <span className="text-color-black">&lt;</span>problem
                  <span className="text-color-black">&gt;</span>
                </div>
                <div className="heading-style-h1 _2">to start.</div>
                <div className="div-block-3">
                  <Link
                    href="/contact"
                    className="link fill w-inline-block"
                    onClick={(e) => {
                      e.preventDefault();
                      startTransition("/contact");
                    }}
                  >
                    <div className="link_fill_text_wrapper">
                      <div className="body20 text-weight-medium _20">Bring us one problem</div>
                      <div className="button_line_box">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`${CDN}/641c7d69b358b24cc0dac8fe_Vector%20(6).svg`}
                          alt=""
                          className="button_line_arrow arrow"
                        />
                      </div>
                    </div>
                  </Link>
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
