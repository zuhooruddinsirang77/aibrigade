"use client";

import { useEffect } from "react";
import { loadGsap, prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * Mount once, inside <body>, above everything else.
 *
 *   `ax-motion`    — JS is alive, the motion layer may hide things it is
 *                    about to animate.
 *   `ax-reduced`   — the OS asked for reduced motion.
 *   `ax-nomotion`  — GSAP did not load. Everything the motion layer hid is
 *                    released and shown as-is.
 *
 * That last flag matters. `Reveal` hides its targets and `MaskHeading` holds
 * its words below their clipping box, and both rely on GSAP to bring them
 * back. If the library never arrives — blocked script, offline, CDN hiccup —
 * those elements would stay invisible forever. So the release is conditional
 * on an actual failure rather than on a timer: a blanket timeout would also
 * fire for headings further down a long page that simply haven't been
 * scrolled to yet, and pop them in with no animation at all.
 */
export default function MotionProvider() {
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => root.classList.toggle("ax-reduced", mq.matches);
    sync();
    mq.addEventListener("change", sync);

    root.classList.add("ax-motion");

    let ready = false;
    let cleanupGsap = () => {};

    if (!prefersReducedMotion()) {
      loadGsap()
        .then((mod) => {
          if (!mod) return;
          ready = true;
          const { ScrollTrigger } = mod;

          // The two remote Webflow stylesheets and the webfonts land after
          // first paint and change the page height. Without a refresh, every
          // trigger start/end is measured against a layout that no longer
          // exists.
          const refresh = () => ScrollTrigger.refresh();
          if (document.fonts?.ready) document.fonts.ready.then(refresh);
          window.addEventListener("load", refresh);
          const settle = setTimeout(refresh, 1200);
          cleanupGsap = () => {
            window.removeEventListener("load", refresh);
            clearTimeout(settle);
          };
        })
        .catch(() => {});
    }

    // This window used to be 3.5s, tuned for "gsap failed to load". In dev,
    // Turbopack compiles the gsap/ScrollTrigger chunk on demand the first
    // time anything actually imports it, and on a cold `next dev` that alone
    // can take longer than 3.5s — confirmed by reproducing it: the failsafe
    // fired on the very first page load of a fresh dev server, stripped every
    // `data-ax="hide"` attribute, and left the whole site permanently static
    // for that visit even though gsap went on to load half a second later.
    // A reload "fixed" it because Turbopack had the chunk cached by then,
    // which made the bug read as "the site has no animations" rather than
    // "the failsafe fired too early." Production doesn't pay the compile
    // cost, but a slow connection or a cold CDN cache is the same shape of
    // problem, so this gets real headroom instead of a dev/prod special case.
    const failsafe = setTimeout(() => {
      if (ready || prefersReducedMotion()) return;
      root.classList.add("ax-nomotion");
      document
        .querySelectorAll('[data-ax="hide"]')
        .forEach((n) => n.removeAttribute("data-ax"));
    }, 9000);

    return () => {
      clearTimeout(failsafe);
      mq.removeEventListener("change", sync);
      root.classList.remove("ax-motion");
      cleanupGsap();
    };
  }, []);

  return null;
}
