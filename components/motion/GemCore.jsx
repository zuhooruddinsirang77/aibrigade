"use client";

import { useEffect, useRef } from "react";
import { canRunWebGL, renderScale, whenNear } from "@/components/motion/webglGuard";

/**
 * The brand's faceted crystal, as an object rather than a picture of one.
 *
 * `pisma_glass_1.webp` and the smaller gem beside the pipeline's closing claim
 * are pre-rendered stills of a 3D object — the same silhouette, lit once,
 * frozen at one angle. On a page where the case tiles now hold live
 * footage and the hero holds a live depth volume, a flat render of a
 * rotating object is the one element that visibly isn't participating.
 *
 * This is that object, actually turning. Same shape, same violet, same
 * glassy read; what it adds is that it catches light differently as it
 * moves, leans toward the pointer, and rolls with the scroll.
 *
 * The material deserves a note, because "faceted violet gem" is easy to
 * get wrong in two opposite directions. A `transmission`-based glass is
 * the physically correct answer and is useless here: transmission samples
 * what is behind the object, and behind this one is a transparent canvas,
 * so a correct glass renders as an almost-invisible smudge. A plain
 * metallic solid goes the other way — opaque, heavy, and nothing like the
 * brand's renders. What works is a *reflective* solve: a low-roughness
 * clearcoat over a violet base, lit by a small environment built out of
 * the site's own palette, so every facet reflects a different part of the
 * brand gradient as it turns. The reflections are the light; no
 * transparency is needed to read as glass.
 *
 * That environment is generated here rather than fetched — it is a 4-stop
 * vertical gradient on a 32px canvas, which costs nothing and means no
 * HDR asset ever has to be downloaded, hosted or colour-managed. Its four
 * stops ARE the palette: `--violet-300`, `--violet-500`, `--violet-700`,
 * `--coral`.
 *
 * Degrades to the still it replaces. The `<img>` renders first and is only
 * hidden once a canvas has actually mounted and drawn — under reduced
 * motion, no WebGL, Save-Data, a low-memory device, a driver failure, or
 * JS off entirely, what stays on screen is exactly the render that was
 * there before. Same rule as every other motion component in this
 * codebase; see `MotionProvider`'s `ax-nomotion` and the Deployments
 * empty state.
 *
 *   <GemCore className="cases_dec-5" src={...} alt="…" size={340} />
 */
