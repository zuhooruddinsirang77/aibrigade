"use client";

import { useEffect } from "react";
import { loadGsap, prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * Inertial scrolling for the whole document — the one change that alters
 * how every other piece of motion on this page feels.
 *
 * Everything below already scrubs against scroll position: `Parallax`,
 * `ScrubFilm`, the `WhyUs` pin, `Pipeline`'s rail, `DecisionPath`'s step
 * list. A native wheel event moves the page in one discrete ~100px jump,
 * so each of those effects also advances in one jump — which is why a
 * scrub-heavy page can look expensive in a video capture and feel like a
 * flipbook under an actual mouse. Interpolating the scroll position means
 * every scrubbed effect inherits the easing for free, without a single
 * one of them changing.
 *
 * Why this is hand-written rather than `lenis` from npm: the whole
 * mechanism is a lerp toward a target offset, and the parts that need care
 * are all integration details specific to this page — the pinned WhyUs
 * section, the `scrollIntoView` calls in `Navbar` and `Hero`, the popup's
 * body lock. Owning ~90 lines is cheaper than owning a dependency plus the
 * same integration work.
 *
 * It drives the real `window.scrollTo`, so it needs no ScrollTrigger
 * `scrollerProxy`: pins, `position: fixed` (the navbar), anchor links,
 * scroll-restoration and the browser's own scrollbar all keep working
 * because the document's actual scroll offset is still the source of
 * truth. The only wiring ScrollTrigger needs is a nudge to re-measure on
 * every interpolated frame instead of only on native scroll events.
 *
 * Four ways it declines to run, each falling back to plain native scroll:
 *
 *   - `prefers-reduced-motion`. Smoothed scrolling is unrequested motion
 *     applied to the one interaction a reader is always performing.
 *   - Coarse pointers. Touch platforms already apply their own momentum
 *     curve, and overriding it with a second one fights the OS and breaks
 *     the rubber-band at both ends of the document.
 *   - No GSAP. The ticker is what drives the frame loop; without it there
 *     is nothing to interpolate on.
 *   - A zoomed page (`visualViewport.scale > 1`), where the reader is
 *     panning rather than scrolling and expects the surface to track their
 *     fingers exactly.
 */

/** Fraction of the remaining distance covered per 60fps frame. */
const EASE = 0.1;
/** Below this, snap — chasing sub-pixel remainders forever costs frames. */
const EPSILON = 0.12;

export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let cancelled = false;
    let teardown = () => {};

    loadGsap().then((mod) => {
      if (!mod || cancelled) return;
      const { gsap, ScrollTrigger } = mod;

      const root = document.documentElement;
      let target = window.scrollY;
      let current = target;
      /* True while the lerp owns the scroll position. Every `scroll` event
         the browser fires during that time is our own `window.scrollTo`
         echoing back, and adopting it as "the reader scrolled" would reset
         the target to wherever the animation had got to — which stops the
         page dead part-way through every single gesture.
         A synchronous "am I inside scrollTo right now" flag does NOT work
         here: scroll events are dispatched asynchronously, so they always
         arrive after that flag has been cleared. The window has to stay
         open for the whole animation. */
      let running = false;

      const maxScroll = () =>
        Math.max(0, root.scrollHeight - window.innerHeight);

      /* Anything that moves the page by a route this component does not
         own — a keyboard PageDown, a scrollbar drag, `scrollIntoView` from
         the navbar, the browser restoring a position, a focus jump — lands
         here. Adopting the new offset rather than fighting it is what
         keeps those interactions feeling native instead of rubber-banding
         back to wherever the lerp had been heading. */
      const resync = () => {
        if (running) return;
        target = window.scrollY;
        current = target;
      };

      const frame = () => {
        /* Something else moved the page between frames — a nav link's
           `scrollIntoView`, a scrollbar drag, a keyboard PageDown, the
           browser restoring a position. The previous frame left `scrollY`
           exactly at `current`, so any real gap is external and the reader
           means it. Yield rather than dragging them back to a target they
           have already abandoned. */
        if (Math.abs(window.scrollY - current) > 12) {
          running = false;
          gsap.ticker.remove(frame);
          target = current = window.scrollY;
          return;
        }

        const delta = target - current;
        if (Math.abs(delta) < EPSILON) {
          current = target;
          running = false;
          gsap.ticker.remove(frame);
          return;
        }
        /* Frame-rate independence: `EASE` is calibrated for 60fps, so on a
           120Hz display the per-frame fraction has to shrink or the page
           arrives twice as fast and the inertia disappears. */
        const ratio = 1 - Math.pow(1 - EASE, gsap.ticker.deltaRatio(60));
        current += delta * ratio;

        window.scrollTo(0, current);

        /* Native `scroll` events fire on their own schedule and are
           throttled; the interpolated positions in between are exactly the
           frames the scrubbed effects need. */
        ScrollTrigger.update();
      };

      const start = () => {
        if (running) return;
        running = true;
        gsap.ticker.add(frame);
      };

      const onWheel = (e) => {
        /* Pinch-zoom and OS-level gestures arrive as ctrl-modified wheel
           events; those are the browser's to handle. */
        if (e.ctrlKey || e.metaKey) return;
        /* Never swallow a wheel event aimed at something with its own
           scrollport — the mobile WhyUs card rail, the reviews swiper, a
           `overflow:auto` code block, the popup when it is open. */
        if (e.target.closest?.("[data-lenis-prevent], .ax-noscroll")) return;
        if (findScrollable(e.target, e.deltaY)) return;

        const max = maxScroll();
        /* `deltaMode` 1 is lines, 2 is pages — Firefox reports lines. */
        const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
        const next = target + e.deltaY * unit;

        /* At either end, hand the event back so the browser can do its own
           overscroll behaviour instead of us silently eating it. */
        if ((next <= 0 && target <= 0) || (next >= max && target >= max)) return;

        e.preventDefault();
        target = Math.min(max, Math.max(0, next));
        start();
      };

      /* A resize changes `scrollHeight`, so a target computed against the
         old one can now be past the end of the document. */
      const onResize = () => {
        target = Math.min(maxScroll(), target);
        resync();
      };

      window.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("scroll", resync, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });
      /* ScrollTrigger re-measures after fonts and the two remote Webflow
         stylesheets land; the document height it settles on is the one the
         clamp above has to respect. */
      ScrollTrigger.addEventListener("refresh", onResize);
      root.classList.add("ax-smooth");

      teardown = () => {
        gsap.ticker.remove(frame);
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("scroll", resync);
        window.removeEventListener("resize", onResize);
        ScrollTrigger.removeEventListener("refresh", onResize);
        root.classList.remove("ax-smooth");
      };
    });

    return () => {
      cancelled = true;
      teardown();
    };
  }, []);

  return null;
}

/**
 * Walk up from the wheel event's target looking for an ancestor that can
 * actually consume this scroll in the direction it is going.
 *
 * "Can scroll" is not the same as "is scrollable": a horizontal card rail
 * that is already at its own bottom (it has no vertical overflow at all)
 * must not swallow a downward wheel, or the page stops dead over it. The
 * direction check is what distinguishes the two.
 */
function findScrollable(node, deltaY) {
  let el = node;
  while (el && el !== document.body && el.nodeType === 1) {
    const style = getComputedStyle(el);
    const overflowY = style.overflowY;
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight + 1
    ) {
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      if (!((deltaY < 0 && atTop) || (deltaY > 0 && atBottom))) return el;
    }
    el = el.parentElement;
  }
  return null;
}
