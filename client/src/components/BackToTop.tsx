"use client";

import { useState, useEffect } from "react";
import { LuChevronUp } from 'react-icons/lu';
import { Button } from "@/components/ui/button";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 rounded-full h-12 w-12 p-0 shadow-lg"
      title="Back to top"
    >
      <ChevronUp className="h-6 w-6" />
    </Button>
  );
}
