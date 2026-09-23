"use client";

import { prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * One answer to "may this surface spend a GPU context here?", shared by
 * every WebGL component on the page.
 *
 * Three of these can mount at once on the home page (`DepthField` in the
 * hero and in the closing CTA, `GemCore` in the pipeline closer), plus
 * `HeroNetwork` on a case-study page. Browsers cap live WebGL contexts —
 * Chrome at 16, but far lower in practice on integrated graphics — and
 * silently kill the oldest when the cap is hit, which shows up as a
 * decoration that vanishes on scroll rather than as an error. Every one of
 * these is atmosphere with a designed fallback underneath it, so the right
 * response to any doubt is simply not to start.
 *
 * The checks, in the order they matter:
 *
 *   - reduced motion. All of these are continuous, unrequested animation.
 *   - Save-Data / 2g. `three` is ~150KB gzipped on top of the page's video.
 *   - `deviceMemory` at 4GB or below, which in practice means a low-end
 *     laptop or an older phone where a second rAF loop is the difference
 *     between a smooth scroll and a stuttering one.
 *   - no WebGL at all (a VM, a hardened browser, a blocklisted driver).
 *
 * Note what is deliberately NOT checked: screen size. A small viewport is
 * not a slow device, and the effects that use this are sized in viewport
 * units — each caller decides for itself whether its own effect is worth
 * showing at phone width.
 */
export function canRunWebGL() {
  if (typeof window === "undefined") return false;
  if (prefersReducedMotion()) return false;

  const conn = navigator.connection;
  if (conn?.saveData) return false;
  if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return false;
  if (typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4) {
    return false;
  }

  return hasWebGL();
}

/** Cached, because creating a probe context is itself not free. */
let webglSupport = null;

function hasWebGL() {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    /* Hand the context straight back rather than waiting for GC — the probe
       itself counts against the browser's context cap. */
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    webglSupport = Boolean(gl);
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

/**
 * Run `start` once `el` comes within `rootMargin` of the viewport; returns
 * a function that cancels the wait.
 *
 * Every WebGL surface on the home page sits well below the fold, and each
 * used to call `import("three")` and build its context straight after
 * hydration — ~180KB of gzipped library parsed, and three contexts
 * compiling shaders, while the first screen was still becoming
 * interactive. A screen of margin is the same lead `AmbientVideo` gives its
 * clips: the swap from still to render still happens before the surface
 * is on screen, so nothing a reader sees changes.
 */
export function whenNear(el, start, rootMargin = "100% 0px") {
  if (typeof IntersectionObserver === "undefined") {
    start();
    return () => {};
  }
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      start();
    },
    { rootMargin }
  );
  io.observe(el);
  return () => io.disconnect();
}

/**
 * Device pixel ratio, capped. Above 2 the extra fragments are invisible on
 * the kind of soft, additive, out-of-focus imagery these components draw,
 * and on a 3x phone display the cost is quadratic.
 */
export function renderScale() {
  return Math.min(window.devicePixelRatio || 1, 2);
}
