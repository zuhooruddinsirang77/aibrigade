"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";
import { CHAPTERS } from "@/components/motion/chapters";

export { CHAPTERS };

/**
 * The site's problem isn't only that nothing moves — it's that eleven
 * sections sit in a row with nothing telling you where you are or why one
 * follows the other. This rail is the spine: seven chapters, one thin tick
 * each, the active one widening and naming itself.
 *
 * Chapter names are written as beats in an engagement, not as section
 * headings ("Evidence", not "Prominent Cases"), so the rail reads as a
 * through-line rather than a table of contents.
 *
 * It sits in its own dark pill at the bottom of the viewport, so it never has
 * to match the section behind it and never covers page content.
 * IntersectionObserver only — no scroll handler, no GSAP, negligible cost.
 *
 * Crossing into a chapter used to also drop a full-screen "Chapter 4 / 7"
 * title card in the middle of the viewport. On a page this dense it landed
 * squarely on top of whatever you were reading — a grey slab over the case
 * copy, the testimonials, the footer — and fired again every time the
 * observer flipped, which on a slow scroll is constantly. The transition is
 * announced here instead: the rail's own pill lifts and its counter ticks
 * over. Same information, in the element already dedicated to carrying it,
 * and it never covers a word.
 */


export default function StoryRail({ chapters = CHAPTERS }) {
  const pathname = usePathname();
  const onHomePage = pathname === "/";

  const [active, setActive] = useState(chapters[0].id);
  const [pulse, setPulse] = useState(0);
  const activeRef = useRef(active);
  const firstCallRef = useRef(true);
  activeRef.current = active;

  useEffect(() => {
    // Every chapter id (header, whyus, cases…) only exists on the homepage.
    // On any other route — the case-study pages — there is nothing to
    // observe, and the rail would otherwise sit stuck on "The brief"
    // forever instead of tracking real scroll position.
    if (!onHomePage) return;

    const nodes = chapters
      .map((c) => document.getElementById(c.id))
      .filter(Boolean);

    if (!nodes.length) return;

    // Band across the middle of the viewport: whichever chapter owns the
    // middle of the screen is the one you're reading.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible && visible.target.id !== activeRef.current) {
          setActive(visible.target.id);
          // Skip the observer's first call — it reports where you loaded
          // in, not a chapter you crossed into.
          if (!firstCallRef.current && !prefersReducedMotion()) {
            setPulse((n) => n + 1);
          }
        }
        firstCallRef.current = false;
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.01, 0.5, 1] }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [chapters, onHomePage]);

  const go = (id) => () => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  };

  if (!onHomePage) return null;

  const activeIndex = chapters.findIndex((c) => c.id === active);

  return (
    <nav className="ax-rail" aria-label="Page chapters">
      {/* `key` remounts the counter on every chapter change so its CSS
          entrance animation replays — a transition you can feel without a
          second element appearing anywhere on screen. */}
      <span key={pulse} className="ax-rail__count" aria-hidden="true">
        {String(activeIndex + 1).padStart(2, "0")}
        <i>/{String(chapters.length).padStart(2, "0")}</i>
      </span>
      {chapters.map((c) => (
        <button
          key={c.id}
          type="button"
          className="ax-rail__item"
          aria-current={active === c.id}
          onClick={go(c.id)}
        >
          <span className="ax-rail__tick" aria-hidden="true" />
          <span className="ax-rail__label">{c.label}</span>
        </button>
      ))}
    </nav>
  );
}
