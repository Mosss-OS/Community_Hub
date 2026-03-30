import { Link } from "wouter";
import { ArrowRight, Play, Calendar, Clock, MapPin, Users, BookOpen, Heart, ChevronRight, Sparkles } from "lucide-react";
import { useSermons } from "@/hooks/use-sermons";
import { useEvents } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageSEO } from "@/components/PageSEO";
import { format } from "date-fns";
import { LocationMap } from "@/components/LocationMap";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function HomePage() {
  const { data: sermons, isLoading: loadingSermons } = useSermons();
  const { data: events, isLoading: loadingEvents } = useEvents();
  const { user } = useAuth();

  const { t } = useLanguage();

  const upcomingEvents = events
    ?.filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  return (
    <>
      <PageSEO 
        title="Home" 
        description="Welcome to CHub - your church community platform. Access sermons, events, devotionals, and connect with your church family."
      />
      <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[100vh] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920&auto=format&fit=crop&q=80"
            alt="Worship Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/80" />
        </div>

        <motion.div className="container relative z-10 px-4 sm:px-6 md:px-10" initial="hidden" animate="visible" variants={stagger}>
          <div className="max-w-5xl mx-auto text-center">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full glass-dark text-white/80 text-xs sm:text-sm font-semibold mb-5 sm:mb-8 shimmer-border">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
              {t("welcomeToCHub")}
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="font-bold text-2xl sm:text-4xl md:text-5xl lg:text-[5rem] text-white mb-4 sm:mb-8 leading-[1.1] tracking-tight font-[--font-display]">
              {t("experienceThe")}<br />
              <span className="text-gradient-gold">{t("powerOfFaith")}</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/50 max-w-2xl mx-auto mb-6 sm:mb-12 leading-relaxed px-2">
              {t("heroDescription")}
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center px-4 sm:px-0">
              <Button
                asChild
                className="rounded-2xl px-5 sm:px-8 py-2.5 sm:py-4 h-10 sm:h-14 bg-accent hover:bg-accent/90 text-accent-foreground font-bold transition-all text-sm sm:text-base shadow-xl shadow-accent/30 hover:shadow-2xl hover:shadow-accent/40 hover:-translate-y-1"
              >
                <Link href="/events">
                  {t("planAVisit")} <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-2xl px-5 sm:px-8 py-2.5 sm:py-4 h-10 sm:h-14 border-white/15 text-white glass-dark hover:bg-white/10 font-bold transition-all text-sm sm:text-base hover:-translate-y-1"
              >
                <Link href="/sermons">
                  <Play className="mr-2 w-4 h-4" /> {t("watchOnline")}
                </Link>
              </Button>
              {user && (
                <Button
                  asChild
                  className="rounded-2xl px-5 sm:px-8 py-2.5 sm:py-4 h-10 sm:h-14 gradient-accent text-primary-foreground font-bold transition-all text-sm sm:text-base shadow-lg shadow-primary/25 hover:-translate-y-1"
                >
                  <Link href="/attendance/checkin">{t("checkIn")}</Link>
                </Button>
              )}
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div variants={fadeUp} custom={4} className="grid grid-cols-3 gap-3 sm:gap-8 max-w-2xl mx-auto mt-10 sm:mt-20 px-2 sm:px-0">
            {[
              { value: "5000+", label: t("membersCount") },
              { value: "15+", label: t("yearsActive") },
              { value: "50+", label: t("ministries") },
            ].map(({ value, label }) => (
              <div key={label} className="text-center glass-dark rounded-xl sm:rounded-2xl p-3 sm:p-6">
                <div className="text-lg sm:text-3xl md:text-4xl font-bold text-accent mb-1 sm:mb-2 font-[--font-display]">{value}</div>
                <div className="text-[10px] sm:text-sm text-white/40 font-medium">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Upcoming Events */}
      <motion.section
        className="py-10 sm:py-20 md:py-28 bg-background relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <div className="container px-4 sm:px-6 md:px-8 relative z-10">
          <motion.div variants={fadeUp} custom={0} className="text-center mb-6 sm:mb-12">
            <span className="text-primary font-bold text-xs sm:text-sm uppercase tracking-wider mb-2 sm:mb-3 block">{t("whatsHappening")}</span>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight font-[--font-display]">
              {t("upcomingEvents")}
            </h2>
            <Button variant="ghost" asChild className="gap-2 mt-4 text-muted-foreground hover:text-primary font-semibold text-xs sm:text-sm">
              <Link href="/events">{t("viewAllSmall")} <ChevronRight size={14} /></Link>
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            {loadingEvents ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-[240px] sm:h-[300px] rounded-2xl sm:rounded-3xl" />
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-20 glass-card rounded-2xl sm:rounded-3xl">
                <Calendar className="h-10 w-10 sm:h-14 sm:w-14 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground text-sm sm:text-base mb-4">{t("noEvents")}</p>
                <Button variant="ghost" asChild className="font-semibold text-sm">
                  <Link href="/events">{t("viewPastEvents")}</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Latest Sermons */}
      <motion.section
        className="py-10 sm:py-20 md:py-28 gradient-section relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <div className="container px-4 sm:px-6 md:px-8 relative z-10">
          <motion.div variants={fadeUp} custom={0} className="text-center mb-6 sm:mb-12">
            <span className="text-secondary font-bold text-xs sm:text-sm uppercase tracking-wider mb-2 sm:mb-3 block">{t("listenAndLearn")}</span>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight font-[--font-display]">
              {t("latestSermons")}
            </h2>
            <Button variant="ghost" asChild className="gap-2 mt-4 text-muted-foreground hover:text-primary font-semibold text-xs sm:text-sm">
              <Link href="/sermons">{t("viewAllSermons")} <ChevronRight size={14} /></Link>
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            {loadingSermons ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-[200px] sm:h-[260px] rounded-2xl sm:rounded-3xl" />
                ))}
              </div>
            ) : sermons && sermons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {sermons.slice(0, 3).map((sermon) => (
                  <SermonCard key={sermon.id} sermon={sermon} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-20 glass-card rounded-2xl sm:rounded-3xl">
                <Play className="h-10 w-10 sm:h-14 sm:w-14 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground text-sm">{t("noSermons")}</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Ministries */}
      <motion.section
        className="py-10 sm:py-20 md:py-28 bg-background relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <div className="container px-4 sm:px-6 md:px-8 relative z-10">
          <motion.div variants={fadeUp} custom={0} className="text-center max-w-2xl mx-auto mb-8 sm:mb-16">
            <span className="text-accent font-bold text-xs sm:text-sm uppercase tracking-wider mb-2 sm:mb-3 block">{t("getInvolved")}</span>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight font-[--font-display] mb-2 sm:mb-4">
              {t("ourMinistries")}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
              {t("ministriesDescription")}
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            <MinistryCard
              icon={<Users className="w-5 h-5 sm:w-7 sm:h-7" />}
              title={t("communityGroups")}
              description={t("communityGroupsDesc")}
              href="/groups"
              color="primary"
            />
            <MinistryCard
              icon={<BookOpen className="w-5 h-5 sm:w-7 sm:h-7" />}
              title={t("bibleStudy")}
              description={t("bibleStudyDesc")}
              href="/bible"
              color="secondary"
            />
            <MinistryCard
              icon={<Heart className="w-5 h-5 sm:w-7 sm:h-7" />}
              title={t("prayerMinistry")}
              description={t("prayerMinistryDesc")}
              href="/prayer"
              color="accent"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Visit Us */}
      <motion.section
        className="py-10 sm:py-20 md:py-28 gradient-section relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
      >
        <div className="container px-4 sm:px-6 md:px-8 relative z-10">
          <div className="glass-card-strong rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid md:grid-cols-2">
              <div className="relative min-h-[200px] sm:min-h-[320px] md:min-h-full">
                <img
                  src="/church_building.avif"
                  alt="CHub Church Building"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[hsl(220,30%,8%)/20]" />
              </div>
              <div className="p-5 sm:p-10 md:p-14 flex flex-col justify-center">
                <span className="text-accent font-bold text-xs sm:text-sm uppercase tracking-wider mb-2 sm:mb-4 block">{t("visitUs")}</span>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight font-[--font-display] mb-3 sm:mb-5">
                  {t("visitUsThisSunday")}
                </h2>
                <p className="text-muted-foreground mb-5 sm:mb-10 leading-relaxed text-sm sm:text-base">
                  {t("visitUsDescription")}
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4">
                  <Button
                    asChild
                    className="rounded-2xl px-5 sm:px-7 py-2.5 sm:py-3.5 gradient-accent text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all text-sm sm:text-base"
                  >
                    <Link href="/events">{t("serviceTimes")} <ArrowRight className="ml-2 w-4 h-4" /></Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-2xl px-5 sm:px-7 py-2.5 sm:py-3.5 border-border/50 text-foreground hover:bg-muted/50 font-bold text-sm sm:text-base"
                  >
                    <Link href="/contact">{t("getDirections")}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <LocationMap />
    </div>
    </>
  );
}

