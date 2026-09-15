"use client";

import { usePopup } from "@/components/PopupContext";
import MaskHeading from "@/components/motion/MaskHeading";
import Magnetic from "@/components/motion/Magnetic";
import HeroNetwork from "@/components/motion/HeroNetwork";

const CDN = "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617";

export default function CtaDark() {
  const { openPopup } = usePopup();
  return (
    <div id="ctadark" className="section_cta_dark" style={{ position: "relative", isolation: "isolate" }}>
      {/* Same feedforward-network motif as the hero, in its light-on-dark
          variant — the closing beat of the page echoes the opening one
          instead of the "AI" visual only ever showing up once. Centred and
          larger since this section has no phone gallery competing for the
          same space. */}
      <HeroNetwork dark position={[0, 0.4, -3]} scale={1.15} />
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-cta_dark">
            <div className="container-large">
              <div className="cta_dark_component">
                <h2 className="heading-style-h4 text-color-white _4 max-width-large big heading-40pt-ipad_pro">
                  <MaskHeading text="Let us turn your concept into a production-grade AI system" />
                </h2>
                <Magnetic>
                <a
                  href="#"
                  className="link fill width w-inline-block"
                  onClick={(e) => {
                    e.preventDefault();
                    openPopup();
                  }}
                >
                  <div className="link_fill_text_wrapper">
                    <div className="body20 text-weight-medium _20">work with us</div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
