"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { usePopup } from "@/components/PopupContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CtaDark from "@/components/CtaDark";
import MaskHeading from "@/components/motion/MaskHeading";
import Reveal from "@/components/motion/Reveal";
import ProjectMedia from "@/components/projects/ProjectMedia";
import LanguageSwitcher from "@/components/projects/LanguageSwitcher";
import ProjectResources from "@/components/projects/ProjectResources";
import { defaultLanguage, formatDuration, languageCodes } from "@/components/projects.data";
import { getUseCase, otherUseCases } from "@/components/usecases.data";

/**
 * One use case — a product we have built, on its own page.
 *
 * This replaced the client case-study template (CaseStudy.jsx) that
 * /icu, /halyk and /uub rendered. That page was built around a client
 * name, a headline metric and a reel, and all three were placeholders:
 * the hero picture was another company's banking app, the metric came
 * from the placeholder deployments table, and the reel section painted a
 * black box because the footage never existed. Everything here is the
 * product's own — its demo, its documents, the chain it runs — so there
 * is nothing on the page that a prospect could check and find missing.
 *
 * The order is the order a buyer asks in:
 *
 *   1. What is it, and who is it for?        hero — headline, lede, a frame
 *                                             of the real demo
 *   2. What does it actually do?             the chain, step by step
 *   3. Can I see it?                         the demo, in every language
 *                                             it ships in
 *   4. What does it bring, what is it made of? features beside a spec card
 *   5. (Fraud Detection) How is it delivered? the product document's steps
 *   6. What else have you built?             the other seven
 *
 * The dark hero and demo band use the AI Lab page's surface (the newest
 * dark band on the site) so the two product-facing routes read as one
 * system; the white sections use the home page's card idiom.
 */

