"use client";

import { useEffect, useState } from "react";

/**
 * "⌘ Enter" on a Mac, "Ctrl Enter" everywhere else.
 *
 * Decided after mount: the server cannot know the platform, and guessing
 * there would mismatch on hydration for half the audience. Hidden on
 * touch screens, which have no modifier key to press.
 */
export default function KbdHint({ action }) {
  const [mod, setMod] = useState("Ctrl");

  useEffect(() => {
    const p = navigator.userAgentData?.platform || navigator.platform || "";
    if (/mac|iphone|ipad/i.test(p)) setMod("⌘");
  }, []);

  return (
    <p className="ax-demo__kbd">
      <kbd>{mod}</kbd>
      <kbd>Enter</kbd>
      {action}
    </p>
  );
}
