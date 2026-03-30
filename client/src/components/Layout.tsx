import { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/use-auth";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin;

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      {!isSuperAdmin && <Navbar />}
      <main className="flex-1 w-full pb-16 md:pb-0">{children}</main>
      {!isSuperAdmin && <Footer />}
      {!isSuperAdmin && <MobileBottomNav />}
    </div>
  );
}
