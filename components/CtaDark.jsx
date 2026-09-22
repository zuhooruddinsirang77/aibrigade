"use client";

import Link from "next/link";
import { usePopup } from "@/components/PopupContext";
import MaskHeading from "@/components/motion/MaskHeading";
import Magnetic from "@/components/motion/Magnetic";
import AmbientVideo from "@/components/motion/AmbientVideo";
import DepthField from "@/components/motion/DepthField";
import Curtain from "@/components/motion/Curtain";

const CDN = "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617";

/* Where the work usually is. Seven functions rather than the six sectors
   the hero opens on: by the time a reader reaches the bottom of the page
   they have agreed this applies to their industry, and the question that
   is left is which part of their own operation to point it at. */
const AREAS = [
  "Customer operations",
  "Back office",
  "Risk & compliance",
  "Knowledge work",
  "Field operations",
  "Revenue operations",
  "Technology operations",
];

export default function CtaDark() {
  const { startTransition } = usePopup();
  return (
    /* The closing frame widens, the same way the two dark scenes before
       it opened. See Curtain. */
    <Curtain id="ctadark" className="section_cta_dark" style={{ position: "relative", isolation: "isolate" }}>
      {/* Same feedforward-network motif as the hero, in its light-on-dark
          variant — the closing beat of the page echoes the opening one
          instead of the "AI" visual only ever showing up once. Centred and
          larger since this section has no phone gallery competing for the
          same space. */}
      {/* The page opened on real footage of a person working with an AI
          agent; it closes the same way — a person at a laptop, a small
          holographic assistant beside them — rather than on an abstract
          circuit clip. The closing question is about that person's work,
          so it lands next to a picture of them doing it rather than next to
          a trace of light with no one in the frame. */}
      <AmbientVideo film="aiPartner" className="ax-cta__film" />
      {/* The page opens on a film with a volume of light suspended in
          front of it and closes the same way, at half strength — the
          closing beat is a single sentence and a button, so the
          atmosphere here is a rhyme with the hero rather than a second
          performance of it. Additive only: it cannot darken or tint the
          footage. */}
      <DepthField className="ax-cta__depth" intensity={0.55} dolly={4} sway={0.7} density={170} />
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-cta_dark">
            <div className="container-large">
              <div className="cta_dark_component">
                <h2 className="heading-style-h4 text-color-white _4 max-width-large big heading-40pt-ipad_pro">
                  <MaskHeading text="What work should AI be doing in your business?" />
                </h2>

                {/* Seven places to look, for a reader who agrees with the
                    question and cannot immediately answer it. Not links —
                    there is nowhere on this site they would each go, and a
                    chip that looks clickable and isn't is worse than a
                    label. They are there to make the question answerable
                    in the ten seconds before the button. */}
                <ul className="ax-close__areas">
                  {AREAS.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>

                <p className="ax-close__ask">
                  Bring us one problem. We&rsquo;ll show you what AI can actually do with it.
                </p>

                <Magnetic>
                <Link
                  href="/contact"
                  className="link fill width w-inline-block"
                  onClick={(e) => {
                    e.preventDefault();
                    startTransition("/contact");
                  }}
                >
                  <div className="link_fill_text_wrapper">
                    <div className="body20 text-weight-medium _20">bring us one problem</div>
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

                {/* The last line, and the same four words the page opens
                    on. Set small and tracked out under the button rather
                    than as a second heading: at heading size it would
                    compete with the question above it and read as the page
                    restating its claim after asking for something, which
                    is the wrong order. At this size it is a sign-off — the
                    reader has just been asked to bring one problem, and
                    this is what happens to it. */}
                <p className="ax-close__stamp" aria-hidden="true">
                  AI that does the work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Curtain>
  );
}
