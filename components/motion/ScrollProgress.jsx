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

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = `scaleX(${p})`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

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
