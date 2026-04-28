import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { HiOutlineMenu } from "react-icons/hi";

export function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#EAEAEA]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between h-20 min-h-[80px] px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-light tracking-tight text-[#111111]">
              Community<span className="font-normal">Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavigationMenu>
              <NavigationMenuList className="flex gap-1">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-light text-[#666666] hover:text-[#111111] px-3 py-2">
                    Sermons
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-6 bg-white border border-[#EAEAEA] rounded-lg">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link href="/sermons" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-[#F8F8F8]">
                            <div className="text-sm font-light text-[#111111]">Browse Sermons</div>
                            <p className="text-xs font-light text-[#666666]">
                              Watch and listen to teachings
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link href="/sermons/topics" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-[#F8F8F8]">
                            <div className="text-sm font-light text-[#111111]">Topics</div>
                            <p className="text-xs font-light text-[#666666]">
                              Browse by category
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-light text-[#666666] hover:text-[#111111] px-3 py-2">
                    Events
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-6 bg-white border border-[#EAEAEA] rounded-lg">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link href="/events" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-[#F8F8F8]">
                            <div className="text-sm font-light text-[#111111]">All Events</div>
                            <p className="text-xs font-light text-[#666666]">
                              Upcoming gatherings
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link href="/calendar" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-[#F8F8F8]">
                            <div className="text-sm font-light text-[#111111]">Calendar</div>
                            <p className="text-xs font-light text-[#666666]">
                              View full calendar
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/give">
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-sm font-light text-[#666666] hover:text-[#111111] px-3 py-2")}>
                      Give
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                {user?.isAdmin && (
                  <NavigationMenuItem>
                    <Link href="/admin">
                      <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-sm font-light text-[#666666] hover:text-[#111111] px-3 py-2")}>
                        Admin
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-sm font-light text-[#666666] hover:text-[#111111]">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="text-sm font-light text-[#666666] hover:text-[#111111]"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" className="text-sm font-light text-[#666666] hover:text-[#111111]">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-[#111111] text-white hover:bg-[#333333] text-sm font-light px-5 py-2 rounded-md">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <HiOutlineMenu className="h-6 w-6 text-[#666666]" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white border-[#EAEAEA]">
                <div className="flex flex-col gap-6 mt-8 px-6">
                  <Link href="/sermons" onClick={() => setIsOpen(false)}>
                    <span className="text-base font-light text-[#111111]">Sermons</span>
                  </Link>
                  <Link href="/events" onClick={() => setIsOpen(false)}>
                    <span className="text-base font-light text-[#111111]">Events</span>
                  </Link>
                  <Link href="/give" onClick={() => setIsOpen(false)}>
                    <span className="text-base font-light text-[#111111]">Give</span>
                  </Link>
                  {user?.isAdmin && (
                    <Link href="/admin" onClick={() => setIsOpen(false)}>
                      <span className="text-base font-light text-[#111111]">Admin</span>
                    </Link>
                  )}
                  {user ? (
                    <>
                      <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                        <span className="text-base font-light text-[#111111]">Dashboard</span>
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="justify-start p-0 text-base font-light text-[#666666]"
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <span className="text-base font-light text-[#111111]">Login</span>
                      </Link>
                      <Link href="/register" onClick={() => setIsOpen(false)}>
                        <Button className="bg-[#111111] text-white hover:bg-[#333333] text-sm font-light px-5 py-2 rounded-md w-full">
                          Sign Up
                        </Button>
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
