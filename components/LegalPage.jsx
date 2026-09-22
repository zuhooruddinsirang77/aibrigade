"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/motion/Reveal";
import { usePopup } from "@/components/PopupContext";
import { getLegal, legal } from "@/components/legal.data";

/**
 * /privacy-policy and /terms-of-use.
 *
 * Both documents run through here: they are the same object — a dated
 * preamble and a numbered set of sections — and the only thing that
 * differs is the prose, which lives in components/legal.data.js.
 *
 * Two things make a legal page readable rather than merely present, and
 * both are here: a contents list that tracks where you are, and a
 * measure narrow enough to read (around 70 characters). Everything else
 * is the site's own type and palette at its quietest.
 */

/** Marks the section currently being read in the contents list. */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const nodes = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!nodes.length) return;

    /* The test line sits a third of the way down the viewport rather than
       at its top edge: a top-edge test flips the marker the instant a
       heading appears, which on a page of short sections means the
       contents list runs ahead of what you are actually reading. */
    const pick = () => {
      const line = window.innerHeight * 0.33;
      let current = nodes[0].id;
      for (const node of nodes) {
        if (node.getBoundingClientRect().top <= line) current = node.id;
      }
      setActive(current);
    };
    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, [ids]);

  return active;
}

function Block({ block }) {
  if (typeof block === "string") return <p>{block}</p>;

  if (block.note) {
    return (
      <p className="ax-legal__note">
        <span aria-hidden="true" />
        {block.note}
      </p>
    );
  }

  if (block.list) {
    return (
      <>
        {block.heading ? <h3 className="ax-legal__sub">{block.heading}</h3> : null}
        <ul className="ax-legal__list">
          {block.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>
    );
  }

  return null;
}

export default function LegalPage({ slug }) {
  const doc = getLegal(slug);
  const { startTransition } = usePopup();

  const ids = doc ? doc.sections.map((s) => s.id) : [];
  const active = useActiveSection(ids);

  if (!doc) return null;

  const other = Object.values(legal).find((d) => d.slug !== slug);

  const go = (href) => (e) => {
    e.preventDefault();
    startTransition(href);
  };

  const jump = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Navbar />
      <main className="ax-legal">
        {/* ---------- hero ---------- */}
        <section className="ax-legal__hero">
          <div className="padding-global">
            <div className="container-large">
              <span className="ax-legal__eyebrow">{doc.kicker}</span>
              <h1 className="ax-legal__title">{doc.title}</h1>
              <p className="ax-legal__summary">{doc.summary}</p>
              <p className="ax-legal__updated">
                Last updated <time>{doc.updated}</time>
              </p>
            </div>
          </div>
        </section>

        {/* ---------- document ---------- */}
        <section className="ax-legal__body">
          <div className="padding-global">
            <div className="container-large">
              <div className="ax-legal__grid">
                <aside className="ax-legal__aside">
                  <nav className="ax-legal__toc" aria-label="On this page">
                    <h2 className="ax-legal__toc-head">Contents</h2>
                    <ol>
                      {doc.sections.map((s, i) => (
                        <li key={s.id}>
                          <a
                            href={`#${s.id}`}
                            onClick={jump(s.id)}
                            data-active={active === s.id ? "true" : undefined}
                            aria-current={active === s.id ? "true" : undefined}
                          >
                            <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                            {s.heading}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                </aside>

                <div className="ax-legal__doc">
                  {doc.sections.map((s, i) => (
                    <Reveal variant="rise" key={s.id} className="ax-legal__section">
                      <section id={s.id}>
                        <h2>
                          <span className="ax-legal__n" aria-hidden="true">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {s.heading}
                        </h2>
                        {s.blocks.map((b, j) => (
                          <Block block={b} key={j} />
                        ))}
                      </section>
                    </Reveal>
                  ))}

                  {/* The two documents are read together more often than
                      either is read alone. */}
                  <div className="ax-legal__foot">
                    <a href={`/${other.slug}`} className="ax-legal__next" onClick={go(`/${other.slug}`)}>
                      <span>
                        <small>Read next</small>
                        {other.title}
                      </span>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M5 12h13M13 6l6 6-6 6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                    <p>
                      Something here unclear? Write to{" "}
                      <a href="mailto:contact@aibrigade.ai">contact@aibrigade.ai</a> and a person
                      will answer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
