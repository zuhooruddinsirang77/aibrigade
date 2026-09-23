"use client";

import { useEffect, useRef, useState } from "react";
import { whyUs } from "@/components/data";
import Reveal from "@/components/motion/Reveal";
import Kicker from "@/components/motion/Kicker";
import { loadGsap } from "@/components/motion/gsapLoader";
import AmbientVideo from "@/components/motion/AmbientVideo";
import TiltCard from "@/components/motion/TiltCard";
import { filmFor } from "@/components/video.data";

const WHYUS_ICONS = {
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.3l6.2 2.4v5.4c0 4.2-2.6 7.5-6.2 8.6-3.6-1.1-6.2-4.4-6.2-8.6V5.7L12 3.3z" />
      <path d="M9.2 12.1l1.9 1.9 3.7-3.9" />
    </svg>
  ),
  automation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="7.5" r="2.6" />
      <circle cx="16.5" cy="16.5" r="2.6" />
      <path d="M9.4 9.4l5.2 5.2" />
      <path d="M7.5 10.1V14a2.5 2.5 0 002.5 2.5h1.4" />
    </svg>
  ),
  document: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.2 3.3h6.4l3.6 3.6v13.4a.4.4 0 01-.4.4H7.2a.4.4 0 01-.4-.4V3.7a.4.4 0 01.4-.4z" />
      <path d="M13.4 3.3v3.6a.4.4 0 00.4.4h3.6" />
      <path d="M9 12h6M9 15.4h6M9 8.6h2" />
    </svg>
  ),
  pulse: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 12.5h3.4l1.7-5.6 3.4 11.2 1.7-5.6h6.4" />
    </svg>
  ),
  scale: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v16M7.5 4h9" />
      <path d="M4.2 9.6L7.5 4l3.3 5.6a3.3 3.3 0 01-6.6 0zM13.2 9.6L16.5 4l3.3 5.6a3.3 3.3 0 01-6.6 0z" />
    </svg>
  ),
  network: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="6.5" r="1.8" />
      <circle cx="5.5" cy="17.5" r="1.8" />
      <circle cx="18.5" cy="12" r="1.8" />
      <path d="M7.3 6.8h3.9a3.6 3.6 0 013.6 3.6M7.3 17.2h3.9a3.6 3.6 0 003.6-3.6" />
    </svg>
  ),
  /* Listen. Drawn as a waveform rather than a microphone: the capability
     is speech in both directions — inbound calls and outbound ones — and
     a mic glyph only says one of them. */
  waveform: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 12h1.6M8 7.4v9.2M12 4.6v14.8M16 8.6v6.8M19.9 11h.6" />
    </svg>
  ),
  /* Operate privately. The same glyph Infrastructure.jsx draws for its
     "Bounded" commitment, at the same weight — one lock in two places
     rather than two locks that almost match. */
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5.5" y="10.5" width="13" height="9" rx="1.6" />
      <path d="M8 10.5V7.8a4 4 0 018 0v2.7" />
      <path d="M12 14v2.4" />
    </svg>
  ),
};

/**
 * The capability mark.
 *
 * Was a 5.5rem violet disc centred in its own block in the middle of the
 * card, which is what gave the row its "icon floating in a hole" look —
 * the mark was the largest object on a card whose subject is the footage
 * behind it. It is a mark now, not an illustration: it sits on the
 * caption block it belongs to, at the size the rest of the page uses for
 * an inline indicator, and the size is a prop so the tablet rail can take
 * it down further without a second component.
 */
function WhyUsIcon({ name }) {
  return (
    <span className="whyus-icon-disc" aria-hidden="true">
      <span className="whyus-icon-disc__glyph">{WHYUS_ICONS[name] || WHYUS_ICONS.network}</span>
    </span>
  );
}

const pad = (n) => String(n).padStart(2, "0");

