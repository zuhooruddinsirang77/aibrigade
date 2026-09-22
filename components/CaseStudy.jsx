"use client";

import { useMemo, useState } from "react";
import { usePopup } from "@/components/PopupContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CtaDark from "@/components/CtaDark";
import MaskHeading from "@/components/motion/MaskHeading";
import Magnetic from "@/components/motion/Magnetic";
import Reveal from "@/components/motion/Reveal";
import Parallax from "@/components/motion/Parallax";
import Counter from "@/components/motion/Counter";
import TerminalFeed from "@/components/motion/TerminalFeed";
import { caseStudies, getCaseStudy } from "@/components/casestudies.data";
import { films, filmFor } from "@/components/video.data";

const CDN = "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617";

// Mirrors the reel empty-state in Deployments.jsx: a specific case's own
// chapter captions typed out as a terminal log stand in for footage that
// doesn't exist yet, so a broken/missing video reads as "this case is
// running" instead of "this page is unfinished."
/* The source resolution below is Deployments.jsx's `sourceFor`, and it is
   here because this component asked for `deployment.src` alone. No entry in
   deployments.data.js carries `src` — the /public/reels files they used to
   point at were never added, which is written up at the top of that file —
   so every case study rendered `<video src={undefined}>`: an element that
   loads nothing, fires no `error`, and paints a black 16:9 rectangle where
   the outcome footage should be. `films[...]` is the reference clip the
   rest of the site falls back to, and a real capture in `src` still wins. */
