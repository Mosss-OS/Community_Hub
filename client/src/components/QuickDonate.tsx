"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function QuickDonate() {
  return (
    <Link href="/give">
      <Button
        className="fixed bottom-6 left-6 z-40 rounded-full h-14 px-6 shadow-lg gradient-accent text-primary-foreground font-bold"
        title="Quick Donate"
      >
        <Heart className="w-5 h-5 mr-2 fill-current" />
        <span className="hidden sm:inline">Give</span>
      </Button>
    </Link>
  );
}
