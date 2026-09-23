"use client";

import { useEffect, useRef, useState } from "react";
import { demos } from "@/components/demos/demos.data";

/**
 * The strip that sticks under the navigation while the modules scroll by.
 *
 * Four modules at close to a screen each is a long page, and the old index
 * cards scrolled away with the first of them. This stays: it names the
 * module being read, jumps to any other, and draws how far through the lab
 * the reader is along its bottom edge.
 *
 * `watchRef` is the element that holds the modules. Progress is measured
 * across it, and written straight to a CSS custom property from a
 * requestAnimationFrame callback — a scroll position has no business
 * re-rendering React forty times a second.
 */
export default function LabRail({ watchRef }) {
  const [active, setActive] = useState(null);
  const railRef = useRef(null);
  const listRef = useRef(null);

  // Progress through the modules, as a 0–1 custom property, and which
  // module is crossing the middle of the viewport. Measured from positions
  // on each frame rather than with an IntersectionObserver: a jump from the
  // bottom of the page to the top crosses no module on the way, and an
  // observer would leave the last one lit over the hero.
  useEffect(() => {
    const rail = railRef.current;
    const watch = watchRef?.current;
    if (!rail || !watch) return;
    const nodes = demos.map((d) => document.getElementById(d.id)).filter(Boolean);

    let raf = 0;
    const measure = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      const r = watch.getBoundingClientRect();
      const span = r.height - mid;
      const p = span > 0 ? (mid - r.top) / span : 0;
      rail.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(4));

      let current = null;
      for (const n of nodes) {
        const b = n.getBoundingClientRect();
        if (b.top <= mid && b.bottom > mid) current = n.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [watchRef]);

  // On a phone the tabs scroll sideways; keep the lit one in view. The
  // list is scrolled directly — `scrollIntoView` would move the page too.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !active) return;
    const tab = list.querySelector(`[data-id="${active}"]`);
    if (!tab || list.scrollWidth <= list.clientWidth) return;
    const left = tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2;
    list.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  return (
    <nav ref={railRef} className="ax-lab__rail" aria-label="Lab modules">
      <div className="padding-global">
        <div className="container-large">
          <div className="ax-lab__rail-inner">
            <span className="ax-lab__rail-tag" aria-hidden="true">
              <i />
              AI Lab
            </span>
            <ol ref={listRef} className="ax-lab__rail-list">
              {demos.map((d, i) => (
                <li key={d.id}>
                  <a
                    href={`#${d.id}`}
                    data-id={d.id}
                    data-on={active === d.id ? "true" : undefined}
                    aria-current={active === d.id ? "true" : undefined}
                  >
                    <span className="ax-lab__rail-n">{String(i + 1).padStart(2, "0")}</span>
                    {d.short}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      <span className="ax-lab__rail-progress" aria-hidden="true">
        <i />
      </span>
    </nav>
  );
}
