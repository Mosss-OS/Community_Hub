import { useState, useEffect } from "react";
import { Link } from "wouter";
import { HiX, HiChevronRight, HiChevronLeft } from "react-icons/hi";

interface TourStep {
  target: string;
  title: string;
  content: string;
}

const tourSteps: TourStep[] = [
  {
    target: "nav",
    title: "Welcome to Watchman Lekki",
    content: "This is your navigation menu. Access all pages from here."
  },
  {
    target: "dashboard",
    title: "Your Dashboard",
    content: "View your activity, attendance, and giving summary."
  },
  {
    target: "sermons",
    title: "Sermons & Teaching",
    content: "Watch and listen to weekly sermons and teaching series."
  },
  {
    target: "events",
    title: "Events",
    content: "Stay updated with upcoming church events and activities."
  },
  {
    target: "groups",
    title: "Small Groups",
    content: "Connect with a community that cares. Join a small group."
  }
];

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem("onboarding_seen");
    if (!seen) {
      setIsOpen(true);
      setHasSeenTour(false);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("onboarding_seen", "true");
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    localStorage.removeItem("onboarding_seen");
    setCurrentStep(0);
    setIsOpen(true);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={handleRestart}
        className="fixed bottom-24 left-6 z-40 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg text-sm md:hidden"
      >
        Tour
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center md:items-center p-4">
      <div className="bg-background rounded-xl shadow-2xl border border-border max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {tourSteps.length}
          </span>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-semibold mb-2">
          {tourSteps[currentStep].title}
        </h3>
        <p className="text-muted-foreground mb-6">
          {tourSteps[currentStep].content}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1 text-sm text-muted-foreground disabled:opacity-50"
          >
            <HiChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm"
          >
            {currentStep === tourSteps.length - 1 ? "Done" : "Next"}
            <HiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}