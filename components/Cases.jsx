"use client";

import { usePopup } from "@/components/PopupContext";
import Reveal from "@/components/motion/Reveal";
import Parallax from "@/components/motion/Parallax";

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
                <a href="/icu" className="cases_item bg-1 w-inline-block" onClick={go("/icu")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${CDN}/641ae32593cc502dc8ebafef_screen_phone%20(1).webp`}
                    alt="Mobile trading app screen showing bonds with quantities, maturity dates, yields."
                    className="cases_phone_image shadow"
                  />
                  <div className="cases_dec-1" />
                  <div className="cases_dec-2" />
                </a>
              </div>

              {/* Halyk */}
              <div className="cases_grid">
                <a href="/halyk" className="cases_item bg-1 w-inline-block" onClick={go("/halyk")}>
                  <div className="cases_dec-3" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${CDN}/642ab38169d01c433136bc01_frame_48095402.webp`}
                    alt="Mobile app screen showing stock prices for Apple, Tesla, Facebook, Halykbank."
                    className="cases_phone_image big"
                  />
                  <div className="cases_dec-4" />
                </a>
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

              {/* UUB + Will your app be next */}
              <div className="cases_grid last">
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

                <div className="cases_item grad1">
                  <Parallax speed={-22}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${CDN}/642d51c99450cf1e66ed1397_pisma_glass_1.webp`}
                      alt="Transparent purple faceted gem."
                      className="cases_dec-5"
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${CDN}/642564b52ec9b8e4d8cfb2aa_bg_corner45_violet.webp`}
                    alt="Abstract purple geometric background."
                    className="cases_bg"
                  />
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
