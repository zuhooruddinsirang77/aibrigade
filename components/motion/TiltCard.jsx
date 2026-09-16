"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * A card that leans toward the pointer instead of just lifting flat, and
 * catches a light while it does.
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
 * Three things were added once these started carrying real footage and
 * real diagrams rather than flat colour, because a rotation on its own is
 * only convincing while a surface has no material:
 *
 *   - **A specular sweep.** A physical card tilting under a light changes
 *     what it reflects. The element injected below is a single soft
 *     highlight positioned at the pointer, which is the cheapest thing
 *     that reads as a surface having a finish. It is what stops the
 *     rotation from looking like a flat image being skewed.
 *   - **Inner parallax.** The host publishes `--ax-tx` / `--ax-ty` (the
 *     pointer, -1..1) on the card, so any child can offset against the
 *     rotation and sit at its own apparent depth. A card whose contents
 *     all rotate rigidly still reads as one plane; one where the film
 *     drifts opposite to the caption reads as a box with things inside it.
 *   - **`--ax-tilt`**, 0 at rest and 1 while engaged, so CSS can ramp
 *     anything else off the same gesture without a second listener.
 *
 * Pointer-fine only, and inert under `prefers-reduced-motion`: the card
 * keeps whatever hover state the stylesheet gives it.
 *
 *   <TiltCard depth={26}><div className="features_item">…</div></TiltCard>
 */
export default function TiltCard({
  children,
  max = 9,
  lift = 10,
  /** Perspective distance in px. Lower = stronger, more dramatic 3D. */
  perspective = 900,
  /** Adds the specular sweep. Off for cards whose surface is pure text. */
  glare = true,
  /** Publishes `--ax-tx`/`--ax-ty` for children to parallax against, and
   *  pushes the card itself this far toward the viewer while engaged. */
  depth = 0,
}) {
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

      /* The highlight is absolutely positioned, so it needs the card to be
         a containing block. Most already are; the ones that aren't get it
         here and have it taken back on teardown, so nothing about the
         card's layout is permanently altered by a decoration. */
      let restorePosition = null;
      let glareEl = null;
      if (glare) {
        if (getComputedStyle(el).position === "static") {
          restorePosition = el.style.position;
          el.style.position = "relative";
        }
        glareEl = document.createElement("span");
        glareEl.className = "ax-tilt__glare";
        glareEl.setAttribute("aria-hidden", "true");
        el.appendChild(glareEl);
      }

      ctx = gsap.context(() => {
        gsap.set(el, {
          transformPerspective: perspective,
          transformStyle: "preserve-3d",
          /* Seeded explicitly. GSAP reads a custom property's start value
             off `getComputedStyle`, and an unregistered one that has never
             been written returns the empty string — which parses to NaN and
             leaves the first tween writing `--ax-tx: NaN`. */
          "--ax-tx": 0,
          "--ax-ty": 0,
          "--ax-tilt": 0,
        });

        const rotX = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" });
        const rotY = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" });
        const lift$ = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
        const push$ = gsap.quickTo(el, "z", { duration: 0.5, ease: "power3.out" });
        /* The CSS variables are tweened too, not assigned — a raw write on
           every pointermove makes children that read them snap between
           frames while the card itself is easing, which reads as the
           contents being loosely attached to the box. */
        const txTo = gsap.quickTo(el, "--ax-tx", { duration: 0.6, ease: "power3.out" });
        const tyTo = gsap.quickTo(el, "--ax-ty", { duration: 0.6, ease: "power3.out" });

        const setGlare = glareEl
          ? gsap.quickSetter(glareEl, "css")
          : null;

        const onEnter = () => {
          el.classList.add("ax-tilt--active");
          gsap.to(el, { "--ax-tilt": 1, duration: 0.45, ease: "power2.out", overwrite: "auto" });
        };

        const onMove = (e) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
          const py = (e.clientY - r.top) / r.height - 0.5;
          rotY(px * max * 2);
          rotX(py * -max * 2);
          lift$(-lift);
          if (depth) push$(depth * 0.5);
          txTo(px * 2);
          tyTo(py * 2);
          /* Written directly rather than tweened: the highlight is meant to
             sit under the pointer, and easing its position makes it lag
             behind the finger that is supposedly casting it. */
          setGlare?.({
            left: `${(px + 0.5) * 100}%`,
            top: `${(py + 0.5) * 100}%`,
          });
        };

        const onLeave = () => {
          rotX(0);
          rotY(0);
          lift$(0);
          push$(0);
          txTo(0);
          tyTo(0);
          el.classList.remove("ax-tilt--active");
          gsap.to(el, { "--ax-tilt": 0, duration: 0.5, ease: "power2.out", overwrite: "auto" });
        };

        el.addEventListener("pointerenter", onEnter);
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        cleanup = () => {
          el.removeEventListener("pointerenter", onEnter);
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
          if (glareEl?.parentNode === el) el.removeChild(glareEl);
          if (restorePosition !== null) el.style.position = restorePosition;
          el.classList.remove("ax-tilt--active");
        };
      }, el);
    });

    return () => {
      cancelled = true;
      cleanup();
      ctx && ctx.revert();
    };
  }, [max, lift, perspective, glare, depth]);

  return (
    <span ref={hostRef} style={{ display: "contents" }}>
      {children}
    </span>
  );
}
