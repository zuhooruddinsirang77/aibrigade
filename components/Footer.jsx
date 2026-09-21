"use client";

import Logo from "@/components/Logo";
import Reveal from "@/components/motion/Reveal";
import Magnetic from "@/components/motion/Magnetic";
import { usePopup } from "@/components/PopupContext";

const CDN = "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617";

const socials = [
  { label: "facebook", href: "https://www.facebook.com/aibrigade" },
  { label: "linkedin", href: "https://www.linkedin.com/company/aibrigade/" },
  { label: "instagram", href: "https://www.instagram.com/aibrigade/" },
  { label: "behance", href: "https://www.behance.net/aibrigade" },
  { label: "twitter", href: "https://twitter.com/aibrigade" },
  { label: "clutch", href: "https://clutch.co/profile/aibrigade#summary" },
];

const navItems = [
  { label: "home", target: "header" },
  { label: "about", target: "whyus" },
  { label: "services", target: "services" },
  { label: "case studies", target: "cases" },
  { label: "reviews", target: "reviews" },
];

export default function Footer() {
  const { openPopup } = usePopup();

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  };

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div id="footer" className="section_footer ax-footer">
      <div className="padding-global">
        <Reveal
          variant="stagger"
          selector=".footer-logo-box, .footer-nav, .footer-social"
          className="footer-grid"
        >
          {/* The brand column used to be a single 2MB PNG set to 12rem
              tall — most of which is the file's own transparent margin, so
              it read as a stamp-sized mark floating in an empty third of
              the footer. Same logo asset the navbar uses, at a size that
              matches it, with the one line that says what the company
              does under it. */}
          <div className="footer-logo-box">
            <Logo dark size="3.5rem" className="footer-logo" />
            <p className="footer-logo-line">
              Production-grade AI systems for fintech and healthtech —
              from discovery through deployment.
            </p>
            <Magnetic>
              <a
                href="#"
                className="ax-footer__cta"
                onClick={(e) => {
                  e.preventDefault();
                  openPopup();
                }}
              >
                Start a project
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M9 5l7 7-7 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </Magnetic>
          </div>

          <div className="footer-nav">
            <div className="footer_navigation_item">
              <div className="d1 text-weight-medium margin foo">Navigation</div>
              <div className="div-block-7">
                {navItems.map((n) => (
                  <a
                    href={`#${n.target}`}
                    key={n.label}
                    className="navbar_link _2 ajax-click footer"
                    onClick={scrollTo(n.target)}
                  >
                    &lt;<span className="text-span-2 footer">{n.label}</span>&gt;
                  </a>
                ))}
                <a
                  href="mailto:contact@aibrigade.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="navbar_link-other _2 ajax-click footer"
                >
                  &lt;<span className="text-span-2 footer">contact</span>&gt;
                </a>
              </div>
            </div>

            <div className="footer_navigation_item">
              <div className="d1 text-weight-medium margin">Contacts</div>
              <div className="div-block-7 contacts">
                <a href="mailto:contact@aibrigade.ai" className="body18 hover footer new">
                  contact@aibrigade.ai
                </a>
                <a href="tel:+18453002429" className="body18 hover footer new">
                  +1 (845) 300-2429
                </a>
                <a href="#" className="body18 black footer" onClick={(e) => e.preventDefault()}>
                  Perth Amboy, NJ (HQ) · Dubai, UAE · Islamabad, Pakistan
                </a>
              </div>
            </div>
          </div>

          <div className="footer-social">
            <div className="d1 text-weight-medium foo">Follow AIBrigade</div>
            <div className="footer-social-grid">
              {socials.map((s) => (
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="footer_social-new w-inline-block"
                  key={s.label}
                >
                  <div className="footer_social-text-component">
                    <div className="body20 is-social-text-link">{s.label}</div>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${CDN}/641c8a2195f878cb331fdf7f_Vector%20(7).svg`} alt="" className="footer_social_icon" />
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        <button type="button" className="ax-footer__totop" onClick={scrollToTop} aria-label="Back to top">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 19V5M5 12l7-7 7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
