"use client";

import Logo from "@/components/Logo";

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
  { label: "pricing", target: "reviews" },
];

export default function Footer() {
  const scrollTo = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  };

  return (
    <div id="footer" className="section_footer">
      <div className="padding-global">
        <div className="footer-grid">
          <div className="footer-logo-box">

 <img
      src="/logo3.png"
      alt="AIBrigade"
      className="footer-logo"
      
      style={{
        display: "block",
        height: "12rem",
        width: "auto",
        flexShrink: 0,
      }}
      />
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
              <div className="d1 text-weight-medium margin text-align-center-mob">Contacts</div>
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

          <div className="footer-copy">
            <div className="footer-text">
              <div className="body16 is-special-text-footer grey is-text-14pt-mob">
                © 2026 AI Brigade, Inc.
              </div>
              <div className="body16 is-special-text-footer grey is-text-14pt-mob">
                Our Platforms
                <br />→{" "}
                <a href="https://fintech.aibrigade.ai" target="_blank" rel="noreferrer" className="link-2">
                  AI in Fintech
                </a>
                <br />→{" "}
                <a href="https://healthtech.aibrigade.ai" target="_blank" rel="noreferrer" className="link-3">
                  AI in Healthcare
                </a>
              </div>
              <div className="body16 is-special-text-footer grey is-text-14pt-mob">
                All rights reserved | AI Brigade, Inc.
              </div>
            </div>
            <a
              href="https://www.aibrigade.ai/terms-of-service"
              target="_blank"
              rel="noreferrer"
              className="body16 is-special-text-footer is--link"
            >
              Terms of service
            </a>
            <a
              href="https://www.aibrigade.ai/privacy-policy"
              target="_blank"
              rel="noreferrer"
              className="body16 is-special-text-footer is--link"
            >
              Privacy policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