export default function GemCore({
  className,
  /** The still this replaces. Stays put if WebGL never starts. */
  src,
  alt = "",
  /** Render resolution in CSS px. The CLASS controls the on-screen box —
   *  this only decides how many pixels are drawn into it. */
  size = 240,
  /** Facet count. 0 is a 20-sided crystal; 1 subdivides to 80. */
  detail = 0,
  /** Degrees of roll across one screen of scroll. 0 disables. */
  spin = 90,
}) {
  const hostRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !canRunWebGL()) return;

    let cancelled = false;
    let dispose = () => {};

    const start = () => import("three").then((THREE) => {
      if (cancelled || !host.isConnected) return;

      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      Object.assign(canvas.style, {
        display: "block",
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
      });

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        });
      } catch {
        return; // the still stays exactly as it is
      }

      host.appendChild(canvas);
      if (imgRef.current) imgRef.current.style.visibility = "hidden";

      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.set(0, 0, 6.2);

      /* Measured, not assumed. The two boxes this renders into are very
         different — a fixed 4.5rem square beside the closing claim, and a
         16.375rem-wide absolutely-positioned block on the Cases card whose
         height comes from the still's own aspect ratio. Rendering a square
         buffer into either and letting CSS stretch it to fit is what turns
         a cut stone into an egg. `size` is a resolution ceiling; the shape
         comes from the element. */
      const fit = () => {
        const w = host.clientWidth || size;
        const h = host.clientHeight || size;
        const scale = Math.min(1, size / Math.max(w, h));
        renderer.setPixelRatio(renderScale() * scale);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      fit();
      const ro = new ResizeObserver(fit);
      ro.observe(host);

      /* ---- the environment ------------------------------------------ */

      /* A 32×128 vertical ramp through the palette, wrapped as an
         equirectangular environment. Small on purpose: every facet only
         ever samples one direction from it, so resolution buys nothing and
         the blur between stops is what makes the reflections read as a lit
         room rather than as four coloured bands. */
      const env = document.createElement("canvas");
      env.width = 32;
      env.height = 128;
      const g = env.getContext("2d");
      const ramp = g.createLinearGradient(0, 0, 0, 128);
      ramp.addColorStop(0.0, "#c79bf5"); // --violet-300, the sky
      ramp.addColorStop(0.42, "#9248e4"); // --violet-500, the brand
      ramp.addColorStop(0.72, "#3f166e"); // --violet-700, the shadow side
      ramp.addColorStop(1.0, "#f87756"); // --coral, one warm bounce
      g.fillStyle = ramp;
      g.fillRect(0, 0, 32, 128);

      const envTexture = new THREE.CanvasTexture(env);
      envTexture.mapping = THREE.EquirectangularReflectionMapping;
      envTexture.colorSpace = THREE.SRGBColorSpace;
      scene.environment = envTexture;

      /* ---- the object ------------------------------------------------ */

      const geometry = new THREE.IcosahedronGeometry(1.7, detail);
      const material = new THREE.MeshPhysicalMaterial({
        color: 0x9248e4, // --violet-500
        metalness: 0.15,
        roughness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        reflectivity: 1,
        envMapIntensity: 1.5,
        /* Per-face normals. A smooth-shaded icosahedron reads as a lumpy
           ball; flat shading is what makes it a cut stone, and it is the
           single property that ties this to the brand's own renders. */
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geometry, material);

      /* Parent group, so the scroll roll below can never accumulate onto
         the pointer tilt written to the mesh — two writers on one Euler is
         how a spin like this ends up drifting off-axis over time. */
      const group = new THREE.Group();
      group.add(mesh);
      scene.add(group);

      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(3, 4, 5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xf87756, 1.1); // --coral
      rim.position.set(-4, -1.5, -3);
      scene.add(rim);
      scene.add(new THREE.AmbientLight(0x3f166e, 0.9)); // --violet-700

      /* ---- motion ---------------------------------------------------- */

      let visible = false;
      let pointerX = 0;
      let pointerY = 0;
      let tiltX = 0;
      let tiltY = 0;
      let raf = 0;
      let last = performance.now();

      /* The host's box, for the scroll roll. Taken from events rather than
         read in `tick`: the tick is a rAF callback that runs after GSAP has
         written the frame's tween styles, so a `getBoundingClientRect`
         there forced a style and layout pass mid-frame, every frame the gem
         was on screen. A scroll event arrives before any of that, and the
         observer hands over the box it has already measured. */
      let box = null;
      let vh = window.innerHeight;
      const measure = () => {
        if (!visible) return;
        box = host.getBoundingClientRect();
        vh = window.innerHeight;
      };

      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          box = entry.boundingClientRect;
        },
        { threshold: 0 }
      );
      io.observe(host);
      window.addEventListener("scroll", measure, { passive: true });
      window.addEventListener("resize", measure, { passive: true });

      const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const onPointerMove = (e) => {
        pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
        pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      if (fine) window.addEventListener("pointermove", onPointerMove, { passive: true });

      const tick = () => {
        raf = requestAnimationFrame(tick);
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        if (!visible || document.hidden) return;

        /* Constant slow turn, so the object is alive even for a reader who
           never moves the pointer and never scrolls past it. */
        mesh.rotation.y += dt * 0.32;

        /* The pointer lean, eased rather than tracked: a crystal that
           snapped to the cursor would read as a UI widget. */
        tiltX += (pointerY * 0.34 - tiltX) * Math.min(1, dt * 3);
        tiltY += (pointerX * 0.3 - tiltY) * Math.min(1, dt * 3);
        mesh.rotation.x = tiltX;
        mesh.rotation.z = tiltY;

        if (spin && box) {
          const span = box.height + vh;
          const p = span > 0 ? 1 - box.bottom / span : 0;
          group.rotation.x = (p - 0.5) * (spin * Math.PI) / 180;
        }

        renderer.render(scene, camera);
      };
      tick();

      dispose = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("scroll", measure);
        window.removeEventListener("resize", measure);
        if (fine) window.removeEventListener("pointermove", onPointerMove);
        geometry.dispose();
        material.dispose();
        envTexture.dispose();
        renderer.dispose();
        /* Hand the GPU context back now rather than at collection time —
           see the context-cap note in `webglGuard`. */
        renderer.forceContextLoss?.();
        if (canvas.parentNode === host) host.removeChild(canvas);
        if (imgRef.current) imgRef.current.style.visibility = "";
      };
    });

    /* Not at mount: both gems are far below the fold. See `whenNear`. */
    const cancelWait = whenNear(host, start);

    return () => {
      cancelled = true;
      cancelWait();
      dispose();
    };
  }, [size, detail, spin]);

  return (
    /* The caller's className goes on the OUTER element untouched — on the
       Cases card that is `.cases_dec-5`, a Webflow class that positions
       this absolutely, and in Pipeline it is `.ax-pipe__closer-img`. An
       inline `position` on that node would silently beat the stylesheet
       rule and move the gem across its card, so the canvas gets its own
       unclassed, relatively-positioned box one level down instead — the
       same two-element shape `Parallax` uses and for the same reason. */
    <div className={className}>
      <div ref={hostRef} style={{ position: "relative", width: "100%", height: "100%" }}>
        {/* `height: 100%` resolves to the still's own intrinsic height
            wherever the outer box is auto-height (the Cases card) and to
            the box wherever it is fixed (the pipeline closer) — so one
            declaration covers both, and `contain` keeps the render
            letterboxed rather than stretched in the second case. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          /* Both callers size this box themselves, so a late load moves
             nothing — and without `lazy` React preloads it from the head,
             ahead of the stylesheets. */
          loading="lazy"
          style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    </div>
  );
}
