"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * Scroll reveal with four deliberately different behaviours. The point of
 * having variants is that a page where every section does the same 28px
 * fade-up reads as templated — the motion should tell you what kind of thing
 * you're looking at.
 *
 *   rise    — a single block of prose or a button. Short, low travel.
 *   clip    — an image or media panel. Unveils from the bottom edge; nothing
 *             moves, so heavy 3D renders don't shimmer.
 *   stagger — a set of sibling cards. Children come in on a rhythm.
 *   drift   — a decorative object. Slow parallax tied to scroll, no in/out.
 *
 * Usage:
 *   <Reveal variant="stagger" selector=".whyus-box_item"><Grid/></Reveal>
 */
export default function Reveal({
  children,
  variant = "rise",
  selector,
  delay = 0,
  start = "top 82%",
  as: Tag = "div",
  className = "",
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) return;

    // Mark the targets hidden NOW, in this effect, rather than after the
    // dynamic gsap import resolves — otherwise every reveal flashes fully
    // visible for a few hundred milliseconds and then snaps out.
    const targets =
      variant === "stagger" && selector
        ? Array.from(el.querySelectorAll(selector))
        : [el];
    if (!targets.length) return;
    if (variant !== "drift") {
      targets.forEach((t) => t.setAttribute("data-ax", "hide"));
    }

    let ctx;
    let cancelled = false;

    loadGsap().then((mod) => {
      if (!mod || cancelled) {
        targets.forEach((t) => t.removeAttribute("data-ax"));
        return;
      }
      const { gsap } = mod;

      ctx = gsap.context(() => {

        const common = {
          scrollTrigger: { trigger: el, start, once: true },
          delay,
        };

        if (variant === "clip") {
          gsap.fromTo(
            targets,
            { opacity: 1, clipPath: "inset(0% 0% 100% 0%)", scale: 1.08 },
            {
              ...common,
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1,
              duration: 1.3,
              ease: "power3.inOut",
              onStart: () => targets.forEach((t) => t.removeAttribute("data-ax")),
            }
          );
          return;
        }

        if (variant === "drift") {
          targets.forEach((t) => t.removeAttribute("data-ax"));
          gsap.to(targets, {
            yPercent: -14,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          });
          return;
        }

        gsap.fromTo(
          targets,
          {
            opacity: 0,
            y: variant === "stagger" ? 58 : 44,
            scale: variant === "stagger" ? 0.94 : 1,
          },
          {
            ...common,
            opacity: 1,
            y: 0,
            scale: 1,
            duration: variant === "stagger" ? 1.05 : 0.95,
            ease: "power3.out",
            stagger: variant === "stagger" ? 0.12 : 0,
            onStart: () => targets.forEach((t) => t.removeAttribute("data-ax")),
          }
        );
      }, el);
    });

    return () => {
      cancelled = true;
      ctx && ctx.revert();
    };
  }, [variant, selector, delay, start]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
