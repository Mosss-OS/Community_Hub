import { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { FloatingActionButton } from "@/components/FloatingActionButton";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <Navbar />
      <main className="flex-1 w-full pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
      <FloatingActionButton />
    </div>
  );
}
