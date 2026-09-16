"use client";

import { useEffect, useRef } from "react";
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
};

function WhyUsIcon({ name, dark }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        className="whyus-icon-disc"
        style={{
          width: "5.5rem",
          height: "5.5rem",
          flexShrink: 0,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: dark
            ? "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06))"
            : "linear-gradient(135deg, #9248E4, #6a2fc4)",
          boxShadow: dark ? "none" : "0 0.5rem 1.5rem rgba(146,72,228,0.28)",
        }}
      >
        <div style={{ width: "48%", color: "#fff" }}>{WHYUS_ICONS[name] || WHYUS_ICONS.network}</div>
      </div>
    </div>
  );
}

export default function WhyUs() {
  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const prevBtnRef = useRef(null);
  const nextBtnRef = useRef(null);

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

  return (
    <div id="whyus" className="section_whyus js">
      <div className="horizontal-section" ref={sectionRef}>
        <div className="horizontal-sticky">
          <div className="padding-global">
            <div className="container-large">
              <div className="padding-section-whyus">
                <Kicker id="whyus" label="What we build" />
                <Reveal variant="rise" className="_3-columns-grid">
                  <h2 className="gradient-background heading-gradient-60pt-ipad-pro">
                    What we&rsquo;re <br />
                    good at
                  </h2>
                  <p className="p2 max-width-medium text-16pt-ipad_pro">
                    Building production-grade AI systems trusted by fintech and healthtech
                    organizations across the U.S.
                  </p>
                </Reveal>

                <div className="horizontal-list-wrapper" ref={wrapRef}>
                  <section id="horizontal-list-js" className="horizontal-list" ref={listRef}>
                    {whyUs.map((c) => (
                      <div className="whyus-box_item" key={c.title}>
                        {/* The six cards are the one place on this page a
                            reader drives the pace themselves — the rail is
                            pinned, so they are looked at one at a time and
                            for as long as they like. `max` is kept low: a
                            card in a horizontally-scrolling row that leans
                            hard starts to fight the row's own motion. */}
                        <TiltCard max={4} lift={6} depth={20} perspective={1000}>
                        <div className={`whyus_item ${c.bg || ""}`}>
                          {/* Always running, never gated on hover. These
                              cards are dark now (see app/film.css) so the
                              clip is the card's surface rather than a
                              reveal — there is nothing to uncover. */}
                          <AmbientVideo
                            film={filmFor.whyUs[c.title]}
                            className="ax-whyus__film"
                            data-lift="far"
                          />
                          <h3 className="heading-style-h5 _30">
                            &lt;<span className="text-color-black">{c.title}</span>&gt;
                          </h3>
                          {c.grad ? (
                            <>
                              <p className="body20 text-color-black height">{c.text}</p>
                              <div className="whyus_bg_1">
                                <div className="whyus_grad" style={{ color: "#fff" }}>
                                  {/* Not `dark`. That variant drew a white
                                      translucent disc to read against the
                                      violet panel this card used to have —
                                      with the panel gone, it was the one
                                      icon in the row that didn't match. */}
                                  <WhyUsIcon name={c.icon} />
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="whyus_bottom">
                              <div className={`whyus_animation ${c.animWrapCls || ""}`}>
                                <div className={c.animCls}>
                                  <WhyUsIcon name={c.icon} />
                                </div>
                              </div>
                              <p className="body20 text-color-black height">{c.text}</p>
                            </div>
                          )}
                        </div>
                        </TiltCard>
                      </div>
                    ))}
                  </section>
                </div>

                <div className="whyus-slider-row">
                  <button
                    type="button"
                    aria-label="Previous"
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
                    aria-label="Next"
                    className="whyus-slider-arrow"
                    ref={nextBtnRef}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
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
