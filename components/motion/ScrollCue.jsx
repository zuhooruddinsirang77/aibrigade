"use client";

import { useEffect, useState } from "react";

/**
 * "There is more below this." A hairline that fills downward, once, at the
 * bottom of the first screen.
 *
 * The hero is exactly one viewport tall and ends on a full-width logo
 * ticker — a horizontal band with a hard edge, which from a standing start
 * is the visual grammar of a page footer. On a page that runs to fifteen
 * screens that is worth one line of correction.
 *
 * It removes itself permanently after the first scroll of any kind. A cue
 * that is still pulsing after the reader has already done the thing it is
 * asking for has stopped being a cue and started being decoration, and it
 * is sitting over the section below by then.
 *
 * Keyboard- and pointer-operable rather than decorative: it is a real
 * button that scrolls to the next section, so the affordance it advertises
 * is one anybody can actually take.
 */
export default function ScrollCue({ targetId, label = "Scroll" }) {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    /* A single threshold, not a fade tied to scroll position: anything
       continuous here would animate on every frame of a scroll, for an
       element whose entire job is to stop existing. */
    const onScroll = () => {
      if (window.scrollY > 40) setGone(true);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = () => {
    setGone(true);
    document.getElementById(targetId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <button
      type="button"
      className="ax-cue"
      data-gone={gone ? "true" : "false"}
      /* Once it has faded it must also stop being a tab stop — an
         invisible control in the tab order is worse than no control. */
      tabIndex={gone ? -1 : 0}
      aria-hidden={gone ? "true" : undefined}
      onClick={go}
    >
      <span className="ax-cue__label">{label}</span>
      <span className="ax-cue__rail" aria-hidden="true">
        <span className="ax-cue__dot" />
      </span>
    </button>
  );
}
