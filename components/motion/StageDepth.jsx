"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * Turns one section into a set of planes at different distances.
 *
 * `Parallax` already exists and is the right tool for a single decorative
 * object drifting past — you point it at one element and give it a speed.
 * What it cannot express is a *scene*: a backdrop, a mid-ground and the
 * copy, all moving at rates derived from one depth ordering, plus the
 * shared camera move that makes them cohere. Written with `Parallax` that
 * is three wrappers with three hand-tuned magic numbers that have to be
 * re-tuned together every time the section's height changes.
 *
 * Here the section is the scene and each layer declares where it sits:
 *
 *   <StageDepth className="ax-hero">
 *     <div data-depth="1"    >…film…</div>
 *     <div data-depth="0.45" >…mid…</div>
 *     <div data-depth="0.12" >…copy…</div>
 *   </StageDepth>
 *
 * `data-depth` is distance from the reader: 0 is glued to the glass, 1 is
 * the far backdrop. Everything else is derived from it —
 *
 *   - **Scroll drift.** Far layers travel further against the scroll,
 *     which is what parallax is.
 *   - **The push-in.** Far layers also scale slightly as the section
 *     leaves, so the exit reads as a camera moving into the scene rather
 *     than a picture sliding upward.
 *   - **Pointer sway.** Far layers swing further under the pointer. This
 *     is the part a reader feels before they have scrolled at all, on a
 *     hero that fills the first screen.
 *
 * `data-fade` opts a layer into fading out as the section leaves — for
 * copy, which should hand the screen over cleanly, rather than backdrops,
 * which should stay lit under the next section's entrance.
 *
 * Both signals are composed by GSAP onto one transform because they are
 * written as different properties (`yPercent`/`scale` for scroll, `x`/`y`
 * for pointer) — the same division of labour `Parallax` uses so its two
 * tweens don't clobber each other.
 *
 * Inert under `prefers-reduced-motion`, and the pointer half additionally
 * requires a fine pointer. With neither, the layers sit exactly where the
 * stylesheet puts them — nothing here is load-bearing for layout.
 */
export default function StageDepth({
  children,
  className = "",
  as: Tag = "div",
  /** Maximum scroll travel of the furthest layer, in % of its own height. */
  travel = 16,
  /** Maximum pointer sway of the furthest layer, in px. */
  sway = 26,
  /** How much the furthest layer scales across the whole scroll. */
  push = 0.1,
  /** Lets the caller hold the same element — the hero needs it for its own
   *  in-view check, and two refs on one node is simpler than two nested
   *  boxes fighting over which one is the section. */
  hostRef,
  ...rest
}) {
  const innerRef = useRef(null);
  const ref = hostRef || innerRef;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const layers = Array.from(el.querySelectorAll("[data-depth]"));
    if (!layers.length) return;

    let ctx;
    let cancelled = false;
    let cleanupPointer = () => {};

    loadGsap().then((mod) => {
      if (!mod || cancelled) return;
      const { gsap } = mod;

      ctx = gsap.context(() => {
        layers.forEach((layer) => {
          const depth = Math.max(0, Math.min(1, parseFloat(layer.dataset.depth) || 0));
          const fades = layer.dataset.fade !== undefined;

          /* One timeline per layer rather than one per property: they share
             a trigger and a scrub, and ScrollTrigger instances are the
             expensive part, not the tweens inside them. */
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "bottom top",
              scrub: 0.8,
            },
          });

          tl.fromTo(
            layer,
            { yPercent: 0, scale: 1 },
            {
              yPercent: -travel * depth,
              scale: 1 + push * depth,
              ease: "none",
            },
            0
          );

          if (fades) {
            /* Held at full opacity for the first third: a hero headline
               that starts dimming on the very first pixel of scroll reads
               as a rendering fault, not as a departure. */
            tl.fromTo(
              layer,
              { opacity: 1 },
              { opacity: 0, ease: "power2.in" },
              0.35
            );
          }
        });

        if (sway && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          const movers = layers.map((layer) => {
            const depth = Math.max(0, Math.min(1, parseFloat(layer.dataset.depth) || 0));
            return {
              depth,
              x: gsap.quickTo(layer, "x", { duration: 1.1, ease: "power3.out" }),
              y: gsap.quickTo(layer, "y", { duration: 1.1, ease: "power3.out" }),
            };
          });

          /* Only while the section is on screen. A hero that keeps
             recalculating a pointer offset for layers eight screens above
             the fold is burning frames the sections in view need. */
          let live = true;
          const io = new IntersectionObserver(
            ([entry]) => { live = entry.isIntersecting; },
            { threshold: 0 }
          );
          io.observe(el);

          const onMove = (e) => {
            if (!live) return;
            const nx = (e.clientX / window.innerWidth - 0.5) * 2;
            const ny = (e.clientY / window.innerHeight - 0.5) * 2;
            movers.forEach((m) => {
              /* Negative, so the scene moves opposite the pointer — the
                 direction a real window parallaxes when you lean. */
              m.x(-nx * sway * m.depth);
              m.y(-ny * sway * m.depth * 0.55);
            });
          };
          window.addEventListener("pointermove", onMove, { passive: true });
          cleanupPointer = () => {
            io.disconnect();
            window.removeEventListener("pointermove", onMove);
          };
        }
      }, el);
    });

    return () => {
      cancelled = true;
      cleanupPointer();
      ctx && ctx.revert();
    };
  }, [travel, sway, push]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