export default function WhyUs() {
  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const prevBtnRef = useRef(null);
  const nextBtnRef = useRef(null);

  /* Which card the rail is currently showing. Printed above the row, and
     the only piece of this section's state React needs to know about —
     everything else the readout drives is written straight to CSS custom
     properties in the loop below, because it changes every frame. */
  const [active, setActive] = useState(0);

  useEffect(() => {
    let ctx;
    let cleanup = () => {};
    let cancelled = false;

    loadGsap().then((mod) => {
      if (cancelled || !mod) return;
      const { gsap, ScrollTrigger } = mod;

      const section = sectionRef.current;
      const list = listRef.current;
      const wrap = wrapRef.current;
      const track = trackRef.current;
      const thumb = thumbRef.current;
      const prevBtn = prevBtnRef.current;
      const nextBtn = nextBtnRef.current;
      if (!section || !list || !wrap) return;

      const isDesktop = () => window.matchMedia("(min-width: 992px)").matches;

      ctx = gsap.context(() => {
        const items = Array.from(list.querySelectorAll(".whyus-box_item"));
        let moveDistance = 0;
        let thumbPercent = 100;
        let itemWidth = 0;

        /* The distance the row has to travel is a measurement, not a guess.
           The previous version derived it from a table of hand-tuned
           "items in view" ratios per breakpoint (3.2 at 1920, 3.5125 at
           1024, ...) multiplied by one card's width. Those numbers had
           drifted from the real layout: at 1440 it asked for 1092px of
           travel when the row only overflows its wrapper by 915px, so the
           last card was dragged ~177px past the left edge and the closing
           frame of the section showed a row already half gone.
           scrollWidth minus clientWidth is the actual overflow, at every
           breakpoint, with no table to maintain. */
        const measure = () => {
          itemWidth = items[0]?.offsetWidth || 0;
          if (!isDesktop()) {
            moveDistance = 0;
            gsap.set(list, { x: 0 });
            return;
          }
          moveDistance = Math.max(0, list.scrollWidth - wrap.clientWidth);
          thumbPercent = moveDistance
            ? Math.min(100, Math.max(14, (wrap.clientWidth / list.scrollWidth) * 100))
            : 100;
          if (thumb) thumb.style.width = thumbPercent + "%";
        };

        measure();

        /* A real pin, not `position: sticky` plus a spacer element.

           The sticky version needed `.horizontal-section` given an explicit
           height (200vh, floored at 1.2 x cardWidth x cardCount) for the
           sticky child to travel inside. That height had no relationship to
           how far the row actually moves, and the surplus showed: the pin
           released ~950px before the section ended, so the finished row
           slid up off the top of the screen -- card headings sheared off
           mid-letter under the navbar -- and left a viewport-tall band of
           empty white before the next section. An end of `+= moveDistance`
           is exactly as long as the animation it drives, and ScrollTrigger
           sizes the spacer itself. */
        const st = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => "+=" + (moveDistance || 1),
          pin: isDesktop(),
          pinSpacing: isDesktop(),
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: measure,
          onUpdate: (self) => {
            if (!isDesktop()) return;
            gsap.set(list, { x: -moveDistance * self.progress });
            if (thumb) thumb.style.left = self.progress * (100 - thumbPercent) + "%";
          },
        });

        /* Slider + arrows reposition the row directly and never touch page
           scroll -- calling ScrollTrigger's own `.scroll()` here used to
           fight the pin and pop the section out of view. The next real
           scroll resumes driving `x` from `onUpdate` as normal. */
        let manualTween = null;
        const setX = (x, animate) => {
          const clamped = Math.min(0, Math.max(-moveDistance, x));
          manualTween?.kill();
          if (animate) {
            manualTween = gsap.to(list, { x: clamped, duration: 0.5, ease: "power2.out" });
          } else {
            gsap.set(list, { x: clamped });
          }
          if (thumb && moveDistance > 0) {
            thumb.style.left = (-clamped / moveDistance) * (100 - thumbPercent) + "%";
          }
        };

        let dragging = false;

        const seekToClientX = (clientX) => {
          if (!track || moveDistance <= 0) return;
          const rect = track.getBoundingClientRect();
          const thumbWidthPx = (thumbPercent / 100) * rect.width;
          const usable = Math.max(1, rect.width - thumbWidthPx);
          const p = Math.min(1, Math.max(0, (clientX - rect.left - thumbWidthPx / 2) / usable));
          setX(-p * moveDistance, false);
        };

        const onPointerDown = (e) => {
          if (!isDesktop() || moveDistance <= 0) return;
          dragging = true;
          seekToClientX(e.clientX);
          track?.setPointerCapture?.(e.pointerId);
        };
        const onPointerMove = (e) => {
          if (!dragging) return;
          seekToClientX(e.clientX);
        };
        const endDrag = () => {
          dragging = false;
        };

        track?.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", endDrag);
        window.addEventListener("pointercancel", endDrag);

        const step = (dir) => {
          if (moveDistance <= 0 || !itemWidth) return;
          const current = gsap.getProperty(list, "x");
          setX(current - dir * itemWidth, true);
        };
        const onPrevClick = () => step(-1);
        const onNextClick = () => step(1);
        prevBtn?.addEventListener("click", onPrevClick);
        nextBtn?.addEventListener("click", onNextClick);

        const onResize = () => ScrollTrigger.refresh();
        window.addEventListener("resize", onResize);

        cleanup = () => {
          manualTween?.kill();
          st.kill();
          window.removeEventListener("resize", onResize);
          track?.removeEventListener("pointerdown", onPointerDown);
          window.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("pointerup", endDrag);
          window.removeEventListener("pointercancel", endDrag);
          prevBtn?.removeEventListener("click", onPrevClick);
          nextBtn?.removeEventListener("click", onNextClick);
        };
      }, section);
    });

    return () => {
      cancelled = true;
      cleanup();
      ctx && ctx.revert();
    };
  }, []);

  /* ------------------------------------------------------------------
     Depth of field along the rail.

     The row used to be six cards at identical weight sliding past a
     window, which is the thing that made it read as a grid that happens
     to move: nothing on screen said which card you were being shown. This
     measures how much of each card is actually inside the window and
     publishes it as `--ax-focus` (0 = mostly out of frame, 1 = fully in
     it). app/compose.css spends it on a veil, the frame's edge light and
     the top hairline, so a card resolves as it arrives and recedes as it
     leaves — the same cue a rack focus gives, and the reason the row now
     has a subject at every scroll position.

     Deliberately read from `getBoundingClientRect` rather than from the
     scroll progress: the row is moved by a pinned `transform` on desktop,
     by native `scrollLeft` on tablet and by the arrows and the slider at
     any width. Measuring where the cards ended up is the one description
     that is true for all four, and it is what lets the readout above the
     row work on a phone, where there is no ScrollTrigger at all.

     The loop only runs while the section is on screen.
     ------------------------------------------------------------------ */
  useEffect(() => {
    const wrap = wrapRef.current;
    const list = listRef.current;
    const section = sectionRef.current;
    if (!wrap || !list || !section) return;

    let raf = 0;
    let running = false;
    let lastIndex = -1;

    const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

    /* The rack focus is the one part of this that a reader who has asked
       for reduced motion should not get: it dims and resolves copy as the
       row travels, which is exactly the kind of scroll-linked change that
       setting exists to refuse. The readout and the edge fades stay — they
       are information about where you are in a set, not motion — so the
       loop still runs and only this one value is pinned. Read live rather
       than captured, so toggling the OS setting takes effect without a
       reload. */
    const reduced =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    const sample = () => {
      const wr = wrap.getBoundingClientRect();
      if (wr.width <= 0) return;
      const items = list.children;
      let firstVisible = 0;
      let seen = false;

      for (let i = 0; i < items.length; i++) {
        const el = items[i];
        const r = el.getBoundingClientRect();
        if (r.width <= 0) continue;
        const inside = Math.min(r.right, wr.right) - Math.max(r.left, wr.left);
        const ratio = clamp01(inside / r.width);
        /* Not the raw ratio: a card that is 90% in frame should read as
           present, not as 10% dimmed. The ramp puts everything past ~85%
           at full strength and everything under ~35% at none, so the
           change happens at the edges of the window where it belongs. */
        el.style.setProperty(
          "--ax-focus",
          reduced?.matches ? "1" : clamp01((ratio - 0.35) / 0.5).toFixed(3)
        );
        if (!seen && ratio > 0.6) {
          firstVisible = i;
          seen = true;
        }
      }

      /* The edge fades are part of the same measurement. The mask used to
         be a constant, so the first card was feathered away at its left
         edge while the row was still at rest against that edge — a card
         dissolving into nothing with no content behind it to dissolve
         into, which reads as a rendering fault rather than as "there is
         more this way". These go to zero when there is nothing past the
         edge and come up over the first 2.5rem of travel. */
      const lr = list.getBoundingClientRect();
      wrap.style.setProperty("--ax-fade-l", clamp01((wr.left - lr.left) / 40).toFixed(3));
      wrap.style.setProperty("--ax-fade-r", clamp01((lr.right - wr.right) / 40).toFixed(3));

      if (seen && firstVisible !== lastIndex) {
        lastIndex = firstVisible;
        setActive(firstVisible);
      }
    };

    const tick = () => {
      sample();
      if (running) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "20% 0px" }
    );
    io.observe(section);

    /* A resize changes the window without moving anything inside it, so
       the loop may well be parked when it happens. */
    window.addEventListener("resize", sample);
    sample();

    return () => {
      io.disconnect();
      stop();
      window.removeEventListener("resize", sample);
    };
  }, []);

  const total = whyUs.length;

  return (
    <div id="whyus" className="section_whyus js">
      <div className="horizontal-section" ref={sectionRef}>
        <div className="horizontal-sticky">
          <div className="padding-global">
            <div className="container-large">
              <div className="padding-section-whyus">
                <Kicker id="whyus" label="Our actual capability" />
                <Reveal variant="rise" className="_3-columns-grid">
                  <h2 className="gradient-background heading-gradient-60pt-ipad-pro">
                    What we&rsquo;ve already <br />
                    taught AI to do
                  </h2>
                  <p className="p2 max-width-medium text-16pt-ipad_pro">
                    These are the reusable building blocks behind new client solutions. Your
                    use case becomes the next workflow.
                  </p>
                </Reveal>

                {/* The bar between the opening and the row.

                    Two things used to be wrong with this band. The head
                    ended on a rule and the cards began 70px later with
                    nothing in between, which is a gap rather than a
                    transition; and the only controls the rail had sat
                    BELOW the cards, ~180px past the bottom of a pinned
                    viewport — present in the DOM, never once on screen at
                    1440x900. Putting the position readout and the
                    controls on one line directly above the row fixes both:
                    the reader is told which of six they are looking at,
                    and the means to move are in the same glance. */}
                <div className="ax-caps__bar">
                  <p className="ax-caps__read" style={{ "--cap": whyUs[active].color }}>
                    <span className="ax-caps__idx">{pad(active + 1)}</span>
                    <span className="ax-caps__of">/ {pad(total)}</span>
                    <span className="ax-caps__now">{whyUs[active].title}</span>
                  </p>

                  <div className="whyus-slider-row">
                    <button
                      type="button"
                      aria-label="Previous capability"
                      className="whyus-slider-arrow"
                      ref={prevBtnRef}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 5l-7 7 7 7" />
                      </svg>
                    </button>
                    <div className="whyus-slider-track" ref={trackRef}>
                      <div className="whyus-slider-thumb" ref={thumbRef} />
                    </div>
                    <button
                      type="button"
                      aria-label="Next capability"
                      className="whyus-slider-arrow"
                      ref={nextBtnRef}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="horizontal-list-wrapper" ref={wrapRef}>
                  <section id="horizontal-list-js" className="horizontal-list" ref={listRef}>
                    {whyUs.map((c, i) => (
                      <div className="whyus-box_item" key={c.title}>
                        {/* The six cards are the one place on this page a
                            reader drives the pace themselves — the rail is
                            pinned, so they are looked at one at a time and
                            for as long as they like. `max` is kept low: a
                            card in a horizontally-scrolling row that leans
                            hard starts to fight the row's own motion. */}
                        <TiltCard max={4} lift={6} depth={20} perspective={1000}>
                          {/* A dossier, not a tile. The index and the
                              sector sit at the top as metadata, the
                              footage owns the middle, and the mark, the
                              name and the copy are one block anchored to
                              the bottom edge. The middle of the card is
                              empty ON PURPOSE now — it is the window onto
                              the film, which is the only thing about these
                              six that differs. Previously the middle held
                              a 5.5rem icon disc with clear space above and
                              below it, so all six cards were the same
                              three stacked blocks and the row read as a
                              grid laid on its side. */}
                          {/* `--cap` is the capability's colour from the
                              deck (components/data.js) — the top edge, the
                              mark and the rail readout take it, so the
                              eight read as eight different things. */}
                          <article
                            className={`whyus_item ax-cap ${c.bg || ""}`}
                            style={{ "--cap": c.color }}
                          >
                            {/* Always running, never gated on hover. These
                                cards are dark (see app/film.css) so the
                                clip is the card's surface rather than a
                                reveal — there is nothing to uncover. */}
                            <AmbientVideo
                              film={filmFor.whyUs[c.title]}
                              className="ax-whyus__film"
                              data-lift="far"
                            />

                            <header className="ax-cap__meta">
                              <span className="ax-cap__index">{pad(i + 1)}</span>
                              <span className="ax-cap__rule" aria-hidden="true" />
                              <span className="ax-cap__domain">{c.domain}</span>
                            </header>

                            {/* `data-lift` without a value is the NEAR
                                layer (immersive.css): it drifts against
                                the pointer and rises toward the viewer,
                                the opposite sign to the film's `far`. Two
                                layers moving opposite ways is what makes
                                the card read as a box with things inside
                                it rather than one image being skewed. */}
                            <div className="ax-cap__body" data-lift>
                              <WhyUsIcon name={c.icon} />
                              {/* No `<Listen>` angle brackets: a code-tag
                                  motif on the first section an executive
                                  reads made the capabilities look like
                                  markup. The deck names them plainly. */}
                              <h3 className="ax-cap__title heading-style-h5 _30">
                                <span className="text-color-black">{c.title}</span>
                              </h3>
                              <p className="ax-cap__text body20 text-color-black">{c.text}</p>
                            </div>
                          </article>
                        </TiltCard>
                      </div>
                    ))}
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="whyus-end" className="whyus-anchor_absolute" />
    </div>
  );
}
