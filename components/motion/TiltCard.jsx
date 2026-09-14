"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * A card that leans toward the pointer instead of just lifting flat.
 *
 * Renders a `display: contents` host and operates on its DOM child directly
 * — the same shape `Parallax` uses, and for the same reason (see that
 * file's comment): `Features.jsx` is a Server Component, so a child element
 * it passes into this Client Component arrives across the RSC boundary as a
 * serialized node, not the plain element `cloneElement(Children.only(...))`
 * expects — that throws "expected to receive a single React element child"
 * at runtime despite looking like exactly one child in the JSX. Reading
 * `host.firstElementChild` after mount sidesteps the question entirely — by
 * then it's just an element, whoever created it. `display: contents` means
 * the host itself generates no box, so the card lays out exactly as if this
 * wrapper weren't there, which matters inside `.features_grid-new` and the
 * reviews grid: they size the card itself as a direct grid/flex child.
 *
 * This fully replaces the plain `transform: translateY(-0.5rem)` hover in
 * motion.css for whatever it wraps — GSAP writes inline `transform`, which
 * outranks a stylesheet `:hover` rule by specificity, so the two can't
 * coexist. The lift lives here now, tweened alongside the tilt so it reads
 * as one motion instead of two fighting ones. The shadow stays in CSS
 * (`.ax-tilt--active`, toggled below) since a `box-shadow` transition is
 * something the browser already does smoothly on its own.
 *
 *   <TiltCard><div className="features_item">…</div></TiltCard>
 */
export default function TiltCard({ children, max = 9, lift = 10 }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const el = host?.firstElementChild;
    if (!el || prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let ctx;
    let cancelled = false;
    let cleanup = () => {};

    loadGsap().then((mod) => {
      if (!mod || cancelled) return;
      const { gsap } = mod;

      ctx = gsap.context(() => {
        gsap.set(el, { transformPerspective: 800 });

        const rotX = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" });
        const rotY = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" });
        const lift$ = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

        const onEnter = () => el.classList.add("ax-tilt--active");
        const onMove = (e) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
          const py = (e.clientY - r.top) / r.height - 0.5;
          rotY(px * max * 2);
          rotX(py * -max * 2);
          lift$(-lift);
        };
        const onLeave = () => {
          rotX(0);
          rotY(0);
          lift$(0);
          el.classList.remove("ax-tilt--active");
        };

        el.addEventListener("pointerenter", onEnter);
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        cleanup = () => {
          el.removeEventListener("pointerenter", onEnter);
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
  }, [max, lift]);

  return (
    <span ref={hostRef} style={{ display: "contents" }}>
      {children}
    </span>
  );
}
