"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { deployments, STAGES } from "@/components/deployments.data";
import { films, filmFor } from "@/components/video.data";
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
 * has one. Here the reels sit in a screening room — one system on the main
 * screen, the other three live on monitors raked in beside it — and the
 * scrub bar is not a timeline but the five stages this studio already claims
 * to run: Discover, Design, Build, Deploy, Scale. Playing a reel is
 * therefore a walk through the method, and clicking "Deploy" jumps straight
 * to the part a sceptical buyer actually wants to see. The device only works
 * because it's tied to this specific company's process; it wouldn't
 * transplant to a generic portfolio.
 *
 * Three things were wrong with the previous version, and only one of them
 * was visual:
 *
 *   - **Nothing played.** Every reel pointed at a `/reels/*.mp4` that has
 *     never been added, so all four 404'd and the section whose entire
 *     subject is work playing rendered four identical terminal fallbacks.
 *     The reels draw on the shared film library now (see `filmFor.reels`),
 *     with the real-capture slot still open and still taking precedence.
 *   - **No composition.** A sidebar list of four text rows beside one flat
 *     16:9 box is a video player with a playlist, not a scene. Nothing was
 *     featured, because everything was the same weight.
 *   - **The five stages were an afterthought** — a row of small pills under
 *     a separate scrub bar, so the thing that makes this section worth
 *     building was the quietest element in it. The scrub bar IS the five
 *     stages now: one track cut into five labelled segments, each as wide as
 *     that chapter is long, filling as the reel runs.
 *
 * Deliberately NOT scroll-pinned. WhyUs.jsx already pins a horizontal
 * ScrollTrigger; a second pin on the same page is where scroll jank and
 * broken refresh cycles come from, and a video the reader can't control is
 * worse than one they can. Scroll only drives the ambient parallax and tilt
 * here — which reel is selected is left entirely to the reader, via the
 * transport controls or the monitor stack, so scrolling past the section
 * never yanks playback away from whatever they chose.
 */

/** Which file this reel plays, and whether that file is the real thing.
 *
 *  `src` is capture of the actual client system and always wins. `film` is a
 *  clip from the shared library standing in until that capture exists — the
 *  frame says so, out loud, rather than letting a stock shot pass as
 *  evidence. See the provenance note in components/video.data.js. */
const sourceFor = (d) => d.src || films[d.film || filmFor.reels?.[d.id]]?.src || null;
const isReference = (d) => !d.src;

/* How long the stand-in walkthrough takes end to end.
 *
 * The chapter timestamps in components/deployments.data.js are seconds into
 * a 39–52s reel that does not exist yet, and the library clips standing in
 * for those reels are four to ten seconds long and loop. Binding the stage
 * track to the clip's own clock would therefore run all five stages past in
 * under a second; binding it to the unbuilt reel's 48 seconds would show a
 * visitor "Discover" and nothing else.
 *
 * So the track runs the chapters' own proportions — the shape of the
 * engagement, which is the real content here — over a pace someone actually
 * watches, while the clip loops underneath as texture. The moment a `src` is
 * filled in, this is bypassed entirely and the track binds to the video's
 * real clock, timestamps and all. */
const PROGRAMME_SECONDS = 26;

const pad2 = (n) => String(n).padStart(2, "0");

