"use client";

import { useEffect, useRef, useState } from "react";
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
 */

const MIN_MS = 700;
const MAX_MS = 1800;

export default function Preloader() {
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);
  const fillRef = useRef(null);

  useEffect(() => {
    const wrapper = document.querySelector(".page-wrapper");
    const started = performance.now();
    let raf = 0;
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

    const finish = () => {
      setPct(100);
      setDone(true);
    };

    if (prefersReducedMotion()) {
      const t = setTimeout(finish, MIN_MS);
      return () => {
        clearTimeout(t);
        clearTimeout(revealTimer);
        window.removeEventListener("load", onLoad);
      };
    }

    const tick = () => {
      const elapsed = performance.now() - started;
      /* Two clocks, whichever is further along. The time-based one
         guarantees the bar always moves — a progress indicator that sits
         at 12% because a video is still buffering is the failure mode this
         is meant to avoid. The load-based one lets a warm cache finish
         early instead of serving a fixed-length animation to someone who
         already has every byte. */
      const byTime = Math.min(1, elapsed / MAX_MS);
      const byLoad = loaded ? Math.min(1, Math.max(byTime, elapsed / MIN_MS)) : byTime;
      const p = Math.max(byTime, byLoad);

      /* Written straight to the node, and only the integer is pushed
         through React state: the fill updates every frame, the numeral at
         most 100 times. */
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
      setPct(Math.round(p * 100));

      if (p >= 1) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
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
        <span className="ax-intro__fill" ref={fillRef} />
      </div>
      <span className="ax-intro__count">{String(pct).padStart(3, "0")}</span>
    </div>
  );
}
