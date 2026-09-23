"use client";

import Link from "next/link";
import { usePopup } from "@/components/PopupContext";
import MaskHeading from "@/components/motion/MaskHeading";
import Magnetic from "@/components/motion/Magnetic";
import Reveal from "@/components/motion/Reveal";
import Kicker from "@/components/motion/Kicker";
import AmbientVideo from "@/components/motion/AmbientVideo";
import DepthField from "@/components/motion/DepthField";
import Curtain from "@/components/motion/Curtain";

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
      {/* The page opened on real footage of a person working with an AI
          agent; it closes the same way — a person at a laptop, a small
          holographic assistant beside them — rather than on an abstract
          circuit clip. The closing question is about that person's work,
          so it lands next to a picture of them doing it rather than next to
          a trace of light with no one in the frame. The copy sits on the
          left under a directional scrim (film.css), which leaves the
          assistant on the right of the frame in full view. */}
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
            <div className="cta_dark_component ax-close">
              <Kicker id="ctadark" tone="invert" label="The next step" />

              {/* Set in the hero's own register — two lines, the second
                  in the hero's lavender-to-violet — so the question at
                  the foot of the page reads as the answer to the claim at
                  the top of it, not as a Webflow heading dropped in. */}
              <h2 className="ax-close__title">
                <MaskHeading text={"What work should AI be\n*doing in your business?*"} />
              </h2>

              <Reveal variant="rise" delay={0.15}>
                <p className="ax-close__ask">
                  Bring us one problem. We&rsquo;ll show you what AI can actually do with it.
                </p>
              </Reveal>

              {/* Seven places to look, for a reader who agrees with the
                  question and cannot immediately answer it. Not links —
                  there is nowhere on this site they would each go, and a
                  chip that looks clickable and isn't is worse than a
                  label. They are there to make the question answerable
                  in the ten seconds before the button. */}
              <Reveal variant="rise" delay={0.25} className="ax-close__areas-block">
                <p className="ax-close__areas-label">Common starting points</p>
                <ul className="ax-close__areas">
                  {AREAS.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </Reveal>

              {/* The hero's own button: the same action must not change
                  shape between the first screen and the last. */}
              <Reveal variant="rise" delay={0.35} className="ax-close__actions">
                <Magnetic>
                  <Link
                    href="/contact"
                    className="ax-hero__cta"
                    onClick={(e) => {
                      e.preventDefault();
                      startTransition("/contact");
                    }}
                  >
                    Bring us one problem
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M5 12h13M13 6l6 6-6 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </Magnetic>
              </Reveal>

              {/* The last line, and the same four words the page opens
                  on. Set small and tracked out under a hairline rather
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
    </Curtain>
  );
}
