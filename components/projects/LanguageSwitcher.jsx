"use client";

import { LANGUAGES } from "@/components/projects.data";

/**
 * "Watch demo in" — one button per language the project actually ships.
 *
 * The buttons come from the project's own `videos` keys, so a two-language
 * project shows two buttons and a three-language project three; there is
 * never a disabled placeholder for a cut that doesn't exist.
 *
 * Arabic and Urdu labels are set in their own script and direction inside
 * an otherwise LTR row. `aria-label` carries the English name so a screen
 * reader announces "Arabic" rather than attempting the glyphs in the
 * page's voice; `aria-pressed` is the selected state.
 */
export default function LanguageSwitcher({
  codes,
  active,
  onChange,
  /** Used in the group's accessible name: "Watch Fitzy demo in". */
  projectName,
  size = "md",
}) {
  if (!codes || codes.length < 2) return null;

  return (
    <div className={`ax-proj__langs ax-proj__langs--${size}`}>
      <span className="ax-proj__langs-label" id={`langs-${projectName}-label`}>
        Watch demo in
      </span>
      <div
        className="ax-proj__langs-row"
        role="group"
        aria-label={`Watch ${projectName} demo in`}
      >
        {codes.map((code) => {
          const l = LANGUAGES[code] || { label: code, english: code, dir: "ltr" };
          const on = code === active;
          return (
            <button
              key={code}
              type="button"
              className="ax-proj__lang"
              aria-pressed={on}
              aria-label={l.english}
              title={l.english}
              onClick={() => !on && onChange(code)}
            >
              <span lang={l.code || code} dir={l.dir}>
                {l.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
