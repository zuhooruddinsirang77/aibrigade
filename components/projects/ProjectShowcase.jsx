"use client";

import { useEffect, useRef } from "react";
import { projects, findProject } from "@/components/projects.data";
import { loadGsap, prefersReducedMotion } from "@/components/motion/gsapLoader";
import Reveal from "@/components/motion/Reveal";
import MaskHeading from "@/components/motion/MaskHeading";
import Kicker from "@/components/motion/Kicker";
import AmbientVideo from "@/components/motion/AmbientVideo";
import Curtain from "@/components/motion/Curtain";
import ProjectCard from "@/components/projects/ProjectCard";

/**
 * "The work, playing" — the project showcase.
 *
 * This replaces the screening-room console that stood here with placeholder
 * clients and library footage. The section now shows the studio's own
 * products, from the demo files in /public/projecs, organised by PROJECT:
 * one card per product, one stage per card, the language cuts as a
 * switcher under it and any document as a resource after that. Nothing on
 * screen is a filename.
 *
 * The band itself — dark ink, engineering grid, violet scroll wash, the
 * ambient fibre clip, the two-column head — is unchanged. It is the same
 * `.ax-reels` section the rest of the stylesheets already position
 * against, with the same `#reels` id the hero and the nav scroll to; only
 * what stands in the room is new.
 *
 * Composition: the featured project opens at full width, stage beside its
 * brief. The rest sit in a six-column grid where a landscape product takes
 * half the row and a portrait one a third — so a phone app is never
 * stretched across a wide card, and two web apps share a row at the size
 * their footage was made for.
 */
export default function ProjectShowcase() {
  const sectionRef = useRef(null);

  const featured = projects.find((p) => p.featured) || projects[0];
  const rest = projects.filter((p) => p !== featured);

  /* The violet wash behind the band tracks scroll position — the one piece
     of choreography carried over from the previous version of this room. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReducedMotion()) return;
    let ctx;
    let cancelled = false;
    loadGsap().then((mod) => {
      if (!mod || cancelled) return;
      const { gsap } = mod;
      ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { "--ax-sweep-y": "4%", "--ax-sweep-x": "34%" },
          {
            "--ax-sweep-y": "88%",
            "--ax-sweep-x": "66%",
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.9 },
          }
        );
      }, el);
    });
    return () => {
      cancelled = true;
      ctx && ctx.revert();
    };
  }, []);

  /* The hero's evidence row asks for a project by id (`ProofStrip` fires
     `ax:select-reel`). Land on that card rather than merely on the section. */
  useEffect(() => {
    const onSelect = (e) => {
      const p = findProject(e.detail?.id);
      const el = p && document.getElementById(`project-${p.id}`);
      if (!el) return;
      el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
      el.focus({ preventScroll: true });
    };
    window.addEventListener("ax:select-reel", onSelect);
    return () => window.removeEventListener("ax:select-reel", onSelect);
  }, []);

  return (
    <Curtain as="section" id="reels" className="ax-reels ax-sweep ax-proj" hostRef={sectionRef}>
      <AmbientVideo film="stream" className="ax-reels__film" />
      <div className="padding-global">
        <div className="container-large">
          <div className="ax-reels__head">
            <Kicker id="reels" label="Projects" tone="invert" />
            <h2 className="ax-reels__title">
              <MaskHeading text={"The work,\nplaying"} />
            </h2>
            <Reveal variant="rise" className="ax-reels__intro">
              <p>
                Real products, in the languages they ship in. Pick a project,
                choose a language, and watch it run.
              </p>
            </Reveal>
          </div>

          <Reveal variant="rise" className="ax-proj__featured">
            <ProjectCard project={featured} index={0} variant="featured" />
          </Reveal>

          {rest.length > 0 && (
            <>
              <p className="ax-proj__divider" aria-hidden="true">
                More projects
                <span>{String(rest.length).padStart(2, "0")}</span>
              </p>
              <Reveal variant="stagger" selector=".ax-proj__card" className="ax-proj__grid">
                {rest.map((p, i) => (
                  <ProjectCard key={p.id} project={p} index={i + 1} variant="card" />
                ))}
              </Reveal>
            </>
          )}
        </div>
      </div>
    </Curtain>
  );
}
