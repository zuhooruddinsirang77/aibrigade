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
import HeroNetwork from "@/components/motion/HeroNetwork";
import TerminalFeed from "@/components/motion/TerminalFeed";
import { caseStudies, getCaseStudy } from "@/components/casestudies.data";

const CDN = "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617";

// Same document glyph WhyUs.jsx uses for "Clinical documentation" — reused
// rather than commissioning new art for the one case with no product
// screenshot of its own (see casestudies.data.js: uub.heroImg is null).
const DOC_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.2 3.3h6.4l3.6 3.6v13.4a.4.4 0 01-.4.4H7.2a.4.4 0 01-.4-.4V3.7a.4.4 0 01.4-.4z" />
    <path d="M13.4 3.3v3.6a.4.4 0 00.4.4h3.6" />
    <path d="M9 12h6M9 15.4h6M9 8.6h2" />
  </svg>
);

// Mirrors the reel empty-state in Deployments.jsx: a specific case's own
// chapter captions typed out as a terminal log stand in for footage that
// doesn't exist yet, so a broken/missing video reads as "this case is
// running" instead of "this page is unfinished."
function ReelEmbed({ deployment, client }) {
  const [failed, setFailed] = useState(false);
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
          src={deployment.src}
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

  return (
    <>
      <Navbar />
      <main className="ax-case">
        <section className="ax-case__hero">
          <HeroNetwork dark position={[0, 0.3, -3]} scale={1.05} />
          <div className="padding-global">
            <div className="container-large">
              <div className="ax-case__hero-grid">
                <div className="ax-case__hero-copy">
                  <a href="/#cases" className="ax-case__back" onClick={go("/#cases")}>
                    <span aria-hidden="true">←</span> All case studies
                  </a>
                  <span className="ax-case__eyebrow">{study.sector} case study</span>
                  <h1 className={`heading-style-h1 grad ${study.gradClass}`}>
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
                  <Reveal variant="clip" className="ax-case__hero-visual ax-case__hero-visual--icon">
                    <div className="ax-case__hero-icon" aria-hidden="true">
                      {DOC_ICON}
                    </div>
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
