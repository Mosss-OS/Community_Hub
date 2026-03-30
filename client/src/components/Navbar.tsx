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
import { ThemeToggle } from "@/components/ThemeToggle";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { data: unreadCount } = useUnreadCount();
  const { data: branding } = useBranding();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/live", label: t("live") },
    { href: "/events", label: t("events") },
    { href: "/prayer", label: t("prayer") },
    { href: "/volunteer", label: t("volunteer") },
    { href: "/devotionals", label: t("devotionals") },
    { href: "/give", label: t("give") },
  ];

  const discoverLinks = [
    { href: "/members", label: t("members") || "Members", icon: Users },
    { href: "/staff", label: "Staff & Leaders", icon: Shield },
    { href: "/groups", label: t("groups"), icon: Compass },
  ];

  const mediaLinks = [
    { href: "/sermons", label: t("sermons"), icon: Mic },
    { href: "/music", label: t("music"), icon: Music },
    { href: "/bible", label: t("bible"), icon: BookOpen },
    { href: "/discipleship", label: t("discipleship"), icon: Sparkles },
  ];

  const communityLinks = [
    { href: "/feed", label: t("feed") || "Feed", icon: MessageCircle },
    { href: "/house-cells", label: t("houseCells"), icon: Heart },
    { href: "/celebrations", label: "Celebrations", icon: PartyPopper },
  ];

  const isActive = (path: string) => location === path;

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "glass-card-strong shadow-lg"
          : "bg-background/80 backdrop-blur-md border-b border-border/20"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 md:px-10 h-14 sm:h-16 md:h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative">
            <img
              src={branding?.logoUrl || "/church_logo.jpeg"}
              alt={branding?.churchName || "CHub"}
              className="h-8 sm:h-10 md:h-11 w-auto rounded-xl sm:rounded-2xl object-contain ring-2 ring-primary/15 shadow-lg shadow-primary/10"
            />
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-bold font-[--font-display] text-foreground tracking-tight">
              {branding?.churchName || "CHub"}
            </span>
          </div>
        </Link>

        {/* Tablet nav (md to xl) */}
        <div className="hidden md:flex xl:hidden items-center gap-0.5">
          {[
            { label: t("home"), links: navLinks },
            { label: t("media"), links: mediaLinks },
            { label: t("community"), links: communityLinks },
            { label: "Discover", links: discoverLinks },
          ].map((group) => (
            <div key={group.label} className="relative group">
              <button className="px-3 py-2 text-[13px] font-semibold text-foreground/60 hover:text-primary rounded-xl flex items-center gap-1 transition-all duration-200">
                {group.label} <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="glass-card-strong shadow-2xl rounded-2xl py-2 w-52 overflow-hidden">
                  {group.links.map((link) => {
                    const Icon = 'icon' in link ? (link as any).icon : null;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors ${
                          isActive(link.href)
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/60 hover:bg-primary/5 hover:text-primary"
                        }`}
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop nav (xl+) */}
        <div className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 text-[14px] font-semibold rounded-xl transition-all duration-200 ${
                isActive(link.href)
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-foreground/55 hover:text-primary hover:bg-primary/5"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Dropdowns */}
          {[
            { label: t("media"), links: mediaLinks },
            { label: t("community"), links: communityLinks },
            { label: "Discover", links: discoverLinks },
          ].map((group) => (
            <div key={group.label} className="relative group">
              <button className="px-4 py-2 text-[14px] font-semibold text-foreground/55 hover:text-primary rounded-xl flex items-center gap-1.5 transition-all duration-200">
                {group.label} <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="glass-card-strong shadow-2xl rounded-2xl py-2 w-56 overflow-hidden">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 px-4 py-3 text-[14px] text-foreground/60 hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSelector variant="navbar" />

          {user ? (
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 py-1.5 h-auto rounded-2xl hover:bg-muted/50 transition-all relative">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-2xl gradient-accent flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20">
                        {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      {unreadCount?.count ? (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-[10px] font-bold border-2 border-card"></span>
                      ) : null}
                    </div>
                    <span className="hidden md:block text-sm font-semibold text-foreground/70">
                      {user.firstName || user.email.split('@')[0]}
                    </span>
                    <ChevronDown className="w-4 h-4 text-foreground/30" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 z-50 glass-card-strong shadow-2xl rounded-2xl p-1">
                  <div className="px-4 py-3.5 border-b border-border/30 rounded-t-xl">
                    <p className="text-sm font-bold text-foreground">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                  </div>
                  <div className="py-1.5">
                    {user.isAdmin ? (
                      <>
                        <DropdownMenuItem asChild className="cursor-pointer px-3 py-2.5 hover:bg-primary/5 rounded-xl mx-1">
                          <Link href="/admin" className="flex items-center gap-3 text-foreground/70">
                            <LayoutDashboard className="w-4.5 h-4.5 text-primary" />
                            <span className="text-sm font-medium">Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer px-3 py-2.5 hover:bg-primary/5 rounded-xl mx-1">
                          <Link href="/admin/sermon-clips" className="flex items-center gap-3 text-foreground/70">
                            <Video className="w-4.5 h-4.5 text-primary" />
                            <span className="text-sm font-medium">Sermon Clips</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem asChild className="cursor-pointer px-3 py-2.5 hover:bg-primary/5 rounded-xl mx-1">
                        <Link href="/dashboard" className="flex items-center gap-3 text-foreground/70">
                          <LayoutDashboard className="w-4.5 h-4.5 text-primary" />
                          <span className="text-sm font-medium">My Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="cursor-pointer px-3 py-2.5 hover:bg-primary/5 rounded-xl mx-1">
                      <Link href="/attendance" className="flex items-center gap-3 text-foreground/70">
                        <CalendarCheck className="w-4.5 h-4.5 text-primary" />
                        <span className="text-sm font-medium">My Attendance</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer px-3 py-2.5 hover:bg-primary/5 rounded-xl mx-1">
                      <Link href="/privacy" className="flex items-center gap-3 text-foreground/70">
                        <Shield className="w-4.5 h-4.5 text-primary" />
                        <span className="text-sm font-medium">Privacy & Data</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer px-3 py-2.5 hover:bg-primary/5 rounded-xl mx-1">
                      <Link href="/messages" className="flex items-center gap-3 text-foreground/70 w-full">
                        <div className="relative">
                          <Bell className="w-4.5 h-4.5 text-primary" />
                          {unreadCount?.count ? (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-accent rounded-full flex items-center justify-center text-accent-foreground text-[10px] font-bold px-0.5">
                              {unreadCount.count > 9 ? '9+' : unreadCount.count}
                            </span>
                          ) : null}
                        </div>
                        <span className="text-sm font-medium flex-1">Messages</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="my-1 bg-border/30" />
                  <div className="py-1.5">
                    <DropdownMenuItem onClick={() => logout()} className="cursor-pointer px-3 py-2.5 hover:bg-destructive/10 rounded-xl mx-1 text-destructive">
                      <LogOut className="w-4.5 h-4.5 mr-3" />
                      <span className="text-sm font-medium">Sign out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-foreground/55 hover:text-primary px-4 h-10 rounded-xl font-semibold"
              >
                <Link href="/login">Log In</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="h-10 px-5 gradient-accent text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
              >
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl md:hidden">
                <Menu className="h-5 w-5 text-foreground/60" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0 glass-card-strong border-l border-border/20">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-3 sm:p-5 border-b border-border/20">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                    <img src="/church_logo.jpeg" alt="CHub" className="h-8 w-auto rounded-xl object-contain" />
                    <span className="font-bold text-foreground">CHub</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-0.5">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2.5 sm:px-4 sm:py-4 min-h-[40px] sm:min-h-[48px] rounded-xl sm:rounded-2xl text-[13px] sm:text-[15px] font-semibold transition-all ${
                        isActive(link.href)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/60 hover:bg-muted/50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {[
                    { label: t("media"), links: mediaLinks, open: mediaOpen, setOpen: setMediaOpen },
                    { label: t("community"), links: communityLinks, open: communityOpen, setOpen: setCommunityOpen },
                    { label: "Discover", links: discoverLinks, open: discoverOpen, setOpen: setDiscoverOpen },
                  ].map(({ label, links, open, setOpen }) => (
                    <Collapsible key={label} open={open} onOpenChange={setOpen}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 sm:px-4 sm:py-4 min-h-[40px] sm:min-h-[48px] rounded-xl sm:rounded-2xl text-[13px] sm:text-[15px] font-semibold text-foreground/60 hover:bg-muted/50 transition-all">
                        {label}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-2 sm:pl-3 space-y-0.5 mt-0.5">
                        {links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-3 min-h-[36px] sm:min-h-[44px] rounded-lg sm:rounded-xl text-[12px] sm:text-[14px] text-foreground/55 hover:text-primary hover:bg-primary/5 transition-colors"
                          >
                            <link.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {link.label}
                          </Link>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>

                <div className="p-4 border-t border-border/20">
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-4 py-3 glass-card rounded-2xl">
                        <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center text-primary-foreground font-bold shadow-md">
                          {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{user.firstName || user.email.split('@')[0]}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Link
                        href={user.isAdmin ? "/admin" : "/dashboard"}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 min-h-[48px] rounded-xl text-sm font-semibold text-foreground/60 hover:bg-muted/50 flex items-center gap-3"
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                        {user.isAdmin ? "Admin Dashboard" : "My Dashboard"}
                      </Link>
                      <button
                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                        className="w-full px-4 py-3 min-h-[48px] rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 flex items-center gap-3 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button asChild className="w-full h-12 rounded-2xl gradient-accent text-primary-foreground font-bold shadow-lg">
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
