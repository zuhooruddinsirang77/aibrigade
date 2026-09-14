"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * A single violet ring that trails the pointer and changes state over
 * interactive things — links grow it, the video stage turns it into a play
 * button. It replaces nothing: the native cursor stays visible underneath, so
 * nobody loses their pointer if this fails to load.
 *
 * Desktop + fine pointer only (gated in motion.css). Hidden entirely under
 * prefers-reduced-motion — a lagging element chasing the pointer is exactly
 * the kind of thing that setting exists to stop.
 */
export default function Cursor() {
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
        const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });

        const onMove = (e) => {
          xTo(e.clientX);
          yTo(e.clientY);
          gsap.to(el, { opacity: 1, duration: 0.2, overwrite: "auto" });
        };
        const onLeave = () => gsap.to(el, { opacity: 0, duration: 0.2 });

        const onOver = (e) => {
          const target = e.target.closest(
            "[data-cursor], a, button, input, textarea, select"
          );
          const state = target?.dataset?.cursor
            ? target.dataset.cursor
            : target
            ? "link"
            : "";
          el.setAttribute("data-state", state);
          gsap.to(el, {
            scale: state === "play" ? 2.6 : state ? 1.7 : 1,
            duration: 0.35,
            ease: "power3.out",
            overwrite: "auto",
          });
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerover", onOver, { passive: true });
        document.addEventListener("pointerleave", onLeave);

        cleanup = () => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerover", onOver);
          document.removeEventListener("pointerleave", onLeave);
        };
      }, el);
    });

    return () => {
      cancelled = true;
      cleanup();
      ctx && ctx.revert();
    };
  }, []);

  return (
    <div className="ax-cursor" ref={ref} aria-hidden="true">
      <span className="ax-cursor__label">Play</span>
    </div>
  );
}