export default function Deployments() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);
  /* How many of the monitor stack's own clips are allowed to start
     downloading. See the staggering effect below — the same "everything
     arms the instant it's on screen" bug the hero had, four times over. */
  const [queueReady, setQueueReady] = useState(0);

  const videoRef = useRef(null);
  const stageRef = useRef(null);
  /* The walkthrough position, per frame. See the clock effect below for why
     this is a ref as well as state. */
  const timeRef = useRef(0);
  const sectionRef = useRef(null);
  const deckRef = useRef(null);
  const queueRef = useRef(null);

  /* A deliberate pause is also a choice — it must survive the section
     scrolling back into view, or the console starts playing again over the
     top of someone who just stopped it. */
  const pausedByUserRef = useRef(false);

  const item = deployments[index];
  const live = !isReference(item);
  const total = (live && duration) || item.duration || 1;

  const src = useMemo(() => sourceFor(item), [item]);

  // Turns each reel's own chapter captions (real copy already in
  // deployments.data.js, not invented for this) into terminal log lines —
  // what a visitor sees if a reel's file is missing or refuses to decode.
  const terminalLines = useMemo(
    () =>
      item.chapters.flatMap((c) => [
        { prompt: true, text: `aibrigade run ${c.stage.toLowerCase()}` },
        { text: `> ${c.caption}` },
      ]),
    [item]
  );

  /* The five stages as measured segments rather than five equal pills: a
     chapter that occupies a quarter of the engagement gets a quarter of the
     track. That is what makes the strip a scrub bar and a process diagram at
     the same time. */
  const segments = useMemo(() => {
    const cs = item.chapters;
    return cs.map((c, i) => {
      const start = c.t;
      const end = i + 1 < cs.length ? cs[i + 1].t : Math.max(total, c.t + 1);
      return { ...c, start, end, span: Math.max(0.001, end - start) };
    });
  }, [item, total]);

  const activeStageIndex = useMemo(() => {
    let n = 0;
    segments.forEach((s, i) => {
      if (time >= s.start) n = i;
    });
    return n;
  }, [segments, time]);

  const activeChapter = segments[activeStageIndex] || item.chapters[0];

  /* ---- playback ------------------------------------------------------ */

  const play = useCallback(() => {
    pausedByUserRef.current = false;
    const v = videoRef.current;
    if (!v) {
      setPlaying(true);
      return;
    }
    const p = v.play();
    if (p?.catch) p.catch(() => setPlaying(false));
    // The walkthrough clock is this section's own, so it starts whether or
    // not the browser let the element play.
    setPlaying(true);
  }, []);

  const pause = useCallback(() => {
    pausedByUserRef.current = true;
    videoRef.current?.pause();
    setPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (failed) return;
    if (playing) pause();
    else play();
  }, [failed, playing, play, pause]);

  const select = useCallback((i) => {
    // Picking a reel — from the monitor stack, the keyboard, or the hero's
    // evidence row — is a request to watch it, not just to switch the
    // frame. The "carry playback across a reel change" effect below is what
    // actually starts the new element once it mounts.
    pausedByUserRef.current = false;
    setPlaying(true);
    setIndex(i);
    timeRef.current = 0;
    setTime(0);
    setDuration(0);
    setFailed(false);
  }, []);

  const seek = useCallback(
    (t) => {
      if (failed) return;
      const clamped = Math.max(0, Math.min(t, total));
      timeRef.current = clamped;
      setTime(clamped);
      const v = videoRef.current;
      // Only a real capture has a timeline to move to. For the stand-in the
      // clip is looping texture — seeking moves the walkthrough, not the film.
      if (v && live) v.currentTime = Math.min(clamped, v.duration || clamped);
      if (!playing) play();
    },
    [failed, total, live, playing, play]
  );

  /* ---- the walkthrough clock ----------------------------------------- */

  /* Real capture drives `time` from `onTimeUpdate` on the element. Without
     it, this is the clock — same chapter proportions, watchable pace.

     The position lives in a ref as well as in state, and the frame reads the
     ref. Advancing it inside a `setTime` updater instead looked tidier and
     was wrong twice over: a state updater has to be pure, so starting the
     next reel from inside one is a side effect React is entitled to run more
     than once — and in StrictMode it does, which skipped a system every time
     a programme ended. The ref also lets `seek` land mid-flight without this
     effect having to tear down and restart around it. */
  useEffect(() => {
    if (!playing || live || failed) return;
    const rate = (item.duration || PROGRAMME_SECONDS) / PROGRAMME_SECONDS;
    let raf = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.25, (now - last) / 1000) * rate;
      last = now;
      const next = timeRef.current + dt;
      if (next >= total) {
        // The programme finished. Move to the next system rather than
        // looping — four reels running one after another is the section
        // playing itself, which is what it is called.
        select((index + 1) % deployments.length);
        return;
      }
      timeRef.current = next;
      setTime(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, live, failed, item, total, index, select]);

  /* ---- ambient + scroll choreography --------------------------------- */

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReducedMotion()) return;

    let ctx;
    let cancelled = false;
    loadGsap().then((mod) => {
      if (!mod || cancelled) return;
      const { gsap, ScrollTrigger } = mod;
      ctx = gsap.context(() => {
        // The violet wash behind the console tracks scroll position.
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

        /* Parallax with a purpose: the monitor stack sits further back in
           the room than the screen does, so it travels less. Two layers
           moving at the same rate is a slide; two moving at different rates
           is depth, and it is the cheapest way to make a flat console read
           as a space. */
        if (queueRef.current) {
          gsap.fromTo(
            queueRef.current,
            { yPercent: 5 },
            {
              yPercent: -5,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 },
            }
          );
        }

        /* The deck tips very slightly as it passes: the far edge of the
           screen settles from 2.2 degrees to flat as the section reaches
           reading position, then leans back as it leaves. Small enough that
           it reads as the room having depth rather than as an effect. */
        if (deckRef.current) {
          gsap.fromTo(
            deckRef.current,
            { "--ax-deck-tilt": "2.2deg", "--ax-deck-lift": "2.5rem" },
            {
              "--ax-deck-tilt": "0deg",
              "--ax-deck-lift": "0rem",
              ease: "none",
              scrollTrigger: { trigger: el, start: "top 85%", end: "top 35%", scrub: 0.8 },
            }
          );
        }

        // Selection is deliberately not scroll-driven: which system is
        // playing is the reader's call, made with the transport controls
        // or the monitor stack, not something scroll position decides for
        // them.
      }, el);
    });
    return () => {
      cancelled = true;
      ctx && ctx.revert();
    };
  }, []);

  /* ---- play only while the section is on screen ----------------------- */

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // "The work, playing" — so it plays, muted, the moment it is
          // genuinely being looked at. Not against a reader who paused it,
          // and not at all if they have asked for less motion.
          if (!pausedByUserRef.current && !prefersReducedMotion() && !failed) play();
        } else {
          videoRef.current?.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [play, failed]);

  /* Stagger the monitor stack's own downloads.
     Each of the four monitors runs its own AmbientVideo, and all four sit
     inside the same `rootMargin` band as the main screen — so the instant
     this section came on screen, five clips (the main reel plus all four
     thumbnails) started downloading at once, and the one the reader is
     actually watching had to share the connection with three they weren't
     looking at. This is the same bug the hero had, just multiplied by
     four. One-shot: it only needs to fire the first time the section is
     genuinely on screen, not on every scroll in and out. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let interval;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        let n = 0;
        setQueueReady(n);
        interval = setInterval(() => {
          n += 1;
          setQueueReady(n);
          if (n >= deployments.length) clearInterval(interval);
        }, 350);
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(interval);
    };
  }, []);

  // A backgrounded tab keeps decoding video on every platform.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        videoRef.current?.pause();
        setPlaying(false);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Keep the element's own muted property in step across reel changes.
  useEffect(() => {
    const v = videoRef.current;
    if (v) v.muted = muted;
  }, [muted, index]);

  /* Carry playback across a reel change.
     The `<video>` is keyed by reel id so the browser drops the previous
     buffer instead of stacking four downloads — which means every change
     mounts a NEW element, paused at zero. The intersection observer above
     only fires when the section crosses the threshold, so it has nothing to
     say about this: without the line below, the first scroll-driven or
     clicked change left the console reading "PLAYING" over a still frame,
     with the stage track running on a clock the footage wasn't keeping. */
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !playing || failed) return;
    v.muted = muted;
    const p = v.play();
    if (p?.catch) p.catch(() => {});
    // `src` as well as `index`: a reel whose file resolves late gets its
    // play() the moment the element actually has something to play.
  }, [index, src, playing, failed, muted]);

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

  // Safety net. `<video src>` is present in the server-rendered markup, so a
  // browser can start (and fail) that fetch before hydration attaches
  // `onError` below — and `error` doesn't bubble, so a synthetic handler that
  // missed the native event never gets a second chance. Without this, a dead
  // file renders as a silent black rectangle instead of the fallback state.
  // `.error` is a persistent property, not a one-shot event, so re-checking
  // it after mount catches the miss.
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

  /* ---- stage track ---------------------------------------------------- */

  const seekInSegment = (e, seg) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(seg.start + p * seg.span);
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
       scenes on this page begin the same way. */
    <Curtain as="section" id="reels" className="ax-reels ax-sweep" hostRef={sectionRef}>
      {/* Texture behind the band, and nothing more. The clip is data moving
          through fibre, which is the one thing this section can honestly
          claim is happening while a reel plays. */}
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

          {/* Not wrapped in `Reveal`.

              It was — `variant="clip"`, which hides its target with
              `data-ax="hide"` synchronously and only unhides it in the
              tween's `onStart`. That is a reveal that fails CLOSED: when
              the dynamic GSAP import resolved after the section had already
              been scrolled past (measurably: whenever four clips were
              decoding at once and the main thread was busy), the
              ScrollTrigger was created past its own start and the tween
              never ran, leaving the centrepiece of the page as a blank
              violet rectangle. Intermittently, which is worse than always.

              It also isn't needed. The band already arrives on `Curtain`'s
              widening clip, and the deck's own tilt and lift below are
              scrubbed — a scrubbed tween lands on its correct value at
              every refresh, so it cannot fail this way. Three entrances on
              one section was one more than the section wanted anyway. */}
          <div className="ax-reels__theatre">
            {/* The room. `perspective` lives here so the screen and the
                monitor stack share one vanishing point — give each its own
                and they read as two flat pictures that happen to be skewed
                rather than as objects at different distances. */}
            <div className="ax-reels__deck" ref={deckRef}>
              {/* ---------------- the screen ---------------- */}
              <div
                className="ax-reels__feature"
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
                  {/* The console's own readout. The dot is a playback state,
                      not decoration: lit and pulsing while the reel runs,
                      dimmed and still when it doesn't — the one place the
                      frame says out loud whether anything is happening. */}
                  <div className="ax-reels__hud" aria-hidden="true">
                    <span className="ax-reels__hud-rec" data-on={playing && !failed}>
                      <span className="ax-reels__hud-dot" />
                      {playing && !failed ? "PLAYING" : "PAUSED"}
                    </span>
                    <span className="ax-reels__hud-count">
                      {pad2(index + 1)} <i>/ {pad2(deployments.length)}</i>
                    </span>
                    <span className="ax-reels__hud-sector">{item.sector}</span>
                    <span className="ax-reels__hud-id">{item.id}</span>
                  </div>

                  {failed || !src ? (
                    <div className="ax-reels__empty">
                      {/* The reel's file is missing or refused to decode.
                          This section never fakes footage — what runs
                          instead is the section's own atmosphere clip,
                          mounted directly in this box rather than relied on
                          to bleed through from the section backdrop several
                          DOM layers up (which sits behind a `Reveal`-wrapped
                          ancestor that isolates its own stacking context, so
                          no amount of transparency here reached it). */}
                      <AmbientVideo
                        film="stream"
                        className="ax-reels__empty-film"
                        rootMargin="0px"
                      />
                      <div className="ax-reels__empty-grid">
                        {/* This case's own chapter captions as a running
                            terminal, so the frame still reads as a live
                            system. `key` forces a fresh type-out per reel. */}
                        <TerminalFeed
                          key={item.id}
                          lines={terminalLines}
                          title={`${item.sector.toLowerCase()} — ${item.id}`}
                          className="ax-reels__empty-terminal"
                        />
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
                      {/* `key` forces a fresh element per reel so the browser
                          drops the previous buffer instead of stacking four
                          downloads, and it restarts the plate's fade so one
                          system dissolves into the next. */}
                      <div className="ax-reels__plate" key={item.id}>
                        <video
                          ref={videoRef}
                          className="ax-reels__video"
                          src={src}
                          poster={item.poster || undefined}
                          muted={muted}
                          loop={!live}
                          playsInline
                          preload="metadata"
                          disablePictureInPicture
                          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
                          onTimeUpdate={(e) => {
                            if (!live) return;
                            timeRef.current = e.currentTarget.currentTime;
                            setTime(e.currentTarget.currentTime);
                          }}
                          onPlay={() => setPlaying(true)}
                          onPause={() => setPlaying(false)}
                          onEnded={() => live && select((index + 1) % deployments.length)}
                          onError={() => setFailed(true)}
                        />
                      </div>

                      {/* Center affordance for the paused state — the
                          transport button below is easy to miss on a first
                          visit; this is the target every video player has
                          trained people to look for. Stops the click from
                          also reaching the screen's own onClick, which would
                          toggle play twice. */}
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

                      <div className="ax-reels__caption" aria-live="polite">
                        <span className="ax-reels__caption-stage">
                          {activeChapter.stage}
                        </span>
                        <span className="ax-reels__caption-text">
                          {activeChapter.caption}
                        </span>
                      </div>

                      {/* Said in the frame, quietly and every time. The clip
                          above is a library clip standing in until capture of
                          the real system exists — see `filmFor.reels` in
                          components/video.data.js. A stock shot under a named
                          sector and a hard metric has to be labelled, or the
                          section is claiming something it cannot support. */}
                      {isReference(item) && (
                        <span className="ax-reels__ref">Reference footage</span>
                      )}
                    </>
                  )}
                </div>

                {/* ---------------- the five stages ---------------- */}
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

                  {/* One track, cut into the five stages, each segment as
                      wide as that chapter is long. It is the scrub bar and
                      the process diagram at once — which is the whole reason
                      this section exists rather than being a video embed. */}
                  <div
                    className="ax-reels__stages"
                    role="group"
                    aria-label="Engagement stages"
                  >
                    {segments.map((seg, i) => {
                      const state =
                        i < activeStageIndex ? "done" : i === activeStageIndex ? "on" : "next";
                      const fill =
                        i < activeStageIndex
                          ? 1
                          : i === activeStageIndex
                          ? Math.max(0, Math.min(1, (time - seg.start) / seg.span))
                          : 0;
                      return (
                        <button
                          key={seg.stage}
                          type="button"
                          className="ax-reels__seg"
                          style={{ flexGrow: seg.span }}
                          data-state={state}
                          disabled={failed}
                          aria-current={state === "on" ? "step" : undefined}
                          aria-label={`${seg.stage} — ${seg.caption}`}
                          onClick={(e) => seekInSegment(e, seg)}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowRight") {
                              e.preventDefault();
                              seek(time + 4);
                            }
                            if (e.key === "ArrowLeft") {
                              e.preventDefault();
                              seek(time - 4);
                            }
                          }}
                        >
                          <span className="ax-reels__seg-rail" aria-hidden="true">
                            <span
                              className="ax-reels__seg-fill"
                              style={{ transform: `scaleX(${fill})` }}
                            />
                          </span>
                          <span className="ax-reels__seg-n" aria-hidden="true">
                            {pad2(i + 1)}
                          </span>
                          <span className="ax-reels__seg-name">{seg.stage}</span>
                        </button>
                      );
                    })}
                    {/* Stages the reel skips still hold their place in the
                        row — the method is five steps whether or not this
                        particular cut has footage for all of them. */}
                    {STAGES.filter((s) => !segments.some((g) => g.stage === s)).map((s) => (
                      <span key={s} className="ax-reels__seg" data-state="absent" aria-hidden="true">
                        <span className="ax-reels__seg-rail" />
                        <span className="ax-reels__seg-name">{s}</span>
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="ax-reels__control"
                    onClick={() => {
                      const v = videoRef.current;
                      const next = v ? !v.muted : !muted;
                      if (v) v.muted = next;
                      setMuted(next);
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

                {/* ---------------- what this reel is ---------------- */}
                <div className="ax-reels__brief">
                  <div className="ax-reels__brief-copy">
                    <p className="ax-reels__brief-client">{item.client}</p>
                    <h3 className="ax-reels__brief-headline">{item.headline}</h3>
                    <p className="ax-reels__outcome">{item.outcome}</p>
                  </div>
                  <div className="ax-reels__brief-metric">
                    <span className="ax-reels__brief-value">
                      <Counter key={item.id} to={Number(item.metric.value)} />
                      <em>{item.metric.unit}</em>
                    </span>
                    <span className="ax-reels__brief-label">{item.metric.label}</span>
                  </div>
                </div>
              </div>

              {/* ---------------- the monitor stack ---------------- */}
              <div
                className="ax-reels__queue"
                ref={queueRef}
                role="tablist"
                /* No `aria-orientation`: the stack is a column on a desktop
                   and a strip under the screen below 1200px, and the key
                   handler takes both axes either way. */
                aria-label="Deployments"
                onKeyDown={onIndexKeyDown}
              >
                <p className="ax-reels__queue-label" aria-hidden="true">
                  On the wall
                  <span>{pad2(deployments.length)}</span>
                </p>

                {deployments.map((d, i) => {
                  const on = i === index;
                  return (
                    /* A `div`, not a `button`, and `AmbientVideo` is the
                       reason: a button's content model is phrasing content
                       and the film mounts a `div`. That nesting is invalid,
                       parses today, and is exactly the kind of thing that
                       diverges between the server's markup and the browser's
                       parse of it. `role="tab"` plus the roving tabindex
                       plus Enter/Space is what the button was giving us here
                       anyway — the tablist already selects on arrow keys. */
                    <div
                      key={d.id}
                      role="tab"
                      id={`reel-tab-${d.id}`}
                      aria-selected={on}
                      aria-controls="reel-stage"
                      tabIndex={on ? 0 : -1}
                      className="ax-reels__monitor"
                      /* Depth by position in the stack, not by index in the
                         data: the selected monitor comes to the front and
                         everything else falls back behind it, so the rake
                         re-forms around whatever is playing. */
                      style={{ "--ax-depth": on ? 0 : Math.abs(i - index) }}
                      onClick={() => select(i)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          select(i);
                        }
                      }}
                    >
                      {/* The receding-wall tilt lives on this inner face, not
                          on the `role="tab"` element above. Rotating and
                          pushing the card itself back in Z (which is what
                          made this read as a rack of monitors) also moves its
                          rendered pixels away from its own layout box under a
                          perspective anchored on the theatre as a whole — so
                          a click aimed at what a reader actually sees was
                          landing on `.ax-reels__queue` behind it instead of
                          this monitor. The hit target now stays flat and
                          exactly where the browser lays it out; only the
                          picture inside tilts. */}
                      <span className="ax-reels__monitor-face">
                        <span className="ax-reels__monitor-screen" aria-hidden="true">
                          {/* Live, not a thumbnail. Four small clips is what
                              makes this read as a wall of monitors rather than
                              a list with pictures — and `AmbientVideo` already
                              refuses to load any of them on a slow connection,
                              on Save-Data, or under reduced motion, and pauses
                              every one that scrolls out of view. */}
                          <AmbientVideo
                            film={d.film || filmFor.reels?.[d.id]}
                            className="ax-reels__monitor-film"
                            vignette={false}
                            rootMargin="50% 0px"
                            /* Gated by the staggering effect above — `arm`
                               only ever latches true, so once this
                               monitor's turn comes up it keeps loading
                               even if `queueReady` moves on. */
                            arm={i < queueReady ? "visible" : false}
                          />
                          <span className="ax-reels__monitor-n">{pad2(i + 1)}</span>
                          {on && (
                            <span className="ax-reels__monitor-on">
                              <span className="ax-reels__monitor-dot" />
                              On screen
                            </span>
                          )}
                        </span>
                        <span className="ax-reels__monitor-body">
                          <span className="ax-reels__monitor-sector">{d.sector}</span>
                          <span className="ax-reels__monitor-headline">{d.headline}</span>
                          <span className="ax-reels__monitor-metric">
                            {d.metric.value}
                            <em>{d.metric.unit}</em>
                          </span>
                        </span>
                        {/* This reel's own progress, on the monitor it
                            belongs to. The stack doubles as the playlist and
                            the position readout, the way a gallery wall
                            does. */}
                        <span className="ax-reels__monitor-bar" aria-hidden="true">
                          <span
                            className="ax-reels__monitor-fill"
                            style={{ width: on ? `${pct}%` : "0%" }}
                          />
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Curtain>
  );
}
