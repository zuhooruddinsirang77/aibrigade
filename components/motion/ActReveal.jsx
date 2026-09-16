"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * One act of the Cases sequence, arriving as a single move.
 *
 * The generic `Reveal` would do this in two — it treats whatever it wraps
 * as one target, or staggers a set of siblings on a fixed rhythm. Neither
 * is right here, because an act is two halves that mean something to each
 * other: a panel of footage and the sentence that explains it. Faded in
 * independently they read as two cards that happened to load at the same
 * time, which is exactly the "stack of cards" impression this section was
 * rebuilt to get rid of.
 *
 * So the sequence is composed:
 *
 *   1. The media unveils from its own outer edge — the side it bleeds off
 *      — so the reveal travels inward from beyond the screen. It is the
 *      one motion on the page that acknowledges the frame continues past
 *      the window, and it is why the bleed reads as intentional rather
 *      than as an image that overflowed.
 *   2. The film inside settles from slightly over-scaled to rest, a beat
 *      behind the clip. Two speeds on one object is what a camera move
 *      looks like; one speed is a slide.
 *   3. The copy follows on a short overlap, its own lines stepped, so the
 *      sentence lands after the thing it describes is already visible.
 *
 * `clipPath` rather than width or transform for the unveil, for the same
 * reason `Curtain` uses it: it is composited, changes no layout, and so
 * cannot disturb the ScrollTrigger measurements of everything below it on
 * a page this long.
 *
 * Plays once. A case study re-unveiling every time it scrolls back into
 * view turns a deliberate entrance into a tic.
 *
 * Under `prefers-reduced-motion`, or with no GSAP, the act is simply
 * there: `.ax-act` has no hidden initial state in CSS, and everything
 * below animates away from the resting values rather than toward them.
 */
export default function ActReveal({ children, className = "", ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const media = el.querySelector(".ax-act__media");
    const film = el.querySelector(".ax-film");
    const copy = Array.from(el.querySelectorAll(".ax-act__copy > *"));
    if (!media && !copy.length) return;

    /* The unveil travels from the edge the panel runs off, so it has to
       know which side that is. Read from the DOM rather than passed as a
       prop because the same attribute already drives the layout — one
       source of truth for "which way does this act face". */
    const side = el.dataset.side === "left" ? "left" : "right";
    const from =
      side === "right"
        ? "inset(0% 0% 0% 100%)" // uncovers leftward, from off-screen right
        : "inset(0% 100% 0% 0%)";

    let ctx;
    let cancelled = false;

    loadGsap().then((mod) => {
      if (!mod || cancelled) return;
      const { gsap } = mod;

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            /* Late enough that the act is genuinely being looked at, early
               enough that it is never caught mid-reveal at the bottom of
               the screen. */
            start: "top 78%",
            once: true,
          },
        });

        if (media) {
          tl.fromTo(
            media,
            { clipPath: from },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.25,
              ease: "power3.inOut",
            },
            0
          );
        }

        if (film) {
          /* Overlapping the clip, not following it. The film is already
             settling while the frame is still opening, which is what makes
             the two read as one object rather than as a reveal followed by
             a zoom. */
          tl.fromTo(
            film,
            { scale: 1.14 },
            { scale: 1, duration: 1.6, ease: "power3.out" },
            0.1
          );
        }

        if (copy.length) {
          tl.fromTo(
            copy,
            { opacity: 0, y: 26 },
            {
              opacity: 1,
              y: 0,
              duration: 0.85,
              ease: "power3.out",
              stagger: 0.08,
            },
            0.32
          );
        }
      }, el);
    });

    return () => {
      cancelled = true;
      ctx && ctx.revert();
    };
  }, []);

  return (
    <article ref={ref} className={className} {...rest}>
      {children}
    </article>
  );
}
