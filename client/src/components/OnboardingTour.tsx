"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { X, ChevronRight, ChevronLeft, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingTour({ steps, isOpen, onClose }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<DOMRect | null>(null);

  const updateHighlight = useCallback(() => {
    if (!isOpen || !steps[currentStep]) return;
    
    const element = document.querySelector(steps[currentStep].target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightedElement(rect);
    }
  }, [isOpen, currentStep, steps]);

  useEffect(() => {
    updateHighlight();
    window.addEventListener("resize", updateHighlight);
    window.addEventListener("scroll", updateHighlight, true);
    return () => {
      window.removeEventListener("resize", updateHighlight);
      window.removeEventListener("scroll", updateHighlight, true);
    };
  }, [updateHighlight]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 pointer-events-none" />
      {highlightedElement && (
        <div
          className="fixed border-2 border-primary rounded-lg z-50 pointer-events-none transition-all duration-300"
          style={{
            top: highlightedElement.top - 8,
            left: highlightedElement.left - 8,
            width: highlightedElement.width + 16,
            height: highlightedElement.height + 16,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
          }}
        />
      )}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-background border rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">{step.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{step.content}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSkip} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep ? "w-8 bg-primary" : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {!isFirstStep && (
              <Button variant="outline" size="sm" onClick={handlePrev}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {isLastStep ? (
                <>Done</>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export function useOnboardingTour() {
  const { user } = useAuth();
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  useEffect(() => {
    if (user && !hasSeenTour) {
      const stored = localStorage.getItem(`onboarding_tour_${user.id}`);
      if (!stored) {
        setTimeout(() => setTourOpen(true), 1000);
      }
    }
  }, [user, hasSeenTour]);

  const completeTour = () => {
    setTourOpen(false);
    if (user) {
      localStorage.setItem(`onboarding_tour_${user.id}`, "true");
    }
    setHasSeenTour(true);
  };

  const resetTour = () => {
    if (user) {
      localStorage.removeItem(`onboarding_tour_${user.id}`);
    }
    setHasSeenTour(false);
    setTourOpen(true);
  };

  return { tourOpen, setTourOpen, completeTour, resetTour };
}
