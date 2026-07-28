"use client";

import { useEffect, useRef } from "react";
import { whyUs } from "@/components/data";

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
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const prevBtnRef = useRef(null);
  const nextBtnRef = useRef(null);

  useEffect(() => {
    let ctx;
    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const gsapMod = await import("gsap");
      const stMod = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      const gsap = gsapMod.default || gsapMod.gsap;
      const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      const list = listRef.current;
      const track = trackRef.current;
      const thumb = thumbRef.current;
      const prevBtn = prevBtnRef.current;
      const nextBtn = nextBtnRef.current;
      if (!section || !list) return;

      const isDesktop = () => window.matchMedia("(min-width: 992px)").matches;

      ctx = gsap.context(() => {
        const items = list.querySelectorAll(".whyus-box_item");
        let moveDistance = 0;
        let thumbPercent = 100;
        let itemWidth = 0;

        const calc = () => {
          if (!isDesktop()) {
            list.style.transform = "none";
            section.style.minHeight = "";
            section.style.height = "";
            return;
          }
          let itemsInView = 3.2;
          const w = window.innerWidth;
          if (w <= 1024) itemsInView = 3.5125;
          else if (w <= 1440) itemsInView = 3.625;
          else if (w <= 1512) itemsInView = 3.385;
          else if (w <= 1600) itemsInView = 3.4125;
          else if (w <= 1920) itemsInView = 3.2;

          itemWidth = items[0]?.offsetWidth || 0;
          const moveAmount = Math.max(items.length - itemsInView, 0);
          moveDistance = itemWidth * moveAmount;
          const minHeight = 1.2 * itemWidth * items.length;
          section.style.height = "200vh";
          section.style.minHeight = minHeight + "px";
          thumbPercent = Math.min(100, Math.max(12, (itemsInView / items.length) * 100));
          if (thumb) thumb.style.width = thumbPercent + "%";
        };

        calc();

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section.querySelector(".horizontal-trigger"),
            start: "top top",
            end: "bottom top",
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (thumb) thumb.style.left = self.progress * (100 - thumbPercent) + "%";
            },
          },
        });
        tl.to(list, { x: () => -moveDistance, duration: 1, ease: "none" });
        const st = tl.scrollTrigger;

        // Slider at the bottom lets visitors scrub the row by hand, on top
        // of the existing scroll-driven auto-slide above. Dragging the
        // thumb (or clicking the track) moves the page's actual scroll
        // position within the pinned range, so the ScrollTrigger tween
        // stays the single source of truth for `x` — no desync possible.
        let dragging = false;

        const seekToClientX = (clientX) => {
          if (!track || !st || moveDistance <= 0) return;
          const rect = track.getBoundingClientRect();
          const thumbWidthPx = (thumbPercent / 100) * rect.width;
          const usable = Math.max(1, rect.width - thumbWidthPx);
          const p = Math.min(1, Math.max(0, (clientX - rect.left - thumbWidthPx / 2) / usable));
          st.scroll(st.start + p * (st.end - st.start));
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

        // Prev/next arrows step one card at a time. Scrolls the real page
        // position natively (smooth) instead of driving it frame-by-frame
        // ourselves — that let our own tween fight the section's
        // position:sticky scroll math and made it pop out of the pinned
        // range. Letting the browser own the scroll means the sticky
        // section and ScrollTrigger's scrub react exactly as they do to
        // normal scrolling.
        const step = (dir) => {
          if (!st || moveDistance <= 0 || !itemWidth) return;
          const current = st.start + st.progress * (st.end - st.start);
          const perPixelScroll = (st.end - st.start) / moveDistance;
          const target = Math.min(st.end, Math.max(st.start, current + dir * itemWidth * perPixelScroll));
          window.scrollTo({ top: target, behavior: "smooth" });
        };
        const onPrevClick = () => step(-1);
        const onNextClick = () => step(1);
        prevBtn?.addEventListener("click", onPrevClick);
        nextBtn?.addEventListener("click", onNextClick);

        const onResize = () => {
          calc();
          ScrollTrigger.refresh();
        };
        window.addEventListener("resize", onResize);
        cleanup = () => {
          window.removeEventListener("resize", onResize);
          track?.removeEventListener("pointerdown", onPointerDown);
          window.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("pointerup", endDrag);
          window.removeEventListener("pointercancel", endDrag);
          prevBtn?.removeEventListener("click", onPrevClick);
          nextBtn?.removeEventListener("click", onNextClick);
        };
      }, section);
    })();

    return () => {
      cancelled = true;
      cleanup();
      ctx && ctx.revert();
    };
  }, []);

  return (
    <div className="section_whyus js">
      <div className="horizontal-section" ref={sectionRef}>
        <div className="horizontal-trigger" />
        <div className="horizontal-sticky">
          <div className="padding-global">
            <div className="container-large">
              <div className="padding-section-whyus">
                <div className="_3-columns-grid">
                  <h2 className="gradient-background heading-gradient-60pt-ipad-pro">
                    What we&rsquo;re <br />
                    good at
                  </h2>
                  <p className="p2 max-width-medium text-16pt-ipad_pro">
                    Building production-grade AI systems trusted by fintech and healthtech
                    organizations across the U.S.
                  </p>
                </div>

                <div className="horizontal-list-wrapper">
                  <section id="horizontal-list-js" className="horizontal-list" ref={listRef}>
                    {whyUs.map((c, i) => (
                      <div className="whyus-box_item" key={c.title}>
                        <div className={`whyus_item ${c.bg || ""}`}>
                          <h3 className="heading-style-h5 _30">
                            &lt;<span className="text-color-black">{c.title}</span>&gt;
                          </h3>
                          {c.grad ? (
                            <>
                              <p className="body20 text-color-black height">{c.text}</p>
                              <div className="whyus_bg_1">
                                <div className="whyus_grad" style={{ color: "#fff" }}>
                                  <WhyUsIcon name={c.icon} dark />
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
      <div id="whyus" className="whyus-anchor_absolute" />
    </div>
  );
}
