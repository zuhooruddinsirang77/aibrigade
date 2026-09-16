"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * The substrate — one continuous space the whole page sits in.
 *
 * The brief this answers is "sections should feel connected as one story,
 * not separate cards stacked on a page", and no amount of per-section
 * animation fixes that, because the thing producing the stacked feeling
 * is structural: every section owns its own background, so there is
 * nothing that persists from one to the next. A reader scrolling this page
 * crossed nine unrelated backgrounds.
 *
 * This is the one thing that does persist. A single fixed canvas behind
 * the entire document, drawing a slow lattice of nodes and the links
 * between them — the diagram of a system, which is what this company
 * builds — with a band of activity that travels down it as you scroll.
 *
 * The layering is the whole trick, and it is worth being precise about:
 *
 *   - It sits at `z-index: -1` as a direct child of `<body>`. A negative
 *     z-index paints above the root background but below every in-flow
 *     element, so the white page is still white and nothing had to have
 *     its stacking context changed to make room.
 *   - The light sections have no background of their own, so the lattice
 *     shows through all of them continuously — Cases, Services, Features,
 *     Reviews and the spaces between are one space.
 *   - The dark bands are opaque, so they cover it. That is deliberate:
 *     they stop reading as panels in a stack and start reading as solid
 *     objects sitting in front of the space the rest of the page is made
 *     of. The occlusion is what creates the depth.
 *
 * It is drawn to be *almost* subliminal. At rest the links sit at 2% and
 * the nodes at 5%, which on white is a texture you notice only when it
 * moves. The first pass ran at roughly double that with tighter spacing
 * and it read as network-diagram wallpaper competing with the headlines —
 * the test for this layer is that you should be able to look straight at
 * a paragraph and not see it. This is substrate, not content.
 *
 * 2D canvas rather than WebGL on purpose: it is a flat lattice, it wants
 * crisp hairlines rather than shading, and the page already spends its
 * GPU-context budget on `DepthField` and `GemCore` (see `webglGuard` on
 * why that budget is finite).
 *
 * Off entirely under `prefers-reduced-motion`. Unlike the film layers,
 * there is no static fallback worth drawing — a still lattice at 4% is
 * invisible, so the honest answer is to render nothing.
 */

/**
 * Minimum gap between draws, in ms.
 *
 * Measured against a full-page scroll on integrated graphics, redrawing
 * this every frame cost ~5.5ms of a 29.6ms budget — roughly a fifth of
 * the page's frame time, spent on a texture at 2% alpha. Halving the rate
 * halves that, and there is nothing here a reader can perceive at 60Hz
 * that they cannot at 30: the nodes drift by about three pixels over two
 * seconds, and the travelling band is already eased.
 */
const FRAME_MS = 33;

/** Target spacing between lattice nodes, in CSS px. */
const SPACING = 88;
/** Longest link drawn, as a multiple of SPACING. */
const LINK = 1.45;
/** Hard ceiling on nodes, whatever the viewport. */
const MAX_NODES = 520;

