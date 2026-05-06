"use client";

import { LuTarget, LuUsers, LuClock } from 'react-icons/lu';
import { Progress } from "@/components/ui/progress";

interface DonationGoalProps {
  title: string;
  description?: string;
  current: number;
  goal: number;
  donorCount: number;
  endDate?: Date;
}

export function DonationGoal({ title, description, current, goal, donorCount, endDate }: DonationGoalProps) {
  const progress = (current / goal) * 100;
  const remaining = goal - current;
  
  return (
    <div className="p-6 border rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      
      {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
      
      <Progress value={progress} className="mb-2" />
      
      <div className="flex items-center justify-between text-sm mb-4">
        <span className="font-bold">${current.toLocaleString()}</span>
        <span className="text-muted-foreground">of ${goal.toLocaleString()}</span>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{donorCount} donors</span>
        </div>
        {endDate && (
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left</span>
          </div>
        )}
      </div>
    </div>
  );
}
