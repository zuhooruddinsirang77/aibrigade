"use client";

import { usePopup } from "@/components/PopupContext";

const CDN = "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617";

export default function Cta() {
  const { openPopup } = usePopup();
  return (
    <div id="cta" className="section_cta">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-cta">
            <div className="cta_component">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${CDN}/64c100b40fcbd204b722a485_cta-gradient.webp`}
                alt="Abstract purple geometric pattern."
                className="cta_bg"
              />
              <h2 className="text-color-white heading-60pt-ipad_pro">Collaborate with us</h2>
              <div className="cta_text_wrapper">
                <p className="p2 _20 text-20pt-ipad_pro">
                  We are passionate builders of production-grade AI, helping fintech and healthtech
                  organizations turn ideas into deployed systems.
                </p>
              </div>
              <div className="cta_button_wrapper">
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${CDN}/642312e3952239cbf4bddb83_chain_clay_1.webp`}
                alt="Two interlocked purple octagonal chain links."
                className="cta_dec"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
