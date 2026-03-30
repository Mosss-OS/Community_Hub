"use client";

import { useState, useEffect } from "react";
import { BookOpen, Flame, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface ReadingPlan {
  id: string;
  name: string;
  totalDays: number;
  completedDays: number;
}

export function ReadingProgress({ plan }: { plan: ReadingPlan }) {
  const progress = (plan.completedDays / plan.totalDays) * 100;
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Calculate streak from localStorage
    const stored = localStorage.getItem(`reading_streak_${plan.id}`);
    if (stored) setStreak(parseInt(stored));
  }, [plan.id]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {plan.name}
          </h3>
          <div className="flex items-center gap-1 text-orange-500">
            <Flame className="w-4 h-4 fill-current" />
            <span className="font-bold">{streak} day streak</span>
          </div>
        </div>
        
        <Progress value={progress} className="mb-2" />
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{plan.completedDays} of {plan.totalDays} days</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        
        <Button className="w-full mt-4" variant="outline">
          Continue Reading
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
