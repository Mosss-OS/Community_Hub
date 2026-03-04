import { Link } from "wouter";
import { format } from "date-fns";
import { MapPin, Clock, Calendar, Check, CalendarPlus, Share2, Facebook, Twitter, Linkedin, Instagram, Link as LinkIcon, ChevronDown, Download } from "lucide-react";
import type { Event } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRsvpEvent, useUserRsvps, useAddToCalendar, useCalendarLinks } from "@/hooks/use-events";
import { useToast } from "@/hooks/use-toast";
import { apiRoutes } from "@/lib/api-routes";
import { buildApiUrl } from "@/lib/api-config";
import { useState } from "react";
import { motion } from "framer-motion";

interface EventCardProps {
  event: Event & { rsvpCount?: number };
}

function CalendarDropdown({ event, onClose }: { event: Event; onClose: () => void }) {
  const { data: calendarLinks, isLoading } = useCalendarLinks(event.id);
  const { toast } = useToast();

  const handleDownloadICS = () => {
    if (calendarLinks?.ics) {
      const blob = new Blob([calendarLinks.ics], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Calendar file downloaded" });
      onClose();
    }
  };

  const calendarOptions = [
    { 
      name: 'Google Calendar', 
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: '📅',
      url: calendarLinks?.google,
      requiresDownload: false
    },
    { 
      name: 'Outlook', 
      color: 'bg-blue-800 hover:bg-blue-900',
      icon: '📧',
      url: calendarLinks?.outlook,
      requiresDownload: false
    },
    { 
      name: 'Apple Calendar', 
      color: 'bg-gray-600 hover:bg-gray-700',
      icon: '🍎',
      action: handleDownloadICS,
      requiresDownload: true
    },
    { 
      name: 'Yahoo Calendar', 
      color: 'bg-purple-600 hover:bg-purple-700',
      icon: '📌',
      url: calendarLinks?.yahoo,
      requiresDownload: false
    },
  ];

  if (isLoading) {
    return (
      <div className="absolute bottom-full mb-2 right-0 bg-white border rounded-lg shadow-lg py-3 min-w-[200px] z-20">
        <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-full mb-2 right-0 bg-white border rounded-lg shadow-lg py-2 min-w-[200px] z-20">
      <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase">Add to Calendar</div>
      {calendarOptions.map((option) => (
        option.action ? (
          <button
            key={option.name}
            onClick={option.action}
            className={`w-full px-4 py-2 text-left text-sm text-white flex items-center gap-2 ${option.color} transition-colors`}
          >
            <span>{option.icon}</span>
            <Download className="w-4 h-4" />
            {option.name}
          </button>
        ) : (
          <button
            key={option.name}
            onClick={() => {
              if (option.url) {
                window.open(option.url, '_blank');
                onClose();
              }
            }}
            disabled={!option.url}
            className={`w-full px-4 py-2 text-left text-sm text-white flex items-center gap-2 ${option.url ? option.color : 'bg-gray-300 cursor-not-allowed'} transition-colors`}
          >
            <span>{option.icon}</span>
            {option.name}
          </button>
        )
      ))}
    </div>
  );
}

function SocialShareMenu({ event, onClose }: { event: Event; onClose: () => void }) {
  const eventUrl = `${window.location.origin}/events/${event.id}`;
  const eventTitle = event.title;
  
  const shareOptions = [
    { 
      name: 'Facebook', 
      icon: Facebook, 
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`
    },
    { 
      name: 'X (Twitter)', 
      icon: Twitter, 
      color: 'bg-black hover:bg-gray-800',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(eventTitle)}&url=${encodeURIComponent(eventUrl)}`
    },
    { 
      name: 'WhatsApp', 
      icon: (props: any) => <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4" {...props} />, 
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(eventTitle + ' ' + eventUrl)}`
    },
    { 
      name: 'Instagram', 
      icon: Instagram, 
      color: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 hover:opacity-90',
      url: `https://www.instagram.com/` // Instagram doesn't have direct share URL
    },
    { 
      name: 'LinkedIn', 
      icon: Linkedin, 
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`
    },
    { 
      name: 'TikTok', 
      icon: (props: any) => <img src="https://upload.wikimedia.org/wikipedia/commons/3/3e/TikTok_logo_2017.svg" alt="TikTok" className="w-4 h-4" {...props} />, 
      color: 'bg-black hover:bg-gray-800',
      url: `https://www.tiktok.com/` // TikTok doesn't have web share
    },
  ];

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    onClose();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
    } catch {
      // Fallback
    }
    onClose();
  };

  return (
    <div className="absolute bottom-full mb-2 right-0 bg-white border rounded-lg shadow-lg py-2 min-w-[180px] z-20">
      {shareOptions.map((option) => (
        <button
          key={option.name}
          onClick={() => handleShare(option.url)}
          className={`w-full px-4 py-2 text-left text-sm text-white flex items-center gap-2 ${option.color} transition-colors`}
        >
          <option.icon className="w-4 h-4" />
          {option.name}
        </button>
      ))}
      <button
        onClick={handleCopyLink}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
      >
        <LinkIcon className="w-4 h-4" />
        Copy Link
      </button>
    </div>
  );
}

