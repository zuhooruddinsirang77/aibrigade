"use client";

import { useEffect, useRef } from "react";
import { canRunWebGL, renderScale } from "@/components/motion/webglGuard";

/**
 * A volume of light suspended in front of a film — the depth layer.
 *
 * Every background clip on this page is flat by definition: it is a
 * rectangle of pixels, so it cannot respond to where the reader's pointer
 * is or how far down the page they have scrolled. That is the thing a
 * viewer registers as "a video is playing behind this" rather than "I am
 * looking into something." This puts a few hundred out-of-focus motes in
 * a real perspective volume between the camera and that rectangle, and
 * then moves the camera: near motes sweep across the frame, far ones
 * barely shift, and the flat plate behind them stops reading as flat.
 *
 * It is parallax with actual geometry rather than a stack of divs on
 * different `translateZ` values, and the difference is specifically that
 * the relationship between layers is continuous — there are no bands.
 *
 * Deliberately NOT a second neural network. `HeroNetwork` already draws
 * the literal MLP diagram and owns that motif (see its own note on why it
 * is the third shape to occupy that role); a page that answered every
 * surface with the same node graph would be repeating itself. This is
 * atmosphere in a different register: depth, not diagram.
 *
 * Palette is the site's, unchanged — `--violet-500`, `--violet-300` and a
 * minority of `--coral`, exactly the three stops the headline gradient and
 * the film grade already use. Blending is additive, so it can only add
 * light: over a dark band it reads as motes catching a lamp, and it can
 * never darken or tint the footage underneath.
 *
 *   <DepthField intensity={0.9} dolly={7} />
 *
 * Decorative throughout: `aria-hidden`, `pointer-events: none`, no focus
 * stop, and nothing underneath it depends on it having rendered. If WebGL
 * is unavailable or refused (see `webglGuard`), the section is exactly
 * what it was before this existed.
 */
