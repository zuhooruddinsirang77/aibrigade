"use client";

import Link from "next/link";
import { usePopup } from "@/components/PopupContext";
import MaskHeading from "@/components/motion/MaskHeading";
import Magnetic from "@/components/motion/Magnetic";
import Parallax from "@/components/motion/Parallax";
import Reveal from "@/components/motion/Reveal";

const CDN = "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617";

export default function Cta() {
  const { startTransition } = usePopup();
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
                loading="lazy"
              />
              <h2 className="text-color-white heading-60pt-ipad_pro">
                <MaskHeading text="Bring us one problem" />
              </h2>
              <Reveal variant="rise" className="cta_text_wrapper" delay={0.15}>
                <p className="p2 _20 text-20pt-ipad_pro">
                  We&rsquo;ll show you what AI can actually do with it &mdash; one workflow,
                  measured against your own baseline, in weeks rather than a transformation
                  program.
                </p>
              </Reveal>
              <div className="cta_button_wrapper">
                <Magnetic>
                <Link
                  href="/contact"
                  className="link fill w-inline-block"
                  onClick={(e) => {
                    e.preventDefault();
                    startTransition("/contact");
                  }}
                >
                  <div className="link_fill_text_wrapper">
                    {/* Not "Bring us one problem", which the heading two
                        lines above already says — a button that repeats the
                        headline it sits under reads as a stutter. And not
                        "Request Free Strategy Session", which this said
                        before: *free* prices the engagement before the buyer
                        does, and *strategy session* is what an agency sells. */}
                    <div className="body20 text-weight-medium _20">Start the conversation</div>
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
                </Magnetic>
              </div>
              <Parallax speed={-18}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${CDN}/642312e3952239cbf4bddb83_chain_clay_1.webp`}
                  alt="Two interlocked purple octagonal chain links."
                  className="cta_dec"
                />
              </Parallax>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
