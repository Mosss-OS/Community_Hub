"use client";

import { Users } from "lucide-react";

interface LiveViewerCountProps {
  count: number;
  peakCount?: number;
}

export function LiveViewerCount({ count, peakCount }: LiveViewerCountProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-600 rounded-full text-sm font-medium">
      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      <Users className="w-4 h-4" />
      <span>{count} watching</span>
      {peakCount && peakCount > count && (
        <span className="text-xs text-muted-foreground">(peak: {peakCount})</span>
      )}
    </div>
  );
}
