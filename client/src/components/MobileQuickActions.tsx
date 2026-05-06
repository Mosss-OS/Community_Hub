"use client";

import { Link } from "wouter";
import { LuCalendar, LuHeart, LuGift, LuMessageSquare, LuUsers, LuBookOpen, LuVideo, LuBell, LuPlus } from 'react-icons/lu';
import { Button } from "@/components/ui/button";

interface QuickAction {
  href: string;
  icon: React.ElementType;
  label: string;
  color: string;
}

const quickActions: QuickAction[] = [
  { href: "/events", icon: Calendar, label: "Events", color: "bg-blue-500" },
  { href: "/prayer", icon: Heart, label: "Prayer", color: "bg-pink-500" },
  { href: "/give", icon: Gift, label: "Give", color: "bg-green-500" },
  { href: "/messages", icon: MessageSquare, label: "Messages", color: "bg-purple-500" },
  { href: "/groups", icon: Users, label: "Groups", color: "bg-orange-500" },
  { href: "/sermons", icon: BookOpen, label: "Sermons", color: "bg-teal-500" },
  { href: "/live-stream", icon: Video, label: "Live", color: "bg-red-500" },
  { href: "/notifications", icon: Bell, label: "Alerts", color: "bg-amber-500" },
];

interface MobileQuickActionsProps {
  limit?: number;
}

export function MobileQuickActions({ limit = 8 }: MobileQuickActionsProps) {
  const displayedActions = quickActions.slice(0, limit);

  return (
    <div className="grid grid-cols-4 gap-2 md:hidden">
      {displayedActions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.href} href={action.href}>
            <Button
              variant="ghost"
              className="flex flex-col h-16 w-full gap-1 rounded-xl hover:bg-muted/50"
            >
              <div className={`h-8 w-8 rounded-lg ${action.color} flex items-center justify-center`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-[10px] font-medium">{action.label}</span>
            </Button>
          </Link>
        );
      })}
    </div>
  );
}

export function FloatingActionButton() {
  return (
    <div className="fixed bottom-20 right-4 z-40 md:hidden">
      <Link href="/give">
        <Button size="lg" className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90">
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
}

export function QuickActionMenu() {
  const menuActions = [
    { href: "/prayer", icon: Heart, label: "New Prayer Request" },
    { href: "/events", icon: Calendar, label: "View Events" },
    { href: "/give", icon: Gift, label: "Give" },
    { href: "/groups", icon: Users, label: "Join Group" },
    { href: "/sermons", icon: BookOpen, label: "Watch Sermons" },
  ];

  return (
    <div className="md:hidden">
      <details className="group">
        <summary className="flex items-center justify-center">
          <Button size="lg" className="rounded-full shadow-lg h-12 w-12">
            <Plus className="h-5 w-5" />
          </Button>
        </summary>
        <div className="fixed bottom-24 right-4 space-y-2 z-50">
          {menuActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 shadow-md w-auto"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </details>
    </div>
  );
}
