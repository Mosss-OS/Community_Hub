import { useState, useEffect } from "react";
import { Link } from "wouter";
import { LuPlus, LuVideo, LuCalendar, LuHeart, LuPencil } from "react-icons/lu";
import { useAuth } from "@/hooks/use-auth";

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user } = useAuth();

  const quickActions = [
    { href: "/feed", icon: LuPencil, label: "New Post", iconClass: "bg-blue-500" },
    { href: "/events/new", icon: LuCalendar, label: "New Event", iconClass: "bg-green-500" },
    { href: "/prayer", icon: LuHeart, label: "Prayer", iconClass: "bg-pink-500" },
    { href: "/admin/live-stream/new", icon: LuVideo, label: "Go Live", iconClass: "bg-red-500", adminOnly: true },
  ];

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

  if (!user) return null;

  return (
    <div className={`fixed bottom-24 right-6 z-50 transition-transform duration-300 ${isVisible ? "translate-y-0" : "translate-y-full"}`}>
      {/* Quick Actions Menu */}
      <div className={`flex flex-col gap-3 mb-4 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {quickActions.map((action) => {
          if (action.adminOnly && !user.isAdmin) return null;
          return (
            <Link key={action.href} href={action.href} onClick={() => setIsOpen(false)}>
              <div className="flex items-center gap-3">
                <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm shadow-md">
                  {action.label}
                </span>
                <div className={`w-12 h-12 rounded-full ${action.iconClass} flex items-center justify-center shadow-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

       {/* Main FAB */}
       <button
         onClick={() => setIsOpen(!isOpen)}
         className={`w-14 h-14 rounded-full bg-[#8B0000] hover:bg-[#6B0000] flex items-center justify-center shadow-lg transition-transform ${
           isOpen ? "rotate-45" : ""
         }`}
       >
         <LuPlus className="w-7 h-7 text-white" />
       </button>
    </div>
  );
}