"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

/**
 * Four marks, drawn here rather than fetched.
 *
 * The old footer pulled one generic outbound-arrow image from the
 * Webflow CDN and repeated it for every link, so the row said
 * "elsewhere" six times and named nothing.
 *
 * Six became four. Clutch and Behance are gone: Behance is a portfolio
 * board for visual work, which is not what this firm sells, and a Clutch
 * badge belongs beside the reviews it links to rather than in the small
 * print — neither was a place a fintech or health buyer goes to check
 * this company out. What is left is where a buyer actually looks.
 *
 * Each glyph is a real brand mark rather than a monogram, in one stroke
 * weight so the four read as a set, and inline so the row costs no
 * requests. The visible label is gone, so each link carries its name in
 * `aria-label`, with `title` for the same name on hover.
 */
const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/aibrigade/",
    icon: (
      <>
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
  },
  {
    label: "Twitter",
    href: "https://twitter.com/aibrigade",
    icon: (
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/aibrigade/",
    icon: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/aibrigade",
    icon: (
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    ),
  },
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
  const { startTransition } = usePopup();

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
                <Link
                  href="/contact"
                  className="ax-foot__cta"
                  onClick={(e) => {
                    e.preventDefault();
                    startTransition("/contact");
                  }}
                >
                  Start a project
                  {ARROW}
                </Link>
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
              {/* These pointed at the old marketing domain and opened in
                  a new tab. Both documents live on this site now. */}
              <a href="/privacy-policy" onClick={goTo("/privacy-policy")}>
                Privacy Policy
              </a>
              <a href="/terms-of-use" onClick={goTo("/terms-of-use")}>
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
                    aria-label={s.label}
                    title={s.label}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {s.icon}
                    </svg>
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
