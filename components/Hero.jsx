"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePopup } from "@/components/PopupContext";
import MaskHeading from "@/components/motion/MaskHeading";
import Magnetic from "@/components/motion/Magnetic";
import Reveal from "@/components/motion/Reveal";
import ProofStrip from "@/components/motion/ProofStrip";
import Kicker from "@/components/motion/Kicker";
import AmbientVideo from "@/components/motion/AmbientVideo";
import StageDepth from "@/components/motion/StageDepth";
import DepthField from "@/components/motion/DepthField";
import ScrollCue from "@/components/motion/ScrollCue";
import { heroModes } from "@/components/video.data";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";

const CDN = "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617";

const tickerLogos = [
  `${CDN}/6419854b6528564c6705e8f1_logo%20halyk.svg`,
  `${CDN}/6419854b9612bf761a454aaa_logo%20ICU.svg`,
  `${CDN}/6419854bcd8723200b132ed2_raiffeisen.svg`,
  `${CDN}/6419854b3d99c56eb40ece06_aushan.svg`,
  `${CDN}/6419854b8f060240e04873d7_bcc-invest.svg`,
  `${CDN}/6419854b3d99c5ea9b0ece07_image_267.webp`,
];

/** How long a mode holds before the hero moves itself on, in ms. */
const DWELL = 6500;
const TICK = 50;

/**
 * The first screen — rebuilt, then made interactive.
 *
 * What was here originally was a two-column Webflow grid with five separate
 * pieces of atmosphere stacked into it — a violet section colour, two
 * blurred glow blobs, a live WebGL neural network, two floating 3D renders —
 * and none of them could be seen properly because all of them were
 * competing. Five half-strength effects is not atmosphere, it is mud. That
 * became one idea: real footage of the thing the company sells, full bleed,
 * full strength, with the claim set on top of it.
 *
 * This pass adds the interaction: three modes — Overview, Fintech,
 * HealthTech — behind a small tab row under the lede. Switching one swaps
 * the background clip and the sentence beneath the headline; the H1 itself
 * stays put, because "Custom AI Systems for Fintech & HealthTech" is the one
 * claim true of all three states, not something to re-animate every few
 * seconds. It advances on its own — the same dwell-and-stop pattern already
 * used in `Environments` and `ServiceExplorer` further down the page — so
 * the hero is visibly alive on first paint instead of waiting to be
 * discovered, and stops once a reader touches the tab row itself.
 *
 * That last part is scoped deliberately narrow: the "taken over" listener
 * sits on `.ax-hero__modes`, not on the hero as a whole. The hero fills the
 * first viewport, so unlike `Environments` — which a reader has to
 * deliberately scroll to and is already choosing to look at — a pointer is
 * almost always already resting somewhere over it the moment the page
 * finishes loading, and Chromium re-evaluates `:hover` under a stationary
 * cursor on layout changes. A listener on the whole section fired within
 * the first render or two, every time, which pinned the mode to Overview
 * before the auto-advance ever got a full cycle — the video never appeared
 * to switch. Scoped to the tabs, only an actual pointer-over or focus on
 * that row counts as taking over.
 *
 * Every `line` in `heroModes` (components/video.data.js) is a recombination
 * of phrases already written elsewhere on the page — nothing new is claimed
 * here that WhyUs and Services don't already say in full sentences. `Fintech`
 * and `HealthTech` reuse clips already fetched further down the page rather
 * than owning dedicated footage, so a reader who explores here and later
 * scrolls to WhyUs or Cases gets an instant cache hit.
 *
 * Removed from the original build, deliberately: `HeroNetwork`, `ThreeHero`,
 * the `header_dec-*` renders, `.ax-hero-glow`, the `Parallax` wrappers that
 * drove them, and `AgentConsole` — the synthetic terminal that stood in for
 * a product shot before there was real footage to show one. `HeroNetwork`
 * still runs in `CtaDark`, where it is the only visual in the section.
 */
