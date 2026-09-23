"use client";

import { useCallback, useRef, useState } from "react";
import {
  LANGUAGES,
  defaultLanguage,
  formatDuration,
  languageCodes,
  projectOrientation,
} from "@/components/projects.data";
import ProjectMedia from "@/components/projects/ProjectMedia";
import LanguageSwitcher from "@/components/projects/LanguageSwitcher";
import ProjectResources from "@/components/projects/ProjectResources";
import { usePopup } from "@/components/PopupContext";

/**
 * One project. The product is the unit: its name and what it is, the demo
 * playing on one stage, the languages that demo exists in, and any
 * document that goes with it — in that order, always.
 *
 * `variant="featured"` lays the stage beside the copy at full width;
 * `variant="card"` stacks them for the grid. Both are this one component:
 * the same project data renders in either slot.
 *
 * A project with no video at all (documents only) gets a document
 * presentation instead of an empty player — see `DocumentOnly` below.
 */
export default function ProjectCard({ project, index, variant = "card" }) {
  const { startTransition } = usePopup();
  const codes = languageCodes(project);
  const [code, setCode] = useState(() => defaultLanguage(project));
  /* A language change while the demo is running should keep running in
     the new language. The stage can't see the old element (it's gone by
     the time the new one mounts), so the card remembers whether playback
     was underway and hands the new stage a token telling it to start. */
  const wasPlaying = useRef(false);
  const [resumeToken, setResumeToken] = useState(0);

  const video = code ? project.videos[code] : null;
  const layout = projectOrientation(project);
  const n = String(index + 1).padStart(2, "0");
  const titleId = `project-${project.id}-title`;

  const changeLanguage = useCallback(
    (next) => {
      const el = document.getElementById(`project-${project.id}`);
      const v = el?.querySelector("video");
      wasPlaying.current = Boolean(v && !v.paused && !v.ended);
      setCode(next);
      setResumeToken(wasPlaying.current ? Date.now() : 0);
    },
    [project.id]
  );

  const meta = [];
  if (codes.length > 1) meta.push(`${codes.length} languages`);
  else if (codes.length === 1) meta.push(LANGUAGES[codes[0]]?.english || codes[0]);
  if (video?.duration) meta.push(formatDuration(video.duration));

  return (
    <article
      id={`project-${project.id}`}
      className={`ax-proj__card ax-proj__card--${variant}`}
      data-layout={layout}
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <header className="ax-proj__head">
        <p className="ax-proj__eyebrow">
          <span className="ax-proj__n" aria-hidden="true">
            {n}
          </span>
          {variant === "featured" && <span className="ax-proj__flag">Featured project</span>}
          <span className="ax-proj__type">{project.type}</span>
        </p>
        <h3 className="ax-proj__name" id={titleId}>
          {project.name}
        </h3>
        {project.tagline && <p className="ax-proj__tagline">{project.tagline}</p>}
        {project.description && (
          <p className={`ax-proj__desc${variant === "card" ? " ax-proj__desc--card" : ""}`}>
            {project.description}
          </p>
        )}
      </header>

      <div className="ax-proj__media">
        {video ? (
          <ProjectMedia
            video={video}
            code={code}
            projectName={project.name}
            variant={variant}
            resumeToken={resumeToken}
          />
        ) : (
          <DocumentOnly project={project} />
        )}
      </div>

      <footer className="ax-proj__foot">
        {video && (
          <LanguageSwitcher
            codes={codes}
            active={code}
            onChange={changeLanguage}
            projectName={project.name}
            size={variant === "featured" ? "lg" : "md"}
          />
        )}
        {video && <ProjectResources resources={project.resources} projectName={project.name} />}
        {meta.length > 0 && (
          <p className="ax-proj__meta" aria-hidden="true">
            {meta.join(" · ")}
          </p>
        )}
        {/* Every product has its own page — the chain it runs, what it
            brings, the demo again at full size. */}
        <a
          href={`/use-cases/${project.id}`}
          className="ax-proj__more"
          onClick={(e) => {
            e.preventDefault();
            startTransition(`/use-cases/${project.id}`);
          }}
        >
          Explore the use case
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M5 12h13M13 6l6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </footer>
    </article>
  );
}

/** A project that exists only as a document. No fake player — the
 *  document itself is the artefact, and it says so. */
function DocumentOnly({ project }) {
  return (
    <div className="ax-proj__doc">
      <svg viewBox="0 0 48 48" aria-hidden="true" className="ax-proj__doc-icon">
        <path d="M13 6h15l9 9v27H13z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M28 6v9h9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M19 24h12M19 30h12M19 36h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <p className="ax-proj__doc-line">Documentation only — no demo video for this project yet.</p>
      <ProjectResources resources={project.resources} projectName={project.name} heading={false} />
    </div>
  );
}
