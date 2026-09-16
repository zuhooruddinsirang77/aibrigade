"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AmbientVideo from "@/components/motion/AmbientVideo";
import { loadGsap, prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * A clip whose playhead is the scrollbar.
 *
 * Scrolling past this section walks the footage forward; scrolling back
 * walks it back. It is the one piece of motion on the page the reader is
 * unambiguously driving — everything else either waits for a click or runs
 * on its own — which is what makes it worth spending a 4MB clip on.
 *
 * Not pinned, and that is a deliberate departure from how this effect is
 * usually built. `WhyUs` already owns a pin on this page, and the note in
 * `Deployments` about a second one is right: two pins on one page mean two
 * ScrollTriggers mutating layout height, each invalidating the other's
 * measurements on every refresh. Mapping the clip onto the section's own
 * pass through the viewport gets the same reader-driven scrub with no
 * height rewriting at all, and it degrades to "a clip that happens to be
 * moving" instead of "the page is stuck" if anything goes wrong.
 *
 * Seeking is rate-limited against the element's own readiness rather than
 * to a timer. `currentTime = x` while a seek is already outstanding is
 * dropped by the browser, so a scrub that writes on every scroll event
 * spends most of its writes on nothing and lands on a stale frame when the
 * reader stops. Writing only once the previous seek has reported back keeps
 * the last write — the one the reader is actually looking at — always
 * honoured.
 *
 * Falls back to a plain looping `AmbientVideo` when scrubbing would be a
 * bad idea: coarse pointers (mobile Safari seeks unreliably, and a
 * momentum-scrolled seek storm is genuinely slow), reduced motion, or a
 * GSAP that never arrived.
 */
export default function ScrubFilm({
  film,
  className = "",
  vignette = true,
  /** Scroll distance the clip is mapped across, as a share of the section's
   *  travel. 1 = the full window-bottom-to-window-top pass. */
  span = 1,
  children,
}) {
  const hostRef = useRef(null);
  const videoRef = useRef(null);
  const [scrubbing, setScrubbing] = useState(false);

  // Written by ScrollTrigger, read by the seek loop. A ref rather than
  // state: this changes on every scroll frame and must never re-render.
  const progress = useRef(0);

  const start = useCallback((video) => {
    const host = hostRef.current;
    if (!host || !video) return;

    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(min-width: 992px)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let ctx;
    let raf = 0;
    let seeking = false;
    let applied = -1;
    let cancelled = false;

    const onSeeked = () => {
      seeking = false;
    };
    video.addEventListener("seeked", onSeeked);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (seeking) return;

      const d = video.duration;
      if (!d || !Number.isFinite(d)) return;

      // Stop a hair short of the end: seeking to exactly `duration` fires
      // `ended` on some browsers, which with `loop` set snaps back to zero
      // and makes the last frame of the scrub flicker to the first.
      const target = Math.min(progress.current, 0.999) * d;
      if (Math.abs(target - applied) < 1 / 60) return;

      applied = target;
      seeking = true;
      try {
        video.currentTime = target;
      } catch {
        seeking = false;
      }
    };

    loadGsap().then((mod) => {
      if (!mod || cancelled) return;
      const { gsap } = mod;

      // The element is being driven frame by frame from here on, so it must
      // not also be playing, and must not loop back under the scrub.
      video.pause();
      video.loop = false;

      setScrubbing(true);
      raf = requestAnimationFrame(tick);

      ctx = gsap.context(() => {
        gsap.to(progress, {
          current: 1,
          ease: "none",
          scrollTrigger: {
            trigger: host,
            start: "top bottom",
            end: () => `bottom top-=${(span - 1) * 100}%`,
            scrub: 0.6,
          },
        });
      }, host);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      video.removeEventListener("seeked", onSeeked);
      ctx && ctx.revert();
    };
  }, [span]);

  // `start` returns its own teardown, but it runs from AmbientVideo's
  // `onReady` rather than from an effect, so React will not call it. Hold it
  // and run it on unmount.
  const disposeRef = useRef(null);
  const onReady = useCallback(
    (video) => {
      disposeRef.current?.();
      disposeRef.current = start(video) || null;
    },
    [start]
  );
  useEffect(() => () => disposeRef.current?.(), []);

  return (
    <div ref={hostRef} className={`ax-scrub ${className}`.trim()}>
      <AmbientVideo
        film={film}
        vignette={vignette}
        videoRef={videoRef}
        onReady={onReady}
        /* While scrubbing, the playhead belongs to the scrollbar. Until then
           — and permanently, on the fallback path — it loops on its own. */
        play={!scrubbing}
        className="ax-scrub__film"
      />
      {children}
    </div>
  );
}
