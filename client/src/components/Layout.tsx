import { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { OnboardingTour } from "@/components/OnboardingTour";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
      <FloatingActionButton />
      <OnboardingTour className="hidden md:block" />
    </div>
  );
}
