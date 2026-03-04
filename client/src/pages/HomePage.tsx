import { Link } from "wouter";
import { ArrowRight, Play, Calendar, Clock, MapPin, Users, BookOpen, Heart, ChevronRight } from "lucide-react";
import { useSermons } from "@/hooks/use-sermons";
import { useEvents } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { LocationMap } from "@/components/LocationMap";

export default function HomePage() {
  const { data: sermons, isLoading: loadingSermons } = useSermons();
  const { data: events, isLoading: loadingEvents } = useEvents();
  const { user } = useAuth();
  const { t } = useLanguage();

  const upcomingEvents = events
    ?.filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  return (
    <div className="flex flex-col">
      {/* Hero Section - Full Screen */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920&auto=format&fit=crop&q=80" 
            alt="Worship Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/40 to-gray-900/20" />
        </div>
        
        <div className="container relative z-10 px-6 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-8 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              Welcome to CHub
            </div>
            
            <h1 className="font-semibold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-8 leading-[1.1]">
              Experience the
              <span className="block text-indigo-200 mt-2">Power of Faith</span>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              Join a vibrant community dedicated to loving God, loving people, and making a difference in our city and beyond.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="rounded-xl px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors text-lg"
              >
                <Link href="/events">
                  Plan a Visit <ArrowRight className="ml-2.5 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-xl px-8 py-4 border-white/20 text-white bg-white/5 hover:bg-white/15 backdrop-blur-sm font-medium transition-colors text-lg"
              >
                <Link href="/sermons">
                  <Play className="mr-2.5 w-5 h-5" /> Watch Online
                </Link>
              </Button>
              {user && (
                <Button
                  asChild
                  className="rounded-xl px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors text-lg"
                >
                  <Link href="/attendance/checkin">
                    Check In
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20 pt-12 border-t border-white/10">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-semibold text-white mb-2">5000+</div>
              <div className="text-sm text-white/60">Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-semibold text-white mb-2">15+</div>
              <div className="text-sm text-white/60">Years Active</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-semibold text-white mb-2">50+</div>
              <div className="text-sm text-white/60">Ministries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3">
                Upcoming Events
              </h2>
              <p className="text-gray-500 text-base md:text-lg">
                Join us for fellowship and growth
              </p>
            </div>
            <Button variant="ghost" asChild className="gap-2 self-start md:self-auto text-gray-600 hover:text-gray-900">
              <Link href="/events">
                View all <ChevronRight size={16} />
              </Link>
            </Button>
          </div>

          {loadingEvents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="space-y-5">
                  <Skeleton className="h-[280px] rounded-3xl" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {upcomingEvents.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-gray-100 rounded-3xl bg-gray-50/50">
              <Calendar className="h-14 w-14 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No upcoming events</p>
              <Button variant="ghost" asChild>
                <Link href="/events">View Past Events</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Latest Sermons Section */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="container px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3">
                Latest Sermons
              </h2>
              <p className="text-gray-500 text-base md:text-lg">
                Experience God's word through our preaching
              </p>
            </div>
            <Button variant="ghost" asChild className="gap-2 self-start md:self-auto text-gray-600 hover:text-gray-900">
              <Link href="/sermons">
                View all sermons <ChevronRight size={16} />
              </Link>
            </Button>
          </div>

          {loadingSermons ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="space-y-5">
                  <Skeleton className="h-[220px] rounded-3xl" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              ))}
            </div>
          ) : sermons && sermons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {sermons.slice(0, 3).map((sermon) => (
                <SermonCard key={sermon.id} sermon={sermon} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
              <Play className="h-14 w-14 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No sermons available</p>
            </div>
          )}
        </div>
      </section>

      {/* Ministries Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container px-6 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              Our Ministries
            </h2>
            <p className="text-gray-500 text-base md:text-lg">
              We have various ministries designed to help you grow in your faith and serve others
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <MinistryCard 
              icon={<Users className="w-8 h-8" />}
              title="Community Groups"
              description="Connect with others in small groups for fellowship and growth"
              href="/groups"
            />
            <MinistryCard 
              icon={<BookOpen className="w-8 h-8" />}
              title="Bible Study"
              description="Dive deeper into God's word with our weekly Bible study sessions"
              href="/bible"
            />
            <MinistryCard 
              icon={<Heart className="w-8 h-8" />}
              title="Prayer Ministry"
              description="Join our prayer team and experience the power of prayer"
              href="/prayer"
            />
          </div>
        </div>
      </section>

      {/* Visit Us Section */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="container px-6 md:px-8">
          <Card className="overflow-hidden shadow-sm rounded-3xl">
            <div className="grid md:grid-cols-2">
              <div className="relative min-h-[320px] md:min-h-full">
                <img 
                  src="/church_building.avif" 
                  alt="CHub Church Building" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-10 md:p-14 flex flex-col justify-center">
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-5">
                  Visit Us This Sunday
                </h2>
                <p className="text-gray-500 mb-10 leading-relaxed text-base">
                  We welcome you to join us for worship, fellowship, and community. 
                  Experience the warmth of God's love at CHub.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    asChild
                    className="rounded-xl px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                  >
                    <Link href="/events">
                      Service Times <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-xl px-7 py-3.5 border-gray-200 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    <Link href="/contact">
                      Get Directions
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Location Map Section */}
      <LocationMap />
    </div>
  );
}

function EventCard({ event }: { event: any }) {
  const eventDate = new Date(event.date);
  
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-white rounded-3xl h-full group cursor-pointer">
        <div className="aspect-[16/10] relative bg-gray-100">
          {event.imageUrl ? (
            <img 
              src={event.imageUrl} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="h-16 w-16 text-gray-300" />
            </div>
          )}
          <div className="absolute top-5 left-5 bg-white px-5 py-4 rounded-2xl text-center shadow-md">
            <div className="text-xs font-bold uppercase text-gray-500 tracking-wider">{format(eventDate, "MMM")}</div>
            <div className="text-3xl font-bold text-gray-900 leading-none">{format(eventDate, "dd")}</div>
          </div>
        </div>
        <CardContent className="p-8">
          <h3 className="font-semibold text-gray-900 mb-5 line-clamp-1 text-xl">{event.title}</h3>
          <div className="space-y-4 text-base text-gray-500">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <span>{format(eventDate, "EEEE, h:mm a")}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function SermonCard({ sermon }: { sermon: any }) {
  const sermonDate = new Date(sermon.date);
  
  return (
    <Link href={`/sermons/${sermon.id}`}>
      <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-white rounded-3xl h-full group cursor-pointer">
        <div className="aspect-[16/9] relative bg-gray-100">
          {sermon.thumbnailUrl ? (
            <img 
              src={sermon.thumbnailUrl} 
              alt={sermon.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="h-16 w-16 text-gray-300" />
            </div>
          )}
          {sermon.videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/30">
              <div className="w-18 h-18 rounded-full bg-white flex items-center justify-center shadow-xl">
                <Play className="h-8 w-8 text-gray-900 ml-1" />
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-8">
          {sermon.series && (
            <p className="text-sm font-medium text-indigo-600 mb-4">
              {sermon.series}
            </p>
          )}
          <h3 className="font-semibold text-gray-900 mb-5 line-clamp-2 text-xl">{sermon.title}</h3>
          <div className="flex items-center gap-3 text-base text-gray-500">
            <span>{sermon.speaker}</span>
            <span className="text-gray-300">·</span>
            <span>{format(sermonDate, "MMM d")}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function MinistryCard({ icon, title, description, href }: { icon: React.ReactNode; title: string; description: string; href: string }) {
  return (
    <Link href={href}>
      <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 rounded-3xl h-full group cursor-pointer">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center mx-auto mb-8 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            {icon}
          </div>
          <h3 className="font-semibold text-gray-900 mb-4 text-2xl">{title}</h3>
          <p className="text-gray-500 text-lg leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
