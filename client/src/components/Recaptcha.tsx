"use client";

import { useState } from "react";

interface RecaptchaProps {
  onVerify: (token: string) => void;
}

export function Recaptcha({ onVerify }: RecaptchaProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // In production, this would load the actual reCAPTCHA script
  // For now, we'll simulate verification
  const handleVerify = () => {
    const mockToken = "mock_token_" + Math.random().toString(36).substr(2, 9);
    onVerify(mockToken);
  };

  return (
    <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/30">
      <button
        type="button"
        onClick={handleVerify}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <div className="w-5 h-5 border-2 border-current rounded-sm" />
        I'm not a robot
      </button>
    </div>
  );
}
