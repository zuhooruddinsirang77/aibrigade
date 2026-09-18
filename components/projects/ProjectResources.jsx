/**
 * Documents attached to a project — an overview PDF, a spec — listed after
 * the demo, quietly. A resource is never presented as a video: it is a
 * link, it opens in a new tab, and it says what it is.
 */
export default function ProjectResources({ resources, projectName, heading = true }) {
  if (!resources || !resources.length) return null;

  return (
    <div className="ax-proj__resources">
      {heading && <span className="ax-proj__resources-label">Additional resources</span>}
      <ul className="ax-proj__resources-list">
        {resources.map((r) => (
          <li key={r.src}>
            <a
              className="ax-proj__res"
              href={r.src}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${projectName} — ${r.label} (${(r.type || "file").toUpperCase()}, opens in a new tab)`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="ax-proj__res-icon">
                <path
                  d="M7 3.5h6.5L18 8v12.5H7z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path d="M13.5 3.5V8H18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9.5 12.5h6M9.5 15.5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span className="ax-proj__res-label">{r.label}</span>
              <span className="ax-proj__res-type" aria-hidden="true">
                {(r.type || "file").toUpperCase()}
              </span>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="ax-proj__res-arrow">
                <path
                  d="M7 17L17 7M9 7h8v8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
