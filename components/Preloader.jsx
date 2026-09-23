"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * The first second.
 *
 * What was here was a fixed ink panel holding the logo, revealed on a
 * fade after a 900ms timer. The timer is the part worth keeping — this
 * page's first screen is a full-bleed video behind a masked headline, and
 * showing a reader the half-built version of that is worse than showing
 * them nothing for a moment. What it did not do was say anything while it
 * held, so the pause read as latency rather than as an opening.
 *
 * Three changes, none of them to the brand:
 *
 *   - **It reports.** A hairline fills and a numeral counts to 100. Same
 *     `--grad-rail` as `ScrollProgress`'s bar, so the instrument that
 *     opens the page is visibly the same one that tracks it afterwards.
 *   - **It lifts rather than dissolves.** The panel travels up and off,
 *     which reveals the hero from underneath — a cut, and a direction. A
 *     cross-fade between two full-screen images is the one transition that
 *     reliably looks like a page still loading.
 *   - **It waits for the real thing.** The count is driven by `window`'s
 *     load event where that arrives promptly, and by the clock otherwise,
 *     so it is neither a pure fiction nor hostage to the last stylesheet
 *     on a slow connection.
 *
 * The floor and ceiling matter more than the curve between them. Below
 * ~700ms an intro reads as a flash of dark, which is worse than no intro.
 * Above ~1.8s it is a toll. Everything here is bounded to that window.
 *
 * Under `prefers-reduced-motion` the panel still appears — it is covering
 * an unfinished paint, which is a correctness job, not a decorative one —
 * but it leaves on a short opacity fade with no counter and no travel
 * (see `.ax-intro` in app/immersive.css).
 *
 * The fill and the numeral are animated in CSS, not from here. They used
 * to be written from a requestAnimationFrame loop, which cannot start
 * until React has hydrated — so on a slow connection the server-rendered
 * panel sat reading "000" with an empty rail for as long as the scripts
 * took, which looks like a hung page. The CSS runs from first paint; this
 * component now only decides when to lift, and it waits for the count to
 * have actually reached 100 (read from the CSS animation itself) so the
 * curtain never leaves mid-count.
 */

const MIN_MS = 700;
const MAX_MS = 1800;
/* Lift regardless after this long, in case an animation never reports
   finishing (a backgrounded tab can hold one indefinitely). */
const FAILSAFE_MS = 3200;

export default function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const wrapper = document.querySelector(".page-wrapper");
    const started = performance.now();
    let timer = 0;
    let cancelled = false;
    let loaded = document.readyState === "complete";

    const onLoad = () => { loaded = true; };
    if (!loaded) window.addEventListener("load", onLoad, { once: true });

    /* Reveal the page underneath almost immediately. The panel is opaque
       and still covering it, so this is not visible — but it means the
       hero's own entrance animations are running behind the curtain and
       are already part-way through when it lifts, rather than all starting
       from zero the instant it clears. */
    const revealTimer = setTimeout(() => {
      wrapper && wrapper.classList.add("is-ready");
    }, 120);

    const reduced = prefersReducedMotion();

    /* Has the CSS count reached 100? None to wait for (reduced motion, or
       no Web Animations support) counts as reached. */
    let counted = false;
    const count = document.querySelector(".ax-intro__count");
    const anims = (!reduced && count && count.getAnimations && count.getAnimations()) || [];
    if (!anims.length) {
      counted = true;
    } else {
      Promise.all(anims.map((a) => a.finished))
        .catch(() => {})
        .then(() => {
          counted = true;
        });
    }

    /* The same floor and ceiling as before: never under MIN_MS, and past
       MAX_MS stop waiting for `load` — a video still buffering is not a
       reason to hold a reader on this panel. */
    const check = () => {
      if (cancelled) return;
      const elapsed = performance.now() - started;
      const ready = elapsed >= MIN_MS && counted && (loaded || elapsed >= MAX_MS);
      if (ready || elapsed >= FAILSAFE_MS) {
        setDone(true);
        return;
      }
      timer = setTimeout(check, 50);
    };
    timer = setTimeout(check, reduced ? MIN_MS : 50);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearTimeout(revealTimer);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <div className="ax-intro" data-done={done ? "true" : "false"} aria-hidden="true">
      <div className="ax-intro__mark preloader_image-wrapper" style={{ maxWidth: "60vw" }}>
        <Logo size="10rem" />
      </div>
      <div className="ax-intro__rail">
        <span className="ax-intro__fill" />
      </div>
      {/* The numeral is drawn by CSS (a counter over an animated integer),
          so it counts from first paint — see app/immersive.css §8. */}
      <span className="ax-intro__count" />
    </div>
  );
}
