"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";

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
 */

export const CHAPTERS = [
  { id: "header", label: "The brief" },
  { id: "whyus", label: "What we build" },
  { id: "cases", label: "Evidence" },
  { id: "reels", label: "The work, playing" },
  { id: "features", label: "How we run it" },
  { id: "reviews", label: "Who vouches" },
  { id: "ctadark", label: "Start something" },
];

export default function StoryRail({ chapters = CHAPTERS }) {
  const pathname = usePathname();
  const onHomePage = pathname === "/";

  const [active, setActive] = useState(chapters[0].id);
  const [flash, setFlash] = useState(null); // { key, index, label } | null
  const activeRef = useRef(active);
  const firstCallRef = useRef(true);
  const flashKeyRef = useRef(0);
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

          // Skip the observer's first call — it just reports where you
          // loaded in, not a chapter you crossed into. Every call after
          // that is a real transition, worth announcing like a chapter
          // card: this is the one piece of motion on the page that says
          // "you are moving through something," not just "this element
          // arrived."
          if (!firstCallRef.current && !prefersReducedMotion()) {
            const idx = chapters.findIndex((c) => c.id === visible.target.id);
            flashKeyRef.current += 1;
            setFlash({ key: flashKeyRef.current, index: idx + 1, label: chapters[idx].label });
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

  return (
    <>
      <nav className="ax-rail" aria-label="Page chapters">
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

      {flash && (
        <div
          key={flash.key}
          className="ax-chapter-flash"
          aria-hidden="true"
          onAnimationEnd={() => setFlash(null)}
        >
          <div className="ax-chapter-flash__inner">
            <span className="ax-chapter-flash__eyebrow">
              Chapter {flash.index} / {chapters.length}
            </span>
            <span className="ax-chapter-flash__label">{flash.label}</span>
          </div>
        </div>
      )}
    </>
  );
}