export default function Hero() {
  const { openPopup } = usePopup();
  const [lines, setLines] = useState("Custom AI Systems\nfor Fintech & HealthTech");

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 720) setLines("Custom AI\nSystems for\nFintech & HealthTech");
      else if (w < 1100) setLines("Custom AI Systems\nfor Fintech\n& HealthTech");
      else setLines("Custom AI Systems\nfor Fintech & HealthTech");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* ---- the mode switcher ---------------------------------------------- */

  const [mode, setMode] = useState(0);
  const [taken, setTaken] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const sectionRef = useRef(null);
  const inView = useRef(true);
  // Mirrors `mode` for the scroll-jack effect below, which needs to compare
  // against the current mode from inside a ScrollTrigger callback set up
  // once on mount — a plain closure over `mode` there would only ever see
  // whatever it was when the effect first ran.
  const modeRef = useRef(0);

  const active = heroModes[mode];

  // All three clips play from first paint rather than mounting on demand —
  // the hero is the one place on the page this is worth the extra
  // bandwidth. Waiting for a click meant the first switch always had a
  // beat of buffering before the crossfade could start, which read as a
  // stutter on the one screen a visitor forms an opinion from in the first
  // few seconds. Every section further down the page still arms lazily —
  // this trade only applies above the fold, and Fintech/HealthTech are the
  // same files WhyUs and Cases fetch anyway, so nothing here is wasted if
  // the reader scrolls on without touching a tab.
  const select = useCallback((i, byReader = true) => {
    modeRef.current = i;
    setMode(i);
    setElapsed(0);
    if (byReader) setTaken(true);
  }, []);

  // Pauses the auto-advance once the reader has scrolled past the hero, the
  // same guard `Environments` uses — a tab quietly cycling somewhere off
  // screen is wasted motion, not atmosphere.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { inView.current = entry.isIntersecting; },
      { threshold: 0.35 }
    );
    
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (taken || prefersReducedMotion()) return;
    const id = setInterval(() => {
      if (!inView.current || document.hidden) return;
      setElapsed((e) => {
        if (e + TICK < DWELL) return e + TICK;
        select((mode + 1) % heroModes.length, false);
        return 0;
      });
    }, TICK);
    return () => clearInterval(id);
  }, [taken, mode, select]);

  const move = (next) => {
    select(next);
    requestAnimationFrame(() => {
      document.getElementById(`hero-mode-${heroModes[next].id}`)?.focus();
    });
  };
  const onKeyDown = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      move((mode + 1) % heroModes.length);
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      move((mode - 1 + heroModes.length) % heroModes.length);
    }
  };

  const pct = taken ? 100 : (elapsed / DWELL) * 100;

  return (
    /* The first screen is the one place on this page where the layers are
       far enough apart in depth for the separation to be the point: the
       film is the far wall, the light in front of it is mid-air, and the
       claim is on the glass. `StageDepth` is what makes those three
       distances real — they part under the pointer and pull apart again as
       the section leaves. See `data-depth` on each layer below. */
    <StageDepth
      as="header"
      id="header"
      hostRef={sectionRef}
      className="section_header ax-hero"
      travel={14}
      sway={30}
      push={0.12}
    >
      <div className="ax-hero__bg" data-depth="1" aria-hidden="true">
        {heroModes.map((m) => (
            <AmbientVideo
              key={m.film}
              film={m.film}
              /* Playing regardless of which tab is active — see the note
                 on `select` above. Only `data-on` (an opacity crossfade in
                 CSS) decides which one the reader actually sees. */
              play
              data-on={m.id === active.id}
              className="ax-hero__film"
              rootMargin="0px"
            />
        ))}
      </div>

      {/* Suspended between the film and the copy, and the only reason the
          film stops reading as a flat plate: these motes sit at real
          distances in a perspective volume, so they cross the frame at
          different rates as the camera moves. Additive-only, so it cannot
          darken or tint the licensed footage underneath — see DepthField. */}
      <DepthField className="ax-hero__depth" data-depth="0.6" intensity={0.85} dolly={7} sway={1.2} />

      <div className="ax-hero__body" data-depth="0.12" data-fade>
        <div className="padding-global">
          <div className="container-large">
            <div className="ax-hero__lead">
              <Kicker id="header" label="The brief" tone="hero" />

              <h1 className="ax-hero__title">
                <MaskHeading text={lines} delay={0.15} />
              </h1>

              {/* Keyed on the active mode so the swap reads as a cut, not a
                  find-and-replace — same device `Environments` uses for its
                  panel copy. */}
              <p className="ax-hero__lede" key={active.id}>
                {active.line}
              </p>

              <div
                className="ax-hero__modes"
                role="tablist"
                aria-label="Focus area"
                onKeyDown={onKeyDown}
                onPointerEnter={() => setTaken(true)}
                onFocusCapture={() => setTaken(true)}
              >
                {heroModes.map((m, i) => (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    id={`hero-mode-${m.id}`}
                    aria-selected={i === mode}
                    tabIndex={i === mode ? 0 : -1}
                    className="ax-hero__mode"
                    onClick={() => select(i)}
                  >
                    <span className="ax-hero__mode-label">{m.label}</span>
                    <span className="ax-hero__mode-rail" aria-hidden="true">
                      <span
                        className="ax-hero__mode-fill"
                        style={{ width: i === mode ? `${pct}%` : "0%" }}
                      />
                    </span>
                  </button>
                ))}
              </div>

              {/* `immediate`: this is the first screen, so the reveal is a
                  function of the page having loaded, not of a scroll that
                  may never happen. See the note on the prop — this row is
                  exactly the element that proved why. */}
              <Reveal variant="rise" delay={0.58} immediate className="ax-hero__actions">
                <Magnetic>
                  <a
                    id="OpenPop"
                    href="#"
                    className="ax-hero__cta"
                    onClick={(e) => {
                      e.preventDefault();
                      openPopup();
                    }}
                  >
                    Request Free Strategy Session
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M5 12h13M13 6l6 6-6 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </Magnetic>

                <a
                  href="#reels"
                  className="ax-hero__ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("reels")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  See the work
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M9 5l7 7-7 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </Reveal>

              <ProofStrip />
            </div>
          </div>
        </div>
      </div>

      {/* The hero fills the viewport and ends on a logo ticker, which from
          a standing start looks like the bottom of the page rather than the
          top of a long one. This says there is more, and stops saying it
          the moment the reader acts on it. */}
      <ScrollCue targetId="whyus" />

      <div className="header_ticker">
        <div className="ticker_component">
          <div className="ticker_move">
            {[0, 1].map((row) => (
              <div className="ticker_wrapper" key={row}>
                {tickerLogos.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="" className="ticker_image" key={i} />
                ))}
                <div className="ticker_div-ipad-pro" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </StageDepth>
  );
}
