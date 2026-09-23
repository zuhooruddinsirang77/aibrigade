"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * Small behaviours the lab's modules share. Each is here rather than in a
 * component because at least two modules use it, and a copy per module is
 * how four panels end up behaving four slightly different ways.
 */

/**
 * Run `fn` once, the first time `ref` scrolls properly into view.
 *
 * An empty console that says "nothing run yet" is the least convincing
 * state a live system can be in, and it was the state every module but the
 * first sat in until a reader clicked. Running the default input as the
 * panel arrives means a reader meets a working system with its reasoning
 * already on screen, and changes it from there.
 */
export function useRunOnView(ref, fn) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      fnRef.current();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          fnRef.current();
        }
      },
      { rootMargin: "0px 0px -15% 0px", threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}

/**
 * A number that travels to its new value instead of jumping.
 *
 * Used on scores. A figure that counts from 31.4 to 58.9 as a slider moves
 * tells a reader which way it went and roughly how far, which a figure
 * that swaps in place does not. Resolves instantly under reduced motion.
 */
export function useCountUp(value, ms = 520) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    if (value == null || Number.isNaN(value)) return;
    const from = fromRef.current ?? value;
    if (from === value || prefersReducedMotion()) {
      fromRef.current = value;
      setShown(value);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (value - from) * eased;
      fromRef.current = next;
      setShown(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);

  return shown;
}

/**
 * Pointer position as CSS custom properties on the element under it, for
 * the soft light the dark panels carry. CSS does the drawing; this only
 * reports where the pointer is. Touch input is ignored — there is no
 * hover on a phone for the light to follow.
 */
export function trackSpotlight(e) {
  if (e.pointerType && e.pointerType !== "mouse") return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
}

/** ⌘/Ctrl + Enter inside a textarea submits its form. */
export function submitOnModEnter(e) {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    e.currentTarget.form?.requestSubmit();
  }
}