const Arrow = ({ d = "M5 12h13M13 6l6 6-6 6" }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ---- the demo band ---------------------------------------------------- */

function Demo({ uc }) {
  const codes = languageCodes(uc);
  const [code, setCode] = useState(() => defaultLanguage(uc));
  const stageRef = useRef(null);
  // Same hand-off ProjectCard makes: a language change while the demo is
  // playing keeps it playing in the new language.
  const [resumeToken, setResumeToken] = useState(0);

  const changeLanguage = useCallback((next) => {
    const v = stageRef.current?.querySelector("video");
    const wasPlaying = Boolean(v && !v.paused && !v.ended);
    setCode(next);
    setResumeToken(wasPlaying ? Date.now() : 0);
  }, []);

  const video = code ? uc.videos[code] : null;
  if (!video) return null;

  return (
    <section id="demo" className="ax-uc__demo" aria-labelledby="uc-demo-title">
      <div className="ax-uc__grid-bg" aria-hidden="true" />
      <div className="padding-global">
        <div className="container-large">
          <div className="ax-uc__demo-layout" data-orientation={uc.posterOrientation}>
            <Reveal variant="rise" className="ax-uc__demo-copy">
              <p className="ax-uc__label ax-uc__label--invert">The demo</p>
              <h2 id="uc-demo-title" className="ax-uc__h2 ax-uc__h2--invert">
                See {uc.name} run.
              </h2>
              <p className="ax-uc__demo-text">
                The product itself, recorded end to end
                {codes.length > 1
                  ? ` — in ${codes.length} languages. Switch language and the demo carries on in it.`
                  : "."}
              </p>

              <div className="ax-uc__demo-controls">
                <LanguageSwitcher
                  codes={codes}
                  active={code}
                  onChange={changeLanguage}
                  projectName={uc.name}
                  size="lg"
                />
                <ProjectResources resources={uc.resources} projectName={uc.name} />
                {video.duration ? (
                  <p className="ax-uc__demo-meta">
                    {formatDuration(video.duration)} · {uc.type}
                  </p>
                ) : null}
              </div>
            </Reveal>

            <Reveal variant="clip" className="ax-uc__demo-stage">
              <div ref={stageRef}>
                <ProjectMedia
                  video={video}
                  code={code}
                  projectName={uc.name}
                  variant="featured"
                  resumeToken={resumeToken}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- the page ---------------------------------------------------------- */

export default function UseCase({ id }) {
  const { startTransition } = usePopup();
  const uc = getUseCase(id);

  const go = (href) => (e) => {
    e.preventDefault();
    startTransition(href);
  };
  const toDemo = (e) => {
    const el = document.getElementById("demo");
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!uc) return null;
  const others = otherUseCases(id);
  const n = String(uc.index + 1).padStart(2, "0");

  return (
    <>
      <Navbar />
      <main className="ax-uc">
        {/* ---------------- 1. hero ---------------- */}
        <header className="ax-uc__hero">
          <div className="ax-uc__grid-bg" aria-hidden="true" />
          <div className="ax-uc__glow" aria-hidden="true" />

          <div className="padding-global">
            <div className="container-large">
              <div className="ax-uc__hero-layout" data-orientation={uc.posterOrientation}>
                <div className="ax-uc__hero-copy">
                  <a href="/#reels" className="ax-uc__back" onClick={go("/#reels")}>
                    <Arrow d="M19 12H6M11 6l-6 6 6 6" />
                    All use cases
                  </a>

                  <p className="ax-kicker ax-kicker--invert ax-uc__kicker">
                    <span>{n}</span>
                    {uc.sector} · {uc.name}
                  </p>

                  <h1 className="ax-uc__title">
                    <MaskHeading text={uc.headline} delay={0.1} />
                  </h1>

                  <Reveal variant="rise" delay={0.3} immediate>
                    <p className="ax-uc__lede">{uc.overview[0]}</p>
                  </Reveal>

                  <Reveal variant="rise" delay={0.42} immediate className="ax-uc__facts">
                    <span className="ax-uc__fact">{uc.type}</span>
                    {uc.languages.length > 0 && (
                      <span className="ax-uc__fact ax-uc__fact--langs">
                        {/* The separator sits between the labels, never
                            inside one: inside an RTL label it lands on
                            the wrong side of the word. */}
                        {uc.languages.map((l, i) => (
                          <span key={l.code} className="ax-uc__lang">
                            {i > 0 ? <i aria-hidden="true">·</i> : null}
                            <span lang={l.code} dir={l.dir} title={l.english}>
                              {l.label}
                            </span>
                          </span>
                        ))}
                      </span>
                    )}
                    {uc.duration ? (
                      <span className="ax-uc__fact">{formatDuration(uc.duration)} demo</span>
                    ) : null}
                  </Reveal>

                  <Reveal variant="rise" delay={0.52} immediate className="ax-uc__actions">
                    <a href="#demo" className="ax-uc__cta" onClick={toDemo}>
                      Watch the demo
                      <Arrow d="M12 5v13M6 13l6 6 6-6" />
                    </a>
                    <Link href="/contact" className="ax-uc__ghost" onClick={go("/contact")}>
                      Bring us one problem
                      <Arrow d="M9 5l7 7-7 7" />
                    </Link>
                  </Reveal>
                </div>

                {/* A frame from the product's own demo — not an
                    illustration of it — with the chain it runs pinned
                    under it. The whole frame is a way into the demo. */}
                <Reveal variant="rise" delay={0.55} immediate className="ax-uc__hero-visual">
                  <a
                    href="#demo"
                    className="ax-uc__shot"
                    data-orientation={uc.posterOrientation}
                    onClick={toDemo}
                    aria-label={`Watch the ${uc.name} demo`}
                  >
                    {uc.posterOrientation === "landscape" ? (
                      <span className="ax-uc__shot-bar" aria-hidden="true">
                        <span className="ax-uc__shot-dots">
                          <i />
                          <i />
                          <i />
                        </span>
                        <span className="ax-uc__shot-name">{uc.id} · demo</span>
                      </span>
                    ) : null}
                    {uc.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={uc.poster}
                        alt={`${uc.name} — a frame from the product demo`}
                        className="ax-uc__shot-img"
                        loading="eager"
                      />
                    ) : null}
                    <span className="ax-uc__shot-play" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
                      </svg>
                    </span>
                  </a>

                  <ol
                    className="ax-uc__chain"
                    aria-label={`${uc.name}, step by step`}
                    style={{ "--n": uc.flow.length }}
                  >
                    {uc.flow.map((s, i) => (
                      <li key={s.name} style={{ "--i": i }}>
                        {s.name}
                      </li>
                    ))}
                  </ol>
                </Reveal>
              </div>
            </div>
          </div>
        </header>

        {/* ---------------- 2. the chain ---------------- */}
        <section className="ax-uc__flow" aria-labelledby="uc-flow-title">
          <div className="padding-global">
            <div className="container-large">
              <Reveal variant="rise" className="ax-uc__head">
                <div>
                  <p className="ax-uc__label">How it runs</p>
                  <h2 id="uc-flow-title" className="ax-uc__h2">
                    From the first request <br />
                    to the finished action.
                  </h2>
                </div>
                <p className="ax-uc__head-text">{uc.overview[1] || uc.overview[0]}</p>
              </Reveal>

              <Reveal
                variant="stagger"
                selector=".ax-uc__step"
                className="ax-uc__steps"
                as="ol"
                style={{ "--n": uc.flow.length }}
              >
                {uc.flow.map((s, i) => (
                  <li className="ax-uc__step" key={s.name}>
                    <span className="ax-uc__step-n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="ax-uc__step-name">{s.name}</span>
                    <p className="ax-uc__step-text">{s.text}</p>
                  </li>
                ))}
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------- 3. the demo ---------------- */}
        <Demo uc={uc} />

        {/* ---------------- 4. what it brings ---------------- */}
        <section className="ax-uc__detail" aria-labelledby="uc-features-title">
          <div className="padding-global">
            <div className="container-large">
              <div className="ax-uc__detail-layout">
                <div className="ax-uc__features-col">
                  <Reveal variant="rise">
                    <p className="ax-uc__label">What it brings</p>
                    <h2 id="uc-features-title" className="ax-uc__h2">
                      Built to do the work, <br />
                      not describe it.
                    </h2>
                  </Reveal>

                  {uc.stats?.length ? (
                    <Reveal variant="stagger" selector=".ax-uc__stat" className="ax-uc__stats">
                      {uc.stats.map((s) => (
                        <div className="ax-uc__stat" key={s.label}>
                          <span className="ax-uc__stat-value">{s.value}</span>
                          <span className="ax-uc__stat-label">{s.label}</span>
                        </div>
                      ))}
                    </Reveal>
                  ) : null}

                  <Reveal variant="stagger" selector=".ax-uc__feature" className="ax-uc__features" as="ul">
                    {uc.features.map((f) => (
                      <li className="ax-uc__feature" key={f.title}>
                        <span className="ax-uc__feature-mark" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="ax-uc__feature-title">{f.title}</span>
                        <span className="ax-uc__feature-text">{f.text}</span>
                      </li>
                    ))}
                  </Reveal>
                </div>

                {/* The facts a buyer scans for, in one place. */}
                <Reveal variant="rise" delay={0.1} className="ax-uc__spec-col">
                  <aside className="ax-uc__spec" aria-label={`${uc.name} at a glance`}>
                    <p className="ax-uc__spec-title">At a glance</p>
                    <dl className="ax-uc__spec-list">
                      <div>
                        <dt>Sector</dt>
                        <dd>{uc.sector}</dd>
                      </div>
                      {uc.audience ? (
                        <div>
                          <dt>Built for</dt>
                          <dd>{uc.audience}</dd>
                        </div>
                      ) : null}
                      <div>
                        <dt>Product</dt>
                        <dd>{uc.type}</dd>
                      </div>
                      <div>
                        <dt>Languages</dt>
                        <dd>{uc.languages.map((l) => l.english).join(", ")}</dd>
                      </div>
                    </dl>

                    <p className="ax-uc__spec-sub">Built from</p>
                    <ul className="ax-uc__caps">
                      {uc.capabilities.map((c) => (
                        <li key={c.title} style={{ "--cap": c.color }} title={c.text}>
                          {c.title}
                        </li>
                      ))}
                    </ul>

                    {uc.stack?.length ? (
                      <>
                        <p className="ax-uc__spec-sub">Under the hood</p>
                        <ul className="ax-uc__stack">
                          {uc.stack.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </>
                    ) : null}

                    <Link href="/contact" className="ax-uc__spec-cta" onClick={go("/contact")}>
                      Talk to us about {uc.name}
                      <Arrow />
                    </Link>
                  </aside>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- 5. delivery (where the product says) ---------------- */}
        {uc.delivery?.length ? (
          <section className="ax-uc__delivery" aria-labelledby="uc-delivery-title">
            <div className="padding-global">
              <div className="container-large">
                <Reveal variant="rise" className="ax-uc__head">
                  <div>
                    <p className="ax-uc__label">How it is delivered</p>
                    <h2 id="uc-delivery-title" className="ax-uc__h2">
                      Shadow-run first. <br />
                      Trusted after.
                    </h2>
                  </div>
                  <p className="ax-uc__head-text">
                    Nothing decides until it has been proven against live traffic — and nothing
                    ships without a way to switch it off.
                  </p>
                </Reveal>
                <Reveal variant="stagger" selector=".ax-uc__phase" className="ax-uc__phases" as="ol">
                  {uc.delivery.map((d, i) => (
                    <li className="ax-uc__phase" key={d.name}>
                      <span className="ax-uc__phase-n">{String(i + 1).padStart(2, "0")}</span>
                      <span className="ax-uc__phase-name">{d.name}</span>
                      <p className="ax-uc__phase-text">{d.text}</p>
                    </li>
                  ))}
                </Reveal>
              </div>
            </div>
          </section>
        ) : null}

        {/* ---------------- 6. more use cases ---------------- */}
        <section className="ax-uc__more" aria-labelledby="uc-more-title">
          <div className="padding-global">
            <div className="container-large">
              <Reveal variant="rise" className="ax-uc__more-head">
                <div>
                  <p className="ax-uc__label">More use cases</p>
                  <h2 id="uc-more-title" className="ax-uc__h2">
                    The same building blocks, <br />
                    other workflows.
                  </h2>
                </div>
              </Reveal>

              <Reveal variant="stagger" selector=".ax-uc__card" className="ax-uc__cards" as="ul">
                {others.map((o) => (
                  <li key={o.id} className="ax-uc__card">
                    <a href={o.href} className="ax-uc__card-link" onClick={go(o.href)}>
                      {/* A phone screen cropped to a landscape tile shows
                          only its status bar, so a portrait frame stands
                          whole on a blurred wash of itself instead. */}
                      <span className="ax-uc__card-media" data-orientation={o.posterOrientation}>
                        {o.poster && o.posterOrientation === "portrait" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={o.poster} alt="" loading="lazy" className="ax-uc__card-wash" />
                        ) : null}
                        {o.poster ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={o.poster} alt="" loading="lazy" className="ax-uc__card-img" />
                        ) : null}
                      </span>
                      <span className="ax-uc__card-body">
                        <span className="ax-uc__card-sector">{o.sector}</span>
                        <span className="ax-uc__card-name">{o.name}</span>
                        <span className="ax-uc__card-line">{o.useCase}</span>
                      </span>
                      <span className="ax-uc__card-arrow" aria-hidden="true">
                        <Arrow />
                      </span>
                    </a>
                  </li>
                ))}
                {/* Seven others leave one slot in a four-column row; the
                    way back to the whole showcase takes it. */}
                <li className="ax-uc__card ax-uc__card--all">
                  <a href="/#reels" className="ax-uc__card-link" onClick={go("/#reels")}>
                    <span className="ax-uc__card-body">
                      <span className="ax-uc__card-sector">The portfolio</span>
                      <span className="ax-uc__card-name">
                        All {others.length + 1} products, running
                      </span>
                      <span className="ax-uc__card-line">
                        Every demo, in every language it ships in.
                      </span>
                    </span>
                    <span className="ax-uc__card-go">
                      See every demo
                      <Arrow />
                    </span>
                  </a>
                </li>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <CtaDark />
      <Footer />
    </>
  );
}
