"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * A dark band opening to full bleed as it arrives.
 *
 * The page alternates between white sections and full-bleed ink bands, and
 * every one of those transitions is currently the same event: a horizontal
 * edge crossing the viewport. Four of them in a row reads as a stack of
 * panels rather than as a sequence of scenes.
 *
 * What this does is give the band an entrance. It arrives inset from the
 * page edges with its corners rounded — a card, clearly sitting on the
 * white page — and opens to the full width of the viewport as it settles
 * into place. It is the cinema move of a frame widening, and it costs one
 * animated property.
 *
 * `clip-path` rather than width, padding or margin, deliberately: those
 * three all change layout, which means every scrubbed effect inside the
 * band — and every ScrollTrigger measurement below it on the page — is
 * being re-measured against a moving target on every frame of the scroll.
 * A clip is composited and changes nothing about where anything is.
 *
 * The one constraint worth knowing: a clipped element becomes the
 * containing block for `position: fixed` descendants. None of the bands
 * this wraps has one — they hold films, consoles and copy — but a fixed
 * child added inside one later would start scrolling with the band instead
 * of the viewport, and this is where to look when that happens.
 *
 * Under `prefers-reduced-motion`, or with no GSAP, the band is simply full
 * bleed from the start — `.ax-curtain` declares the open state and this
 * only ever animates away from it.
 */
export default function Curtain({
  children,
  as: Tag = "div",
  className = "",
  /** How far in from each edge the band starts, in % of viewport width. */
  inset = 4,
  /** Corner radius at the start, in rem. */
  radius = 1.75,
  /** Lets the caller hold the same element — `Environments` needs it for
   *  its own in-view check, and two refs on one node is simpler than a
   *  second wrapper box around a full-bleed band. */
  hostRef,
  ...rest
}) {
  const innerRef = useRef(null);
  const ref = hostRef || innerRef;

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
          el,
          { clipPath: `inset(0% ${inset}% 0% ${inset}% round ${radius}rem)` },
          {
            clipPath: "inset(0% 0% 0% 0% round 0rem)",
            ease: "none",
            scrollTrigger: {
              trigger: el,
              /* Entry only. The band is taller than the viewport, so
                 scrubbing across its whole length would leave it opening
                 for thousands of pixels — the move has to complete while
                 the top edge is still the thing being watched. */
              start: "top bottom",
              end: "top 55%",
              scrub: 0.7,
            },
          }
        );
      }, el);
    });

    return () => {
      cancelled = true;
      ctx && ctx.revert();
    };
  }, [inset, radius]);

  return (
    <Tag ref={ref} className={`ax-curtain ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}
