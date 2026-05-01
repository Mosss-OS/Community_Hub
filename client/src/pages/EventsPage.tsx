import { Link, useLocation } from "wouter";
import { Calendar, Clock, MapPin, Users, Search, Plus, ChevronRight, Menu, ArrowRight, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageSEO } from "@/components/PageSEO";
import { motion, AnimatePresence } from "framer-motion";

export default function EventsPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const events = [
    { 
      id: 1, 
      title: "Sunday Service", 
      date: "May 4, 2025", 
      time: "8:00 AM - 12:00 PM",
      location: "Main Sanctuary",
      category: "Worship",
      image: "/church_building.avif",
      description: "Join us for worship and the Word"
    },
    { 
      id: 2, 
      title: "Youth Night", 
      date: "May 9, 2025", 
      time: "7:00 PM - 9:00 PM",
      location: "Youth Hall",
      category: "Youth",
      image: "/church_building.avif",
      description: "Fun, fellowship and God"
    },
    { 
      id: 3, 
      title: "Bible Study", 
      date: "May 7, 2025", 
      time: "6:00 PM - 8:00 PM",
      location: "Fellowship Hall",
      category: "Discipleship",
      image: "/church_building.avif",
      description: "Deep dive into God's Word"
    },
    { 
      id: 4, 
      title: "Midweek Service", 
      date: "May 11, 2025", 
      time: "6:00 PM - 8:00 PM",
      location: "Main Sanctuary",
      category: "Worship",
      image: "/church_building.avif",
      description: "Midweek worship and prayer"
    },
    { 
      id: 5, 
      title: "Mother's Day Fellowship", 
      date: "May 11, 2025", 
      time: "2:00 PM - 5:00 PM",
      location: "Church Grounds",
      category: "Fellowship",
      image: "/church_building.avif",
      description: "Celebrating all mothers"
    },
    { 
      id: 6, 
      title: "Prayer Meeting", 
      date: "May 14, 2025", 
      time: "6:00 AM - 7:00 AM",
      location: "Prayer Room",
      category: "Prayer",
      image: "/church_building.avif",
      description: "Early morning prayer session"
    },
  ];

  const categories = ["all", "Worship", "Youth", "Discipleship", "Fellowship", "Prayer"];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeFilter === "all" || event.category.toLowerCase() === activeFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <PageSEO title="Events | Watchman Lagos" description="Upcoming events at Watchman Lagos." />

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow-md" : "bg-[#1A1A1A]"}`}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#8B0000]">
                <span className="text-xl font-serif font-bold text-white">W</span>
              </div>
              <span className={`text-xl font-semibold ${isScrolled ? "text-gray-900" : "text-white"} hidden sm:block`}>Watchman</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/about" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white/90"}`}>About</Link>
              <Link href="/sermons" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white/90"}`}>Sermons</Link>
              <Link href="/events" className="text-sm font-medium text-[#8B0000]">Events</Link>
              <Link href="/groups" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white/90"}`}>Groups</Link>
              <Link href="/live" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white/90"}`}>Live</Link>
              <Link href="/give" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white/90"}`}>Give</Link>
            </div>
            <Link href="/login"><Button className="bg-[#8B0000] hover:bg-[#6B0000] text-white px-6 rounded-full">Join Us</Button></Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("/church_building.avif")' }}>
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-8 text-center text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold mb-6"
          >
            Events
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80"
          >
            Join us at any of our upcoming events
          </motion.p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:border-[#8B0000]"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === cat 
                      ? "bg-[#8B0000] text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat === "all" ? "All Events" : cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#F8F8F8]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="aspect-[16/9] bg-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute top-3 left-3 bg-[#8B0000] text-white text-xs px-3 py-1 rounded-full">
                      {event.category}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-[#8B0000] hover:bg-[#6B0000]">
                      RSVP Now
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Calendar, title: "Add to Calendar", desc: "Sync events with your calendar" },
              { icon: Users, title: "Bring Friends", desc: "Invite others to join you" },
              { icon: Play, title: "Virtual Option", desc: "Join online if you can't attend" }
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#8B0000]/10 flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-[#8B0000]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#8B0000]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 text-center text-white">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-serif font-semibold mb-4"
          >
            Want to Host an Event?
          </motion.h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            We welcome event proposals from our members. Submit your event idea and we'll get back to you.
          </p>
          <Button className="bg-white text-[#8B0000] hover:bg-white/90 px-8 py-3 rounded-full">
            Submit Event Proposal
          </Button>
        </div>
      </section>

      <footer className="bg-[#1A1A1A] text-white py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#8B0000] flex items-center justify-center">
              <span className="text-xl font-serif font-bold text-white">W</span>
            </div>
            <span className="text-xl font-semibold">Watchman</span>
          </div>
          <p className="text-white/40 text-sm">&copy; {new Date().getFullYear()} Watchman Lagos. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}