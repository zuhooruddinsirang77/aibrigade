import Reveal from "@/components/motion/Reveal";
import TerminalFeed from "@/components/motion/TerminalFeed";
import AmbientVideo from "@/components/motion/AmbientVideo";

/* The five shapes a problem worth bringing us takes. These were carried
   as adjectives inside the paragraph above ("too slow, too expensive,
   too manual..."), which said the words but gave a reader nothing to
   recognise their own process in. As five named cards they work the way
   they do in the deck: you scan them, one of them describes something
   you own, and that is the conversation. */
const PROBLEMS = [
  { k: "Slow", d: "Processes that take too long" },
  { k: "Expensive", d: "Work consuming too much human effort" },
  { k: "Manual", d: "Repetitive workflows across people and systems" },
  { k: "Risky", d: "Decisions or handoffs with control gaps" },
  { k: "Frustrating", d: "Poor customer or employee experiences" },
];

/* What happens after you bring one. Stated as a chain because the shape
   of the engagement is the reassurance: it starts at the business problem
   and ends at something measurable, and nothing in between asks the
   client to have picked a model. */
const ROUTE = [
  "Business problem",
  "Workflow design",
  "Agent architecture",
  "Integration",
  "Measurable pilot",
];

export default function Featured() {
  return (
    <div id="featured" className="section_featured">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-featured padding-bottom-0_ipad-pro">
            <Reveal
              variant="stagger"
              selector="h3, .featured_gradient, p, .ax-featured-terminal"
              className="_12-col-grid featured_component tow-columns-grid-gradient i_pro-grid-padding-home"
            >
              {/* Inside `.featured_component`, not behind it. That class is
                  a rounded violet card — `background-color: var(--violet)`,
                  `position: relative`, `z-index: 0`, `overflow: hidden` —
                  so a film mounted at section level is covered by it
                  completely, which is exactly what happened: the clip was
                  invisible except for two strips above and below the card,
                  and the band read as a flat purple block.

                  Mounted here it paints over that violet (the z-index makes
                  the card a stacking context, so the background goes down
                  first and negative children on top of it) and is clipped
                  to the card's own corner radius — the section becomes a
                  framed film rather than a slab. */}
              {/* "consultancy" — a consultant presenting a holographic AI
                  assistant to a client. It was shot for the line that used
                  to sit here ("a focused, fast-moving AI consultancy") and
                  still fits the one that replaced it: two people across a
                  table working out what the problem actually is, which is
                  the whole of what this band now asks for. The particle-
                  stream clip it replaced was atmosphere; this is the claim,
                  illustrated. */}
              <AmbientVideo film="consultancy" className="ax-featured__film" />
              <h3
                id="w-node-a1a784d5-ab7c-b5d9-ae82-a7f9802fc0c1-3317ee6c"
                className="heading-style-h5 text-color-white _30 first-columns heading-h5-36pt-ipad_pro"
              >
                Give us a business problem. Not an AI requirement.
              </h3>
              {/* `.featured_gradient` is a Webflow-positioned decorative wash
                  (absolute, sized by that stylesheet, sitting behind the
                  heading) — not a content slot. Putting the terminal inside
                  it overlapped the heading text badly. It gets its own grid
                  item instead, spanning the full row below both existing
                  ones so it doesn't need to guess at column tracks it can't
                  see (the grid's real template lives in the remote Webflow
                  stylesheet). */}
              <div className="featured_gradient is-gradient-home-page" />
              <p
                id="w-node-a1a784d5-ab7c-b5d9-ae82-a7f9802fc0c4-3317ee6c"
                className="body20 text-color-white max-width-medium two-columns text-16pt-ipad_pro"
              >
                You should not need to choose a model, design a RAG architecture or define an
                agent framework before talking to us. Bring us the process that is too slow,
                too expensive, too manual, too risky, or too frustrating to keep defending
                &mdash; and we&rsquo;ll determine whether AI can materially improve it, and
                build it if it can.
              </p>
              {/* `gridColumn: 1 / -1` makes this span the row, but the
                  Webflow grid's own tracks are narrow, so the panel still
                  rendered ~212px wide — a sliver with a large empty black
                  area under two lines of log. The width is set in CSS
                  alongside the rest of the terminal styling instead. */}
              <div className="ax-featured-terminal">
                <TerminalFeed />
              </div>
            </Reveal>

            <Reveal
              variant="stagger"
              selector=".ax-problems__item"
              className="ax-problems"
              as="ul"
            >
              {PROBLEMS.map((p) => (
                <li className="ax-problems__item" key={p.k}>
                  <h4 className="ax-problems__k">{p.k}</h4>
                  <p className="ax-problems__d">{p.d}</p>
                </li>
              ))}
            </Reveal>

            <Reveal variant="rise" className="ax-route">
              <ol className="ax-route__chain">
                {ROUTE.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
