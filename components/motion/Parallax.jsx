"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * Scroll-scrubbed drift for decorative objects — the floating cubes, the
 * gems, the figure renders behind the feature cards.
 *
 * It renders a `display: contents` host and animates that host's element
 * children directly.
 *
 * Two constraints forced this shape:
 *
 *   - A normal wrapper div is out. Most of these decorations are
 *     `position: absolute` under Webflow's CSS, and a wrapper with a box
 *     would become their containing block and move them across the page.
 *     `display: contents` generates no box at all, so the child is laid out
 *     exactly as if this component weren't here.
 *
 *   - `cloneElement(Children.only(children), { ref })` is out. It threw,
 *     because `Features.jsx` is a Server Component: the `<img>` it passes
 *     arrives across the RSC boundary as a serialized node, not the plain
 *     element `Children.only` expects. Reading `host.children` from the DOM
 *     after mount sidesteps the question entirely — by then it is just an
 *     element, whoever created it.
 *
 * Never use this on `.services_photo`. globals.css pins that one with
 * `transform: translate3d(0,0,0) !important` and the tween silently loses.
 *
 *   <Parallax speed={-18}>
 *     <img className="header_dec-1" … />
 *   </Parallax>
 *
 * `mouse` adds a second, independent tween on the same target: a pointer-
 * follow drift, in pixels, scaled by distance from viewport centre. Scroll
 * drift is the motion you notice on a long page; mouse drift is the motion
 * you feel the instant you land, before you've scrolled at all — the two
 * read as separate signals (`yPercent` vs `x`/`y`) so GSAP composites them
 * into one transform instead of one clobbering the other.
 *
 *   <Parallax speed={-26} mouse={22}>
 *     <img className="header_dec-2" … />
 *   </Parallax>
 */
export default function Parallax({ children, speed = -14, mouse = 0 }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || prefersReducedMotion()) return;

    const targets = Array.from(host.children);
    if (!targets.length) return;

    let ctx;
    let cancelled = false;
    let cleanupMouse = () => {};

    loadGsap().then((mod) => {
      if (!mod || cancelled) return;
      const { gsap } = mod;

      // Scoped to the host so ctx.revert() cleans up every tween and trigger
      // this instance made, and nothing else.
      ctx = gsap.context(() => {
        targets.forEach((target) => {
          gsap.to(target, {
            yPercent: speed,
            ease: "none",
            scrollTrigger: {
              // The host has no box, so it cannot be the trigger — measure
              // against the element that actually occupies space.
              trigger: target,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          });
        });

        if (mouse && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          // quickTo reuses one tween per axis instead of spinning up a fresh
          // gsap.to() on every pointermove — the difference between smooth
          // and janky at 100+ events a second.
          const movers = targets.map((target) => ({
            x: gsap.quickTo(target, "x", { duration: 0.9, ease: "power3.out" }),
            y: gsap.quickTo(target, "y", { duration: 0.9, ease: "power3.out" }),
          }));
          const onMove = (e) => {
            const nx = (e.clientX / window.innerWidth - 0.5) * 2;
            const ny = (e.clientY / window.innerHeight - 0.5) * 2;
            movers.forEach((m) => {
              m.x(nx * mouse);
              m.y(ny * mouse);
            });
          };
          window.addEventListener("pointermove", onMove);
          cleanupMouse = () => window.removeEventListener("pointermove", onMove);
        }
      }, host);
    });

    return () => {
      cancelled = true;
      cleanupMouse();
      ctx && ctx.revert();
    };
  }, [speed, mouse]);

  return (
    <span ref={hostRef} style={{ display: "contents" }}>
      {children}
    </span>
  );
}
