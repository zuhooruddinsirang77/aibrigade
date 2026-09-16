"use client";

import { useEffect, useRef, useState } from "react";
import { loadGsap, prefersReducedMotion } from "@/components/motion/gsapLoader";
import AmbientVideo from "@/components/motion/AmbientVideo";
import { filmFor } from "@/components/video.data";

/**
 * "How we run it" — the five stages of an engagement, as a line being drawn
 * rather than a grid being listed.
 *
 * The content was already on the page: Discover, Design, Build, Deploy,
 * Scale, laid out as six equal tiles in a 3x2 grid (the sixth,
 * "People-first approach", is not a stage and is handled separately by the
 * caller). Nothing in that layout said these happen in order, which is the
 * single most important thing about them — and it is the same five-stage
 * spine the Deployments section already scrubs its reels along, so the page
 * was telling the same story twice in two unrelated shapes.
 *
 * Here a line draws left to right as the section passes the viewport, and
 * each stage lights as the line reaches it. Scroll position *is* project
 * progress, which is the one metaphor this particular content earns.
 *
 * Deliberately NOT pinned. The first version pinned this section the way
 * WhyUs pins its card row, and inherited both of that approach's problems
 * at once: the fixed navbar sheared the tops off the stage headings, and
 * the pin added two viewports of scroll to a section whose content is six
 * lines of text. Scrubbing against the section's own pass through the
 * viewport draws the same line over scroll the reader was doing anyway.
 *
 * Degradation: under reduced motion, or if GSAP never loads, every stage
 * renders lit, as the plain ordered list it is underneath. The copy is the
 * content; the drawing is the flourish. Below 992px the stages stack and
 * the rail is hidden entirely (see motion.css) — there is no horizontal
 * line to draw in a single column.
 *
 * Above the rail sits one screen, showing the stage the line has reached —
 * the same scroll position saying the same thing a third way: the line
 * reaches Deploy, Deploy lights, and the screen becomes a rack of servers.
 * Pointing at any stage takes the screen over from the scroll, so a reader
 * can look ahead at Scale without scrolling there and losing their place.
 *
 * One screen rather than a clip behind each of the five stages, and that is
 * a legibility decision before an aesthetic one: this section sits on white
 * with dark text, so five films behind five paragraphs would mean five
 * paragraphs to keep readable over moving footage. A single screen that
 * carries no text over it can be graded as hard as the footage needs.
 *
 * Clips arm one at a time as the line reaches them, never all five at once,
 * and all five are files already used elsewhere on the page (see `filmFor`
 * in components/video.data.js), so most come from cache.
 */
export default function Pipeline({ stages }) {
  const sectionRef = useRef(null);
  const railRef = useRef(null);
  const [active, setActive] = useState(0);
  const [drawn, setDrawn] = useState(0); // 0..1, how much of the line is in
  // Which stage the pointer is on, or null when the scroll is in charge.
  const [hovered, setHovered] = useState(null);
  const [seen, setSeen] = useState(() => new Set([0]));

  // The stage whose clip is showing: the pointer wins over the scroll.
  const lit = hovered ?? active;

  useEffect(() => {
    setSeen((prev) => (prev.has(lit) ? prev : new Set(prev).add(lit)));
  }, [lit]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Show the finished diagram rather than a permanently half-drawn one
    // whenever the scroll machinery isn't going to run: reduced motion, and
    // below the pin breakpoint where the stages stack instead.
    const settle = () => {
      setDrawn(1);
      setActive(stages.length - 1);
    };
    const isDesktop = () => window.matchMedia("(min-width: 992px)").matches;

    if (prefersReducedMotion() || !isDesktop()) {
      settle();
      if (prefersReducedMotion()) return;
    }

    let cancelled = false;
    let cleanup = () => {};

    loadGsap().then((mod) => {
      if (cancelled) return;
      if (!mod) {
        settle();
        return;
      }
      const { ScrollTrigger } = mod;

      const st = ScrollTrigger.create({
        trigger: section,
        // The line starts drawing as the stages clear the lower third of
        // the screen and finishes while the last one is still well above
        // the fold — so the diagram is complete at the moment you are
        // actually looking at the end of it, not after it has left.
        start: "top 72%",
        end: "bottom 62%",
        scrub: 0.8,
        invalidateOnRefresh: true,
        onRefresh: () => {
          if (!isDesktop()) settle();
        },
        onUpdate: (self) => {
          if (!isDesktop()) return;
          const p = self.progress;
          setDrawn(p);
          // The stage that is "current" is the last one the line has passed.
          setActive(Math.min(stages.length - 1, Math.floor(p * stages.length)));
        },
      });

      const onResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", onResize);
      cleanup = () => {
        st.kill();
        window.removeEventListener("resize", onResize);
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [stages.length]);

  return (
    <div className="ax-pipe" ref={sectionRef}>
      <div className="ax-pipe__screen" aria-hidden="true">
        {stages.map((s, i) =>
          seen.has(i) ? (
            <AmbientVideo
              key={s.title}
              film={filmFor.stages[s.title]}
              play={i === lit}
              data-on={i === lit}
              className="ax-pipe__film"
              rootMargin="0px"
            />
          ) : null
        )}
        <p className="ax-pipe__screen-label">
          <span>{String(lit + 1).padStart(2, "0")}</span>
          {stages[lit]?.title}
        </p>
      </div>

      <div className="ax-pipe__rail" ref={railRef} aria-hidden="true">
        <span className="ax-pipe__rail-base" />
        <span
          className="ax-pipe__rail-fill"
          style={{ transform: `scaleX(${drawn})` }}
        />
      </div>

      <ol className="ax-pipe__stages">
        {stages.map((s, i) => (
          <li
            key={s.title}
            className="ax-pipe__stage"
            data-state={i < active ? "past" : i === active ? "now" : "next"}
            data-lit={i === lit}
            onPointerEnter={() => setHovered(i)}
            onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
            onFocusCapture={() => setHovered(i)}
            onBlurCapture={() => setHovered((h) => (h === i ? null : h))}
          >
            <span className="ax-pipe__node" aria-hidden="true">
              <span className="ax-pipe__node-dot" />
            </span>
            <span className="ax-pipe__index" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="ax-pipe__title">{s.title}</h3>
            <p className="ax-pipe__text">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
