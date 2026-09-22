"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePopup } from "@/components/PopupContext";
import Logo from "@/components/Logo";
import { caseStudies } from "@/components/casestudies.data";

/**
 * Primary navigation.
 *
 * Rebuilt on the site's own tokens rather than on the Webflow navbar
 * markup it inherited — four nested wrappers, a CDN corner image to draw
 * one button, and a full-screen flat-violet drawer with no arrangement
 * inside it. The identity is kept exactly: the same logo, the same
 * angle-bracket link motif, the same violet, the same enquiry popup
 * behind the same label. What changes is spacing, hierarchy and the two
 * places the old bar had nothing to say — the case studies, and the
 * phone.
 *
 * Three things are new, and each answers a real gap:
 *
 *   - **A menu under "use cases".** /icu, /halyk and /uub are real pages
 *     that were reachable only by finding the Cases section and clicking
 *     the right panel. They are in the navigation now, with the project
 *     showcase under them.
 *   - **Anchors that work off the home page.** Every link here pointed at
 *     an id (`#whyus`, `#cases`, `#services`). On a case-study route none
 *     of those ids exist, so `getElementById` returned null and the whole
 *     navigation silently did nothing. `goTo` falls back to a real
 *     navigation through the page-transition overlay.
 *   - **A drawer with a structure.** Logo and a close control at the top,
 *     the sections numbered the way `Kicker` numbers them everywhere else
 *     on the page, the case studies nested under their parent, the call to
 *     action at the foot. Focus is trapped while it is open and returned
 *     to the button that opened it.
 *
 * `id="nav"` and `data-menu` are kept because app/refine.css locks body
 * scroll off `body:has(#nav[data-menu="open"])`, and every section's
 * `scroll-margin-top` is written against this bar's height.
 */

const CASES = ["icu", "halyk", "uub"]
  .map((slug) => caseStudies[slug])
  .filter(Boolean)
  .map((c) => ({
    slug: c.slug,
    client: c.client,
    sector: c.sector,
    title: String(c.title).replace(/\s*\n\s*/g, " "),
  }));

/* `watch` is the set of sections that light a link up: the page has more
   sections than the nav has labels, so "use cases" covers the case
   studies and the project showcase, and "company" covers everything from
   the services strip down to the recognition badges. */
const LINKS = [
  { id: "platform", label: "Capability", target: "#whyus", watch: ["whyus", "featured"] },
  {
    id: "cases",
    label: "Proof",
    target: "#cases",
    watch: ["cases", "reels"],
    menu: true,
  },
  {
    id: "company",
    label: "Company",
    target: "#services",
    watch: ["services", "features", "reviews", "proud"],
  },
  /* A route, not an anchor — `goTo` sends anything that isn't a `#id`
     through the page transition, the same way Contact below does. It sits
     after Deployments because the order is evidence first, then the thing
     a reader can operate themselves. */
  { id: "demos", label: "Demos", target: "/demos" },
  /* Was `mailto:contact@aibrigade.ai`. On a machine with no mail client
     registered — most browsers on most desktops now — that link does
     nothing at all when clicked, so the one item in the bar labelled
     "Contact" was the one item that could silently fail. It points at a
     real page now, and the address is still one tap away inside it. */
  { id: "contact", label: "Contact", target: "/contact" },
];

/* Six, not two. The page now argues six sectors and the hero's own row
   lists all six; a bar that still offered fintech and healthtech would be
   telling four of them they were in the wrong place. All six point at the
   same section — ServiceExplorer groups them into four tracks, so "retail"
   and "customer ops" land on the same tab, as do "industrial" and
   "energy". If the row proves too wide at tablet, drop to fintech,
   healthtech, retail, industrial rather than going back to two. */
const DOMAINS = [
  { label: "fintech", target: "#services" },
  { label: "healthtech", target: "#services" },
  { label: "retail", target: "#services" },
  { label: "customer ops", target: "#services" },
  { label: "industrial", target: "#services" },
  { label: "energy", target: "#services" },
];

