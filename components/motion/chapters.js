/**
 * The page's narrative spine, in one place.
 *
 * Two things read this: StoryRail (the floating chapter pill) and Kicker
 * (the numbered label opening each section). It lives in its own plain
 * module rather than in StoryRail.jsx because StoryRail is a `"use client"`
 * module — importing a value out of one from a server component hands you
 * a client reference, not the array, and `CHAPTERS.findIndex` then fails
 * at prerender.
 *
 * Chapter names are beats in an engagement, not section headings
 * ("Evidence", not "Prominent Cases"), so the rail reads as a through-line
 * rather than a table of contents. Order here is the order on the page;
 * inserting one renumbers every kicker after it.
 */
export const CHAPTERS = [
  { id: "header", label: "AI that does the work" },
  { id: "whyus", label: "Our actual capability" },
  { id: "inside", label: "The difference" },
  { id: "cases", label: "Proof before promise" },
  { id: "reels", label: "The portfolio" },
  { id: "environments", label: "Across your estate" },
  { id: "services", label: "The digital workforce" },
  { id: "features", label: "A lower-risk way to start" },
  { id: "reviews", label: "Who vouches" },
  { id: "featured", label: "Start with the problem" },
  { id: "ctadark", label: "Bring us one problem" },
];
