"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { reviews } from "@/components/data";
import Reveal from "@/components/motion/Reveal";
import Kicker from "@/components/motion/Kicker";

/**
 * `role` is one string — "Chief Risk Officer, Meridian Capital" — and the
 * two halves of it do different jobs. The title says how much this
 * person's opinion is worth; the company says whose opinion it is. The
 * selector list on the right of the stage is a list of *organisations* a
 * reader scans for one they recognise, so it needs the second half on its
 * own line; the attribution under a quote wants both.
 *
 * Split rather than added to components/data.js: every role in that file
 * is already written in this shape, and a derived value can't drift out
 * of sync with the string it was derived from.
 */
function splitRole(role = "") {
  /* The FIRST comma, not the last: "CEO, Curiosity Fintech, LLC" splits
     into a one-word title and a company whose legal suffix is part of its
     name. Splitting at the last comma gave that entry a company of
     "LLC" — the one row in the index that named no organisation at all. */
  const at = role.indexOf(", ");
  if (at < 0) return { title: role, company: "" };
  return { title: role.slice(0, at), company: role.slice(at + 2) };
}

const pad = (n) => String(n).padStart(2, "0");

/**
 * One piece of testimony.
 *
 * Was a grey rounded plate with the name and job title at the top in
 * 20px medium and the quote underneath in 18px — nine of them, identical,
 * in a three-column masonry. Two things were wrong with that beyond it
 * being plain:
 *
 *   - The plates did all the visual work and carried no information. Nine
 *     grey rectangles at the same weight is a wall, and a reader skims a
 *     wall rather than reading it.
 *   - The hierarchy was inverted. The name was the largest thing in the
 *     card and the sentence someone actually said was the smallest. On a
 *     page whose entire job in this section is "other people vouch for
 *     this", the quote is the content and the attribution is the receipt.
 *
 * So: the quote set first and largest, and the attribution demoted to the
 * detail rank the rest of the page uses for metadata. `variant="slide"`
 * puts a surface back for the mobile carousel, where a borderless quote
 * has no edge to read as a slide.
 */
