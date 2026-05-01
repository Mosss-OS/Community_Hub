import { Link } from "wouter";
import { Users, MapPin, Clock, Search, Plus, ArrowRight, Menu, Star, MessageCircle, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageSEO } from "@/components/PageSEO";
import { motion, AnimatePresence } from "framer-motion";

export default function GroupsPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const groups = [
    { 
      id: 1, 
      name: "Faith Builders", 
      category: "Bible Study",
      members: 15,
      meeting: "Wednesdays 6PM",
      location: "Room 101",
      image: null,
      description: "Deep dive into scripture"
    },
    { 
      id: 2, 
      name: "Youth Champions", 
      category: "Youth",
      members: 25,
      meeting: "Fridays 7PM",
      location: "Youth Hall",
      image: null,
      description: "Young adults growing together"
    },
    { 
      id: 3, 
      name: "Prayer Warriors", 
      category: "Prayer",
      members: 12,
      meeting: "Tuesdays 6AM",
      location: "Prayer Room",
      image: null,
      description: "Early morning prayer"
    },
    { 
      id: 4, 
      name: "Marriage Matters", 
      category: "Family",
      members: 20,
      meeting: "Sundays 5PM",
      location: "Room 201",
      image: null,
      description: "Couples ministry"
    },
    { 
      id: 5, 
      name: " Singles Fellowship", 
      category: "Fellowship",
      members: 18,
      meeting: "Saturdays 4PM",
      location: "Fellowship Hall",
      image: null,
      description: "Single believers community"
    },
    { 
      id: 6, 
      name: "Care Group Alpha", 
      category: "Discipleship",
      members: 10,
      meeting: "Mondays 7PM",
      location: "Room 102",
      image: null,
      description: "New believers track"
    },
  ];

  const categories = ["all", "Bible Study", "Youth", "Prayer", "Family", "Fellowship", "Discipleship"];

  return (
    <>
      <PageSEO title="Small Groups | Watchman Lekki" description="Join a small group at Watchman Lekki." />

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
              <Link href="/sermons" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white/90"}`}>Sermons</Link>
              <Link href="/events" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white/90"}`}>Events</Link>
              <Link href="/groups" className="text-sm font-medium text-[#8B0000]">Groups</Link>
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
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold mb-6 text-white"
          >
            Small Groups
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80 max-w-2xl mx-auto"
          >
            Connect deeper. Grow stronger. Belong to a community that cares.
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
                placeholder="Search groups..."
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
                  {cat === "all" ? "All Groups" : cat}
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
              {groups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-2 bg-[#8B0000]" />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{group.name}</h3>
                        <span className="text-xs text-[#8B0000] bg-[#8B0000]/10 px-2 py-1 rounded-full">
                          {group.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {group.members} members
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {group.meeting}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {group.location}
                      </div>
                    </div>
                    <Button className="w-full bg-[#8B0000] hover:bg-[#6B0000]">
                      Join Group
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 text-center">
          <h2 className="text-3xl font-serif font-semibold text-gray-900 mb-4">Start Your Own Group</h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Feel called to lead? Start a new small group and help others grow in faith.
          </p>
          <Button className="bg-[#8B0000] hover:bg-[#6B0000] px-8 py-3 rounded-full flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Start a Group
          </Button>
        </div>
      </section>
    </>
  );
}