/* Matches the hero's button exactly — the same action must not have two
   names on one screen.

   Not "Request Free Strategy Session": *free* prices the engagement before
   the buyer does, and *strategy session* is what an agency sells. And no
   longer "Book a technical review", which this said until the page was
   repositioned: the argument now is that you should not have to choose a
   model or define an agent framework before talking to us, and a button
   asking for a *technical* review asks for exactly that readiness. */
const CTA_LABEL = "Bring us one problem";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function Navbar() {
  const { startTransition } = usePopup();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // the phone drawer
  const [openDrop, setOpenDrop] = useState(null); // which desktop menu is down
  const [active, setActive] = useState(null);
  const [openGroup, setOpenGroup] = useState(null); // drawer accordion

  const dropTimer = useRef(null);
  const drawerRef = useRef(null);
  const burgerRef = useRef(null);
  const barRef = useRef(null);

  /* ---- navigation ----------------------------------------------------- */

  /* An id that isn't on this page is not a dead link — it is a link to
     the home page's version of that section. Case-study routes mount this
     same navigation, and that is where every anchor used to go nowhere. */
  const goTo = useCallback(
    (href) => (e) => {
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      e.preventDefault();
      setMenuOpen(false);
      setOpenDrop(null);

      if (href.startsWith("#")) {
        const el = document.getElementById(href.slice(1));
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        startTransition(`/${href}`);
        return;
      }
      startTransition(href);
    },
    [startTransition]
  );

  const toTop = useCallback(
    (e) => {
      e.preventDefault();
      setMenuOpen(false);
      setOpenDrop(null);
      if (document.getElementById("header")) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      startTransition("/");
    },
    [startTransition]
  );

  const openEnquiry = useCallback(
    (e) => {
      e.preventDefault();
      setMenuOpen(false);
      setOpenDrop(null);
      startTransition("/contact");
    },
    [startTransition]
  );

  /* ---- scroll state ---------------------------------------------------- */

  /* The bar stays put. It used to slide away on a downward scroll — the
     behaviour the Webflow navbar shipped with — which on a page this long
     meant the navigation was absent for most of the time anyone spends on
     it, and reappeared with a jump on the first upward flick. Always
     present is the calmer and more useful of the two, and the compaction
     below is what keeps it from taking much room. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Which section is being read. The test band is the middle of the
     viewport rather than its top edge: a top-edge test flips the active
     link the instant a section's first pixel appears, which on this page
     — where WhyUs is scroll-pinned and holds for 1,000px — marks a link
     active long before its section is what you are looking at. */
  useEffect(() => {
    const nodes = LINKS.flatMap((l) => l.watch || [])
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!nodes.length) return;

    const pick = () => {
      const mid = window.innerHeight / 2;
      let current = null;
      for (const node of nodes) {
        const r = node.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) current = node.id;
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
  }, []);

  /* ---- the desktop menu ------------------------------------------------ */

  const cancelClose = () => {
    clearTimeout(dropTimer.current);
    dropTimer.current = null;
  };
  /* Hover with intent both ways: a short delay before opening stops a
     pointer crossing the bar on its way somewhere else from flashing the
     panel, and a longer one before closing lets the pointer cross the gap
     between the trigger and the panel without it shutting underneath. */
  const hoverOpen = (id) => () => {
    cancelClose();
    dropTimer.current = setTimeout(() => setOpenDrop(id), 90);
  };
  const hoverClose = () => {
    cancelClose();
    dropTimer.current = setTimeout(() => setOpenDrop(null), 220);
  };
  useEffect(() => () => clearTimeout(dropTimer.current), []);

  // Escape closes whatever is open; a click outside closes the menu.
  useEffect(() => {
    if (!openDrop && !menuOpen) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (openDrop) {
        setOpenDrop(null);
        document.getElementById(`nav-trigger-${openDrop}`)?.focus();
        return;
      }
      setMenuOpen(false);
      burgerRef.current?.focus();
    };
    const onDown = (e) => {
      if (openDrop && barRef.current && !barRef.current.contains(e.target)) setOpenDrop(null);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [openDrop, menuOpen]);

  // The drawer only exists below 992px; growing past it has to close it,
  // or the page is left with a locked body and an invisible panel.
  useEffect(() => {
    if (!menuOpen) return;
    const mq = window.matchMedia("(min-width: 992px)");
    const onChange = (e) => e.matches && setMenuOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [menuOpen]);

  /* ---- focus, while the drawer is open --------------------------------- */

  useEffect(() => {
    if (!menuOpen) return;
    const panel = drawerRef.current;
    if (!panel) return;

    const first = panel.querySelector(FOCUSABLE);
    first?.focus();

    const onKey = (e) => {
      if (e.key !== "Tab") return;
      const items = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (!items.length) return;
      const head = items[0];
      const tail = items[items.length - 1];
      if (e.shiftKey && document.activeElement === head) {
        e.preventDefault();
        tail.focus();
      } else if (!e.shiftKey && document.activeElement === tail) {
        e.preventDefault();
        head.focus();
      }
    };
    panel.addEventListener("keydown", onKey);
    return () => panel.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const closeDrawer = () => {
    setMenuOpen(false);
    burgerRef.current?.focus();
  };

  /* ---- render ---------------------------------------------------------- */

  const isActive = (l) => Boolean(l.watch && active && l.watch.includes(active));

  return (
    <header
      id="nav"
      ref={barRef}
      className="ax-nav"
      data-scrolled={scrolled ? "true" : "false"}
      data-menu={menuOpen ? "open" : "closed"}
    >
      <div className="padding-global">
        <div className="container-large">
          <div className="ax-nav__bar">
            {/* ---- brand ---- */}
            <div className="ax-nav__brand">
              {/* A plain anchor, not `next/link`: every cross-page move on
                  this site goes through the page-transition overlay
                  (`startTransition`), and on the home page this doesn't
                  navigate at all — it scrolls to the top. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                className="ax-nav__logo"
                aria-label="AI Brigade — home"
                onClick={toTop}
              >
                {/* A CSS variable rather than a fixed size: `Logo` writes
                    its height inline, which would otherwise outrank the
                    compact scrolled state declared in the stylesheet. */}
                <Logo dark={scrolled && !menuOpen} size="var(--ax-nav-logo)" />
              </a>
              <span className="ax-nav__domains" aria-hidden="true">
                {DOMAINS.map((d) => (
                  <a key={d.label} href={d.target} onClick={goTo(d.target)} tabIndex={-1}>
                    {d.label}
                  </a>
                ))}
              </span>
            </div>

            {/* ---- desktop navigation ---- */}
            <nav className="ax-nav__nav" aria-label="Primary">
              <ul className="ax-nav__list">
                {LINKS.map((l) => {
                  const on = isActive(l);
                  if (!l.menu) {
                    return (
                      <li key={l.id} className="ax-nav__item">
                        <a
                          href={l.target}
                          className="ax-nav__link"
                          data-active={on ? "true" : undefined}
                          aria-current={on ? "true" : undefined}
                          onClick={goTo(l.target)}
                          {...(l.external
                            ? { target: "_blank", rel: "noreferrer" }
                            : null)}
                        >
                          {l.label}
                        </a>
                      </li>
                    );
                  }

                  const open = openDrop === l.id;
                  return (
                    <li
                      key={l.id}
                      className="ax-nav__item ax-nav__item--has-menu"
                      onPointerEnter={hoverOpen(l.id)}
                      onPointerLeave={hoverClose}
                    >
                      <button
                        type="button"
                        id={`nav-trigger-${l.id}`}
                        className="ax-nav__link ax-nav__link--trigger"
                        data-active={on ? "true" : undefined}
                        aria-expanded={open}
                        aria-controls={`nav-menu-${l.id}`}
                        onClick={() => setOpenDrop(open ? null : l.id)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setOpenDrop(l.id);
                            requestAnimationFrame(() =>
                              document
                                .getElementById(`nav-menu-${l.id}`)
                                ?.querySelector("a")
                                ?.focus()
                            );
                          }
                        }}
                      >
                        {l.label}
                        <svg className="ax-nav__chev" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M6 9.5l6 6 6-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>

                      <div
                        id={`nav-menu-${l.id}`}
                        className="ax-nav__panel"
                        /* `visibility`, not the `hidden` attribute: a
                           display-none panel cannot animate shut, and
                           `visibility: hidden` takes it out of the
                           accessibility tree just as completely. */
                        data-open={open ? "true" : "false"}
                      >
                        <p className="ax-nav__panel-label">Case studies</p>
                        <ul className="ax-nav__cases">
                          {CASES.map((c) => (
                            <li key={c.slug}>
                              <a
                                href={`/${c.slug}`}
                                className="ax-nav__case"
                                onClick={goTo(`/${c.slug}`)}
                              >
                                <span className="ax-nav__case-head">
                                  <span className="ax-nav__case-client">{c.client}</span>
                                  <span className="ax-nav__case-sector">{c.sector}</span>
                                </span>
                                <span className="ax-nav__case-title">{c.title}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                        <a
                          href="#reels"
                          className="ax-nav__panel-foot"
                          onClick={goTo("#reels")}
                        >
                          <span>
                            Project showcase
                            <small>Product demos, in every language they ship in</small>
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
                      </div>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* ---- the one action ---- */}
            <Link href="/contact" className="ax-nav__cta" onClick={openEnquiry}>
              <span>{CTA_LABEL}</span>
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
            </Link>

            {/* ---- drawer control ---- */}
            <button
              type="button"
              ref={burgerRef}
              className="ax-nav__burger"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="nav-drawer"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* ---- the drawer ---- */}
      <div
        className="ax-nav__scrim"
        data-open={menuOpen ? "true" : "false"}
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <div
        id="nav-drawer"
        ref={drawerRef}
        className="ax-nav__drawer"
        data-open={menuOpen ? "true" : "false"}
        role="dialog"
        aria-modal={menuOpen || undefined}
        aria-label="Menu"
      >
        <div className="ax-nav__drawer-inner">
          <nav aria-label="Primary, mobile">
            <ul className="ax-nav__drawer-list">
              {LINKS.map((l, i) => {
                const n = String(i + 1).padStart(2, "0");
                if (!l.menu) {
                  return (
                    <li key={l.id}>
                      <a
                        href={l.target}
                        className="ax-nav__drawer-link"
                        onClick={goTo(l.target)}
                        {...(l.external ? { target: "_blank", rel: "noreferrer" } : null)}
                      >
                        <span className="ax-nav__drawer-n" aria-hidden="true">
                          {n}
                        </span>
                        {l.label}
                      </a>
                    </li>
                  );
                }
                const open = openGroup === l.id;
                return (
                  <li key={l.id}>
                    <div className="ax-nav__drawer-row">
                      <a
                        href={l.target}
                        className="ax-nav__drawer-link"
                        onClick={goTo(l.target)}
                      >
                        <span className="ax-nav__drawer-n" aria-hidden="true">
                          {n}
                        </span>
                        {l.label}
                      </a>
                      <button
                        type="button"
                        className="ax-nav__drawer-toggle"
                        aria-expanded={open}
                        aria-controls={`nav-drawer-${l.id}`}
                        aria-label={`${open ? "Hide" : "Show"} case studies`}
                        onClick={() => setOpenGroup(open ? null : l.id)}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M6 9.5l6 6 6-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                    <ul
                      id={`nav-drawer-${l.id}`}
                      className="ax-nav__drawer-sub"
                      hidden={!open}
                    >
                      {CASES.map((c) => (
                        <li key={c.slug}>
                          <a href={`/${c.slug}`} onClick={goTo(`/${c.slug}`)}>
                            {c.client}
                            <small>{c.sector}</small>
                          </a>
                        </li>
                      ))}
                      <li>
                        <a href="#reels" onClick={goTo("#reels")}>
                          Project showcase
                        </a>
                      </li>
                    </ul>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ax-nav__drawer-foot">
            <span className="ax-nav__drawer-domains" aria-hidden="true">
              {DOMAINS.map((d) => (
                <span key={d.label}>{d.label}</span>
              ))}
            </span>
            <a href="mailto:contact@aibrigade.ai" className="ax-nav__drawer-mail">
              contact@aibrigade.ai
            </a>
            {/* Last, so the action is the thing closest to the thumb. */}
            <Link href="/contact" className="ax-nav__drawer-cta" onClick={openEnquiry}>
              {CTA_LABEL}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
