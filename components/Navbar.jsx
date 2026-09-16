"use client";

import { useEffect, useRef, useState } from "react";
import { usePopup } from "@/components/PopupContext";
import Logo from "@/components/Logo";

const CDN = "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617";

/* `target` is the element the link scrolls to; `watch` is the set of
   sections that should light this link up, because the page has more
   sections than the nav has labels — "use cases" covers the case studies
   and the reels, "company" covers everything from the services strip
   down to the recognition badges. Without this, two thirds of a scroll
   through the page had no link marked at all. */
const LINKS = [
  { label: "platform", target: "whyus", watch: ["whyus", "featured"] },
  { label: "use cases", target: "cases", watch: ["cases", "reels"] },
  { label: "company", target: "services", watch: ["services", "features", "reviews", "proud"] },
];

export default function Navbar() {
  const { openPopup } = usePopup();
  const [dir, setDir] = useState("down"); // down = visible, up = hidden
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState(null);
  const lastScroll = useRef(0);

  useEffect(() => {
    const delta = 5;
    const navHeight = 80;
    const onScroll = () => {
      const st = window.scrollY;
      setScrolled(st > navHeight);
      if (Math.abs(lastScroll.current - st) <= delta) return;
      if (st > lastScroll.current && st > navHeight) {
        setDir("up");
      } else {
        setDir("down");
      }
      lastScroll.current = st;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Which section is being read. The band is the middle of the viewport
     rather than its top edge: a top-edge test flips the active link the
     instant a section's first pixel appears, which on this page — where
     WhyUs is scroll-pinned and stays put for 1,000px — marks a link
     active long before its section is what you are looking at. */
  useEffect(() => {
    const ids = LINKS.flatMap((l) => l.watch);
    const nodes = ids
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

  // Close the drawer on Escape, and whenever the viewport grows past the
  // breakpoint where the drawer stops existing.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    const mq = window.matchMedia("(min-width: 992px)");
    const onChange = (e) => e.matches && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onChange);
    };
  }, [mobileOpen]);

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Colours are declared in app/refine.css off these two attributes, so
  // the transition between the two states can actually be animated —
  // inline styles gave it nothing to tween between.
  const light = !scrolled;

  return (
    <div
      id="nav"
      className={`navbar-white ${dir === "up" && !mobileOpen ? "nav-up" : "nav-down"}`}
      data-scrolled={scrolled ? "true" : "false"}
      data-menu={mobileOpen ? "open" : "closed"}
      style={{ zIndex: 100 }}
    >
      <div className="padding-global">
        <div className="container-large">
          <div
            className="navbar_wrapper"
            style={{ display: "flex", flexWrap: "nowrap", alignItems: "center", justifyContent: "space-between", gap: "1.5rem" }}
          >
            <div className="navbar_left" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <a
                href="/"
                className="brand w-nav-brand w--current"
                aria-label="AIBrigade — back to top"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                style={{ display: "flex", alignItems: "center" }}
              >
                <Logo dark={scrolled} size="5.8rem" className="navbar_logo" />
              </a>
              <div className="navbar_buttons_box">
                <a
                  href="#services"
                  className="navbar_btn-page base_btn-white-menu w-button"
                  onClick={scrollTo("services")}
                  style={light ? { color: "#fff", borderColor: "rgba(255,255,255,0.55)" } : undefined}
                >
                  fintech
                </a>
                <a
                  href="#services"
                  className="navbar_btn-page health_btn-white-menu w-button"
                  onClick={scrollTo("services")}
                  style={light ? { color: "#fff", borderColor: "rgba(255,255,255,0.55)" } : undefined}
                >
                  healthtech
                </a>
              </div>
            </div>

            <div
              className={`nav-menu-white${mobileOpen ? " mobile-nav-open" : ""}`}
              id="nav-menu"
            >
              <div className="navbar_menu_wrapper overflow-non">
                <div className="navbar-flex-link">
                  {LINKS.map((l) => {
                    const isActive = l.watch.includes(active);
                    return (
                      <a
                        key={l.target}
                        href={`#${l.target}`}
                        className="navbar_link_p close-secondary-menu"
                        data-active={isActive ? "true" : "false"}
                        aria-current={isActive ? "true" : undefined}
                        style={light ? { color: "#fff" } : undefined}
                        onClick={scrollTo(l.target)}
                      >
                        &lt;<span className="link-span-yelow_white" style={light ? { color: "#fff" } : undefined}>{l.label}</span>&gt;
                      </a>
                    );
                  })}
                  <a
                    href="mailto:contact@aibrigade.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="navbar_link_p-other"
                    style={light ? { color: "#fff" } : undefined}
                  >
                    &lt;<span className="link-span-yelow_white" style={light ? { color: "#fff" } : undefined}>contact us</span>&gt;
                  </a>
                </div>
                <div className="navbar_button_wrapper">
                  <a
                    href="#"
                    className="button small w-inline-block"
                    style={{ display: "flex" }}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileOpen(false);
                      openPopup();
                    }}
                  >
                    <div className="button_text_wrapper">
                      <div className="body16-btn is-special-text-navbar-btn">Request Free Strategy Session</div>
                    </div>
                    <div className="button_bg_wrapper">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${CDN}/641b1450a988d58dc24e1241_corner%20(1).webp`}
                        alt=""
                        className="button_bg-2 small"
                      />
                      <div className="button_bg" />
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Hamburger */}
            <button
              className="menu_box-btn"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="nav-menu"
              onClick={() => setMobileOpen((v) => !v)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                position: "relative",
                zIndex: 60,
              }}
            >
              <div className="menu_wrapper">
                <div className="menu_line-1 _2" />
                <div className="menu_line-2 _2" />
                <div className="menu_line-3 _2" />
              </div>
            </button>
          </div>
        </div>
      </div>
      <div className="top-line-absolute" />
    </div>
  );
}
