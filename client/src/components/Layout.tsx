import { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin;

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      {!isSuperAdmin && <Navbar />}
      <main className="flex-1 w-full">{children}</main>
      {!isSuperAdmin && <Footer />}
    </div>
  );
}
