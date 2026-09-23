"use client";

import { useEffect, useRef } from "react";

/**
 * A hairline across the top of the viewport that fills as you move through
 * the page. It pairs with StoryRail: the rail tells you which chapter you're
 * in, this tells you how far through you are.
 *
 * No GSAP and no ScrollTrigger — a scroll listener coalesced into one rAF is
 * cheaper than a tween here, and this has to stay smooth while the WhyUs pin
 * and every Parallax instance are already competing for the same frame.
 */
export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let frame = 0;
    let p = 0;

    /* Measured when the event arrives, drawn on the next frame. The read
       used to happen inside the rAF callback, which runs after GSAP's tick
       has written the frame's tween styles — so `scrollHeight` there forced
       a style and layout pass mid-frame, on every frame of every scroll.
       When a scroll event is dispatched, the layout is still the one the
       last frame painted, and reading it costs nothing. */
    const measure = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    const update = () => {
      frame = 0;
      bar.style.transform = `scaleX(${p})`;
    };

    const onScroll = () => {
      measure();
      if (!frame) frame = requestAnimationFrame(update);
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="ax-progress" aria-hidden="true">
      <span className="ax-progress__bar" ref={barRef} />
    </div>
  );
}
