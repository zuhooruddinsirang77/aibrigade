"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * Two elements chasing the pointer at different speeds: a dot that is
 * essentially on it, and a violet ring that arrives a moment later. It
 * replaces nothing — the native cursor stays visible underneath, so nobody
 * loses their pointer if this fails to load.
 *
 * The two speeds are the entire point, and the reason this started as one
 * ring and became two elements. A single trailing ring reads as latency:
 * the thing representing your pointer is visibly not where your pointer
 * is. Pairing it with a dot that tracks almost exactly fixes that — the
 * dot is the position, the ring is the momentum — and it is what lets the
 * ring be slow enough to actually express state changes as motion rather
 * than as an instant swap.
 *
 * States come from `data-cursor` on whatever is under the pointer, with a
 * sensible default for anything interactive that doesn't declare one:
 *
 *   link  — any anchor, button or field. The ring grows and tints.
 *   view  — a media tile that opens a case study. Labelled, because a
 *           full-bleed film with a console on it does not otherwise look
 *           like a link.
 *   play  — the video stage. Labelled, and filled.
 *
 * Desktop + fine pointer only (gated in motion.css). Hidden entirely under
 * `prefers-reduced-motion`: an element chasing the pointer is exactly the
 * kind of unrequested motion that setting exists to stop.
 */

/** Ring follow time. Slow enough to read as weight, short enough to keep up. */
const RING = 0.35;
/** Dot follow time. Non-zero only so a 120Hz display doesn't look stepped. */
const DOT = 0.075;

export default function Cursor() {
  const ref = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const dot = dotRef.current;
    if (!el || prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let ctx;
    let cancelled = false;
    let cleanup = () => {};

    loadGsap().then((mod) => {
      if (!mod || cancelled) return;
      const { gsap } = mod;

      ctx = gsap.context(() => {
        const xTo = gsap.quickTo(el, "x", { duration: RING, ease: "power3" });
        const yTo = gsap.quickTo(el, "y", { duration: RING, ease: "power3" });
        const dxTo = gsap.quickTo(dot, "x", { duration: DOT, ease: "power2" });
        const dyTo = gsap.quickTo(dot, "y", { duration: DOT, ease: "power2" });

        const onMove = (e) => {
          xTo(e.clientX);
          yTo(e.clientY);
          dxTo(e.clientX);
          dyTo(e.clientY);
          gsap.to([el, dot], { opacity: 1, duration: 0.2, overwrite: "auto" });
        };
        const onLeave = () => gsap.to([el, dot], { opacity: 0, duration: 0.2 });

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
            /* The two labelled states have to hold a word, so they are
               sized to the word rather than to a scale that happens to
               look right. "view" sits over live console content (Cases.jsx)
               rather than a plain image — a badge sized like "play"'s (or
               even most of the way there) blots out the transaction row
               under it, so this stays as small as the word still fits. */
            scale: state === "play" ? 2.6 : state === "view" ? 1.2 : state ? 1.7 : 1,
            duration: 0.35,
            ease: "power3.out",
            overwrite: "auto",
          });
          /* The dot shrinks out of the way as the ring grows: with a label
             inside the ring it would otherwise sit in the middle of the
             word. */
          gsap.to(dot, {
            scale: state === "play" || state === "view" ? 0 : 1,
            duration: 0.3,
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
    <>
      <div className="ax-cursor" ref={ref} aria-hidden="true">
        <span className="ax-cursor__label ax-cursor__label--play">Play</span>
        <span className="ax-cursor__label ax-cursor__label--view">View</span>
      </div>
      <div className="ax-cursor-dot" ref={dotRef} aria-hidden="true" />
    </>
  );
}
