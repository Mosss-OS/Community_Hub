"use client";

import { useState, useEffect } from "react";
import { LuVideo, LuPlay, LuCalendar, LuClock } from 'react-icons/lu';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface StreamCountdownProps {
  streamDate: Date;
  title: string;
  description?: string;
  onJoin?: () => void;
}

export function StreamCountdown({ streamDate, title, description, onJoin }: StreamCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = streamDate.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsLive(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [streamDate]);

  if (isLive) {
    return (
      <Card className="bg-red-500/10 border-red-500">
        <CardContent className="pt-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-red-500 font-bold">LIVE NOW</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          {description && <p className="text-muted-foreground mb-4">{description}</p>}
          <Button size="lg" onClick={onJoin} className="gap-2">
            <Play className="h-5 w-5" />Watch Live
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Video className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Stream starts in</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          {description && <p className="text-muted-foreground mb-4">{description}</p>}
        </div>

        <div className="flex justify-center gap-4">
          {timeLeft.days > 0 && (
            <div className="text-center">
              <div className="text-3xl font-bold bg-primary/10 rounded-lg p-3 min-w-[70px]">
                {timeLeft.days}
              </div>
              <span className="text-xs text-muted-foreground">Days</span>
            </div>
          )}
          <div className="text-center">
            <div className="text-3xl font-bold bg-primary/10 rounded-lg p-3 min-w-[70px]">
              {timeLeft.hours.toString().padStart(2, "0")}
            </div>
            <span className="text-xs text-muted-foreground">Hours</span>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-primary/10 rounded-lg p-3 min-w-[70px]">
              {timeLeft.minutes.toString().padStart(2, "0")}
            </div>
            <span className="text-xs text-muted-foreground">Minutes</span>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-primary/10 rounded-lg p-3 min-w-[70px]">
              {timeLeft.seconds.toString().padStart(2, "0")}
            </div>
            <span className="text-xs text-muted-foreground">Seconds</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{streamDate.toLocaleDateString()} at {streamDate.toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
