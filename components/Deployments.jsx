"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { deployments, STAGES } from "@/components/deployments.data";
import { loadGsap, prefersReducedMotion } from "@/components/motion/gsapLoader";
import Reveal from "@/components/motion/Reveal";
import MaskHeading from "@/components/motion/MaskHeading";
import Counter from "@/components/motion/Counter";
import TerminalFeed from "@/components/motion/TerminalFeed";
import Kicker from "@/components/motion/Kicker";
import AmbientVideo from "@/components/motion/AmbientVideo";
import Curtain from "@/components/motion/Curtain";

/**
 * Deployments — "The work, playing".
 *
 * The reason this isn't a video grid with a lightbox: a grid of thumbnails
 * makes a prospect choose before they know anything, and every studio site
 * has one. Here the reels sit in a single stage, and the scrub bar is divided
 * into the five stages this studio already claims to run — Discover, Design,
 * Build, Deploy, Scale. Playing a reel is therefore a walk through the
 * method, and clicking "Deploy" jumps straight to the part a sceptical buyer
 * actually wants to see. The device only works because it's tied to this
 * specific company's process; it wouldn't transplant to a generic portfolio.
 *
 * Deliberately NOT scroll-pinned. WhyUs.jsx already pins a horizontal
 * ScrollTrigger; a second pin on the same page is where scroll jank and
 * broken refresh cycles come from, and a video the reader can't control is
 * worse than one they can.
 */
