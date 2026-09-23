"use client";

import { useEffect, useMemo, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * Headline reveal: each word rises out of its own clipping box.
 *
 * Word-level rather than line-level on purpose — line splitting needs layout
 * measurement, which breaks on this site because the two Webflow stylesheets
 * arrive over the network after first paint and re-flow every heading. Words
 * clip correctly at any width with no measurement at all.
 *
 * GSAP's SplitText is a paid Club plugin; this needs nothing beyond core.
 *
 * Wrap the text only. Keep the existing Webflow heading classes on the
 * element so the theme's type, gradient fills and breakpoints still apply:
 *
 *   <h2 className="gradient-background heading-gradient-60pt-ipad-pro">
 *     <MaskHeading text={"Prominent\nCases"} />
 *   </h2>
 *
 * Words wrapped in asterisks — `"AI that does\n*the work.*"` — get
 * `.ax-mask__word--accent`, so a heading can carry its emphasis without
 * giving up the per-word reveal. The asterisks are not rendered.
 */

/* Split one line into words, marking the ones inside `*…*`. */
function parseLine(line) {
  let accent = false;
  return line
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      let word = raw;
      const opens = word.startsWith("*");
      if (opens) word = word.slice(1);
      const closes = word.endsWith("*");
      if (closes) word = word.slice(0, -1);
      if (opens) accent = true;
      const out = { word, accent };
      if (closes) accent = false;
      return out;
    });
}
export default function MaskHeading({ text, delay = 0, start = "top 85%" }) {
  const ref = useRef(null);

  // "\n" becomes a hard line break, matching the <br /> usage already in the
  // markup. Everything else splits on whitespace.
  const lines = useMemo(() => String(text).split("\n"), [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let ctx;
    let cancelled = false;

    loadGsap().then((mod) => {
      if (!mod || cancelled) {
        // No GSAP, no reveal — but the headline is not optional. Drop the
        // clipping so the words sit where they normally would.
        el.classList.add("ax-mask--released");
        return;
      }
      const { gsap } = mod;

      ctx = gsap.context(() => {
        const words = el.querySelectorAll(".ax-mask__word > span");
        if (!words.length) return;

        gsap.fromTo(
          words,
          // `y: 0` is not redundant. getComputedStyle turned the CSS
          // `translateY(105%)` into a pixel matrix, which GSAP reads back as
          // a `y` offset with yPercent 0. Without clearing `y` here, the tween
          // animates a yPercent that is already 0 and the words never move.
          // `rotateX` adds a slight 3D flip on top of the rise — needs the
          // sibling `perspective` in motion.css to read as depth rather than
          // a flat vertical skew.
          { yPercent: 105, y: 0, rotateX: -55, transformOrigin: "50% 100%" },
          {
            yPercent: 0,
            y: 0,
            rotateX: 0,
            duration: 1.05,
            delay,
            ease: "power3.out",
            stagger: 0.07,
            scrollTrigger: { trigger: el, start, once: true },
          }
        );
      }, el);
    });

    return () => {
      cancelled = true;
      ctx && ctx.revert();
    };
  }, [delay, start, text]);

  return (
    <span className="ax-mask" ref={ref}>
      {lines.map((line, li) => (
        <span key={li}>
          {parseLine(line).map(({ word, accent }, wi) => (
            <span
              className={accent ? "ax-mask__word ax-mask__word--accent" : "ax-mask__word"}
              key={`${li}-${wi}`}
            >
              <span>
                {word}
                {"\u00A0"}
              </span>
            </span>
          ))}
          {li < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </span>
  );
}
