"use client";

import ScrubFilm from "@/components/motion/ScrubFilm";
import Reveal from "@/components/motion/Reveal";
import MaskHeading from "@/components/motion/MaskHeading";

/**
 * The beat after the five stages: what "Scale" actually means once the
 * engagement is over.
 *
 * `Features` ends on Discover → Design → Build → Deploy → Scale, drawn as a
 * pipeline, and then the page went straight to testimonials. The stage that
 * matters most to a buyer is the one after handover — the thing is still
 * running at 3am and somebody is watching it — and nothing on the page said
 * so. This is that sentence, given a full-bleed band and the one clip whose
 * subject is literally infrastructure at night.
 *
 * Full-bleed and deliberately short. It is a breath between the method and
 * the testimonials, not a section with its own argument to make; the three
 * lines below are practice, not performance claims, because a number here
 * would need a source and this footage cannot be one.
 *
 * Redesigned from a shared hairline-divided list into three standalone
 * cards, each carrying an icon: a list of three sentences with no visual
 * distinction between them read as boilerplate however true the sentences
 * were, and the row of hairlines it sat in was borrowed from the
 * Deployments index a section above rather than earned by this one. Same
 * icon-disc language `WhyUs` already uses, so the vocabulary carries across
 * the page instead of inventing a fourth way to badge a list item.
 */
const COMMITMENTS = [
  {
    k: "Owned",
    v: "You keep the code",
    d: "Everything ships into your accounts, your repos, your cloud. No runtime dependency on us.",
    icon: "lock",
  },
  {
    k: "Watched",
    v: "Monitoring from day one",
    d: "Drift, latency and cost are instrumented before launch, not bolted on after the first incident.",
    icon: "eye",
  },
  {
    k: "Handed over",
    v: "Your team can run it",
    d: "Runbooks, retraining procedure and a walkthrough with the people who inherit it.",
    icon: "handoff",
  },
];

const ICONS = {
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5.5" y="10.5" width="13" height="9" rx="1.6" />
      <path d="M8 10.5V7.8a4 4 0 018 0v2.7" />
      <path d="M12 14v2.4" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.8 12S6.4 5.8 12 5.8 21.2 12 21.2 12 17.6 18.2 12 18.2 2.8 12 2.8 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  ),
  handoff: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 12h6.2M9.7 12l-2.4 2.4M9.7 12L7.3 9.6" />
      <path d="M20.5 12h-6.2M14.3 12l2.4 2.4M14.3 12l2.4-2.4" />
    </svg>
  ),
};

export default function Infrastructure() {
  return (
    <section id="infrastructure" className="ax-infra">
      <ScrubFilm film="infrastructure" span={1.15}>
        <div className="ax-infra__inner">
          <div className="padding-global">
            <div className="container-large">
              <div className="ax-infra__grid">
                <div className="ax-infra__head">
                  {/* Not a claim about THIS visitor's session — no fabricated
                      "N systems monitored" counter, since nothing on this
                      page can source that number honestly (see the note on
                      Deployments' own reels for why). It is the section's
                      own premise stated as a status line instead of a
                      caption: the kind of system being described here does
                      not clock off, so the badge does not either. */}
                  <p className="ax-infra__status">
                    <span className="ax-infra__status-dot" aria-hidden="true" />
                    Always on
                  </p>
                  <p className="ax-infra__kicker">After handover</p>
                  <h2 className="ax-infra__title">
                    <MaskHeading text={"The part that\nruns at 3am"} />
                  </h2>
                  <Reveal variant="rise" className="ax-infra__lede">
                    <p>
                      A model that works in a demo and a model that survives a
                      quarter of real traffic are different pieces of
                      engineering. We build the second one.
                    </p>
                  </Reveal>
                </div>

                <Reveal
                  variant="stagger"
                  selector=".ax-infra__item"
                  className="ax-infra__list"
                >
                  {COMMITMENTS.map((c, i) => (
                    <div className="ax-infra__item" key={c.k}>
                      <span className="ax-infra__item-icon" aria-hidden="true">
                        {ICONS[c.icon]}
                      </span>
                      <span className="ax-infra__item-index" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="ax-infra__item-k">{c.k}</p>
                      <h3 className="ax-infra__item-v">{c.v}</h3>
                      <p className="ax-infra__item-d">{c.d}</p>
                    </div>
                  ))}
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </ScrubFilm>
    </section>
  );
}
