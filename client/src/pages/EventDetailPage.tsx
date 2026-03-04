import { useRoute } from "wouter";
import { useEventWithRsvps, useRsvpEvent, useUserRsvps, useAddToCalendar } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, ArrowLeft, Share2, CalendarPlus, Check, Facebook, Twitter, Linkedin, Instagram, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useState } from "react";

function generateCalendarLink(event: any): string {
  const eventDate = new Date(event.date);
  const startDate = eventDate.toISOString().replace(/-|:|\.\d{3}/g, "").slice(0, 15);
  const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d{3}/g, "").slice(0, 15);
  
  const title = encodeURIComponent(event.title);
  const description = encodeURIComponent(event.description);
  const location = encodeURIComponent(event.location);
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${description}&location=${location}`;
}

function SocialShareMenu({ event, onClose }: { event: any; onClose: () => void }) {
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
      url: `https://www.instagram.com/`
    },
    { 
      name: 'LinkedIn', 
      icon: Linkedin, 
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`
    },
  ];

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    onClose();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
    } catch {}
    onClose();
  };

  return (
    <div className="absolute bottom-full mb-2 left-0 bg-white border rounded-lg shadow-lg py-2 min-w-[180px] z-20">
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

export default function EventDetailPage() {
  const [, params] = useRoute<{ id: string }>("/events/:id");
  const eventId = params?.id ? parseInt(params.id) : null;
  const { data: event, isLoading, error } = useEventWithRsvps(eventId!);
  const { data: userRsvps } = useUserRsvps();
  const { user } = useAuth();
  const { mutate: rsvp, isPending: isRsvpPending } = useRsvpEvent();
  const { mutate: addToCalendar, isPending: isAddingToCalendar } = useAddToCalendar();
  const { toast } = useToast();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [justRsvped, setJustRsvped] = useState(false);

  // Check if user has RSVP'd to this event (from server or just RSVP'd locally)
  const userRsvp = userRsvps?.find((r: any) => Number(r.eventId) === Number(eventId));
  const isRsvped = !!userRsvp || justRsvped;
  const isAddedToCalendar = userRsvp?.addedToCalendar;

  const handleRsvp = () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setJustRsvped(true);
    rsvp(eventId!, {
      onSuccess: () => {
        toast({
          title: "RSVP Confirmed!",
          description: "We look forward to seeing you there.",
        });
      },
      onError: () => {
        setJustRsvped(false);
        toast({
          title: "Error",
          description: "Could not RSVP. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const handleAddToCalendar = () => {
    if (!event) return;
    const calendarUrl = generateCalendarLink(event);
    window.open(calendarUrl, "_blank");
    
    addToCalendar(eventId!, {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
          <Skeleton className="h-8 w-32 mb-10" />
          <Skeleton className="h-14 w-2/3 mb-4" />
          <Skeleton className="h-6 w-1/3 mb-10" />
          <Skeleton className="h-72 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full mt-6 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-5">Event not found</h1>
          <Button asChild>
            <Link href="/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        {/* Back Button */}
        <Link href="/events" className="inline-flex items-center gap-2 text-base text-gray-500 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">{event.title}</h1>
          <div className="flex flex-wrap gap-5 text-base text-gray-500">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5" />
              <span>{format(eventDate, "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5" />
              <span>{format(eventDate, "h:mm a")}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-5 h-5" />
              <span>{event.location}</span>
            </div>
            {(event as any).rsvpCount !== undefined && (
              <div className="flex items-center gap-2.5 text-green-600 font-medium">
                <Calendar className="w-5 h-5" />
                <span>{(event as any).rsvpCount} interested</span>
              </div>
            )}
          </div>
        </div>

        {/* Image */}
        {event.imageUrl && (
          <div className="aspect-[16/9] rounded-3xl overflow-hidden mb-8 bg-gray-50">
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description */}
          <div className="lg:col-span-2">
            <Card className="border border-gray-100">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-5">About this event</h2>
                <p className="text-gray-600 leading-relaxed text-lg">{event.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="border border-gray-100 sticky top-24">
              <CardContent className="p-8">
                <h3 className="font-semibold text-gray-900 mb-5 text-xl">Event Details</h3>
                <div className="space-y-5 mb-6">
                  <div className="flex items-center gap-3.5 text-gray-600">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900 text-lg">{format(eventDate, "MMMM d, yyyy")}</p>
                      <p className="text-base">{format(eventDate, "EEEE")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5 text-gray-600">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900 text-lg">{format(eventDate, "h:mm a")}</p>
                      <p className="text-base">West Africa Time</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5 text-gray-600">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900 text-lg">Location</p>
                      <p className="text-base">{event.location}</p>
                    </div>
                  </div>
                </div>

                {isRsvped ? (
                  <>
                    <Button 
                      disabled
                      className="w-full bg-green-600 text-lg py-3.5"
                      size="lg"
                    >
                      <Check className="w-4 h-4 mr-1.5" /> RSVPED
                    </Button>
                    
                    <div className="flex gap-2 md:gap-3 mt-3">
                      <div className="relative flex-1">
                        <Button 
                          variant="outline" 
                          className="w-full text-xs md:text-sm py-2"
                          onClick={() => setShowShareMenu(!showShareMenu)}
                        >
                          <Share2 className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                          Share
                        </Button>
                        {showShareMenu && (
                          <SocialShareMenu event={event} onClose={() => setShowShareMenu(false)} />
                        )}
                      </div>
                      {!isAddedToCalendar ? (
                        <Button 
                          variant="outline" 
                          className="flex-1 text-xs md:text-sm py-2"
                          disabled={isAddingToCalendar}
                          onClick={handleAddToCalendar}
                        >
                          <CalendarPlus className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                          {isAddingToCalendar ? "Adding..." : "Add to Calendar"}
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="flex-1 text-xs md:text-sm py-2 bg-green-50"
                          disabled
                        >
                          <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                          Added
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={handleRsvp} 
                      disabled={isRsvpPending}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-sm md:text-base py-2.5 md:py-3"
                      size="lg"
                    >
                      {isRsvpPending ? "Confirming..." : "RSVP Now"}
                    </Button>
                    
                    <div className="flex gap-2 md:gap-3 mt-3">
                      <div className="relative flex-1">
                        <Button 
                          variant="outline" 
                          className="w-full text-xs md:text-sm py-2"
                          onClick={() => setShowShareMenu(!showShareMenu)}
                        >
                          <Share2 className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                          Share
                        </Button>
                        {showShareMenu && (
                          <SocialShareMenu event={event} onClose={() => setShowShareMenu(false)} />
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        className="flex-1 text-xs md:text-sm py-2"
                        onClick={handleAddToCalendar}
                      >
                        <CalendarPlus className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                        Add
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
