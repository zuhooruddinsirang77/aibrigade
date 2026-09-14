"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * Counts up once, when it first reaches view.
 *
 * Renders the final value into the DOM on the server, so the real number is
 * in the HTML for crawlers and for anyone who never runs the animation. The
 * count is a flourish on top, not the source of truth.
 *
 *   <Counter to={94} suffix="%" /> — fraud caught pre-settlement
 */
export default function Counter({ to, from = 0, decimals = 0, prefix = "", suffix = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let ctx;
    let cancelled = false;

    loadGsap().then((mod) => {
      if (!mod || cancelled) return;
      const { gsap } = mod;

      ctx = gsap.context(() => {
        const state = { v: from };
        gsap.to(state, {
          v: to,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => {
            el.textContent = `${prefix}${state.v.toFixed(decimals)}${suffix}`;
          },
        });
      }, el);
    });

    return () => {
      cancelled = true;
      ctx && ctx.revert();
    };
  }, [to, from, decimals, prefix, suffix]);

  return (
    <span className="ax-counter" ref={ref}>
      {`${prefix}${Number(to).toFixed(decimals)}${suffix}`}
    </span>
  );
}
