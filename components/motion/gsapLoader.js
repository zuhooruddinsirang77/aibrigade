"use client";

/**
 * One shared, memoised GSAP + ScrollTrigger loader.
 *
 * The repo already loads GSAP this way in WhyUs.jsx (dynamic import inside an
 * effect) so it stays out of the server bundle. Doing it once here means the
 * horizontal-scroll section and the new motion layer share a single
 * ScrollTrigger instance — two copies would fight over scroll state.
 */

let promise = null;

export function loadGsap() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (promise) return promise;

  promise = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
    ([gsapMod, stMod]) => {
      const gsap = gsapMod.default || gsapMod.gsap;
      const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    }
  );

  return promise;
}

export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