function EventCard({ event }: { event: any }) {
  const eventDate = new Date(event.date);

  return (
    <Link href={`/events/${event.id}`}>
      <div className="glass-card-strong rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 h-full group cursor-pointer hover:-translate-y-2">
        <div className="aspect-[16/10] relative bg-muted">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Calendar className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}
          <div className="absolute top-4 left-4 glass-card-strong px-4 py-3 rounded-2xl text-center shadow-lg">
            <div className="text-[10px] font-bold uppercase text-primary tracking-wider">{format(eventDate, "MMM")}</div>
            <div className="text-2xl font-bold text-foreground leading-none font-[--font-display]">{format(eventDate, "dd")}</div>
          </div>
        </div>
        <div className="p-6">
          <h3 className="font-bold text-foreground mb-4 line-clamp-1 text-lg font-[--font-display]">{event.title}</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-primary/50" />
              <span>{format(eventDate, "EEEE, h:mm a")}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-primary/50" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SermonCard({ sermon }: { sermon: any }) {
  const sermonDate = new Date(sermon.date);

  return (
    <Link href={`/sermons/${sermon.id}`}>
      <div className="glass-card-strong rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 h-full group cursor-pointer hover:-translate-y-2">
        <div className="aspect-[16/9] relative bg-muted">
          {sermon.thumbnailUrl ? (
            <img src={sermon.thumbnailUrl} alt={sermon.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Play className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}
          {sermon.videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[hsl(220,30%,8%)/50]">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-xl">
                <Play className="h-7 w-7 text-primary-foreground ml-1" />
              </div>
            </div>
          )}
        </div>
        <div className="p-6">
          {sermon.series && (
            <p className="text-xs font-bold text-secondary mb-3 uppercase tracking-wider">{sermon.series}</p>
          )}
          <h3 className="font-bold text-foreground mb-4 line-clamp-2 text-lg font-[--font-display]">{sermon.title}</h3>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <span className="font-medium">{sermon.speaker}</span>
            <span className="text-border">·</span>
            <span>{format(sermonDate, "MMM d")}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function MinistryCard({ icon, title, description, href, color }: { icon: React.ReactNode; title: string; description: string; href: string; color: string }) {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-primary/25",
    secondary: "bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground group-hover:shadow-secondary/25",
    accent: "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground group-hover:shadow-accent/25",
  };

  return (
    <Link href={href}>
      <div className="glass-card-strong rounded-2xl sm:rounded-3xl h-full group cursor-pointer hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 shimmer-border">
        <div className="p-5 sm:p-10 text-center">
          <div className={`w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-6 transition-all duration-300 group-hover:shadow-lg ${colorMap[color]}`}>
            {icon}
          </div>
          <h3 className="font-bold text-foreground mb-2 sm:mb-3 text-base sm:text-xl font-[--font-display]">{title}</h3>
          <p className="text-muted-foreground text-xs sm:text-base leading-relaxed">{description}</p>
        </div>
      </div>
    </Link>
  );
}
