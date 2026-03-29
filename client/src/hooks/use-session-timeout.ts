"use client";

import { useState, useEffect, useCallback } from "react";

interface UseSessionTimeoutOptions {
  timeout?: number; // in milliseconds
  warningTime?: number; // show warning before timeout
  onTimeout: () => void;
}

export function useSessionTimeout({
  timeout = 30 * 60 * 1000, // 30 minutes
  warningTime = 5 * 60 * 1000, // 5 minutes before
  onTimeout,
}: UseSessionTimeoutOptions) {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(timeout);

  const resetTimer = useCallback(() => {
    setShowWarning(false);
    setRemainingTime(timeout);
  }, [timeout]);

  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    const handleActivity = () => resetTimer();

    events.forEach(event => window.addEventListener(event, handleActivity));
    return () => events.forEach(event => window.removeEventListener(event, handleActivity));
  }, [resetTimer]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= warningTime && !showWarning) {
          setShowWarning(true);
        }
        if (prev <= 0) {
          onTimeout();
          return timeout;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [warningTime, showWarning, onTimeout, timeout]);

  return { showWarning, remainingTime, resetTimer };
}
