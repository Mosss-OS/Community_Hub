"use client";

import { LuHeart } from 'react-icons/lu';
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect, useState } from "react";

export function QuickDonate() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsPWA(isStandalone);
  }, []);

  return (
    <Link href="/give">
      <Button
        className={`${isPWA ? 'fixed top-4 left-4' : 'fixed bottom-6 left-6'} z-40 rounded-full h-14 px-6 shadow-lg gradient-accent text-primary-foreground font-bold transition-all`}
        title="Quick Donate"
      >
        <Heart className="w-5 h-5 mr-2 fill-current" />
        <span>Give</span>
      </Button>
    </Link>
  );
}