export default function Deployments() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);

  const videoRef = useRef(null);
  const stageRef = useRef(null);

  const item = deployments[index];
  const total = duration || item.duration || 1;

  // Turns each reel's own chapter captions (real copy already in
  // deployments.data.js, not invented for this) into terminal log lines —
  // what a visitor sees in place of the raw "not uploaded yet" placeholder
  // while the actual footage doesn't exist yet.
  const terminalLines = useMemo(
    () =>
      item.chapters.flatMap((c) => [
        { prompt: true, text: `aibrigade run ${c.stage.toLowerCase()}` },
        { text: `> ${c.caption}` },
      ]),
    [item]
  );

  const activeChapter = useMemo(() => {
    let current = item.chapters[0];
    for (const c of item.chapters) if (time >= c.t) current = c;
    return current;
  }, [item, time]);

  /* ---- playback ------------------------------------------------------ */

  const play = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p?.catch) p.catch(() => setPlaying(false));
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v || failed) return;
    if (v.paused) play();
    else v.pause();
  }, [failed, play]);

  const select = useCallback((i) => {
    setIndex(i);
    setTime(0);
    setDuration(0);
    setFailed(false);
  }, []);

  const seek = useCallback((t) => {
    const v = videoRef.current;
    if (!v || failed) return;
    v.currentTime = Math.max(0, Math.min(t, v.duration || t));
    setTime(t);
    if (v.paused) play();
  }, [failed, play]);

  // The violet wash behind the console tracks scroll position. It's the one
  // piece of ambient motion in this section — everything else here waits for
  // the reader to do something.
  useEffect(() => {
    const el = stageRef.current?.closest(".ax-reels");
    if (!el || prefersReducedMotion()) return;

    let ctx;
    let cancelled = false;
    loadGsap().then((mod) => {
      if (!mod || cancelled) return;
      const { gsap } = mod;
      ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { "--ax-sweep-y": "4%", "--ax-sweep-x": "34%" },
          {
            "--ax-sweep-y": "88%",
            "--ax-sweep-x": "66%",
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.9 },
          }
        );
      }, el);
    });
    return () => {
      cancelled = true;
      ctx && ctx.revert();
    };
  }, []);

  // Pause when the section leaves the viewport. A reel playing to nobody
  // costs the reader battery and bandwidth for nothing.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const v = videoRef.current;
        if (!v) return;
        if (!entry.isIntersecting && !v.paused) v.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Autoplay the newly selected reel — muted, so browsers allow it, and only
  // when motion is welcome.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    setMuted(true);
  }, [index]);

  // The hero's evidence row prints three of these reels' metrics; clicking
  // one is meant to land on that reel, not merely somewhere near this
  // section. A window event rather than lifted state or context because
  // these two components share nothing else, and the hero must not have to
  // know how this console tracks its selection.
  useEffect(() => {
    const onSelect = (e) => {
      const i = deployments.findIndex((d) => d.id === e.detail?.id);
      if (i >= 0) select(i);
    };
    window.addEventListener("ax:select-reel", onSelect);
    return () => window.removeEventListener("ax:select-reel", onSelect);
  }, [select]);

  // Safety net for the very first reel. `<video src>` is present in the
  // server-rendered markup, so a browser can start (and, for a placeholder
  // path, fail) that fetch before hydration attaches `onError` below — and
  // `error` doesn't bubble, so a synthetic handler that missed the native
  // event never gets a second chance to catch it. Without this, a 404 reel
  // renders as a silent black rectangle instead of the "not uploaded yet"
  // state: the failure happened, React state just never heard about it.
  // `.error` is a persistent property on the element, not a one-shot event,
  // so re-checking it after mount catches the miss.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const check = () => {
      if (v.error) setFailed(true);
    };
    check();
    const t = setTimeout(check, 400);
    return () => clearTimeout(t);
  }, [index]);

  /* ---- scrub bar ----------------------------------------------------- */

  const onTrackClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - rect.left) / rect.width) * total);
  };

  // Roving tabindex: moving with the arrows has to move focus too, or the
  // keyboard user lands on a button that is no longer tabbable.
  const move = (next) => {
    select(next);
    requestAnimationFrame(() => {
      document.getElementById(`reel-tab-${deployments[next].id}`)?.focus();
    });
  };

  const onIndexKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      move((index + 1) % deployments.length);
    }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      move((index - 1 + deployments.length) % deployments.length);
    }
  };

  const pct = Math.min(100, (time / total) * 100);

  return (
    /* Opens from an inset card to full bleed as it arrives — the same
       entrance Environments and the closing CTA use, so the three dark
       scenes on this page begin the same way. `closest(".ax-reels")` above
       still finds this element: Curtain renders the section itself, not a
       wrapper around it. */
    <Curtain as="section" id="reels" className="ax-reels ax-sweep">
      {/* Texture behind the band, and nothing more — see the provenance
          note in components/video.data.js for why generated footage is
          kept out of the console itself. The clip is data moving through
          fibre, which is the one thing this section can honestly claim is
          happening while a reel plays. */}
      <AmbientVideo film="stream" className="ax-reels__film" />
      <div className="padding-global">
        <div className="container-large">
          <div className="ax-reels__head">
            <Kicker id="reels" label="Deployments" tone="invert" />
            <h2 className="ax-reels__title">
              <MaskHeading text={"The work,\nplaying"} />
            </h2>
            <Reveal variant="rise" className="ax-reels__intro">
              <p>
                Four systems, running. Each reel is cut to the five stages we
                run every engagement through — jump to the one you care about.
              </p>
            </Reveal>
          </div>

          <Reveal variant="clip" className="ax-reels__console">
            {/* ---------------- index ---------------- */}
            <div
              className="ax-reels__index"
              role="tablist"
              aria-orientation="vertical"
              aria-label="Deployments"
              onKeyDown={onIndexKeyDown}
            >
              {deployments.map((d, i) => (
                <button
                  key={d.id}
                  type="button"
                  role="tab"
                  id={`reel-tab-${d.id}`}
                  aria-selected={i === index}
                  aria-controls="reel-stage"
                  tabIndex={i === index ? 0 : -1}
                  className="ax-reels__entry"
                  onClick={() => select(i)}
                >
                  <span className="ax-reels__entry-bar" aria-hidden="true">
                    <span
                      className="ax-reels__entry-fill"
                      style={{ height: i === index ? `${pct}%` : "0%" }}
                    />
                  </span>
                  <span className="ax-reels__entry-body">
                    <span className="ax-reels__entry-sector">{d.sector}</span>
                    <span className="ax-reels__entry-headline">{d.headline}</span>
                    <span className="ax-reels__entry-client">{d.client}</span>
                  </span>
                  <span className="ax-reels__entry-metric" aria-hidden="true">
                    <Counter to={Number(d.metric.value)} />
                    <em>{d.metric.unit}</em>
                  </span>
                </button>
              ))}
            </div>

            {/* ---------------- stage ---------------- */}
            <div
              className="ax-reels__stage"
              id="reel-stage"
              role="tabpanel"
              aria-labelledby={`reel-tab-${item.id}`}
              ref={stageRef}
            >
              <div
                className="ax-reels__screen"
                data-cursor={failed ? undefined : "play"}
                onClick={togglePlay}
              >
                {/* The console's own readout — sector and case id, plus a
                    live dot that borrows the same pulse already used below
                    for the empty-state status line. Present in both states
                    so the frame reads as one instrument, not a video player
                    that occasionally shows a fallback. */}
                <div className="ax-reels__hud" aria-hidden="true">
                  <span className="ax-reels__hud-rec">
                    <span className="ax-reels__hud-dot" />
                    REC
                  </span>
                  <span className="ax-reels__hud-sector">{item.sector}</span>
                  <span className="ax-reels__hud-id">{item.id}</span>
                </div>

                {failed ? (
                  <div className="ax-reels__empty">
                    {/* No client footage exists for this reel yet, and this
                        section never fakes that — see the provenance note
                        in components/video.data.js. What's shown instead is
                        the section's own atmosphere clip, mounted directly
                        in this box rather than relied on to bleed through
                        from the section-level backdrop behind it: that
                        backdrop sits several DOM layers up, behind a
                        `Reveal`-wrapped ancestor that (harmlessly, but
                        conclusively) turned out to isolate its own stacking
                        context, so no amount of transparency on the screen
                        itself actually reached it. A dedicated instance
                        here has no such ambiguity — same file, same
                        `AmbientVideo`, browser cache makes the second
                        request nearly free. */}
                    <AmbientVideo
                      film="stream"
                      className="ax-reels__empty-film"
                      rootMargin="0px"
                    />
                    <div className="ax-reels__empty-grid">
                      {/* Footage doesn't exist for this reel yet. Showing this
                          specific case's own chapter captions as a running
                          terminal keeps the section feeling like a live system
                          even before there's video to play — `key` forces a
                          fresh mount (and a fresh type-out) per reel, same
                          reason the <video> below is keyed by item.id.

                          What used to sit under it was "add public/reels/x.mp4
                          to bring it online" — an instruction to the developer,
                          printed on the live marketing site for prospects to
                          read. The status line below says the same thing to the
                          only audience that's actually here. */}
                      <TerminalFeed
                        key={item.id}
                        lines={terminalLines}
                        title={`${item.sector.toLowerCase()} — ${item.id}`}
                        className="ax-reels__empty-terminal"
                      />
                      {/* The one number this case is already known for
                          (same value as the sidebar row), blown up here so
                          the frame that would otherwise be dead space reads
                          as a result card instead of a gap. */}
                      <div className="ax-reels__empty-metric">
                        <span className="ax-reels__empty-metric-value">
                          <Counter to={Number(item.metric.value)} />
                          <em>{item.metric.unit}</em>
                        </span>
                        <span className="ax-reels__empty-metric-label">
                          {item.metric.label}
                        </span>
                      </div>
                    </div>
                    <p className="ax-reels__empty-note">
                      <span className="ax-reels__empty-dot" aria-hidden="true" />
                      Walkthrough in post &mdash; the build log runs live in the
                      meantime.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* key forces a fresh element per reel so the browser drops
                       the previous buffer instead of stacking four downloads */}
                    <video
                      key={item.id}
                      ref={videoRef}
                      className="ax-reels__video"
                      src={item.src}
                      poster={item.poster}
                      muted={muted}
                      playsInline
                      preload="metadata"
                      onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
                      onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                      onPlay={() => setPlaying(true)}
                      onPause={() => setPlaying(false)}
                      onEnded={() => select((index + 1) % deployments.length)}
                      onError={() => setFailed(true)}
                    />

                    {/* Center affordance for the paused state — the small
                        transport button below is easy to miss on a first
                        visit; this is the same target every video player
                        trains people to look for. Stops the click from
                        also reaching the screen's own onClick, which would
                        otherwise toggle play twice. */}
                    {!playing && (
                      <button
                        type="button"
                        className="ax-reels__bigplay"
                        aria-label="Play reel"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay();
                        }}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8 5.2l11 6.8-11 6.8z" />
                        </svg>
                      </button>
                    )}

                    {/* Overlays the footage only — with no video there is no
                        "now playing" moment to caption, and the terminal
                        feed already narrates the current chapter on its own. */}
                    <div className="ax-reels__caption" aria-live="polite">
                      <span className="ax-reels__caption-stage">{activeChapter.stage}</span>
                      <span className="ax-reels__caption-text">{activeChapter.caption}</span>
                    </div>
                  </>
                )}
              </div>

              {/* ---------------- chapter track ---------------- */}
              <div className="ax-reels__transport">
                <button
                  type="button"
                  className="ax-reels__control"
                  onClick={togglePlay}
                  disabled={failed}
                  aria-label={playing ? "Pause reel" : "Play reel"}
                >
                  {playing ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="7" y="5" width="3.4" height="14" rx="1" />
                      <rect x="13.6" y="5" width="3.4" height="14" rx="1" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 5.2l11 6.8-11 6.8z" />
                    </svg>
                  )}
                </button>

                <div className="ax-reels__track-wrap">
                  <div
                    className="ax-reels__track"
                    onClick={onTrackClick}
                    role="slider"
                    tabIndex={0}
                    aria-label="Reel position"
                    aria-valuemin={0}
                    aria-valuemax={Math.round(total)}
                    aria-valuenow={Math.round(time)}
                    aria-valuetext={`${activeChapter.stage}, ${Math.round(time)} seconds`}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight") seek(time + 5);
                      if (e.key === "ArrowLeft") seek(time - 5);
                    }}
                  >
                    <span className="ax-reels__track-fill" style={{ width: `${pct}%` }} />
                    <span className="ax-reels__thumb" style={{ left: `${pct}%` }} aria-hidden="true" />
                    {item.chapters.map((c) => (
                      <span
                        key={c.stage}
                        className="ax-reels__marker"
                        style={{ left: `${(c.t / total) * 100}%` }}
                        aria-hidden="true"
                      />
                    ))}
                  </div>

                  <div className="ax-reels__stages">
                    {STAGES.map((stage) => {
                      const chapter = item.chapters.find((c) => c.stage === stage);
                      const isOn = activeChapter.stage === stage;
                      return (
                        <button
                          key={stage}
                          type="button"
                          className="ax-reels__stage-btn"
                          data-on={isOn}
                          disabled={!chapter || failed}
                          onClick={() => chapter && seek(chapter.t)}
                          aria-label={`Jump to ${stage}`}
                        >
                          {stage}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  className="ax-reels__control"
                  onClick={() => {
                    const v = videoRef.current;
                    if (!v) return;
                    v.muted = !v.muted;
                    setMuted(v.muted);
                  }}
                  disabled={failed}
                  aria-label={muted ? "Unmute reel" : "Mute reel"}
                >
                  {muted ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 9.5h3.6L12 5.6v12.8l-4.4-3.9H4z" />
                      <path d="M16 9.6l4.4 4.8M20.4 9.6L16 14.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 9.5h3.6L12 5.6v12.8l-4.4-3.9H4z" />
                      <path d="M15.6 9a4.2 4.2 0 010 6M18 6.6a7.6 7.6 0 010 10.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              </div>

              <p className="ax-reels__outcome">{item.outcome}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </Curtain>
  );
}
