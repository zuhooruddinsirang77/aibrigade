"use client";

import { Children, cloneElement, useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * Pulls its child a few pixels toward the pointer.
 *
 * It clones the child and attaches a ref rather than rendering a wrapper.
 * The earlier wrapper version shipped an `inline-block` span around the hero
 * CTA, which broke `width-mob-100` — the anchor sized to the shrink-to-fit
 * span instead of the container, so the full-width mobile button stopped
 * being full width. Cloning leaves the DOM shape exactly as Webflow's CSS
 * expects it.
 *
 *   <Magnetic><a className="button" …>Let&rsquo;s talk</a></Magnetic>
 */
export default function Magnetic({ children, strength = 0.28 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let ctx;
    let cancelled = false;
    let cleanup = () => {};

    loadGsap().then((mod) => {
      if (!mod || cancelled) return;
      const { gsap } = mod;

      ctx = gsap.context(() => {
        const onMove = (e) => {
          const r = el.getBoundingClientRect();
          gsap.to(el, {
            x: (e.clientX - (r.left + r.width / 2)) * strength,
            y: (e.clientY - (r.top + r.height / 2)) * strength,
            duration: 0.5,
            ease: "power3.out",
          });
        };
        const onLeave = () =>
          gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });

        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        cleanup = () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
        };
      }, el);
    });

    return () => {
      cancelled = true;
      cleanup();
      ctx && ctx.revert();
    };
  }, [strength]);

  return cloneElement(Children.only(children), { ref });
}
