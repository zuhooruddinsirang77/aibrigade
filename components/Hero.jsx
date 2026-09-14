"use client";

import { useEffect, useState } from "react";
import { usePopup } from "@/components/PopupContext";
import MaskHeading from "@/components/motion/MaskHeading";
import Magnetic from "@/components/motion/Magnetic";
import Reveal from "@/components/motion/Reveal";
import Parallax from "@/components/motion/Parallax";

const CDN = "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617";

const tickerLogos = [
  `${CDN}/6419854b6528564c6705e8f1_logo%20halyk.svg`,
  `${CDN}/6419854b9612bf761a454aaa_logo%20ICU.svg`,
  `${CDN}/6419854bcd8723200b132ed2_raiffeisen.svg`,
  `${CDN}/6419854b3d99c56eb40ece06_aushan.svg`,
  `${CDN}/6419854b8f060240e04873d7_bcc-invest.svg`,
  `${CDN}/6419854b3d99c5ea9b0ece07_image_267.webp`,
];

export default function Hero() {
  const { openPopup } = usePopup();
  const [lines, setLines] = useState({
    first: "Custom AI Systems",
    second: "for Fintech",
    third: "& HealthTech",
  });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 720) {
        setLines({ first: "Custom AI", second: "Systems for", third: "Fintech & HealthTech" });
      } else if (w <= 768) {
        setLines({ first: "Custom AI Systems", second: "for Fintech &", third: "HealthTech" });
      } else {
        setLines({ first: "Custom AI Systems", second: "for Fintech", third: "& HealthTech" });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div id="header" className="section_header">
      <div className="ax-hero-glow" aria-hidden="true" />
      <div className="padding-global ipad">
        <div className="container-large">
          <div className="padding-section-header padding-section_header">
            <div className="header_component">
              <div className="header_top">
                <div className="div-block-18">
                  <h1 className="text-color-white h1 h1-72pt-tablet">
                    <MaskHeading text={lines.first} delay={0.15} />
                  </h1>
                </div>
                <Parallax speed={-26} mouse={24}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${CDN}/64186f6f7587b79ac4b1fa13_figure_1.webp`}
                    width="150"
                    alt="3D purple geometric shape."
                    className="header_dec-2 hide-mobile-landscape"
                  />
                </Parallax>
              </div>

              <div className="header_heading_wrapper _4 is-visible-tablet">
                <Parallax speed={-16} mouse={15}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${CDN}/64186f6f980d4e4bc1b82e65_object_flycube.webp`}
                    width="180"
                    alt="3D purple cube structure."
                    className="header_dec-1"
                  />
                </Parallax>
                <h1 className="text-color-white h1 h1-72pt-tablet left-padding-tabler">
                  <MaskHeading text={lines.second} delay={0.3} />
                </h1>
              </div>

              <div className="header_heading_wrapper _2">
                <h1 className="text-color-white h1 h1-72pt-tablet">
                  <MaskHeading text={lines.third} delay={0.45} />
                </h1>
              </div>

              <div className="header_text_wrapper is-special-text-wrapper">
                <p className="d1 text-color-white text-weight-medium is-special-d1">
                  We build production-grade AI systems — copilots, automation agents, GPT platforms,
                  and decision intelligence workflows — from initial discovery through production deployment.
                </p>
              </div>

              <Reveal variant="clip" className="header_image_gallery is-special-flex-gap" delay={0.5}>
                <Parallax speed={-9}>
                <div className="header_image_gallery_left">
                  <div className="header_image_gallery_image box-shadow_first">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${CDN}/642187d053db92feae4ab614_screen_phone_halyk.webp`}
                      alt="Mobile screen showing Apple Inc stock price with 7-day upward trend."
                      className="header_image_gallery_image img-size-1"
                    />
                  </div>
                </div>
                </Parallax>

                <Parallax speed={-20}>
                <div className="header_image_gallery_grid is-special-grid-gap">
                  <div className="header_image_gallery_image box-shadow_secondary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${CDN}/64186f6f0e3f0b00550f2131_screen2.webp`}
                      alt="Mobile trading app screen showing bond offers with yields."
                      className="header_image_gallery_image img-size-2"
                    />
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${CDN}/64186f6f0f8b4c595958528d_screen3.webp`}
                    alt="Mobile app showing available funds and trending stocks."
                    className="header_image_gallery_image img-size-3"
                  />
                </div>
                </Parallax>
              </Reveal>

              <Magnetic>
              <a
                id="OpenPop"
                href="#"
                className="button is-special-tablet width-mob-100 w-inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  openPopup();
                }}
              >
                <div className="button_text_wrapper">
                  <div>Request Free Strategy Session</div>
                  <div className="button_line_box">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${CDN}/641da81fd328c70dfa2f5923_Frame%2048095372%20(1).svg`}
                      alt=""
                      className="button_line_arrow"
                    />
                  </div>
                </div>
                <div className="button_bg_wrapper is-specal-flex">
                  <div className="button_bg_back" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${CDN}/641aee25bd4242675de7a8ca_image_274.webp`}
                    alt=""
                    className="button_bg-2 is-specal-absolute"
                  />
                </div>
              </a>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>

      <div className="header_ticker">
        <div className="ticker_component">
          <div className="ticker_move">
            {[0, 1].map((row) => (
              <div className="ticker_wrapper" key={row}>
                {tickerLogos.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="" className="ticker_image" key={i} />
                ))}
                <div className="ticker_div-ipad-pro" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
