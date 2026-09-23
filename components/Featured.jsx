import Reveal from "@/components/motion/Reveal";
import Kicker from "@/components/motion/Kicker";
import ProblemBrief from "@/components/motion/ProblemBrief";
import { PROBLEM_ICONS, PROBLEMS } from "@/components/problems.data";

const BY_ICON = Object.fromEntries(PROBLEMS.map((p) => [p.icon, p]));

/* One of the five kinds, as an inline chip: the same tone and glyph as the
   chips on each example brief (see ProblemBrief). */
function Kind({ k }) {
  const p = BY_ICON[k];
  return (
    <span className="ax-kind" data-tone={p.tone} title={p.d}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {PROBLEM_ICONS[k]}
      </svg>
      {p.k.toLowerCase()}
    </span>
  );
}

export default function Featured() {
  return (
    <div id="featured" className="section_featured">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-featured">
            {/* The same opening every light chapter on this page has
                (compose.css §4): the numbered kicker, the claim on the left
                at display size, one line of context on the right, a rule
                under both. This band used to open on a dark film card with
                the copy set over the footage — the only section on the page
                that did, and the reason it read as a slab dropped in from
                somewhere else. Set like "Start with one workflow. / Earn the
                right to expand." in Features: ink, then violet. */}
            <Kicker id="featured" label="Where every engagement starts" />
            <Reveal variant="rise" className="_3-columns-grid">
              <h2 className="heading-style-h4 _2 _3 heading-30pt-tablet heading-40pt-ipad_pro">
                Give us a business problem. <br />
                <span className="text-span">Not an AI requirement.</span>
              </h2>
              <p className="p2 max-width-medium _2 text-16pt-ipad_pro">
                You should not need to choose a model, design a RAG architecture or define an
                agent framework before talking to us.
              </p>
            </Reveal>

            {/* The second half of the deck's paragraph, verbatim, with the
                five problem kinds set inline as the chips they are
                everywhere else in this chapter. The copy doc asked for them
                inline from the start (§11). They were briefly a row of five
                cards under this sentence as well — the same five words said
                twice in a row, once in the sentence and once as card
                titles. Now they are said once, and the brief panel below
                tags each example with the same chips. The card definitions
                ride along as the chips' titles. */}
            <Reveal variant="rise" as="p" className="ax-kinds">
              Bring us the process that is too <Kind k="slow" />, too <Kind k="expensive" />,
              too <Kind k="manual" />, too <Kind k="risky" />, or too <Kind k="frustrating" /> to
              keep defending &mdash; and we&rsquo;ll determine whether AI can materially
              improve it, and build it if it can.
            </Reveal>

            {/* The claim, shown: a problem as a client would put it, and
                what comes back, laid out along the deck's route from
                business problem to measurable pilot. It replaced a stock clip
                of a presenter holding a hologram, and the route that used to
                be drawn again as its own strip under it. See ProblemBrief. */}
            <Reveal variant="rise">
              <ProblemBrief />
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
