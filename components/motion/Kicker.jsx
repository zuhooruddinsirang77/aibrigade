import { CHAPTERS } from "@/components/motion/chapters";

/**
 * The chapter label that opens a section.
 *
 * StoryRail has always known this page is a sequence of chapters, but only
 * the floating pill at the bottom of the window ever said so — the
 * sections themselves read as an unordered stack of panels. This puts the
 * same numbering in the page.
 *
 * The number is looked up from `CHAPTERS` by section id rather than typed
 * in, so the page and the rail can never disagree about what chapter four
 * is — inserting a section into the rail renumbers every kicker after it
 * automatically.
 *
 * `label` is the section's own descriptor and is deliberately NOT the
 * chapter name: the rail says "Evidence", the section heading says
 * "Prominent Cases", and printing both in the same spot would just be the
 * same phrase twice.
 */
export default function Kicker({ id, label, tone }) {
  const index = CHAPTERS.findIndex((c) => c.id === id);
  if (index < 0) return null;

  const cls = ["ax-kicker", tone ? `ax-kicker--${tone}` : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <p className={cls}>
      <span>{String(index + 1).padStart(2, "0")}</span>
      {label}
    </p>
  );
}
