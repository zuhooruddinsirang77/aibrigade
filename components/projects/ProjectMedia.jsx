"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { LANGUAGES, orientationOf } from "@/components/projects.data";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * The stage a project's demo plays on. One `<video>`, whichever language
 * is selected; the card around it never changes.
 *
 * Two things this has to get right that a plain `<video>` doesn't:
 *
 *   Shape. A mobile app is filmed at 9:16 and a web app at 16:9, and one
 *   project can mix the two across its cuts. The stage reads the active
 *   cut's dimensions (from the data first, then from the element the
 *   moment it reports its own) and lays out for THAT: a landscape cut
 *   fills the width at its own ratio; a portrait cut stands centred at a
 *   fixed height inside a device-style frame, with room around it. Nothing
 *   is stretched or cropped, and when a language change alters the shape
 *   the stage animates between the two heights rather than jumping.
 *
 *   Weight. Only the selected cut is in the DOM at all, and nothing
 *   downloads until the card is within 600px of the viewport (see the
 *   IntersectionObserver below) — `preload="none"` behind a poster frame
 *   until then, `"metadata"` once seen, and `"auto"` only once the
 *   pointer or focus reaches the stage. Eight cards on `"auto"` meant the
 *   browser buffered every card's cut in parallel the moment the grid
 *   came near — ~195MB of mostly-4K footage competing with the rest of
 *   the page for bandwidth and decoders — for demos most visitors never
 *   press. Intent is still a head start on the click, so playback starts
 *   almost at once, and a visitor who never scrolls to a card still
 *   never fetches its video. Pressing a language after playback has
 *   started carries the intent over — the new cut starts itself — but a
 *   language change on an unstarted card just swaps the poster. Only one
 *   demo plays at a time across the section, and a demo that scrolls
 *   fully out of view pauses rather than playing to nobody.
 */

/** Section-wide "one at a time". Every stage listens; the one that just
 *  started tells the rest to stop. Same window-event idiom the hero uses
 *  to reach this section. */
const PLAY_EVENT = "ax:project-play";