export function EventCard({ event }: EventCardProps) {
  const { user } = useAuth();
  const { mutate: rsvp, isPending: isRsvpPending } = useRsvpEvent();
  const { mutate: addToCalendar, isPending: isAddingToCalendar } = useAddToCalendar();
  const { data: userRsvps } = useUserRsvps();
  const { toast } = useToast();
  const eventDate = new Date(event.date);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);

  // Check if user has RSVP'd to this event
  const userRsvp = userRsvps?.find((r: any) => Number(r.eventId) === Number(event.id));
  const isRsvped = !!userRsvp;
  const isAddedToCalendar = userRsvp?.addedToCalendar;

  const handleRsvp = () => {
    if (!user) {
      window.location.href = buildApiUrl(apiRoutes.auth.login);
      return;
    }
    rsvp(event.id, {
      onSuccess: () => {
        toast({
          title: "RSVP Confirmed!",
          description: "We look forward to seeing you there.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Could not RSVP. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const handleAddToCalendar = () => {
    addToCalendar(event.id, {
      onSuccess: () => {
        toast({
          title: "Added to Calendar",
          description: "Event has been added to your calendar.",
        });
      },
      onError: () => {
        toast({
          title: "Note",
          description: "Please add the event to your calendar manually if it didn't open.",
        });
      },
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="flex flex-col md:flex-row overflow-hidden border-border/50 hover:border-primary/20 transition-all duration-300 rounded-none">
        <div className="md:w-1/3 bg-muted relative min-h-[180px] md:min-h-full">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-full object-cover absolute inset-0"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-4xl md:text-5xl font-display font-bold text-muted-foreground/20">
              {format(eventDate, "dd")}
            </span>
          </div>
        )}
        <div className="absolute top-4 md:top-5 left-4 md:left-5 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-lg text-center shadow-sm">
          <div className="text-[10px] md:text-xs font-bold uppercase text-primary">{format(eventDate, "MMM")}</div>
          <div className="text-xl md:text-2xl font-display font-bold leading-none">{format(eventDate, "dd")}</div>
        </div>
      </div>
      <CardContent className="flex-1 p-6 md:p-8 flex flex-col justify-between">
        <div>
          <h3 className="font-display font-bold text-xl md:text-2xl mb-3 md:mb-4">{event.title}</h3>
          <p className="text-muted-foreground line-clamp-2 mb-5 md:mb-6 text-base md:text-lg">
            {event.description}
          </p>
          <div className="space-y-2.5 md:space-y-3 text-sm md:text-base text-muted-foreground mb-5 md:mb-8">
            <div className="flex items-center gap-2.5 md:gap-3">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <span>{format(eventDate, "h:mm a")}</span>
            </div>
            <div className="flex items-center gap-2.5 md:gap-3">
              <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <span>{event.location}</span>
            </div>
            {(event as any).rsvpCount !== undefined && (
              <div className="flex items-center gap-2.5 md:gap-3">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                <span className="text-green-600 font-medium">{(event as any).rsvpCount} attending</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {isRsvped ? (
            <>
              <Button 
                variant="default"
                disabled
                className="flex-1 sm:flex-none text-sm md:text-base py-3 md:py-3.5 bg-green-600 cursor-not-allowed rounded-lg"
              >
                <Check className="w-4 h-4 mr-1.5" /> RSVPED
              </Button>
              <div className="relative">
                <Button 
                  variant="outline"
                  className="flex-1 sm:flex-none text-sm md:text-base py-3 md:py-3.5 rounded-lg"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  <Share2 className="w-4 h-4 mr-1.5" /> Share
                </Button>
                {showShareMenu && (
                  <SocialShareMenu event={event} onClose={() => setShowShareMenu(false)} />
                )}
              </div>
              <div className="relative">
                <Button 
                  variant="outline"
                  disabled={isAddingToCalendar}
                  className="flex-1 sm:flex-none text-sm md:text-base py-3 md:py-3.5 rounded-lg"
                  onClick={() => setShowCalendarMenu(!showCalendarMenu)}
                >
                  {isAddingToCalendar ? "Adding..." : isAddedToCalendar ? <><Calendar className="w-4 h-4 mr-1.5" /> Calendar</> : <><CalendarPlus className="w-4 h-4 mr-1.5" /> Add to Calendar</>}
                </Button>
                {showCalendarMenu && (
                  <CalendarDropdown event={event} onClose={() => setShowCalendarMenu(false)} />
                )}
              </div>
            </>
          ) : (
            <>
              <Button 
                onClick={handleRsvp} 
                disabled={isRsvpPending}
                className="flex-1 md:flex-none text-sm md:text-base py-3 md:py-3.5 rounded-lg"
              >
                {isRsvpPending ? "Confirming..." : "RSVP"}
              </Button>
              <div className="relative">
                <Button 
                  variant="outline"
                  className="flex-1 md:flex-none text-sm md:text-base py-3 md:py-3.5 rounded-lg"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  <Share2 className="w-4 h-4 mr-1.5" /> Share
                </Button>
                {showShareMenu && (
                  <SocialShareMenu event={event} onClose={() => setShowShareMenu(false)} />
                )}
              </div>
            </>
          )}
          <Button variant="outline" asChild className="flex-1 md:flex-none text-sm md:text-base py-3 md:py-3.5 rounded-lg">
            <Link href={`/events/${event.id}`}>Details</Link>
          </Button>
        </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
