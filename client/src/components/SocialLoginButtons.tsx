"use client";

import { Button } from "@/components/ui/button";
import { Chrome, Facebook, Apple, Mail } from "lucide-react";

interface SocialLoginButtonsProps {
  onGoogleLogin?: () => void;
  onFacebookLogin?: () => void;
  onAppleLogin?: () => void;
}

export function SocialLoginButtons({ 
  onGoogleLogin, 
  onFacebookLogin, 
  onAppleLogin 
}: SocialLoginButtonsProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          onClick={onGoogleLogin}
          className="gap-2"
        >
          <Chrome className="h-4 w-4" />
          <span className="hidden sm:inline">Google</span>
        </Button>

        <Button
          variant="outline"
          onClick={onFacebookLogin}
          className="gap-2"
        >
          <Facebook className="h-4 w-4" />
          <span className="hidden sm:inline">Facebook</span>
        </Button>

        <Button
          variant="outline"
          onClick={onAppleLogin}
          className="gap-2"
        >
          <Apple className="h-4 w-4" />
          <span className="hidden sm:inline">Apple</span>
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or with email
          </span>
        </div>
      </div>
    </div>
  );
}

export function OAuthButtons() {
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  const handleFacebookLogin = () => {
    window.location.href = "/api/auth/facebook";
  };

  const handleAppleLogin = () => {
    window.location.href = "/api/auth/apple";
  };

  return (
    <SocialLoginButtons
      onGoogleLogin={handleGoogleLogin}
      onFacebookLogin={handleFacebookLogin}
      onAppleLogin={handleAppleLogin}
    />
  );
}