export default function DepthField({
  className = "",
  /** Overall brightness multiplier. Tune per surface, not per mote. */
  intensity = 1,
  /** How far the field travels through the camera across one screen of
   *  scroll, in world units. 0 disables the scroll response. */
  dolly = 6,
  /** Pointer parallax amplitude, in world units of camera travel. */
  sway = 1.1,
  /** Mote count at desktop width. Halved below 700px. */
  density = 280,
  /** `data-depth` and friends, for when this sits inside a `StageDepth`. */
  ...rest
}) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !canRunWebGL()) return;

    let cancelled = false;
    let dispose = () => {};

    import("three").then((THREE) => {
      if (cancelled || !host.isConnected) return;

      const narrow = window.innerWidth < 700;
      const COUNT = Math.round(narrow ? density * 0.5 : density);
      /* Depth of the slab the motes occupy. The camera sits at z = 0 and
         the field is recycled through it, so this is also the distance a
         mote travels before it wraps. */
      const DEPTH = 26;

      let width = host.clientWidth || 1;
      let height = host.clientHeight || 1;

      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      Object.assign(canvas.style, {
        display: "block",
        width: "100%",
        height: "100%",
      });

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: false, // points are soft-edged in the shader already
          powerPreference: "low-power",
        });
      } catch {
        return; // guard said yes, driver said no — leave the surface alone
      }
      host.appendChild(canvas);

      renderer.setPixelRatio(renderScale());
      renderer.setSize(width, height, false);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 80);
      camera.position.set(0, 0, 0);

      /* ---- the field ------------------------------------------------- */

      const positions = new Float32Array(COUNT * 3);
      const colors = new Float32Array(COUNT * 3);
      const scales = new Float32Array(COUNT);
      const phases = new Float32Array(COUNT);
      const drifts = new Float32Array(COUNT * 2);

      /* The three stops already in the theme. Coral is a deliberate
         minority — it is the accent in `--grad-brand`, and at parity with
         the violets it would stop reading as an accent. */
      const palette = [
        new THREE.Color(0x9248e4), // --violet-500
        new THREE.Color(0xc79bf5), // --violet-300
        new THREE.Color(0x9248e4),
        new THREE.Color(0xf87756), // --coral
      ];

      /* Spread is widened with depth so the field fills the frustum rather
         than tapering to a point at the far plane — without this the motes
         visibly converge on the vanishing point and the volume reads as a
         cone. */
      for (let i = 0; i < COUNT; i++) {
        const z = -Math.random() * DEPTH;
        const spread = 4 + Math.abs(z) * 0.62;
        positions[i * 3] = (Math.random() - 0.5) * spread * 2;
        positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 1.4;
        positions[i * 3 + 2] = z;

        const c = palette[(Math.random() * palette.length) | 0];
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;

        /* A few large motes near the camera do most of the work of selling
           depth; the long tail of small ones is the haze behind them. */
        scales[i] = 0.5 + Math.pow(Math.random(), 2.4) * 3.2;
        phases[i] = Math.random() * Math.PI * 2;
        drifts[i * 2] = (Math.random() - 0.5) * 0.06;
        drifts[i * 2 + 1] = (Math.random() - 0.5) * 0.045;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
      geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

      const material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        /* Additive is the whole reason this can sit over licensed footage
           without a per-clip grade: it adds light and never removes any,
           so the film underneath is never darkened, tinted or hidden. */
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: intensity },
          uPixelRatio: { value: renderer.getPixelRatio() },
          uDepth: { value: DEPTH },
        },
        vertexShader: /* glsl */ `
          attribute float aScale;
          attribute float aPhase;
          uniform float uTime;
          uniform float uPixelRatio;
          uniform float uDepth;
          varying vec3 vColor;
          varying float vAlpha;

          void main() {
            vColor = color;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);

            // Distance from the camera, 0 at the lens, 1 at the far edge
            // of the slab.
            float depth = clamp(-mv.z / uDepth, 0.0, 1.0);

            // Fade at BOTH ends: far motes dissolve into the haze, and near
            // ones fade as they pass the lens so a mote never pops out of
            // existence at the moment it would be largest on screen.
            float far  = 1.0 - smoothstep(0.55, 1.0, depth);
            float near = smoothstep(0.0, 0.10, depth);
            float twinkle = 0.72 + 0.28 * sin(uTime * 0.9 + aPhase);

            vAlpha = far * near * twinkle;

            gl_Position = projectionMatrix * mv;
            // Perspective size attenuation — the "/ -mv.z" is what makes a
            // near mote genuinely bigger rather than uniformly scaled.
            gl_PointSize = aScale * 26.0 * uPixelRatio / max(-mv.z, 0.6);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uIntensity;
          varying vec3 vColor;
          varying float vAlpha;

          void main() {
            // Soft round falloff. Squaring the ramp gives a small bright
            // core inside a wide halo, which is what an out-of-focus
            // point of light actually looks like — a linear ramp reads as
            // a flat disc.
            float d = length(gl_PointCoord - 0.5);
            float mask = 1.0 - smoothstep(0.0, 0.5, d);
            mask *= mask;
            gl_FragColor = vec4(vColor, mask * vAlpha * uIntensity);
          }
        `,
      });
      /* Required for the `color` attribute to reach the shader as the
         built-in varying rather than being ignored. */
      material.vertexColors = true;

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      /* ---- motion ---------------------------------------------------- */

      let visible = false;
      let pointerX = 0;
      let pointerY = 0;
      let camX = 0;
      let camY = 0;
      let scrollN = 0; // 0..1, this element's progress through the viewport
      let dollyZ = 0;
      let raf = 0;
      let last = performance.now();

      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
        },
        { threshold: 0 }
      );
      io.observe(host);

      const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const onPointerMove = (e) => {
        pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
        pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      if (fine) window.addEventListener("pointermove", onPointerMove, { passive: true });

      /* Read rather than subscribe: this runs inside the rAF loop that is
         already pumping, so a separate throttled scroll listener would be
         a second source of truth for the same number. `getBoundingClientRect`
         is cheap as long as nothing writes to layout in the same frame,
         and nothing here does. */
      const readScroll = () => {
        const r = host.getBoundingClientRect();
        const span = r.height + window.innerHeight;
        scrollN = span > 0 ? 1 - (r.bottom / span) : 0;
      };

      const onResize = () => {
        width = host.clientWidth || 1;
        height = host.clientHeight || 1;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(renderScale());
        renderer.setSize(width, height, false);
        material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
      };
      const ro = new ResizeObserver(onResize);
      ro.observe(host);

      const tick = () => {
        raf = requestAnimationFrame(tick);
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        if (!visible || document.hidden) return;

        readScroll();
        material.uniforms.uTime.value += dt;

        /* Lateral drift, wrapped. Each mote has its own velocity so the
           field never reads as one sheet sliding. */
        const pos = geometry.attributes.position.array;
        for (let i = 0; i < COUNT; i++) {
          const ix = i * 3;
          const spread = 4 + Math.abs(pos[ix + 2]) * 0.62;
          pos[ix] += drifts[i * 2] * dt * 10;
          pos[ix + 1] += drifts[i * 2 + 1] * dt * 10;
          if (pos[ix] > spread) pos[ix] = -spread;
          else if (pos[ix] < -spread) pos[ix] = spread;
          if (pos[ix + 1] > spread * 0.7) pos[ix + 1] = -spread * 0.7;
          else if (pos[ix + 1] < -spread * 0.7) pos[ix + 1] = spread * 0.7;
        }
        geometry.attributes.position.needsUpdate = true;

        /* Scroll dollies the FIELD rather than the camera, so the pointer
           sway below stays an independent signal on the camera and the two
           can never cancel each other out. */
        const wantZ = dolly * (scrollN - 0.5) * 2;
        dollyZ += (wantZ - dollyZ) * Math.min(1, dt * 3.5);
        points.position.z = dollyZ;

        camX += (pointerX * sway - camX) * Math.min(1, dt * 2.2);
        camY += (-pointerY * sway * 0.6 - camY) * Math.min(1, dt * 2.2);
        camera.position.x = camX;
        camera.position.y = camY;
        /* Aiming into the slab rather than straight ahead is what turns
           camera translation into rotation-free parallax: near motes swing
           opposite to far ones instead of the whole field sliding. */
        camera.lookAt(camX * 0.35, camY * 0.35, -DEPTH * 0.45);

        renderer.render(scene, camera);
      };
      tick();

      dispose = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        if (fine) window.removeEventListener("pointermove", onPointerMove);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        /* Release the GPU context immediately instead of waiting for the
           canvas to be collected — see the context-cap note in
           `webglGuard`. */
        renderer.forceContextLoss?.();
        if (canvas.parentNode === host) host.removeChild(canvas);
      };
    });

    return () => {
      cancelled = true;
      dispose();
    };
  }, [intensity, dolly, sway, density]);

  return (
    <div
      ref={hostRef}
      className={`ax-depth ${className}`.trim()}
      aria-hidden="true"
      {...rest}
    />
  );
}
