"use client";

import { usePopup } from "@/components/PopupContext";
import Reveal from "@/components/motion/Reveal";
import Parallax from "@/components/motion/Parallax";
import Kicker from "@/components/motion/Kicker";
import SystemVisual from "@/components/motion/SystemVisual";
import TiltCard from "@/components/motion/TiltCard";
import GemCore from "@/components/motion/GemCore";
import AmbientVideo from "@/components/motion/AmbientVideo";
import { filmFor } from "@/components/video.data";

const CDN = "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617";


export default function Cases() {
  const { openPopup, startTransition } = usePopup();

  const go = (href) => (e) => {
    e.preventDefault();
    startTransition(href);
  };

  return (
    <div id="cases" className="section_cases position-relative">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-cases padding-top-100_ipad-pro">
            <Kicker id="cases" label="Evidence" />
            <Reveal variant="rise" className="_3-columns-grid">
              <h2 className="gradient-background heading-gradient-60pt-ipad-pro">
                Prominent <br />
                Cases
              </h2>
              <p className="p2 max-width-medium _3 _4 text-16pt-ipad_pro margin-top-zero-ipad-pro">
                Production-grade AI systems we&rsquo;ve deployed for fintech and healthtech
                organizations nationwide.
              </p>
            </Reveal>

            <Reveal variant="stagger" selector=".cases_grid" className="cases_component">
              {/* ICU */}
              <div className="cases_grid first">
                <div className="cases_item">
                  <h3 className="heading-style-h5 _30 _24 heading-30pt-ipad_pro">
                    Real-time fraud detection for a regional bank
                  </h3>
                  <p className="body18 opacity50">
                    AIBrigade built an autonomous fraud detection system for ICU Capital, a self-contained
                    asset and investment management company. It provides real-time transaction monitoring,
                    explainable risk scoring, and multi-factor authentication for a secure, flawless
                    user experience.
                  </p>
                  <div className="cases_bg">
                    <div className="cases_bg-2 _3" />
                  </div>
                  <a href="/icu" className="link click case_1 w-inline-block" onClick={go("/icu")}>
                    <div className="d2 _20 _18">learn more</div>
                    <div className="link_line_box">
                      <div className="link_arrow_wrapper" />
                    </div>
                  </a>
                </div>
                {/* The three media tiles are the largest pieces of footage
                    on the page and the only ones with a diagram floating
                    over them, so they are where the difference between "a
                    video is playing here" and "there is a system in this
                    box" is actually visible. `TiltCard` turns the frame;
                    `data-lift` decides what sits at which distance inside
                    it — the film behind (drifting with the pointer, pushed
                    back), the console in front (drifting against it,
                    pulled forward). See app/immersive.css §3. */}
                <TiltCard max={5} lift={8} depth={26}>
                  <a href="/icu" className="cases_item bg-1 w-inline-block" data-cursor="view" onClick={go("/icu")}>
                    {/* The tile already draws the system as a diagram; the
                        film puts it somewhere. */}
                    <AmbientVideo film={filmFor.cases.icu} className="ax-case__film" data-lift="far" />
                    <SystemVisual variant="stream" data-lift="" />
                    <div className="cases_dec-1" />
                    <div className="cases_dec-2" />
                  </a>
                </TiltCard>
              </div>

              {/* Halyk */}
              <div className="cases_grid">
                <TiltCard max={5} lift={8} depth={26}>
                  <a href="/halyk" className="cases_item bg-1 w-inline-block" data-cursor="view" onClick={go("/halyk")}>
                    <AmbientVideo film={filmFor.cases.halyk} className="ax-case__film" data-lift="far" />
                    <div className="cases_dec-3" />
                    <SystemVisual variant="split" data-lift="" />
                    <div className="cases_dec-4" />
                  </a>
                </TiltCard>
                <div className="cases_item _2">
                  <h3 className="heading-style-h5 _30 _24">
                    Autonomous underwriting for a leading investment bank
                  </h3>
                  <p className="body18 opacity50">
                    Meridian Capital is a leading investment bank serving clients nationwide.
                    AIBrigade built a decision intelligence workflow that automates underwriting
                    while keeping every decision auditable and compliant.
                  </p>
                  <div className="cases_bg">
                    <div className="cases_bg-2 _2" />
                  </div>
                  <a href="/halyk" className="link click case_2 w-inline-block" onClick={go("/halyk")}>
                    <div className="d2 _20 _18">learn more</div>
                    <div className="link_line_box">
                      <div className="link_arrow_wrapper" />
                    </div>
                  </a>
                </div>
              </div>

              {/* UUB */}
              <div className="cases_grid">
                <div className="cases_item d">
                  <h3 className="heading-style-h5 _30 _24">
                    A HIPAA-compliant clinical documentation copilot
                  </h3>
                  <p className="body18 opacity50">
                    UUB Health is a growing multi-site clinical network. AIBrigade built a
                    HIPAA-compliant documentation copilot, integrated with Epic via HL7 FHIR, that
                    reduces clinician charting time and improves clinical efficiency.
                  </p>
                  <div className="cases_bg">
                    <div className="cases_bg-2" />
                  </div>
                  <a href="/uub" className="link click case_3 w-inline-block" onClick={go("/uub")}>
                    <div className="d2 _20 _18">learn more</div>
                    <div className="link_line_box">
                      <div className="link_arrow_wrapper" />
                    </div>
                  </a>
                </div>

                <TiltCard max={5} lift={8} depth={26}>
                  <a href="/uub" className="cases_item bg-1 w-inline-block" data-cursor="view" onClick={go("/uub")}>
                    <AmbientVideo film={filmFor.cases.uub} className="ax-case__film" data-lift="far" />
                    <SystemVisual variant="draft" data-lift="" />
                  </a>
                </TiltCard>
              </div>

              {/* The closing invitation is not a fourth case study, so it
                  gets its own full-width row rather than sitting in a
                  two-column grid pretending to be one. */}
              <div className="cases_grid last is-cta">
                <div className="cases_item grad1">
                  {/* This card was the one full-bleed flat image left on the
                      page — a static violet gradient .webp behind a 3D gem
                      render, next to three case tiles that had all just
                      been given real footage. It kept its identity as the
                      site's one flagship violet-brand block (the gradient
                      wash below is still the dominant thing you see) but
                      now has actual motion under that wash instead of a
                      flat PNG-shaped gradient. */}
                  <AmbientVideo film="energy" className="ax-cases-cta__film" />
                  {/* Was a still of this object. It is the largest brand
                      render on the page and sits on the one card that asks
                      for a decision, so it is the right place for the
                      crystal to actually be a crystal — turning, catching
                      the palette, leaning toward the pointer. `Parallax`
                      still drives its drift; `GemCore` only replaces what
                      is inside the frame, and falls back to this exact
                      still wherever WebGL can't or shouldn't run. */}
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
                  {/* Was the `bg_corner45_violet.webp` flat gradient image
                      this card used before the film above replaced it.
                      Kept as a pure CSS wash now — see `.ax-cases-cta__wash`
                      — rather than a second image, since its whole job is
                      colour, not content. */}
                  <div className="ax-cases-cta__wash" aria-hidden="true" />
                </div>
              </div>
            </Reveal>
            <div id="cases-end" className="anchor-cases" />
          </div>
        </div>
      </div>
    </div>
  );
}
