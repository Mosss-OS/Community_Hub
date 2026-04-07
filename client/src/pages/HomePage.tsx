import { Link } from "wouter";
import { ArrowRight, Play, Calendar, Users, BookOpen, Heart } from "lucide-react";
import { useSermons } from "@/hooks/use-sermons";
import { useEvents } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageSEO } from "@/components/PageSEO";
import { format } from "date-fns";

export default function HomePage() {
  const { data: sermons } = useSermons();
  const { data: events } = useEvents();
  const { user } = useAuth();
  const { t } = useLanguage();

  const upcomingEvents = events
    ?.filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3) || [];

  const recentSermons = sermons?.slice(0, 3) || [];

  return (
    <>
      <PageSEO 
        title="CHub - Church Community Platform" 
        description="Welcome to CHub - your church community platform. Access sermons, events, devotionals, and connect with your church family."
      />
      
      {/* Hero Section - Locus Style */}
      <section className="w-full pt-36 pb-24 md:pt-48 md:pb-36 px-4 sm:px-8 md:px-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-normal leading-[1.1] tracking-[-0.02em] text-[#1b1b1c] mb-6 md:mb-8">
            Your Church Community,<br />
            <span className="text-primary">All in One Place</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-[18px] text-[#505153] max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed">
            Connect with your church family, watch sermons, join events, give, 
            and grow in your faith journey - all in one beautiful platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/login"
              className="px-5 md:px-6 py-2.5 md:py-3 bg-primary text-white text-[13px] md:text-[14px] font-normal hover:bg-[#3400c8] transition-colors"
            >
              Get Started
            </Link>
            <Link 
              href="/sermons"
              className="px-5 md:px-6 py-2.5 md:py-3 border border-primary text-primary text-[13px] md:text-[14px] font-normal hover:bg-[#f8f6ff] transition-colors"
            >
              Watch Sermons
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof - Logos */}
      <section className="w-full py-16 md:py-24 border-y border-[#e5e5e5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <p className="text-center text-sm text-[#a0a0a0] mb-8">Trusted by churches worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            <span className="text-xl font-semibold text-[#a0a0a0]">Grace Chapel</span>
            <span className="text-xl font-semibold text-[#a0a0a0]">Faith Center</span>
            <span className="text-xl font-semibold text-[#a0a0a0]">Hope Church</span>
            <span className="text-xl font-semibold text-[#a0a0a0]">Victory Temple</span>
            <span className="text-xl font-semibold text-[#a0a0a0]">Living Faith</span>
          </div>
        </div>
      </section>

      {/* Features Section - Locus Style */}
      <section className="w-full py-16 md:py-24 px-4 sm:px-8 md:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-normal text-[#1b1b1c] mb-4">
              Everything Your Church Needs
            </h2>
            <p className="text-[#505153] max-w-xl mx-auto">
              A complete platform designed to help churches grow, engage, and connect with their community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 md:p-8 border border-[#e5e5e5] hover:border-[#c2bbff] transition-all duration-200">
              <div className="w-10 h-10 bg-[#f0eeff] flex items-center justify-center text-primary mb-6">
                <Play className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-[#1b1b1c] mb-3">Sermons & Teaching</h3>
              <p className="text-[#505153] text-sm leading-relaxed">
                Access sermons anytime, anywhere. Watch live or catch up on recorded messages.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 md:p-8 border border-[#e5e5e5] hover:border-[#c2bbff] transition-all duration-200">
              <div className="w-10 h-10 bg-[#f0eeff] flex items-center justify-center text-primary mb-6">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-[#1b1b1c] mb-3">Events & Activities</h3>
              <p className="text-[#505153] text-sm leading-relaxed">
                Never miss a church event. RSVP, get reminders, and stay connected.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 md:p-8 border border-[#e5e5e5] hover:border-[#c2bbff] transition-all duration-200">
              <div className="w-10 h-10 bg-[#f0eeff] flex items-center justify-center text-primary mb-6">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-[#1b1b1c] mb-3">Give & Support</h3>
              <p className="text-[#505153] text-sm leading-relaxed">
                Simple and secure online giving. Support the mission and ministry of your church.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 md:p-8 border border-[#e5e5e5] hover:border-[#c2bbff] transition-all duration-200">
              <div className="w-10 h-10 bg-[#f0eeff] flex items-center justify-center text-primary mb-6">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-[#1b1b1c] mb-3">Member Directory</h3>
              <p className="text-[#505153] text-sm leading-relaxed">
                Connect with other members. Find groups, connect with leaders, grow together.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 md:p-8 border border-[#e5e5e5] hover:border-[#c2bbff] transition-all duration-200">
              <div className="w-10 h-10 bg-[#f0eeff] flex items-center justify-center text-primary mb-6">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-[#1b1b1c] mb-3">Daily Devotionals</h3>
              <p className="text-[#505153] text-sm leading-relaxed">
                Start your day with inspiring devotionals. Grow in faith every day.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 md:p-8 border border-[#e5e5e5] hover:border-[#c2bbff] transition-all duration-200">
              <div className="w-10 h-10 bg-[#f0eeff] flex items-center justify-center text-primary mb-6">
                <ArrowRight className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-[#1b1b1c] mb-3">Prayer Requests</h3>
              <p className="text-[#505153] text-sm leading-relaxed">
                Submit prayer requests and pray for others. Experience the power of community prayer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="w-full py-16 md:py-24 px-4 sm:px-8 md:px-24 bg-[#f8f8f8]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-normal text-[#1b1b1c]">Upcoming Events</h2>
              <Link href="/events" className="text-primary text-sm hover:underline">
                View all events
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="block">
                  <div className="p-6 border border-[#e5e5e5] bg-white hover:border-[#c2bbff] transition-all duration-200">
                    <p className="text-xs uppercase tracking-wider text-[#a0a0a0] mb-2">
                      {format(new Date(event.date), "MMM d, yyyy")}
                    </p>
                    <h3 className="text-lg font-medium text-[#1b1b1c] mb-2">{event.title}</h3>
                    <p className="text-sm text-[#505153]">{event.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Sermons */}
      {recentSermons.length > 0 && (
        <section className="w-full py-16 md:py-24 px-4 sm:px-8 md:px-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-normal text-[#1b1b1c]">Latest Sermons</h2>
              <Link href="/sermons" className="text-primary text-sm hover:underline">
                View all sermons
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentSermons.map((sermon) => (
                <Link key={sermon.id} href={`/sermons/${sermon.id}`} className="block">
                  <div className="border border-[#e5e5e5] bg-white hover:border-[#c2bbff] transition-all duration-200">
                    <div className="aspect-video bg-[#f0eeff] flex items-center justify-center">
                      <Play className="w-12 h-12 text-primary" />
                    </div>
                    <div className="p-6">
                      <p className="text-xs uppercase tracking-wider text-[#a0a0a0] mb-2">
                        {sermon.series || "Sunday Service"} · {format(new Date(sermon.date), "MMM d, yyyy")}
                      </p>
                      <h3 className="text-lg font-medium text-[#1b1b1c] mb-2">{sermon.title}</h3>
                      <p className="text-sm text-[#505153]">{sermon.speaker}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 px-4 sm:px-8 md:px-24 bg-primary text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-normal mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-white/80 mb-8 leading-relaxed">
            Sign up today and experience the power of a connected church community.
          </p>
          <Link 
            href="/login"
            className="inline-block px-6 py-3 bg-white text-primary text-sm hover:bg-white/90 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-16 md:py-24 px-4 sm:px-8 md:px-24">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-normal text-[#1b1b1c] text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <div className="border border-[#e5e5e5] p-5 hover:border-[#c2bbff] transition-all duration-200 cursor-pointer">
              <h3 className="text-sm text-[#505153]">Is CHub free to use?</h3>
            </div>
            <div className="border border-[#e5e5e5] p-5 hover:border-[#c2bbff] transition-all duration-200 cursor-pointer">
              <h3 className="text-sm text-[#505153]">How do I join my church on CHub?</h3>
            </div>
            <div className="border border-[#e5e5e5] p-5 hover:border-[#c2bbff] transition-all duration-200 cursor-pointer">
              <h3 className="text-sm text-[#505153]">Can I give offering through CHub?</h3>
            </div>
            <div className="border border-[#e5e5e5] p-5 hover:border-[#c2bbff] transition-all duration-200 cursor-pointer">
              <h3 className="text-sm text-[#505153]">Is my data secure?</h3>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
