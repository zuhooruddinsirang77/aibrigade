"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePopup } from "@/components/PopupContext";
import Logo from "@/components/Logo";

/**
 * Leaving the home page for a case study.
 *
 * The mechanism is unchanged — an ink panel covers the viewport, the route
 * changes behind it, the panel leaves — and so is the brand: the same ink
 * (`--ink-canvas`) and the same mark. What changed is the choreography,
 * so that this and `Preloader` are recognisably one thing rather than two
 * different full-screen dark panels that happen to share a colour.
 *
 *   - It carries the same instrument. The hairline that fills during the
 *     intro fills again here, so "the site is moving you somewhere" always
 *     looks like the same event.
 *   - It leaves through the TOP, in the direction of travel, rather than
 *     retreating back down the way it came. A panel that arrives from
 *     below and then sinks back below reads as a thing that changed its
 *     mind; one that passes through reads as a cut.
 *
 * The reset after the exit is the part worth commenting. Once the panel
 * has travelled off the top it has to return to its parked position below
 * the fold for the next navigation — and if that return were animated, the
 * reader would watch a dark panel sweep back across the page they just
 * arrived on. So the transition is switched off for exactly one frame
 * while it is re-parked, then switched back on.
 *
 * Under `prefers-reduced-motion` the panel still covers — its job there is
 * to hide a route swap, which is not decorative — but it crosses in a
 * short fade rather than travelling.
 */

/**
 * Ceilings, not schedules. Each leg is driven by the panel's own
 * `transitionend` and only falls back to a timer if that never arrives —
 * an interrupted transition, a backgrounded tab, or reduced motion, where
 * the transform never changes and so never reports finishing.
 *
 * The first version of this sequenced the legs on wall-clock timers
 * instead, and it was visibly wrong on this page: the home route is
 * running two WebGL loops, several playing videos and a dozen
 * ScrollTriggers, and the style recalculation that starts the cover
 * transition was landing up to ~250ms after the class change. Against a
 * fixed 620ms budget that meant the route swapped while the panel was
 * still two-fifths of the way up the screen — a flash of the new page
 * through the gap, on the one device the whole component exists to
 * prevent. Waiting for the transition to actually finish is both correct
 * and self-tuning.
 */
const COVER_CEILING = 1400;
const LEAVE_CEILING = 1400;

export default function PageTransition() {
  const { transitionTo, clearTransition } = usePopup();
  const router = useRouter();
  const [phase, setPhase] = useState("idle"); // idle | cover | leave | reset
  const panelRef = useRef(null);
  const fillRef = useRef(null);

  useEffect(() => {
    if (!transitionTo) return;

    const panel = panelRef.current;
    let cancelled = false;
    let timer = 0;

    /* Resolves on the panel's own transition finishing, or on the ceiling,
       whichever comes first — and never twice. */
    const settled = (ceiling, fn) => {
      let fired = false;
      const done = () => {
        if (fired || cancelled) return;
        fired = true;
        panel?.removeEventListener("transitionend", onEnd);
        clearTimeout(timer);
        fn();
      };
      const onEnd = (e) => {
        /* Children transition too — the rail's own fill is inside this
           element — and their events bubble. Only the panel's own move
           means the leg is over. */
        if (e.target === panel) done();
      };
      panel?.addEventListener("transitionend", onEnd);
      timer = setTimeout(done, ceiling);
      return () => {
        panel?.removeEventListener("transitionend", onEnd);
        clearTimeout(timer);
      };
    };

    setPhase("cover");
    /* Started a frame late so the browser has a chance to paint the 0%
       state first — setting both ends of a transition in one frame is the
       classic way to get no transition at all. */
    const fill = requestAnimationFrame(() => {
      if (fillRef.current) fillRef.current.style.transform = "scaleX(1)";
    });

    const stopCover = settled(COVER_CEILING, () => {
      if (transitionTo.startsWith("http")) {
        window.location.href = transitionTo;
      } else {
        router.push(transitionTo);
      }
      setPhase("leave");

      settled(LEAVE_CEILING, () => {
        /* Re-park with the transition suppressed, then release it on the
           next frame so the following navigation animates normally. */
        setPhase("reset");
        requestAnimationFrame(() => {
          if (fillRef.current) fillRef.current.style.transform = "scaleX(0)";
          requestAnimationFrame(() => {
            if (cancelled) return;
            setPhase("idle");
            clearTransition();
          });
        });
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(fill);
      clearTimeout(timer);
      stopCover();
    };
  }, [transitionTo, router, clearTransition]);

  return (
    <div className="nextpage ax-wipe" data-phase={phase} ref={panelRef} aria-hidden="true">
      <div className="ax-wipe__inner">
        <Logo size="7.5rem" />
        <span className="ax-wipe__rail">
          <span className="ax-wipe__fill" ref={fillRef} />
        </span>
      </div>
    </div>
  );
}
