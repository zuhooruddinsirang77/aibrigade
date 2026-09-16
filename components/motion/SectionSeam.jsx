"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * The join between two dark bands.
 *
 * `Deployments` ends on ink and `Environments` begins on ink, with the
 * white body showing through between them. That white strip is the one
 * place on the page where the reader can see the seam between two
 * sections instead of a transition, and it is where four `<br />`s used to
 * be doing the job (see app/page.jsx).
 *
 * What it draws is a single hairline that extends from the centre outward
 * as the seam passes through the viewport, with the numeral of the chapter
 * about to start above it. That is the whole idea: a beat, and a count.
 * It is the same instrument as `ScrollProgress`'s bar and the intro's
 * rail — `--grad-rail`, one pixel tall — so a reader who has already seen
 * those two reads this one immediately as "position in the story".
 *
 * Deliberately not a parallax image, a video, or a coloured wipe. The
 * space between two pieces of footage is the only place on this page where
 * a reader's eye gets to rest, and filling it with a third piece of
 * footage would remove the rest without adding any information.
 *
 * Under reduced motion the line is simply drawn at full width — the
 * element still separates the two bands, it just doesn't perform.
 */
export default function SectionSeam({ label = "Where it runs" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let ctx;
    let cancelled = false;

    loadGsap().then((mod) => {
      if (!mod || cancelled) return;
      const { gsap } = mod;

      ctx = gsap.context(() => {
        gsap.fromTo(
          el.querySelector(".ax-seam__line"),
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              /* Starts as the seam enters the lower third and completes as
                 it reaches the upper third, so the line is at full width
                 exactly while it is the thing being looked at — not after
                 it has already scrolled past. */
              start: "top 85%",
              end: "top 35%",
              scrub: 0.6,
            },
          }
        );
      }, el);
    });

    return () => {
      cancelled = true;
      ctx && ctx.revert();
    };
  }, []);

  return (
    <div className="ax-seam" ref={ref} aria-hidden="true">
      <span className="ax-seam__label">{label}</span>
      <span className="ax-seam__line" />
    </div>
  );
}
