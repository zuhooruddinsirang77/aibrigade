/* The five shapes a problem worth bringing us takes — slide 10 of the
   deck. Read by Featured.jsx (the five cards) and by
   components/motion/ProblemBrief.jsx (the chips on each example brief), so
   a brief tagged "Slow" wears the same tone and glyph as the Slow card
   under it.

   These were first carried as adjectives inside the Featured paragraph
   ("too slow, too expensive, too manual..."), which said the words but
   gave a reader nothing to recognise their own process in. As five named
   cards they work the way they do in the deck: you scan them, one of them
   describes something you own, and that is the conversation.

   Each one carries a tone and a glyph. The tone is the card's coloured
   edge; the glyph is what lets a reader find "theirs" in the row before
   reading the word under it. */

export const PROBLEM_ICONS = {
  slow: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </>
  ),
  expensive: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
      <path d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
    </>
  ),
  manual: (
    <>
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </>
  ),
  risky: (
    <>
      <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z" />
      <path d="M12 8.5v4" />
      <path d="M12 16h.01" />
    </>
  ),
  frustrating: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M16 16.5s-1.5-2-4-2-4 2-4 2" />
      <path d="M9 9.5h.01M15 9.5h.01" />
    </>
  ),
};

export const PROBLEMS = [
  { k: "Slow", d: "Processes that take too long", tone: "teal", icon: "slow" },
  { k: "Expensive", d: "Work consuming too much human effort", tone: "amber", icon: "expensive" },
  { k: "Manual", d: "Repetitive workflows across people and systems", tone: "blue", icon: "manual" },
  { k: "Risky", d: "Decisions or handoffs with control gaps", tone: "coral", icon: "risky" },
  { k: "Frustrating", d: "Poor customer or employee experiences", tone: "violet", icon: "frustrating" },
];
