"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePopup } from "@/components/PopupContext";
import Logo from "@/components/Logo";

export default function PageTransition() {
  const { transitionTo, clearTransition } = usePopup();
  const router = useRouter();
  const [top, setTop] = useState("100vh");

  useEffect(() => {
    if (!transitionTo) return;
    // Slide the overlay up, then navigate.
    setTop("0%");
    const nav = setTimeout(() => {
      if (transitionTo.startsWith("http")) {
        window.location.href = transitionTo;
      } else {
        router.push(transitionTo);
      }
    }, 1000);
    const reset = setTimeout(() => {
      setTop("100vh");
      clearTransition();
    }, 1600);
    return () => {
      clearTimeout(nav);
      clearTimeout(reset);
    };
  }, [transitionTo, router, clearTransition]);

  return (
    <div
      className="nextpage"
      style={{
        top,
        background: "#161d25",
        transition: "top 1.1s cubic-bezier(0.4,0,0.2,1)",
      }}
      aria-hidden="true"
    >
      <Logo size="7.5rem" />
    </div>
  );
}
