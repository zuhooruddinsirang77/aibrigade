"use client";

import { useEffect, useRef, useState } from "react";
import { films } from "@/components/video.data";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * One `<video>` element, loaded late and played only while someone can
 * actually see it.
 *
 * Every other film on this page goes through here, and the reason is
 * arithmetic: /public/video is ~28MB across eight clips. A page that mounts
 * eight `<video src>` tags downloads all of it, and the browser starts those
 * fetches from the server-rendered markup — before hydration, before any
 * effect gets a chance to intervene. So `src` is deliberately absent from
 * the first render and is attached from an effect once the element is within
 * a screen of the viewport. Nothing loads for a reader who never scrolls
 * that far, and the hero clip is the only one that costs anything above the
 * fold.
 *
 * Three ways this declines to play at all, each of which leaves the poster
 * gradient in place rather than a black box:
 *
 *   - `prefers-reduced-motion`. A looping background is exactly the
 *     unrequested, unstoppable motion that setting exists to refuse, and
 *     since the clip would never move, downloading megabytes for a still
 *     frame would be worse than showing none.
 *   - Save-Data, or a connection reporting 2g/slow-2g.
 *   - Autoplay refused by the browser. `play()` rejects, and the catch is
 *     the whole handler — there is no play button to offer, because this is
 *     scenery and no reader came here to start it.
 *
 * There is no per-instance grade or opacity. Every film on the page renders
 * through the same CSS in `.ax-film`, and a surface that needs more contrast
 * under its copy gets a scrim from its own section instead. The reason is
 * written up at the top of app/film.css: the version with per-surface tuning
 * made the page look like eight different sites.
 */
export default function AmbientVideo({
  film,
  className = "",
  vignette = true,
  play: shouldPlay = true,
  /** When the clip is allowed to start downloading.
   *  "visible" — once it comes within `rootMargin` of the viewport.
   *  true      — now.
   *  false     — not yet. Used by `HoverFilm`, where the cost of a clip is
   *              only worth paying for a card someone actually pointed at. */
  arm = "visible",
  videoRef: externalRef,
  hostRef: externalHostRef,
  onReady,
  rootMargin = "100% 0px",
  ...rest
}) {
  const spec = films[film];

  const innerHostRef = useRef(null);
  const hostRef = externalHostRef || innerHostRef;
  const innerRef = useRef(null);
  const videoRef = externalRef || innerRef;

  // `armed` is "this element is close enough that loading it is justified".
  // It only ever goes true — a clip that has been fetched should not be
  // thrown away and re-fetched when the reader scrolls back past it.
  const [armed, setArmed] = useState(false);
  const [ready, setReady] = useState(false);

  /* ---- decide whether this clip may load at all ---------------------- */

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !spec) return;

    if (prefersReducedMotion()) return;

    const conn = navigator.connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return;

    // Explicit arming, from a caller that already knows the reader wants
    // this clip. `false` is not "disarm" — a clip that has been fetched
    // should not be thrown away because the pointer left.
    if (arm !== "visible") {
      if (arm) setArmed(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(host);
    return () => io.disconnect();
  }, [spec, rootMargin, arm, hostRef]);

  /* ---- play only while visible --------------------------------------- */

  // Separate observer from the one above, and a tighter box: `armed` wants
  // to fire early enough that the clip has buffered by the time it is seen,
  // playback wants to start only once it actually is.
  useEffect(() => {
    const host = hostRef.current;
    const v = videoRef.current;
    if (!armed || !host || !v) return;

    // Not optional, and not a duplicate of the `muted` prop: if this is
    // ever false at the moment `play()` is called, the browser refuses.
    v.muted = true;

    let visible = false;

    const sync = () => {
      if (visible && shouldPlay) {
        const p = v.play();
        // Autoplay refused, or the element was torn down mid-promise.
        if (p?.catch) p.catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.01 }
    );
    io.observe(host);

    // A backgrounded tab keeps firing rAF-driven work on some platforms and
    // keeps decoding video on all of them.
    const onVisibility = () => {
      if (document.hidden) v.pause();
      else sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    sync();

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [armed, shouldPlay, videoRef]);

  if (!spec) return null;

  // No grade modifier. Every film on the page renders identically; where a
  // surface needs more contrast for the copy on top of it, the SECTION adds
  // a scrim. See the note at the top of app/film.css.
  const cls = ["ax-film", ready ? "is-ready" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={hostRef} className={cls} aria-hidden="true" {...rest}>
      {armed && (
        <video
          ref={videoRef}
          className="ax-film__el"
          /* Inline autoplay is only permitted for a muted, playsinline
             element. `muted` is also forced as a property in the effect
             below — React has a long history of dropping this particular
             attribute, and losing it turns every background clip on the
             page into a blocked-autoplay black box. */
          src={spec.src}
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
          onLoadedData={(e) => {
            setReady(true);
            onReady?.(e.currentTarget);
          }}
        />
      )}
      <span className="ax-film__grade" />
      {vignette && <span className="ax-film__vignette" />}
    </div>
  );
}