export default function ThreadField() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || prefersReducedMotion()) return;

    const conn = navigator.connection;
    if (conn?.saveData) return;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, { display: "block", width: "100%", height: "100%" });
    host.appendChild(canvas);

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      host.removeChild(canvas);
      return;
    }

    let w = 0;
    let h = 0;
    let dpr = 1;
    let nodes = [];
    let links = [];
    /** Per-frame scratch: {x, y, e} per node, reused rather than rebuilt. */
    let px = [];
    let raf = 0;
    let t = 0;
    let pointerX = -9999;
    let pointerY = -9999;
    /** 0..1 — how far through the document the reader is. */
    let progress = 0;
    let shown = progress;

    /* ---- build the lattice ---------------------------------------- */

    const build = () => {
      /* One device pixel per CSS pixel, on every display. These are
         hairlines at 2% alpha and dots under 2px across: the extra samples
         a retina buffer would give are below the threshold at which this
         is visible at all, while the fill cost they add is quadratic. This
         is the single cheapest lever on the whole effect. */
      dpr = Math.min(window.devicePixelRatio || 1, 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(w / SPACING) + 1;
      const rows = Math.ceil(h / SPACING) + 1;

      nodes = [];
      for (let r = 0; r < rows && nodes.length < MAX_NODES; r++) {
        for (let c = 0; c < cols && nodes.length < MAX_NODES; c++) {
          /* Jittered, not square. A perfect grid reads as a table — a
             piece of UI chrome. Displacing each node by up to a third of
             the spacing turns it into a lattice: still obviously
             structured, but not a ruled sheet. */
          const jx = (Math.sin(r * 12.9898 + c * 78.233) * 43758.5453) % 1;
          const jy = (Math.sin(c * 39.3468 + r * 11.135) * 24634.6345) % 1;
          nodes.push({
            x: c * SPACING + jx * SPACING * 0.34,
            y: r * SPACING + jy * SPACING * 0.34,
            /* Each node's own phase, so the drift never pulses in unison. */
            p: Math.abs(jx * 6.283),
            /* Vertical position in the lattice, 0..1 — what the travelling
               band is measured against. */
            v: rows > 1 ? r / (rows - 1) : 0,
          });
        }
      }

      /* Links are computed once, not per frame. The nodes only drift by a
         few pixels, so which ones are neighbours never changes — and an
         O(n²) neighbour search every frame for 500 nodes is the difference
         between this being free and this being the most expensive thing on
         the page. */
      px = nodes.map(() => ({ x: 0, y: 0, e: 0 }));

      const max = SPACING * LINK;
      links = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < max * max) links.push([i, j]);
        }
      }
    };

    /* ---- draw ------------------------------------------------------ */

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      /* The travelling band. It is a function of scroll position, so the
         reader is what moves it: the lattice brightens just where they
         are in the document and dims behind them. This is the piece that
         makes the backdrop feel like one continuous thing being moved
         through rather than a looping screensaver. */
      const band = shown;

      /* Written into a scratch array that lives for the life of the
         component. The first version built a fresh array of ~400 objects
         on every frame, which is 24,000 short-lived allocations a second
         handed to the GC for no reason — and GC pauses are exactly what
         the p99 frame time measures. */
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const s = px[i];
        s.x = n.x + Math.sin(t * 0.00042 + n.p) * 3.2;
        s.y = n.y + Math.cos(t * 0.00036 + n.p * 1.3) * 3.2;
        /* Distance from the band, and from the pointer. Both are simple
           falloffs; together they decide how lit this node is. */
        const nearBand = Math.max(0, 1 - Math.abs(n.v - band) * 3.4);
        const dx = s.x - pointerX;
        const dy = s.y - pointerY;
        const nearPointer = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 190);
        s.e = Math.min(1, nearBand * 0.72 + nearPointer * 0.9);
      }

      /* Links first, so nodes sit on top of their own connections. One
         path per alpha bucket instead of one stroke per link: a few
         hundred `stroke()` calls is slow, a handful is not. */
      const buckets = [
        { a: 0.02, min: 0, path: new Path2D() },
        { a: 0.052, min: 0.28, path: new Path2D() },
        { a: 0.115, min: 0.62, path: new Path2D() },
      ];
      for (const [i, j] of links) {
        const e = Math.max(px[i].e, px[j].e);
        let b = 0;
        if (e >= buckets[2].min) b = 2;
        else if (e >= buckets[1].min) b = 1;
        const p = buckets[b].path;
        p.moveTo(px[i].x, px[i].y);
        p.lineTo(px[j].x, px[j].y);
      }
      ctx.lineWidth = 1;
      for (const b of buckets) {
        ctx.strokeStyle = `rgba(146, 72, 228, ${b.a})`; // --violet-500
        ctx.stroke(b.path);
      }

      /* Nodes. The lit ones get a touch of the coral accent so the
         travelling band has the same two-colour identity as `--grad-rail`
         and the headline gradient, rather than being violet-on-violet. */
      for (const n of px) {
        const r = 0.95 + n.e * 1.35;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle =
          n.e > 0.68
            ? `rgba(248, 119, 86, ${0.07 + n.e * 0.3})` // --coral
            : `rgba(146, 72, 228, ${0.05 + n.e * 0.26})`;
        ctx.fill();
      }
    };

    /* ---- loop ------------------------------------------------------ */

    let visible = true;

    const readProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    let lastDraw = 0;

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      if (now - lastDraw < FRAME_MS) return;
      /* Scaled by how long this frame actually was, so the drift and the
         band travel at the same speed whatever rate the throttle settles
         at — otherwise a 30Hz draw on a busy page would halve the motion
         a 60Hz draw produces. */
      const step = Math.min((now - lastDraw) / 16.67, 4);
      lastDraw = now;
      t = now;
      /* Eased toward the real scroll position rather than snapped to it,
         so the band still has momentum when the page is flicked. */
      shown += (progress - shown) * 0.06 * step;
      draw();
    };

    const onResize = () => {
      build();
      readProgress();
      shown = progress;
    };
    const onScroll = () => readProgress();
    const onPointer = (e) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
    };
    const onPointerOut = () => {
      pointerX = -9999;
      pointerY = -9999;
    };
    const onVisibility = () => {
      visible = !document.hidden;
    };

    build();
    readProgress();
    shown = progress;
    raf = requestAnimationFrame(tick);

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (fine) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("pointerleave", onPointerOut);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      if (fine) {
        window.removeEventListener("pointermove", onPointer);
        document.removeEventListener("pointerleave", onPointerOut);
      }
      if (canvas.parentNode === host) host.removeChild(canvas);
    };
  }, []);

  return <div className="ax-thread" ref={hostRef} aria-hidden="true" />;
}
