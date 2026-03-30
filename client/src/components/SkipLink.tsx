"use client";

import { useState, useEffect } from "react";

export function SkipLink() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleFocus = () => setIsVisible(true);
    const handleBlur = () => setIsVisible(false);
    
    const skipLink = document.getElementById("skip-link");
    if (skipLink) {
      skipLink.addEventListener("focus", handleFocus);
      skipLink.addEventListener("blur", handleBlur);
    }
    
    return () => {
      if (skipLink) {
        skipLink.removeEventListener("focus", handleFocus);
        skipLink.removeEventListener("blur", handleBlur);
      }
    };
  }, []);

  return (
    <a
      id="skip-link"
      href="#main-content"
      className={`fixed top-0 left-0 z-50 px-4 py-2 bg-primary text-primary-foreground font-medium transform transition-transform ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      Skip to main content
    </a>
  );
}
