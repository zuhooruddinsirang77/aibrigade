"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/components/motion/gsapLoader";

/**
 * A live feedforward neural network in the hero background — four layers of
 * nodes (4 → 6 → 6 → 3, the classic MLP taper toward an output layer), each
 * node densely wired to every node in the next layer, with small pulses of
 * light travelling left to right through the connections — a forward pass,
 * visibly running.
 *
 * This is the third shape in this spot. A flowing ribbon (borrowed from
 * cerebrium.ai's hero) read as decoration with no connection to what this
 * company does. A wireframe sphere fixed the "does this look deliberate"
 * problem but still only said "data," not "AI" — a globe is the shorthand
 * for distributed systems in general, not machine learning specifically.
 * A layered, fully-connected node diagram is the one visual almost anyone
 * recognizes on sight as a neural network, so this is the version that
 * actually answers "give it an AI feel": not a generic 3D object with AI
 * branding attached, but the literal textbook diagram, live and running.
 *
 * Pure atmosphere, not content: absolutely positioned, full-bleed inside
 * `#header`, behind everything (`z-index: -1`), `pointer-events: none`
 * throughout. Nothing here is load-bearing — if `three` never loads, the
 * hero looks exactly like it did before this existed.
 */
export default function HeroNetwork({
  className,
  dark = false,
  position = [3.6, 0.6, -2.4],
  scale = 1,
}) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || prefersReducedMotion()) return;

    let renderer, raf;
    let cancelled = false;
    let disposed = false;
    const disposeRef = { current: () => {} };

    import("three").then((THREE) => {
      if (cancelled || !host.isConnected) return;

      let width = host.clientWidth || 1;
      let height = host.clientHeight || 1;
      let visible = true;
      let pointerX = 0;
      let pointerY = 0;

      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      Object.assign(canvas.style, { display: "block", width: "100%", height: "100%" });

      let capable = true;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      } catch {
        capable = false;
      }
      if (!capable || !renderer) return;

      host.appendChild(canvas);

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(width, height, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      camera.position.set(0, 0, 9);

      const group = new THREE.Group();
      // Position/scale are per-instance: the hero places this in the open
      // field above/right of the phone gallery, `CtaDark` centres a larger
      // one behind its headline instead. A wireframe is mostly empty space
      // either way, so it never blocks the content in front of it.
      group.position.set(position[0], position[1], position[2]);
      group.scale.setScalar(scale);
      scene.add(group);

      // ---- build the network: four layers, left to right, each node
      // densely wired to every node in the next layer — a real MLP
      // topology, not an approximation of one.
      let seed = 11;
      const rand = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
      };

      const LAYER_SIZES = [4, 6, 6, 3];
      const LAYER_X = [-2.3, -0.85, 0.85, 2.3];
      const points = [];
      const layerOf = [];
      const nodesByLayer = LAYER_SIZES.map((count, layerIndex) => {
        const spacing = 4.6 / Math.max(count - 1, 1);
        const idxs = [];
        for (let i = 0; i < count; i++) {
          const y = count === 1 ? 0 : (i - (count - 1) / 2) * Math.min(spacing, 0.85);
          const z = (rand() - 0.5) * 0.5;
          points.push(new THREE.Vector3(LAYER_X[layerIndex], y, z));
          idxs.push(points.length - 1);
          layerOf.push(layerIndex);
        }
        return idxs;
      });

      const edges = [];
      for (let l = 0; l < nodesByLayer.length - 1; l++) {
        for (const a of nodesByLayer[l]) {
          for (const b of nodesByLayer[l + 1]) edges.push([a, b]);
        }
      }

      // Contrast has to run the opposite direction depending on what's
      // behind it: dark ink reads as an etched silhouette against the
      // hero's saturated violet fill, but the same dark ink would vanish
      // against `CtaDark`'s near-black background — there it needs to be
      // light violet catching what little light there is instead. Coral
      // pulses work against both, so they're the one constant.
      const colorIn = dark ? new THREE.Color(0xb794f4) : new THREE.Color(0x241536);
      const colorOut = dark ? new THREE.Color(0x4c2f7a) : new THREE.Color(0x0c0716);
      const linePositions = new Float32Array(edges.length * 6);
      const lineColors = new Float32Array(edges.length * 6);
      edges.forEach(([a, b], k) => {
        const pa = points[a];
        const pb = points[b];
        linePositions.set([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z], k * 6);
        const ca = colorIn.clone().lerp(colorOut, layerOf[a] / (LAYER_SIZES.length - 1));
        const cb = colorIn.clone().lerp(colorOut, layerOf[b] / (LAYER_SIZES.length - 1));
        lineColors.set([ca.r, ca.g, ca.b, cb.r, cb.g, cb.b], k * 6);
      });
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
      lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));
      const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: dark ? 0.55 : 0.65,
      });
      const wireframe = new THREE.LineSegments(lineGeometry, lineMaterial);
      group.add(wireframe);

      // The neurons themselves — every diagram of a neural network draws
      // the nodes as circles, not just the connecting lines between them,
      // and that's most of what makes it legible as "a network" rather
      // than an abstract mesh.
      const nodeGeometry = new THREE.SphereGeometry(0.075, 10, 10);
      const nodeMaterial = new THREE.MeshBasicMaterial({
        color: dark ? 0xd9c4fb : 0x2a1642,
        transparent: true,
        opacity: 0.95,
      });
      points.forEach((p) => {
        const m = new THREE.Mesh(nodeGeometry, nodeMaterial);
        m.position.copy(p);
        group.add(m);
      });

      // A dozen small bright pulses travelling sampled connections left to
      // right — a forward pass, visibly running. Coral (`#f87756`, this
      // codebase's one established non-violet accent — see the scroll-
      // progress gradient in motion.css) rather than another shade of
      // violet: it's the only colour in the palette that actually
      // contrasts against the hero's violet fill, so these are the one
      // thing in the whole network that pops instead of blending in.
      const PULSE_COUNT = 12;
      const pulseGeometry = new THREE.SphereGeometry(0.06, 8, 8);
      const pulseMaterial = new THREE.MeshBasicMaterial({ color: 0xf87756, transparent: true, opacity: 0.95 });
      const pulses = Array.from({ length: PULSE_COUNT }, () => {
        const [a, b] = edges[Math.floor(rand() * edges.length)];
        const m = new THREE.Mesh(pulseGeometry, pulseMaterial);
        m.userData = { a: points[a], b: points[b], speed: 0.5 + rand() * 0.35, phase: rand() };
        group.add(m);
        return m;
      });

      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
        },
        { threshold: 0.02 }
      );
      io.observe(host);

      const onVisibilityChange = () => {
        visible = visible && !document.hidden;
      };
      document.addEventListener("visibilitychange", onVisibilityChange);

      const onPointerMove = (e) => {
        const r = host.getBoundingClientRect();
        pointerX = ((e.clientX - r.left) / r.width - 0.5) * 2;
        pointerY = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      window.addEventListener("pointermove", onPointerMove);

      const onResize = () => {
        width = host.clientWidth || 1;
        height = host.clientHeight || 1;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };
      window.addEventListener("resize", onResize);

      const clock = new THREE.Clock();
      let elapsed = 0;
      const tmp = new THREE.Vector3();
      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visible || document.hidden) return;
        const dt = Math.min(clock.getDelta(), 0.05);
        elapsed += dt;

        // A diagram reads as a diagram only while it holds still enough to
        // look at — a full continuous spin (the sphere's old motion) would
        // tumble the layer order in and out of legibility. A slow sway
        // plus the mouse's own gentle tilt is enough to feel alive without
        // ever losing the left-to-right layer structure that makes this
        // recognizable as a network in the first place.
        group.rotation.y = Math.sin(elapsed * 0.15) * 0.12 + pointerX * 0.1;
        group.rotation.x += (pointerY * 0.12 - group.rotation.x) * 0.03;

        pulses.forEach((p) => {
          const { a, b, speed, phase } = p.userData;
          const t = (elapsed * speed + phase) % 1;
          p.position.copy(tmp.copy(a).lerp(b, t));
          p.material.opacity = 0.35 + Math.sin(t * Math.PI) * 0.6;
        });

        renderer.render(scene, camera);
      };
      tick();

      disposeRef.current = () => {
        disposed = true;
        cancelAnimationFrame(raf);
        io.disconnect();
        document.removeEventListener("visibilitychange", onVisibilityChange);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("resize", onResize);
        lineGeometry.dispose();
        lineMaterial.dispose();
        nodeGeometry.dispose();
        nodeMaterial.dispose();
        pulseGeometry.dispose();
        pulseMaterial.dispose();
        renderer.dispose();
        if (canvas.parentNode === host) host.removeChild(canvas);
      };
    });

    return () => {
      cancelled = true;
      if (!disposed) disposeRef.current();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={className}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, zIndex: -1, pointerEvents: "none", overflow: "hidden" }}
    />
  );
}
