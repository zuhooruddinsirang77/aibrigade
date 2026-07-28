"use client";

import { createContext, useContext, useState, useCallback } from "react";

const PopupContext = createContext(null);

export function PopupProvider({ children }) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [transitionTo, setTransitionTo] = useState(null);

  const openPopup = useCallback(() => {
    setPopupOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closePopup = useCallback(() => {
    setPopupOpen(false);
    document.body.style.overflow = "auto";
  }, []);

  // Triggers the full-screen page-transition overlay before navigating.
  const startTransition = useCallback((href) => {
    setTransitionTo(href);
  }, []);

  const clearTransition = useCallback(() => setTransitionTo(null), []);

  return (
    <PopupContext.Provider
      value={{ popupOpen, openPopup, closePopup, transitionTo, startTransition, clearTransition }}
    >
      {children}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error("usePopup must be used within PopupProvider");
  return ctx;
}
