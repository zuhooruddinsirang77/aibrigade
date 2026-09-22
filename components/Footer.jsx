"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import Reveal from "@/components/motion/Reveal";
import Magnetic from "@/components/motion/Magnetic";
import { usePopup } from "@/components/PopupContext";
import { caseStudies } from "@/components/casestudies.data";

/**
 * Site footer.
 *
 * Rebuilt on the site's own tokens rather than on the Webflow footer
 * markup it inherited. What was there: a brand block, one column of
 * `<angle bracket>` links, a contacts column, and six social chips laid
 * out by rules spread across three stylesheets — plus a `.footer-copy`
 * legal strip whose CSS survived in two files after the markup for it
 * had already gone. It was wide, thin, and said nothing a visitor who
 * had read the page still needed.
 *
 * Four bands now, in the order someone leaving a page wants them:
 *
 *   1. **Who we are and how to start** — the brand, the one line, the
 *      action, and the reply time stated as a live status rather than a
 *      promise buried in a paragraph.
 *   2. **Where else to go** — sections, the three case studies (they
 *      were reachable from the navigation and the Cases section and from
 *      nowhere at the bottom of the page), and how to reach a person.
 *   3. **Where we are** — three offices with the local time in each.
 *      For a firm working across New Jersey, Dubai and Islamabad, "which
 *      of these is awake right now" is real information, and it is the
 *      detail that makes a distributed team read as a company rather
 *      than a list of cities.
 *   4. **The small print**, under the wordmark.
 *
 * Every navigation link here used to scroll to an id and silently do
 * nothing on /icu, /halyk, /uub and /contact, where those ids do not
 * exist. `goTo` falls back to a real navigation, as `Navbar.goTo` does.
 *
 * Light on purpose: the page closes on `CtaDark`'s ink band, and a
 * second dark surface directly under it would read as one enormous black
 * footer with a heading in the middle.
 */

const CASES = ["icu", "halyk", "uub"].map((slug) => caseStudies[slug]).filter(Boolean);

const EXPLORE = [
  { label: "Platform", target: "#whyus" },
  { label: "What we build", target: "#services" },
  { label: "Inside the system", target: "#features" },
  { label: "Deployments", target: "#cases" },
  { label: "Client reviews", target: "#reviews" },
];

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/aibrigade/" },
  { label: "Twitter", href: "https://twitter.com/aibrigade" },
  { label: "Clutch", href: "https://clutch.co/profile/aibrigade#summary" },
  { label: "Behance", href: "https://www.behance.net/aibrigade" },
  { label: "Instagram", href: "https://www.instagram.com/aibrigade/" },
  { label: "Facebook", href: "https://www.facebook.com/aibrigade" },
];

const OFFICES = [
  { city: "Perth Amboy", region: "New Jersey, US", role: "Headquarters", tz: "America/New_York" },
  { city: "Dubai", region: "United Arab Emirates", role: "Middle East delivery", tz: "Asia/Dubai" },
  { city: "Islamabad", region: "Pakistan", role: "Engineering", tz: "Asia/Karachi" },
];

const ARROW = (
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
);

/**
 * The local time in one office.
 *
 * Renders nothing on the server and on the first client paint. Any clock
 * rendered during SSR is a guaranteed hydration mismatch — the server's
 * minute and the browser's are not the same minute often enough to
 * matter, and React would replace the subtree and log an error for a
 * decorative line of text.
 */
function LocalTime({ tz }) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    const read = () => {
      try {
        setNow(
          new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: tz,
          }).format(new Date())
        );
      } catch {
        // An engine without full ICU data throws on an unknown zone.
        // The city and country above still say everything essential.
        setNow(null);
      }
    };
    read();
    const t = setInterval(read, 30000);
    return () => clearInterval(t);
  }, [tz]);

  if (!now) return null;
  return (
    <span className="ax-foot__time">
      <span className="ax-foot__time-dot" aria-hidden="true" />
      {now} local
    </span>
  );
}