function Voice({ r, index, variant, id, labelledBy, hidden }) {
  const { title, company } = splitRole(r.role);

  return (
    <figure
      className={`ax-voice${variant ? ` ax-voice--${variant}` : ""}`}
      id={id}
      role={id ? "tabpanel" : undefined}
      aria-labelledby={labelledBy}
      aria-hidden={hidden ? "true" : undefined}
      /* Stacked panels stay in the document — the nine quotations are the
         section's actual content and should be in the markup whether or
         not JavaScript ever runs — but an inactive one must not be
         reachable by tab or findable by a screen reader while it is
         sitting invisible under the live one. */
      inert={hidden || undefined}
      /* A tabpanel holding no focusable content of its own needs a tab
         stop, or a keyboard reader arrives at the list of names with no
         way into the quotation any of them is attached to. */
      tabIndex={id && !hidden ? 0 : undefined}
    >
      {typeof index === "number" ? (
        <p className="ax-voice__count">
          <span className="ax-voice__count-n">{pad(index + 1)}</span>
          <span className="ax-voice__count-of">/ {pad(reviews.length)}</span>
        </p>
      ) : null}

      <blockquote className="ax-voice__quote">{r.text}</blockquote>

      <figcaption className="ax-voice__by">
        {r.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.img} alt="" className="ax-voice__face" loading="lazy" />
        ) : (
          <span className="ax-voice__face ax-voice__face--mono" aria-hidden="true">
            {r.name.charAt(0)}
          </span>
        )}
        <span className="ax-voice__who">
          <span className="ax-voice__name">{r.name}</span>
          <span className="ax-voice__role">
            {title}
            {company ? <span className="ax-voice__org">{company}</span> : null}
          </span>
        </span>

        {r.project ? (
          <span className="ax-voice__project">
            project <span className="purple">&lt;</span>
            {r.project}
            <span className="purple">/&gt;</span>
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}

/**
 * Who vouches.
 *
 * Nine testimonials given equal weight is nine things to decide between.
 * The previous pass promoted one to pull-quote scale and set the other
 * eight as a three-column text block underneath, which fixed the
 * hierarchy and left two new problems behind:
 *
 *   - The eight were still a wall, just a lighter one — 1,600 words of
 *     14px grey prose in three ragged columns, the last of which ran out
 *     two thirds of the way down and left a column-height hole in the
 *     page.
 *   - The lead quote and its attribution were in two columns with a
 *     `--rhythm-1` gutter and nothing in it, so the name floated 340px
 *     away from the sentence it belonged to. That is the specific thing
 *     that read as "visually disconnected": the two halves of one
 *     statement, too far apart to be seen as one.
 *
 * What replaces it is a stage. One quotation is on at a time, on a panel
 * with its attribution directly beneath it, and the other eight are
 * listed beside it by name and company — so every organisation that
 * vouches is still visible at a glance, which is the part that actually
 * carries the credibility, while only one quotation is asking to be read.
 * All nine stay in the markup; the eight that aren't on are stacked in
 * the same grid cell at zero opacity, which is also what keeps the panel
 * from changing height when the reader switches.
 *
 * Tablet and phone keep the carousel below — see the note there.
 */
export default function Reviews() {
  /* The `highlight` flag in components/data.js has always marked which
     testimonial is the strongest one. It opens the stage. */
  const startAt = useMemo(() => {
    const i = reviews.findIndex((r) => r.highlight);
    return i < 0 ? 0 : i;
  }, []);

  const [active, setActive] = useState(startAt);
  const tabsRef = useRef([]);
  /* Only move focus into the newly selected tab when the change came from
     the keyboard. Doing it on every change would steal focus from the
     prev/next buttons the moment they were clicked. */
  const refocus = useRef(false);

  const select = useCallback((next, viaKeyboard) => {
    const n = (next + reviews.length) % reviews.length;
    refocus.current = !!viaKeyboard;
    setActive(n);
  }, []);

  useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    tabsRef.current[active]?.focus();
  }, [active]);

  /* Autoplay: one testimonial every AUTOPLAY_MS. A manual pick — click or
     keyboard — pauses it rather than fighting the reader's own choice, and
     it resumes on its own once they've been idle for the same interval, so
     the stage doesn't just stall for the rest of the visit. */
  const AUTOPLAY_MS = 20000;
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef(null);

  const pauseThenResume = useCallback(() => {
    setPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), AUTOPLAY_MS);
  }, []);

  useEffect(() => () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % reviews.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused]);

  const onKeyDown = (e) => {
    const map = {
      ArrowDown: 1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowLeft: -1,
    };
    if (map[e.key]) {
      e.preventDefault();
      pauseThenResume();
      select(active + map[e.key], true);
    } else if (e.key === "Home") {
      e.preventDefault();
      pauseThenResume();
      select(0, true);
    } else if (e.key === "End") {
      e.preventDefault();
      pauseThenResume();
      select(reviews.length - 1, true);
    }
  };

  return (
    <div id="reviews" className="section_reviews">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-reviews">
            <Kicker id="reviews" label="Who vouches" />
            <div className="_3-columns-grid">
              <h2 className="gradient-background say">What our clients say about us</h2>
              <p className="p2 max-width-medium text-16pt-ipad_pro">
                Regulated teams who let an AI system touch their operations &mdash; and the
                people who had to defend that decision internally.
              </p>
            </div>

            {/* Desktop: the stage */}
            <Reveal variant="rise" className="ax-voices hide-reviews-tablet">
              <div className="ax-voices__stage">
                <div className="ax-voices__panel">
                  <span className="ax-voices__mark" aria-hidden="true">
                    &ldquo;
                  </span>
                  <div className="ax-voices__deck">
                    {reviews.map((r, i) => (
                      <Voice
                        key={r.name}
                        r={r}
                        index={i}
                        variant={i === active ? "on" : "off"}
                        id={`ax-voice-panel-${i}`}
                        labelledBy={`ax-voice-tab-${i}`}
                        hidden={i !== active}
                      />
                    ))}
                  </div>
                </div>

                {/* The index. Every name and company on the list at once,
                    which is the part of nine testimonials that does the
                    persuading; the quotation is what you read once one of
                    them catches your eye. */}
                <div className="ax-voices__index">
                  <p className="ax-voices__index-label">
                    All voices
                    <span>{pad(reviews.length)}</span>
                  </p>

                  <div className="ax-voices__listwrap">
                    {/* The spine and its fill are one element each rather
                        than a border on every row: a single line down the
                        whole list with a lit segment on it reads as a
                        position in a sequence, which is the same thing the
                        capability rail's slider says two sections up.

                        The position is published as two numbers and the
                        stylesheet decides what to do with them, because
                        the spine is vertical beside a nine-row list and
                        horizontal above a wrapped one below 1200px. An
                        inline `translateY` — which is what this was — is
                        correct for the first and slides the lit segment
                        straight out of a 2px-tall bar in the second. */}
                    <span
                      className="ax-voices__spine"
                      aria-hidden="true"
                      style={{ "--ax-voice-i": active, "--ax-voice-n": reviews.length }}
                    >
                      <span className="ax-voices__spine-fill" />
                    </span>

                    <div
                      className="ax-voices__list"
                      role="tablist"
                      aria-label="Client testimonials"
                      aria-orientation="vertical"
                      onKeyDown={onKeyDown}
                    >
                      {reviews.map((r, i) => {
                        const { company } = splitRole(r.role);
                        const on = i === active;
                        return (
                          <button
                            key={r.name}
                            type="button"
                            role="tab"
                            id={`ax-voice-tab-${i}`}
                            aria-selected={on}
                            aria-controls={`ax-voice-panel-${i}`}
                            tabIndex={on ? 0 : -1}
                            ref={(el) => {
                              tabsRef.current[i] = el;
                            }}
                            className={`ax-voices__tab${on ? " is-on" : ""}`}
                            onClick={() => {
                              pauseThenResume();
                              select(i);
                            }}
                          >
                            {r.img ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={r.img} alt="" className="ax-voices__tab-face" loading="lazy" />
                            ) : (
                              <span
                                className="ax-voices__tab-face ax-voices__tab-face--mono"
                                aria-hidden="true"
                              >
                                {r.name.charAt(0)}
                              </span>
                            )}
                            <span className="ax-voices__tab-who">
                              <span className="ax-voices__tab-name">{r.name}</span>
                              <span className="ax-voices__tab-org">{company || r.role}</span>
                            </span>
                            {/* The row's own number, ranged right. It
                                fills a column whose names only ever use
                                the left half of it, and it is the same
                                numbering the panel prints as "03 / 09" and
                                the capability cards carry two sections up
                                — one counting convention for the page. */}
                            <span className="ax-voices__tab-n" aria-hidden="true">
                              {pad(i + 1)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Same control as the capability rail, deliberately:
                      two sections of this page ask the reader to move
                      through a set, and they should not have two different
                      ideas of what that control looks like. */}
                  <div className="ax-voices__nav">
                    <button
                      type="button"
                      className="whyus-slider-arrow"
                      aria-label="Previous testimonial"
                      onClick={() => {
                        pauseThenResume();
                        select(active - 1);
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 5l-7 7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="whyus-slider-arrow"
                      aria-label="Next testimonial"
                      onClick={() => {
                        pauseThenResume();
                        select(active + 1);
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Tablet / phone: one at a time, by swipe.
                `EffectCoverflow` was dropped with the old plates — it tilts
                and scales the neighbouring slides in 3D, which on a quote
                makes the off-centre text look like a rendering fault rather
                than a card behind a card. A plain slide is the right
                transition for a piece of prose. */}
            <div className="review-swiper-tablet ax-voices--mobile">
              <Swiper
                modules={[Navigation]}
                grabCursor
                slidesPerView={1.05}
                spaceBetween={16}
                navigation
                breakpoints={{ 768: { slidesPerView: 2 } }}
              >
                {reviews.map((r, i) => (
                  <SwiperSlide key={r.name} style={{ height: "auto" }}>
                    <Voice r={r} index={i} variant="slide" />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
