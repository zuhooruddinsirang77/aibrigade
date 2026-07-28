"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

export default function Preloader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const wrapper = document.querySelector(".page-wrapper");
    // Reveal the page and fade the preloader out shortly after mount.
    const revealTimer = setTimeout(() => {
      wrapper && wrapper.classList.add("is-ready");
    }, 150);
    const hideTimer = setTimeout(() => setHidden(true), 900);
    return () => {
      clearTimeout(revealTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div
      className="preloader"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#161d25",
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : "auto",
        transition: "opacity 0.5s ease",
      }}
    >
      <div className="preloader_image-wrapper" style={{ maxWidth: "60vw" }}>
        <Logo size="10rem" />
      </div>
    </div>
  );
}