function ReelEmbed({ deployment, client }) {
  const src =
    deployment.src || films[deployment.film || filmFor.reels?.[deployment.id]]?.src || null;
  const [failed, setFailed] = useState(!src);
  const terminalLines = useMemo(
    () =>
      deployment.chapters.flatMap((c) => [
        { prompt: true, text: `aibrigade run ${c.stage.toLowerCase()}` },
        { text: `> ${c.caption}` },
      ]),
    [deployment]
  );

  return (
    <div className="ax-case__screen" data-cursor={failed ? undefined : "play"}>
      {failed ? (
        <div className="ax-case__empty">
          <TerminalFeed
            lines={terminalLines}
            title={`${client.toLowerCase()} — ${deployment.id}`}
            className="ax-case__empty-terminal"
          />
        </div>
      ) : (
        <video
          className="ax-case__video"
          src={src}
          poster={deployment.poster}
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export default function CaseStudy({ slug }) {
  const { openPopup, startTransition } = usePopup();
  const study = getCaseStudy(slug);

  const go = (href) => (e) => {
    e.preventDefault();
    startTransition(href);
  };

  if (!study) return null;
  const { deployment } = study;
  const others = Object.values(caseStudies).filter((c) => c.slug !== slug);

  /* Only read when this case has no product shot — see the hero's second
     branch. `undefined` leaves TerminalFeed on its own generic pipeline
     log, which is the right fallback for a case with no chapters either. */
  const heroLog = deployment?.chapters?.flatMap((c) => [
    { prompt: true, text: `aibrigade run ${c.stage.toLowerCase()}` },
    { text: `> ${c.caption}` },
  ]);

  return (
    <>
      <Navbar />
      <main className="ax-case">
        <section className="ax-case__hero">
          {/* The `HeroNetwork` canvas that used to sit here is gone. Two
              reasons: full-bleed it drew forty hairlines and a dozen lit
              nodes straight through the headline, and the drawing itself —
              the textbook four-layer node diagram — is the one picture
              every AI company's landing page already has. It said nothing
              about this work. The band now carries a violet bloom and a
              faint grid (app/casestudy.css), and the visual on the right is
              the thing that is actually specific to the case: the system
              that shipped. */}
          <div className="padding-global">
            <div className="container-large">
              <div className="ax-case__hero-grid">
                <div className="ax-case__hero-copy">
                  <a href="/#cases" className="ax-case__back" onClick={go("/#cases")}>
                    <span aria-hidden="true">←</span> All case studies
                  </a>
                  <span className="ax-case__eyebrow">{study.sector} case study</span>
                  {/* Not `.heading-style-h1.grad`. That is the home page's
                      display size on white — about 6rem here — and these
                      titles are seven and eight words long, so it produced a
                      five-line headline that overflowed the hero and ran
                      through both the network and the device shot. The class
                      below sizes for the sentence; `data-accent` keeps
                      Halyk's green identity in the gradient's far stop. */}
                  <h1 className="ax-case__title" data-accent={study.gradClass || undefined}>
                    <MaskHeading text={study.title} />
                  </h1>
                  <Reveal variant="rise" delay={0.2} className="ax-case__dek">
                    <p>{study.dek}</p>
                  </Reveal>

                  <div className="ax-case__hero-bottom">
                    {deployment ? (
                      <div className="ax-case__metric">
                        <span className="ax-case__metric-value">
                          <Counter to={Number(deployment.metric.value)} />
                          <em>{deployment.metric.unit}</em>
                        </span>
                        <span className="ax-case__metric-label">{deployment.metric.label}</span>
                      </div>
                    ) : null}
                    <Magnetic>
                      <a
                        href="#"
                        className="link fill w-inline-block"
                        onClick={(e) => {
                          e.preventDefault();
                          openPopup();
                        }}
                      >
                        <div className="link_fill_text_wrapper">
                          <div className="body20 text-weight-medium _20">Start a project like this</div>
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
                    </Magnetic>
                  </div>
                </div>

                {study.heroImg ? (
                  <Reveal variant="clip" className="ax-case__hero-visual">
                    <Parallax speed={-10}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={study.heroImg} alt={study.heroImgAlt} />
                    </Parallax>
                  </Reveal>
                ) : (
                  /* The one case with no product shot used to draw a
                     document glyph on a violet square — a piece of clip
                     art standing in for the work, next to a headline about
                     a clinical system. This case's own five stages, typed
                     out as a build log, is both specific to it and the
                     thing an engineer reading the page recognises. Same
                     panel `Deployments` uses when a reel has no footage. */
                  <Reveal variant="clip" className="ax-case__hero-visual ax-case__hero-visual--log">
                    <TerminalFeed
                      lines={heroLog}
                      title={`${study.client.toLowerCase()} — ${deployment?.id || slug}`}
                    />
                  </Reveal>
                )}
              </div>
            </div>
          </div>
        </section>

        {deployment ? (
          <section className="ax-case__process">
            <div className="padding-global">
              <div className="container-large">
                <Reveal variant="rise" className="ax-case__process-head">
                  <h2 className="gradient-background heading-gradient-60pt-ipad-pro">
                    How we <br />
                    built it
                  </h2>
                  <p className="p2 max-width-medium text-16pt-ipad_pro">
                    Five stages, one team, start to finish — the same process behind every
                    engagement we run.
                  </p>
                </Reveal>

                <Reveal variant="stagger" selector=".ax-case__stage" className="ax-case__stages">
                  {deployment.chapters.map((c, i) => (
                    <div className="ax-case__stage" key={c.stage}>
                      <span className="ax-case__stage-index">{String(i + 1).padStart(2, "0")}</span>
                      <span className="ax-case__stage-name">{c.stage}</span>
                      <p className="ax-case__stage-caption">{c.caption}</p>
                    </div>
                  ))}
                </Reveal>
              </div>
            </div>
          </section>
        ) : null}

        {deployment ? (
          <section className="ax-case__reel ax-sweep">
            <div className="padding-global">
              <div className="container-large">
                <div className="ax-case__reel-grid">
                  <Reveal variant="clip" className="ax-case__reel-media">
                    <ReelEmbed deployment={deployment} client={study.client} />
                  </Reveal>
                  <Reveal variant="rise" className="ax-case__outcome" delay={0.15}>
                    <span className="ax-case__outcome-label">Outcome</span>
                    <p className="ax-case__outcome-text">{deployment.outcome}</p>
                    {study.stack?.length ? (
                      <ul className="ax-stack">
                        {study.stack.map((tag) => (
                          <li className="ax-stack__tag" key={tag}>
                            {tag}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </Reveal>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="ax-case__more">
          <div className="padding-global">
            <div className="container-large">
              <Reveal variant="rise" className="ax-case__more-inner">
                <span className="ax-case__more-label">More work</span>
                <div className="ax-case__more-links">
                  {others.map((c) => (
                    <a
                      key={c.slug}
                      href={`/${c.slug}`}
                      className="ax-case__more-link"
                      onClick={go(`/${c.slug}`)}
                    >
                      {c.client} <span aria-hidden="true">→</span>
                    </a>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <CtaDark />
      <Footer />
    </>
  );
}
