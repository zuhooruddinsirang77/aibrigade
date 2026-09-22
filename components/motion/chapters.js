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
  { id: "header", label: "The brief" },
  { id: "whyus", label: "What we build" },
  { id: "inside", label: "Inside the system" },
  { id: "cases", label: "Evidence" },
  { id: "reels", label: "The work, playing" },
  { id: "environments", label: "Where it runs" },
  { id: "services", label: "The offer" },
  { id: "features", label: "How we run it" },
  { id: "reviews", label: "Who vouches" },
  { id: "ctadark", label: "Start something" },
];
