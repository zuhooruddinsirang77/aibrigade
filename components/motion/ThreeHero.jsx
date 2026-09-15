"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * A live WebGL gem, replacing the static `figure_1.webp` render in the hero
 * with an object that actually turns, catches light, and answers the
 * pointer — same silhouette the brand's flat 3D renders already use, but
 * real instead of a picture of it.
 *
 * Renders the original `<img>` underneath and only hides it once a WebGL
 * canvas has actually mounted and started rendering — under reduced motion,
 * no WebGL, a slow connection before `three` finishes loading, or JS off
 * entirely, the flat render stays exactly what's on screen instead of an
 * empty box. Every motion component in this codebase degrades this way
 * (see `MotionProvider`'s `ax-nomotion`, `Deployments`'s reel empty state);
 * this is the same rule applied to a live 3D object.
 *
 * Three.js loads dynamically (`import("three")`), the same reasoning as
 * `gsapLoader`: no reason to ship it in the initial bundle for a decoration
 * that does nothing under reduced motion and isn't load-bearing content.
 *
 * Motion, layered on one mesh + its parent group so nothing fights:
 *   - constant slow spin on the mesh's own Y axis
 *   - a gentle tilt (mesh X/Z) that eases toward wherever the pointer is in
 *     the viewport
 *   - a full 360° flip on click/tap, tweened by hand on the *parent group's*
 *     X rotation (never the mesh's own) so it can't collide with or
 *     accumulate onto the tilt — it always animates 0→2π and resets to 0
 *
 * Pauses rendering (keeps the rAF loop alive so it resumes instantly, just
 * skips the draw call) when the tab is hidden or the canvas scrolls out of
 * view.
 *
 *   <ThreeHero width={150} height={150} fallbackSrc={...} fallbackAlt="…" />
 */
export default function ThreeHero({ width = 150, height = 150, className, fallbackSrc, fallbackAlt = "" }) {
  // `outerRef` carries the caller's className untouched — on the hero
  // decorations that's `.header_dec-2`, a Webflow class that positions the
  // element with `position: absolute` (see `Parallax`'s own doc comment).
  // Setting an inline `position` on that same node would silently override
  // the stylesheet rule and break its placement. `innerRef` is a plain,
  // unclassed div that exists only to give the canvas an `absolute`
  // positioning context of its own, one level down, without touching the
  // outer element's position at all.
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const host = innerRef.current;
    if (!host || prefersReducedMotion()) return;

    let renderer, raf;
    let cancelled = false;
    let disposed = false;
    const disposeRef = { current: () => {} };

    import("three").then((THREE) => {
      if (cancelled || !host.isConnected) return;

      let visible = true;
      let pointerX = 0;
      let pointerY = 0;
      let flipping = false;
      let flipStart = 0;

      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      Object.assign(canvas.style, {
        display: "block",
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        cursor: "pointer",
      });

      let capable = true;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      } catch {
        capable = false;
      }
      if (!capable || !renderer) return; // fallback <img> stays exactly as it was

      host.appendChild(canvas);
      if (imgRef.current) imgRef.current.style.visibility = "hidden";

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
      camera.position.set(0, 0, 6);

      const group = new THREE.Group();
      scene.add(group);

      const geometry = new THREE.IcosahedronGeometry(1.65, 0);
      const material = new THREE.MeshPhysicalMaterial({
        color: 0x9248e4,
        metalness: 0.35,
        roughness: 0.25,
        clearcoat: 0.85,
        clearcoatRoughness: 0.15,
        reflectivity: 0.6,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);

      const key = new THREE.DirectionalLight(0xffffff, 2.4);
      key.position.set(3, 4, 5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xd6b8ff, 1.6);
      rim.position.set(-4, -2, -3);
      scene.add(rim);
      scene.add(new THREE.AmbientLight(0x3f166e, 1.1));

      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
        },
        { threshold: 0.05 }
      );
      io.observe(host);

      const onVisibilityChange = () => {
        visible = visible && !document.hidden;
      };
      document.addEventListener("visibilitychange", onVisibilityChange);

      const onPointerMove = (e) => {
        pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
        pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("pointermove", onPointerMove);

      const onActivate = () => {
        if (flipping) return;
        flipping = true;
        flipStart = performance.now();
      };
      canvas.addEventListener("pointerdown", onActivate);

      const clock = new THREE.Clock();
      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visible || document.hidden) return;
        const dt = Math.min(clock.getDelta(), 0.05);

        mesh.rotation.y += dt * 0.35;
        mesh.rotation.x += (pointerY * 0.45 - mesh.rotation.x) * 0.05;
        mesh.rotation.z += (pointerX * 0.25 - mesh.rotation.z) * 0.05;

        if (flipping) {
          const t = Math.min(1, (performance.now() - flipStart) / 900);
          const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
          group.rotation.x = eased * Math.PI * 2;
          if (t >= 1) {
            flipping = false;
            group.rotation.x = 0;
          }
        }

        renderer.render(scene, camera);
      };
      tick();

      disposeRef.current = () => {
        disposed = true;
        cancelAnimationFrame(raf);
        io.disconnect();
        document.removeEventListener("visibilitychange", onVisibilityChange);
        window.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerdown", onActivate);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        if (canvas.parentNode === host) host.removeChild(canvas);
        if (imgRef.current) imgRef.current.style.visibility = "";
      };
    });

    return () => {
      cancelled = true;
      if (!disposed) disposeRef.current();
    };
  }, [width, height]);

  return (
    // No inline width/height here — the Webflow class controls the real box
    // size (and it may differ by breakpoint), same as the plain `<img
    // width="150">` this replaces: the HTML `width` attribute below is only
    // an intrinsic-size hint, easily beaten by any CSS rule on the class.
    // `width`/`height` props feed the WebGL render resolution instead; the
    // canvas fills whatever box the class actually produces via 100%/100%.
    <div ref={outerRef} className={className}>
      <div ref={innerRef} style={{ position: "relative", width: "100%", height: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={fallbackSrc}
          alt={fallbackAlt}
          width={width}
          style={{ display: "block", width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
