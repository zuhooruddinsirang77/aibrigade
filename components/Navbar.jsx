"use client";

import { useEffect, useRef, useState } from "react";
import { usePopup } from "@/components/PopupContext";
import Logo from "@/components/Logo";

const CDN = "https://cdn.prod.website-files.com/64147b2316f5ef0922b44617";

const LINKS = [
  { label: "platform", target: "whyus" },
  { label: "use cases", target: "cases" },
  { label: "company", target: "services" },
];

export default function Navbar() {
  const { openPopup } = usePopup();
  const [dir, setDir] = useState("down"); // down = visible, up = hidden
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  };

  return (
    <div
      id="nav"
      className={`navbar-white ${dir === "up" ? "nav-up" : "nav-down"}`}
      style={
        scrolled
          ? { zIndex: 100 }
          : { zIndex: 100, background: "transparent", backdropFilter: "none", WebkitBackdropFilter: "none" }
      }
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
                onClick={(e) => {
                  e.preventDefault();
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
                  style={scrolled ? undefined : { color: "#fff", borderColor: "#fff" }}
                >
                  fintech
                </a>
                <a
                  href="#services"
                  className="navbar_btn-page health_btn-white-menu w-button"
                  style={scrolled ? undefined : { color: "#fff", borderColor: "#fff" }}
                >
                  healthtech
                </a>
              </div>
            </div>

            <div
              className={`nav-menu-white${mobileOpen ? " mobile-nav-open" : ""}`}
            >
              <div className="navbar_menu_wrapper overflow-non">
                <div className="navbar-flex-link">
                  {LINKS.map((l) => (
                    <a
                      key={l.target}
                      href={`#${l.target}`}
                      className="navbar_link_p close-secondary-menu"
                      style={scrolled ? undefined : { color: "#fff" }}
                      onClick={scrollTo(l.target)}
                    >
                      &lt;<span className="link-span-yelow_white" style={scrolled ? undefined : { color: "#fff" }}>{l.label}</span>&gt;
                    </a>
                  ))}
                  <a
                    href="mailto:contact@aibrigade.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="navbar_link_p-other"
                    style={scrolled ? undefined : { color: "#fff" }}
                  >
                    &lt;<span className="link-span-yelow_white" style={scrolled ? undefined : { color: "#fff" }}>careers</span>&gt;
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
              aria-label="Menu"
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