export default function ProjectMedia({
  video,
  code,
  projectName,
  /** "featured" gets a taller stage than a grid card. */
  variant = "card",
  /** Told by the card when a language change happened while playing, so
   *  the new cut starts on its own. */
  resumeToken,
}) {
  const instance = useId();
  const stageRef = useRef(null);
  const videoRef = useRef(null);
  const lastHeight = useRef(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [dims, setDims] = useState(() => ({ width: video?.width, height: video?.height }));
  // Nothing downloads until a card has been seen at least once — after
  // that its metadata is fetched, and `warm` (pointer or focus on the
  // stage) lets it buffer the cut itself. Both sticky rather than tied to
  // `isIntersecting` directly, so scrolling a card back off-screen doesn't
  // discard what it fetched.
  const [seen, setSeen] = useState(false);
  const [warm, setWarm] = useState(false);

  const lang = LANGUAGES[code] || { english: code };
  const orientation = orientationOf(dims);
  const ratio = dims.width && dims.height ? `${dims.width} / ${dims.height}` : "16 / 9";

  /* ---- a new cut ------------------------------------------------------ */

  // The element is keyed by src, so a language change mounts a fresh one.
  // Reset to the data's dimensions for the new cut — during render, the
  // way React asks for state derived from a changed prop, so the stage
  // never paints a frame laid out for the previous cut. The element
  // corrects the dimensions below if the file disagrees with the data.
  const [seenSrc, setSeenSrc] = useState(video?.src);
  if (video?.src !== seenSrc) {
    setSeenSrc(video?.src);
    setDims({ width: video?.width, height: video?.height });
    setPlaying(false);
    setStarted(Boolean(resumeToken));
  }

  // Carry playback across a language change. The click that changed the
  // language is a user gesture, so play() with sound is permitted.
  useEffect(() => {
    if (!resumeToken) return;
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p?.catch) p.catch(() => setStarted(false));
  }, [resumeToken, video?.src]);

  /* ---- shape ---------------------------------------------------------- */

  // Track the stage's rendered height so a change of cut can be animated
  // from the old height to the new. The observer fires after layout, so at
  // the moment the layout effect below runs it still holds the previous
  // cut's height — which is exactly the value needed.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      lastHeight.current = entry.contentRect.height;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = stageRef.current;
    const from = lastHeight.current;
    if (!el || from == null || prefersReducedMotion()) return;
    const to = el.getBoundingClientRect().height;
    if (Math.abs(to - from) < 2) return;

    el.style.transition = "none";
    el.style.height = `${from}px`;
    el.style.overflow = "hidden";
    // Force the starting height to be laid out before transitioning away
    // from it.
    void el.offsetHeight;
    el.style.transition = "height 0.55s var(--ease)";
    el.style.height = `${to}px`;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.style.transition = "";
      el.style.height = "";
      el.style.overflow = "";
    };
    el.addEventListener("transitionend", finish, { once: true });
    const t = setTimeout(finish, 650);
    return () => {
      clearTimeout(t);
      finish();
    };
  }, [ratio, orientation]);

  /* ---- one at a time, and not off screen ------------------------------ */

  useEffect(() => {
    const onOther = (e) => {
      if (e.detail?.instance !== instance) videoRef.current?.pause();
    };
    window.addEventListener(PLAY_EVENT, onOther);
    return () => window.removeEventListener(PLAY_EVENT, onOther);
  }, [instance]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSeen(true);
        else videoRef.current?.pause();
      },
      { threshold: 0, rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) videoRef.current?.pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Browsers only consult `preload` when the resource-selection algorithm
  // runs — on mount, or after an explicit load() call. Flipping the attribute
  // on an already-mounted element (none -> metadata, first time a card is
  // seen) doesn't retroactively start fetching on its own, so kick it here.
  // The later metadata -> auto step needs no kick: raising `preload` on an
  // element that has already loaded is honoured as it stands.
  useEffect(() => {
    if (!seen || started) return;
    videoRef.current?.load();
  }, [seen, started]);

  /* ---- handlers -------------------------------------------------------- */

  const start = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setStarted(true);
    const p = v.play();
    if (p?.catch) p.catch(() => {});
  }, []);

  const onPlay = () => {
    setPlaying(true);
    setStarted(true);
    window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: { instance } }));
  };

  const onLoadedMetadata = (e) => {
    const { videoWidth: w, videoHeight: h } = e.currentTarget;
    if (w && h && (w !== dims.width || h !== dims.height)) setDims({ width: w, height: h });
  };

  if (!video) return null;

  return (
    <div
      ref={stageRef}
      className={`ax-proj__stage ax-proj__stage--${variant}`}
      data-orientation={orientation}
      data-playing={playing || undefined}
      data-started={started || undefined}
      style={{ "--ax-ratio": ratio }}
      onPointerEnter={() => setWarm(true)}
      onFocus={() => setWarm(true)}
    >
      {/* A blurred copy of the poster lights the space around a cut that
          sits inset from its own frame — every portrait cut, and a
          landscape one in the grid (see `.ax-proj__stage--card` in
          projects.css: a landscape screenshot there is framed with a
          margin rather than bled to the edge, the same reasoning as the
          device frame below). The featured slot's landscape cut still
          runs full-bleed, so it gets no glow — there's no margin for one
          to light. Decorative only. */}
      {(orientation === "portrait" || variant === "card") && video.poster && (
        <span
          className="ax-proj__stage-glow"
          aria-hidden="true"
          style={{ backgroundImage: `url("${video.poster}")` }}
        />
      )}

      <div className="ax-proj__frame" key={video.src}>
        <video
          ref={videoRef}
          className="ax-proj__video"
          src={video.src}
          poster={video.poster || undefined}
          preload={seen ? (warm ? "auto" : "metadata") : "none"}
          playsInline
          controls={started}
          controlsList="nodownload"
          aria-label={`${projectName} demo, ${lang.english}`}
          onLoadedMetadata={onLoadedMetadata}
          onPlay={onPlay}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />

        {!started && (
          <button
            type="button"
            className="ax-proj__play"
            aria-label={`Play ${projectName} demo in ${lang.english}`}
            data-cursor="play"
            onClick={start}
          >
            <span className="ax-proj__play-ring" aria-hidden="true">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5.2l11 6.8-11 6.8z" />
              </svg>
            </span>
            <span className="ax-proj__play-text" aria-hidden="true">
              Watch demo
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
