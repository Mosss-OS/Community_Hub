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
import { Menu, ChevronDown, LogOut, LayoutDashboard, CalendarCheck, QrCode, Shield, Bell, Music, Mic, Users, Heart, BookOpen, Video, X, MessageCircle, Compass, Search, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSelector } from "@/components/LanguageSelector";
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
  ];

  const isActive = (path: string) => location === path;

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-100" 
          : "bg-white border-b border-slate-100"
      }`}
    >
      <div className="max-w-8xl mx-auto px-6 md:px-8 h-16 md:h-18 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img 
            src={branding?.logoUrl || "/church_logo.jpeg"} 
            alt={branding?.churchName || "CHub"} 
            className="h-9 md:h-10 w-auto rounded-full object-contain"
          />
          <span className="hidden sm:block text-base font-semibold text-slate-900">
            {branding?.churchName || "CHub"}
          </span>
        </Link>

        <div className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2.5 text-[15px] font-medium rounded-lg transition-all duration-200 ${
                isActive(link.href)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          <div className="relative group">
            <button className="px-4 py-2.5 text-[15px] font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 transition-all duration-200">
              {t("media")} <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white border border-slate-100 shadow-xl rounded-xl py-2 w-52 overflow-hidden">
                {mediaLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="relative group">
            <button className="px-4 py-2.5 text-[15px] font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 transition-all duration-200">
              {t("community")} <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white border border-slate-100 shadow-xl rounded-xl py-2 w-52 overflow-hidden">
                {communityLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="relative group">
            <button className="px-4 py-2.5 text-[15px] font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 transition-all duration-200">
              Discover <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white border border-slate-100 shadow-xl rounded-xl py-2 w-52 overflow-hidden">
                {discoverLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSelector variant="navbar" />
          
          {user ? (
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 py-1.5 h-auto rounded-xl hover:bg-slate-50 transition-all relative">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                        {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      {unreadCount?.count ? (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white">
                        </span>
                      ) : null}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-slate-700">
                      {user.firstName || user.email.split('@')[0]}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 z-50 bg-white border-slate-100 shadow-xl rounded-xl p-1">
                  <div className="px-4 py-3.5 border-b border-slate-100 rounded-t-xl">
                    <p className="text-sm font-semibold text-slate-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                  </div>
                  <div className="py-1.5">
                    {user.isAdmin ? (
                      <>
                        <DropdownMenuItem asChild className="cursor-pointer px-3 py-2.5 hover:bg-slate-50 rounded-lg mx-1">
                          <Link href="/admin" className="flex items-center gap-3 text-slate-700">
                            <LayoutDashboard className="w-4.5 h-4.5 text-indigo-600" />
                            <span className="text-sm font-medium">Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer px-3 py-2.5 hover:bg-slate-50 rounded-lg mx-1">
                          <Link href="/admin/sermon-clips" className="flex items-center gap-3 text-slate-700">
                            <Video className="w-4.5 h-4.5 text-indigo-600" />
                            <span className="text-sm font-medium">Sermon Clips</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem asChild className="cursor-pointer px-3 py-2.5 hover:bg-slate-50 rounded-lg mx-1">
                        <Link href="/dashboard" className="flex items-center gap-3 text-slate-700">
                          <LayoutDashboard className="w-4.5 h-4.5 text-indigo-600" />
                          <span className="text-sm font-medium">My Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="cursor-pointer px-3 py-2.5 hover:bg-slate-50 rounded-lg mx-1">
                      <Link href="/attendance" className="flex items-center gap-3 text-slate-700">
                        <CalendarCheck className="w-4.5 h-4.5 text-indigo-600" />
                        <span className="text-sm font-medium">My Attendance</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer px-3 py-2.5 hover:bg-slate-50 rounded-lg mx-1">
                      <Link href="/privacy" className="flex items-center gap-3 text-slate-700">
                        <Shield className="w-4.5 h-4.5 text-indigo-600" />
                        <span className="text-sm font-medium">Privacy & Data</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer px-3 py-2.5 hover:bg-slate-50 rounded-lg mx-1">
                      <Link href="/messages" className="flex items-center gap-3 text-slate-700 w-full">
                        <div className="relative">
                          <Bell className="w-4.5 h-4.5 text-indigo-600" />
                          {unreadCount?.count ? (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold px-0.5">
                              {unreadCount.count > 9 ? '9+' : unreadCount.count}
                            </span>
                          ) : null}
                        </div>
                        <span className="text-sm font-medium flex-1">Messages</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="my-1" />
                  <div className="py-1.5">
                    <DropdownMenuItem onClick={() => logout()} className="cursor-pointer px-3 py-2.5 hover:bg-red-50 rounded-lg mx-1 text-red-600">
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
                className="text-slate-600 hover:text-indigo-600 hover:bg-slate-50 px-4 h-10 rounded-lg"
              >
                <Link href="/login">Log In</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="h-10 px-5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all"
              >
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-lg xl:hidden">
                <Menu className="h-5 w-5 text-slate-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:w-[380px] p-0 bg-white">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                    <img 
                      src="/church_logo.jpeg" 
                      alt="CHub" 
                      className="h-8 w-auto rounded-full object-contain"
                    />
                    <span className="font-semibold text-slate-900">
                      CHub
                    </span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-5 w-5 text-slate-500" />
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-4 min-h-[48px] rounded-xl text-[15px] font-medium transition-colors ${
                        isActive(link.href)
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  <Collapsible open={mediaOpen} onOpenChange={setMediaOpen} className="pt-4 mt-2">
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 min-h-[48px] rounded-xl text-[15px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Media</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${mediaOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 mt-1">
                      {mediaLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-4 min-h-[48px] rounded-xl text-[15px] font-medium transition-colors ${
                            isActive(link.href)
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <link.icon className="w-5 h-5" />
                          {link.label}
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible open={communityOpen} onOpenChange={setCommunityOpen} className="pt-2 mt-2">
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 min-h-[48px] rounded-xl text-[15px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Community</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${communityOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 mt-1">
                      {communityLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-4 min-h-[48px] rounded-xl text-[15px] font-medium transition-colors ${
                            isActive(link.href)
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <link.icon className="w-5 h-5" />
                          {link.label}
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible open={discoverOpen} onOpenChange={setDiscoverOpen} className="pt-2 mt-2">
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 min-h-[48px] rounded-xl text-[15px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Discover</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${discoverOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 mt-1">
                      {discoverLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-4 min-h-[48px] rounded-xl text-[15px] font-medium transition-colors ${
                            isActive(link.href)
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <link.icon className="w-5 h-5" />
                          {link.label}
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                  
                  {user && (
                    <>
                      <div className="pt-4 mt-2 border-t border-slate-100">
                        {(user.isAdmin || user.isSuperAdmin) && (
                          <Link
                            href="/super-admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-4 min-h-[48px] rounded-xl text-[15px] font-medium transition-colors ${
                              isActive("/super-admin")
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <Shield className="w-5 h-5" />
                            Super Admin
                          </Link>
                        )}
                        <Link
                          href={user.isAdmin ? "/admin" : "/dashboard"}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-4 min-h-[48px] rounded-xl text-[15px] font-medium transition-colors ${
                            isActive("/dashboard") || isActive("/admin")
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          {user.isAdmin ? "Admin Dashboard" : "My Dashboard"}
                        </Link>
                        <Link
                          href="/attendance"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-4 min-h-[48px] rounded-xl text-[15px] font-medium transition-colors ${
                            isActive("/attendance")
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <CalendarCheck className="w-5 h-5" />
                          My Attendance
                        </Link>
                        <Link
                          href="/attendance/scan"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-4 min-h-[48px] rounded-xl text-[15px] font-medium transition-colors ${
                            isActive("/attendance/scan")
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <QrCode className="w-5 h-5" />
                          Scan QR
                        </Link>
                        <Link
                          href="/messages"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-4 min-h-[48px] rounded-xl text-[15px] font-medium transition-colors ${
                            isActive("/messages")
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <Bell className="w-5 h-5" />
                          Messages
                        </Link>
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-3 px-4 py-4 min-h-[48px] rounded-xl text-[15px] font-medium transition-colors text-red-600 hover:bg-red-50 w-full"
                        >
                          <LogOut className="w-5 h-5" />
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
                
                {!user && (
                  <div className="p-4 border-t border-slate-100 space-y-2">
                    <Button asChild variant="outline" className="w-full h-11 rounded-xl border-slate-200" onClick={() => setMobileMenuOpen(false)}>
                      <Link href="/login">Log In</Link>
                    </Button>
                    <Button asChild className="w-full h-11 rounded-xl bg-slate-900" onClick={() => setMobileMenuOpen(false)}>
                      <Link href="/login">Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