export default function Footer() {
  const { openPopup, startTransition } = usePopup();

  /* An id that isn't on this page is not a dead link — it is a link to
     the home page's version of that section. */
  const goTo = (href) => (e) => {
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    e.preventDefault();

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
  };

  const toTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="footer" className="ax-foot">
      <div className="padding-global">
        <div className="container-large">
          {/* ---- 1 + 2: brand and the three columns ---- */}
          <Reveal
            variant="stagger"
            selector=".ax-foot__brand, .ax-foot__col"
            className="ax-foot__top"
          >
            <div className="ax-foot__brand">
              <a
                href="/"
                className="ax-foot__logo"
                aria-label="AI Brigade — home"
                onClick={goTo("/")}
              >
                <Logo dark size="3rem" />
              </a>
              <p className="ax-foot__line">
                Production-grade AI systems for fintech and healthtech — from discovery
                through deployment.
              </p>
              <Magnetic>
                <a
                  href="#"
                  className="ax-foot__cta"
                  onClick={(e) => {
                    e.preventDefault();
                    openPopup();
                  }}
                >
                  Start a project
                  {ARROW}
                </a>
              </Magnetic>
              <p className="ax-foot__status">
                <span className="ax-foot__status-dot" aria-hidden="true" />
                Enquiries answered within one business day
              </p>
            </div>

            <nav className="ax-foot__col" aria-label="Sections">
              <h2 className="ax-foot__head">Explore</h2>
              <ul className="ax-foot__list">
                {EXPLORE.map((l) => (
                  <li key={l.label}>
                    <a href={l.target} className="ax-foot__link" onClick={goTo(l.target)}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="ax-foot__col" aria-label="Case studies">
              <h2 className="ax-foot__head">Case studies</h2>
              <ul className="ax-foot__list">
                {CASES.map((c) => (
                  <li key={c.slug}>
                    <a
                      href={`/${c.slug}`}
                      className="ax-foot__case"
                      onClick={goTo(`/${c.slug}`)}
                    >
                      <span className="ax-foot__case-client">{c.client}</span>
                      <span className="ax-foot__case-sector">{c.sector}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="ax-foot__col">
              <h2 className="ax-foot__head">Contact</h2>
              <ul className="ax-foot__list">
                <li>
                  <a href="mailto:contact@aibrigade.ai" className="ax-foot__link ax-foot__link--em">
                    contact@aibrigade.ai
                  </a>
                </li>
                <li>
                  <a href="tel:+18453002429" className="ax-foot__link ax-foot__link--em">
                    +1 (845) 300-2429
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="ax-foot__link ax-foot__inline"
                    onClick={goTo("/contact")}
                  >
                    Send us a brief
                    {ARROW}
                  </a>
                </li>
              </ul>
              <p className="ax-foot__hours">Mon–Fri · 9am – 6pm ET</p>
            </div>
          </Reveal>

          {/* ---- 3: where we are ---- */}
          <Reveal variant="stagger" selector=".ax-foot__office" className="ax-foot__offices">
            {OFFICES.map((o) => (
              <div className="ax-foot__office" key={o.city}>
                <span className="ax-foot__office-city">
                  {o.city}
                  <LocalTime tz={o.tz} />
                </span>
                <span className="ax-foot__office-region">{o.region}</span>
                <span className="ax-foot__office-role">{o.role}</span>
              </div>
            ))}
          </Reveal>

          {/* ---- the signature ----
              Decorative and hidden from assistive technology: the name is
              already the first thing in this footer, as a logo with a
              label on it. */}
          <div className="ax-foot__mark" aria-hidden="true">
            <span>AIBRIGADE</span>
          </div>

          {/* ---- 4: the small print ---- */}
          <div className="ax-foot__base">
            <div className="ax-foot__base-left">
              <p className="ax-foot__copy">© {new Date().getFullYear()} AI Brigade</p>
              <a href="https://www.aibrigade.ai/privacy-policy" target="_blank" rel="noreferrer">
                Privacy Policy
              </a>
              <a href="https://www.aibrigade.ai/terms-of-use" target="_blank" rel="noreferrer">
                Terms of Use
              </a>
            </div>

            <div className="ax-foot__base-right">
              <div className="ax-foot__socials">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="ax-foot__social"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
              <button type="button" className="ax-foot__totop" onClick={toTop}>
                Back to top
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 19V5M5 12l7-7 7 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
