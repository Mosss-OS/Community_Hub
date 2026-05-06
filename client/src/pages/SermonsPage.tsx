import { Link, useLocation } from "wouter";
import { LuPlay, LuClock, LuCalendar, LuSearch, LuFilter, LuChevronRight, LuMenu, LuX, LuHeadphones, LuBookOpen, LuUsers, LuArrowRight, LuStar } from 'react-icons/lu';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageSEO } from "@/components/PageSEO";
import { motion, AnimatePresence } from "framer-motion";

export default function SermonsPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const series = [
    { id: 1, title: "Walking in Faith", preacher: "Pastor John Doe", date: "May 2025", image: "/church_building.avif", count: 4 },
    { id: 2, title: "Peace of Mind", preacher: "Pastor Jane Smith", date: "April 2025", image: "/church_building.avif", count: 3 },
    { id: 3, title: "Better Together", preacher: "Pastor John Doe", date: "March 2025", image: "/church_building.avif", count: 5 },
  ];

  const sermons = [
    { id: 1, title: "The Power of Community", series: "Better Together", preacher: "Pastor John Doe", date: "May 4, 2025", duration: "45 min", thumbnail: "/church_building.avif" },
    { id: 2, title: "Finding Peace in Chaos", series: "Peace of Mind", preacher: "Pastor Jane Smith", date: "April 27, 2025", duration: "38 min", thumbnail: "/church_building.avif" },
    { id: 3, title: "Walking by Faith", series: "Walking in Faith", preacher: "Pastor Emmanuel", date: "April 20, 2025", duration: "42 min", thumbnail: "/church_building.avif" },
    { id: 4, title: "Love in Action", series: "Better Together", preacher: "Pastor John Doe", date: "April 13, 2025", duration: "40 min", thumbnail: "/church_building.avif" },
    { id: 5, title: "Trusting God's Plan", series: "Walking in Faith", preacher: "Pastor Emmanuel", date: "April 6, 2025", duration: "35 min", thumbnail: "/church_building.avif" },
    { id: 6, title: "Overcoming Doubts", series: "Peace of Mind", preacher: "Pastor Jane Smith", date: "March 30, 2025", duration: "41 min", thumbnail: "/church_building.avif" },
  ];

  const filters = ["all", "pastor-john", "pastor-jane", "pastor-emmanuel"];

  return (
    <>
      <PageSEO title="Sermons | Watchman Lekki" description="Watch and listen to sermons from Watchman Lekki." />

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow-md" : "bg-[#1A1A1A]"}`}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="https://res.cloudinary.com/dv0tt80vn/image/upload/v1777633359/watchman_logo_uc5f1m.webp"
                alt="Watchman Lekki"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className={`text-xl font-semibold ${isScrolled ? "text-gray-900" : "text-white"} hidden sm:block`}>Watchman Lekki</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/about" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white/90"}`}>About</Link>
              <Link href="/sermons" className={`text-sm font-medium text-[#8B0000]`}>Sermons</Link>
              <Link href="/events" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white/90"}`}>Events</Link>
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
            Sermons & Teaching
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80"
          >
            Grow in your faith through our weekly sermons and teaching series
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
                placeholder="Search sermons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:border-[#8B0000]"
              />
            </div>
            <div className="flex gap-2">
              {["All", "This Month", "This Year"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter.toLowerCase())}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === filter.toLowerCase()
                    ? "bg-[#8B0000] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#F8F8F8]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-6">Sermon Series</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <AnimatePresence>
              {series.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="aspect-video bg-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{item.preacher}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{item.date}</span>
                      <span>{item.count} sermons</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-6">Latest sermons</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {sermons.map((sermon, index) => (
                <motion.div
                  key={sermon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="aspect-video bg-gray-200 relative">
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {sermon.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-[#8B0000] font-medium mb-1">{sermon.series}</p>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">{sermon.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{sermon.preacher} • {sermon.date}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Headphones className="w-3 h-3 mr-1" /> Audio
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <BookOpen className="w-3 h-3 mr-1" /> Notes
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
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
            Subscribe to Our Channel
          </motion.h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Never miss a sermon. Subscribe on YouTube to get notified when new messages are posted.
          </p>
          <Button className="bg-white text-[#8B0000] hover:bg-white/90 px-8 py-3 rounded-full">
            Subscribe Now
          </Button>
        </div>
      </section>
    </>
  );
}