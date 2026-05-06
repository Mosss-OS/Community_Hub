"use client";

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { LuHome, LuSearch, LuPlusCircle, LuBell, LuUser } from 'react-icons/lu';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/give", icon: PlusCircle, label: "Give" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function MobileBottomNav() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleNav = (href: string) => {
    setLocation(href);
  };

  const getHref = (item: typeof navItems[0]) => {
    if (item.href === "/profile" && user) {
      return `/members/${user.id}`;
    }
    if (item.href === "/notifications" && user) {
      return `/notifications`;
    }
    return item.href;
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50 transition-transform duration-300 md:hidden ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center justify-around h-20 px-4">
        {navItems.map((item) => {
          const isActive = location === item.href || 
            (item.href === "/notifications" && location.startsWith("/notifications")) ||
            (item.href === "/profile" && location.startsWith("/members/"));
          const Icon = item.icon;
          
          return (
            <Button
              key={item.href}
              variant="ghost"
              size="icon"
              className={`flex flex-col h-14 min-h-[56px] w-16 rounded-lg transition-colors ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => handleNav(getHref(item))}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-0.5">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
