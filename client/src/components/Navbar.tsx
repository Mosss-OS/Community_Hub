import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-messages";
import { useLanguage } from "@/hooks/use-language";
import { useBranding } from "@/hooks/use-branding";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown, LogOut, LayoutDashboard, CalendarCheck, QrCode, Shield, Bell, Music, Mic, Users, Heart, BookOpen, Video, X, MessageCircle, Compass, Sparkles, PartyPopper } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSelector } from "@/components/LanguageSelector";

export function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { data: unreadCount } = useUnreadCount();
  const { data: branding } = useBranding();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/sermons", label: "Sermons" },
    { href: "/events", label: "Events" },
    { href: "/devotionals", label: "Devotionals" },
    { href: "/give", label: "Give" },
    { href: "/members", label: "Members" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white">
      <div className="w-full px-4 sm:px-8 md:px-24 pt-6 md:pt-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          {/* Logo - Left */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img
                src={branding?.logoUrl || "/church_logo.jpeg"}
                alt="CHub"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Nav Links - Center */}
          <div className="hidden lg:flex items-center justify-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors hover:text-primary ${
                  isActive(link.href) ? "text-primary" : "text-[#505153]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons - Right */}
          <div className="flex items-center justify-end gap-3 md:gap-4">
            <LanguageSelector variant="navbar" />
            
            {user ? (
              <Link href="/dashboard" className="hidden md:block text-sm text-[#505153] hover:text-primary transition-colors">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden md:block text-sm text-[#505153] hover:text-primary transition-colors">
                  Log in
                </Link>
                <Link 
                  href="/login" 
                  className="px-4 md:px-6 py-3 md:py-[14px] border border-primary text-primary text-xs md:text-sm hover:bg-primary hover:text-white transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm">
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg text-[#505153] hover:text-primary transition-colors py-2"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t border-border my-4" />
                  {!user && (
                    <>
                      <Link href="/login" className="text-lg text-[#505153] py-2">
                        Log in
                      </Link>
                      <Link href="/login" className="px-6 py-3 bg-primary text-white text-center">
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
