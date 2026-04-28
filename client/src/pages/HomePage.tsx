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

      {/* Hero Section - Clean, minimal, large typography */}
      <section className="w-full pt-32 pb-20 md:pt-48 md:pb-32 px-4 sm:px-8 md:px-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-extralight leading-[1.1] tracking-[-0.03em] text-[#111111] mb-6 md:mb-8">
            Your Church Community,<br />
            <span className="text-[#4101f6]">All in One Place</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-[20px] text-[#666666] max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed font-light">
            Connect with your church family, watch sermons, join events, give,
            and grow in your faith journey — all in one beautiful platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 md:px-8 py-3 md:py-3.5 bg-[#111111] text-white text-base md:text-lg font-light hover:bg-[#333333] transition-colors rounded-md"
            >
              Get Started
            </Link>
            <Link
              href="/sermons"
              className="px-6 md:px-8 py-3 md:py-3.5 border border-[#EAEAEA] text-[#111111] text-base md:text-lg font-light hover:bg-[#F8F8F8] transition-colors rounded-md"
            >
              Watch Sermons
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof - Minimal */}
      <section className="w-full py-12 md:py-16 border-y border-[#EAEAEA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <p className="text-center text-sm text-[#aaaaaa] mb-8 font-light">Trusted by churches worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 text-[#aaaaaa]">
            <span className="text-xl font-light">Grace Chapel</span>
            <span className="text-xl font-light">Faith Center</span>
            <span className="text-xl font-light">Hope Church</span>
            <span className="text-xl font-light">Victory Temple</span>
            <span className="text-xl font-light">Living Faith</span>
          </div>
        </div>
      </section>

      {/* Features Section - Clean, minimal, spacing-based */}
      <section className="w-full py-20 md:py-28 px-4 sm:px-8 md:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-extralight text-[#111111] mb-4 leading-[1.2]">
              Everything Your Church Needs
            </h2>
            <p className="text-[#666666] max-w-xl mx-auto text-lg font-light leading-relaxed">
              A complete platform designed to help churches grow, engage, and connect with their community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {/* Feature 1 */}
            <div className="p-8 md:p-10 hover:border-[#4101f6] border border-[#EAEAEA] transition-colors duration-200 rounded-lg">
              <div className="w-12 h-12 bg-[#F5F3FF] flex items-center justify-center text-[#4101f6] mb-6 rounded-md">
                <Play className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-light text-[#111111] mb-3">Sermons & Teaching</h3>
              <p className="text-[#666666] text-base leading-relaxed font-light">
                Access sermons anytime, anywhere. Watch live or catch up on recorded messages.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 md:p-10 hover:border-[#4101f6] border border-[#EAEAEA] transition-colors duration-200 rounded-lg">
              <div className="w-12 h-12 bg-[#F5F3FF] flex items-center justify-center text-[#4101f6] mb-6 rounded-md">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-light text-[#111111] mb-3">Events & Activities</h3>
              <p className="text-[#666666] text-base leading-relaxed font-light">
                Never miss a church event. RSVP, get reminders, and stay connected.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 md:p-10 hover:border-[#4101f6] border border-[#EAEAEA] transition-colors duration-200 rounded-lg">
              <div className="w-12 h-12 bg-[#F5F3FF] flex items-center justify-center text-[#4101f6] mb-6 rounded-md">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-light text-[#111111] mb-3">Give & Support</h3>
              <p className="text-[#666666] text-base leading-relaxed font-light">
                Simple and secure online giving. Support the mission and ministry of your church.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 md:p-10 hover:border-[#4101f6] border border-[#EAEAEA] transition-colors duration-200 rounded-lg">
              <div className="w-12 h-12 bg-[#F5F3FF] flex items-center justify-center text-[#4101f6] mb-6 rounded-md">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-light text-[#111111] mb-3">Member Directory</h3>
              <p className="text-[#666666] text-base leading-relaxed font-light">
                Connect with other members. Find groups, connect with leaders, grow together.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 md:p-10 hover:border-[#4101f6] border border-[#EAEAEA] transition-colors duration-200 rounded-lg">
              <div className="w-12 h-12 bg-[#F5F3FF] flex items-center justify-center text-[#4101f6] mb-6 rounded-md">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-light text-[#111111] mb-3">Daily Devotionals</h3>
              <p className="text-[#666666] text-base leading-relaxed font-light">
                Start your day with inspiring devotionals. Grow in faith every day.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 md:p-10 hover:border-[#4101f6] border border-[#EAEAEA] transition-colors duration-200 rounded-lg">
              <div className="w-12 h-12 bg-[#F5F3FF] flex items-center justify-center text-[#4101f6] mb-6 rounded-md">
                <ArrowRight className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-light text-[#111111] mb-3">Prayer Requests</h3>
              <p className="text-[#666666] text-base leading-relaxed font-light">
                Submit prayer requests and pray for others. Experience the power of community prayer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events - Clean, minimal */}
      {upcomingEvents.length > 0 && (
        <section className="w-full py-20 md:py-28 px-4 sm:px-8 md:px-24 bg-[#F8F8F8]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-extralight text-[#111111] leading-[1.2]">
                Upcoming Events
              </h2>
              <Link href="/events" className="text-[#4101f6] text-base hover:underline font-light">
                View all events
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="block">
                  <div className="p-8 border border-[#EAEAEA] bg-white hover:border-[#4101f6] transition-colors duration-200 rounded-lg">
                    <p className="text-xs uppercase tracking-wider text-[#aaaaaa] mb-3 font-light">
                      {format(new Date(event.date), "MMM d, yyy")}
                    </p>
                    <h3 className="text-xl font-light text-[#111111] mb-3">{event.title}</h3>
                    <p className="text-base text-[#666666] font-light">{event.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Sermons - Clean, minimal */}
      {recentSermons.length > 0 && (
        <section className="w-full py-20 md:py-28 px-4 sm:px-8 md:px-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-extralight text-[#111111] leading-[1.2]">
                Latest Sermons
              </h2>
              <Link href="/sermons" className="text-[#4101f6] text-base hover:underline font-light">
                View all sermons
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentSermons.map((sermon) => (
                <Link key={sermon.id} href={`/sermons/${sermon.id}`} className="block">
                  <div className="border border-[#EAEAEA] bg-white hover:border-[#4101f6] transition-colors duration-200 rounded-lg overflow-hidden">
                    <div className="aspect-video bg-[#F5F3FF] flex items-center justify-center">
                      <Play className="w-16 h-16 text-[#4101f6] opacity-60" />
                    </div>
                    <div className="p-6">
                      <p className="text-xs uppercase tracking-wider text-[#aaaaaa] mb-3 font-light">
                        {sermon.series || "Sunday Service"} · {format(new Date(sermon.date), "MMM d, yyy")}
                      </p>
                      <h3 className="text-xl font-light text-[#111111] mb-3">{sermon.title}</h3>
                      <p className="text-base text-[#666666] font-light">{sermon.speaker}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Minimal */}
      <section className="w-full py-20 md:py-28 px-4 sm:px-8 md:px-24 bg-[#111111] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extralight mb-6 leading-[1.2]">
            Ready to Join Our Community?
          </h2>
          <p className="text-white/80 mb-10 leading-relaxed text-lg font-light">
            Sign up today and experience the power of a connected church community.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3.5 bg-white text-[#111111] text-lg font-light hover:bg-white/90 transition-colors rounded-md"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* FAQ Section - Minimal */}
      <section className="w-full py-20 md:py-28 px-4 sm:px-8 md:px-24">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extralight text-[#111111] text-center mb-16 leading-[1.2]">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="border border-[#EAEAEA] p-6 hover:border-[#4101f6] transition-colors duration-200 cursor-pointer rounded-lg">
              <h3 className="text-lg text-[#666666] font-light">Is CHub free to use?</h3>
            </div>
            <div className="border border-[#EAEAEA] p-6 hover:border-[#4101f6] transition-colors duration-200 cursor-pointer rounded-lg">
              <h3 className="text-lg text-[#666666] font-light">How do I join my church on CHub?</h3>
            </div>
            <div className="border border-[#EAEAEA] p-6 hover:border-[#4101f6] transition-colors duration-200 cursor-pointer rounded-lg">
              <h3 className="text-lg text-[#666666] font-light">Can I give offering through CHub?</h3>
            </div>
            <div className="border border-[#EAEAEA] p-6 hover:border-[#4101f6] transition-colors duration-200 cursor-pointer rounded-lg">
              <h3 className="text-lg text-[#666666] font-light">Is my data secure?</h3>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
