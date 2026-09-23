import { STAGES } from "@/components/demos/demos.data";

/**
 * The five capabilities in order, with the ones a module evidences lit.
 *
 * The rail between nodes is lit from the first lit stage to the last, so a
 * module that listens and then acts reads as one span across the stack
 * rather than three disconnected dots. Printed as a list so a screen
 * reader hears which stages are in use, not five bare words.
 */
export default function StageStrip({ stages, tone = "light", className = "" }) {
  const on = new Set(stages);
  const idx = STAGES.map((s, i) => (on.has(s.id) ? i : -1)).filter((i) => i >= 0);
  const first = idx.length ? Math.min(...idx) : 0;
  const last = idx.length ? Math.max(...idx) : 0;
  const step = 100 / (STAGES.length - 1);

  return (
    <div
      className={`ax-stages ax-stages--${tone} ${className}`}
      style={{ "--from": `${first * step}%`, "--to": `${(STAGES.length - 1 - last) * step}%` }}
    >
      <span className="ax-stages__rail" aria-hidden="true">
        <i />
      </span>
      <ol className="ax-stages__list">
        {STAGES.map((s) => (
          <li key={s.id} data-on={on.has(s.id) ? "true" : undefined}>
            <span className="ax-stages__node" aria-hidden="true" />
            <span className="ax-stages__label">
              {s.label}
              <span className="ax-lab-sr">{on.has(s.id) ? " — used" : ""}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
