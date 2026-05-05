import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { HiOutlineMenu } from "react-icons/hi";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#EAEAEA]">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 min-h-[64px] sm:h-20 sm:min-h-[80px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img 
              src="https://res.cloudinary.com/dv0tt80vn/image/upload/v1777633359/watchman_logo_uc5f1m.webp" 
              alt="Watchman Lekki" 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" 
            />
            <span className="text-lg sm:text-xl font-semibold text-gray-900">
              Watchman Lekki
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="/about" className="text-xs sm:text-sm font-medium hover:text-[#8B0000] text-gray-700">About</Link>
            <Link href="/sermons" className="text-xs sm:text-sm font-medium hover:text-[#8B0000] text-gray-700">Sermons</Link>
            <Link href="/bookmarks" className="text-xs sm:text-sm font-medium hover:text-[#8B0000] text-gray-700">Bookmarks</Link>
            <Link href="/events" className="text-xs sm:text-sm font-medium hover:text-[#8B0000] text-gray-700">Events</Link>
            <Link href="/groups" className="text-xs sm:text-sm font-medium hover:text-[#8B0000] text-gray-700">Groups</Link>
            <Link href="/live" className="text-xs sm:text-sm font-medium hover:text-[#8B0000] text-gray-700">Live</Link>
            <Link href="/give" className="text-xs sm:text-sm font-medium hover:text-[#8B0000] text-gray-700">Give</Link>
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
                <ThemeToggle />
                <Link href="/contact">
                  <Button className="bg-[#8B0000] hover:bg-[#6B0000] text-white px-5 py-2 rounded-md">
                    Contact Now
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
              <SheetContent side="right" className="w-[280px] xs:w-[300px] sm:w-[400px] bg-white border-[#EAEAEA]">
                <div className="flex flex-col gap-4 xs:gap-6 mt-6 xs:mt-8 px-4 xs:px-6">
                  <Link href="/about" onClick={() => setIsOpen(false)}>
                    <span className="text-sm xs:text-base font-medium text-gray-700">About</span>
                  </Link>
                  <Link href="/sermons" onClick={() => setIsOpen(false)}>
                    <span className="text-sm xs:text-base font-medium text-gray-700">Sermons</span>
                  </Link>
                  <Link href="/bookmarks" onClick={() => setIsOpen(false)}>
                    <span className="text-sm xs:text-base font-medium text-gray-700">Bookmarks</span>
                  </Link>
                  <Link href="/events" onClick={() => setIsOpen(false)}>
                    <span className="text-sm xs:text-base font-medium text-gray-700">Events</span>
                  </Link>
                  <Link href="/groups" onClick={() => setIsOpen(false)}>
                    <span className="text-sm xs:text-base font-medium text-gray-700">Groups</span>
                  </Link>
                  <Link href="/live" onClick={() => setIsOpen(false)}>
                    <span className="text-sm xs:text-base font-medium text-gray-700">Live</span>
                  </Link>
                  <Link href="/give" onClick={() => setIsOpen(false)}>
                    <span className="text-sm xs:text-base font-medium text-gray-700">Give</span>
                  </Link>
                  {user?.isAdmin && (
                    <Link href="/admin" onClick={() => setIsOpen(false)}>
                      <span className="text-sm xs:text-base font-light text-[#111111]">Admin</span>
                    </Link>
                  )}
                  {user ? (
                    <>
                      <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                        <span className="text-sm xs:text-base font-light text-[#111111]">Dashboard</span>
                      </Link>
                      <Button
                        variant="ghost"
                        className="text-sm xs:text-base font-light text-[#111111] justify-start p-0"
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <ThemeToggle />
                      <Link href="/contact">
                        <Button className="bg-[#8B0000] hover:bg-[#6B0000] text-white px-5 py-2 rounded-md w-full text-sm xs:text-base">
                          Contact Now
                        </Button>
                      </Link>
                    </div>
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
