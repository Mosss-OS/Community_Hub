import { Link, useLocation } from "wouter";
import { LuHeart, LuSprout, LuLightbulb, LuMessageCircle, LuCheckCircle, LuChevronRight, LuMenu, LuSparkles } from 'react-icons/lu';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageSEO } from "@/components/PageSEO";
import { motion, AnimatePresence } from "framer-motion";

export default function PrayerPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [prayerFocus, setPrayerFocus] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const focusAreas = [
    "Salvation & New Beginnings",
    " Healing & Health",
    " Financial Breakthrough",
    " Family & Relationships",
    " Peace & Direction",
    " Church & Ministry",
  ];

  const answeredPrayers = [
    { name: "Sarah M.", prayer: "Prayed for healing for my mother", date: "March 2025" },
    { name: "Anonymous", prayer: "Prayed for financial breakthrough", date: "February 2025" },
    { name: "Michael C.", prayer: "Prayed for new job", date: "January 2025" },
  ];

  return (
    <>
      <PageSEO title="Prayer | Watchman Lekki" description="Prayer requests at Watchman Lekki." />

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
              <Link href="/groups" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white/90"}`}>Groups</Link>
              <Link href="/live" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white/90"}`}>Live</Link>
              <Link href="/prayer" className="text-sm font-medium text-[#8B0000]">Prayer</Link>
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
            Prayer Requests
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80 max-w-2xl mx-auto"
          >
            Submit your prayer requests and let the body of Christ stand with you in faith
          </motion.p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <AnimatePresence>
              {[
                { icon: Sprout, title: "Submit Request", desc: "Share your prayer need" },
                { icon: Lightbulb, title: "Join Prayer Chain", desc: "Be part of prayer team" },
                { icon: CheckCircle, title: "Testify", desc: "Share answered prayers" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 border border-gray-200 rounded-lg hover:border-[#8B0000] hover:shadow-md transition-all"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#8B0000]/10 flex items-center justify-center">
                    <item.icon className="w-8 h-8 text-[#8B0000]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#F8F8F8]">
        <div className="max-w-[800px] mx-auto px-4 sm:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-6 text-center">Submit Prayer Request</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">What do you need prayer for?</label>
              <textarea
                placeholder="Share your prayer request here..."
                value={prayerFocus}
                onChange={(e) => setPrayerFocus(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8B0000]"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Focus Areas</label>
              <div className="flex flex-wrap gap-2">
                {focusAreas.map((area, index) => (
                  <button
                    key={index}
                    className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-[#8B0000] hover:text-white transition-colors"
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#8B0000] focus:text-[#8B0000]"
                />
                <span className="text-sm text-gray-600">Keep my identity anonymous</span>
              </label>
            </div>

            <Button className="w-full bg-[#8B0000] hover:bg-[#6B0000] text-white py-4 text-lg rounded-lg flex items-center justify-center gap-2">
              <Heart className="w-5 h-5" />
              Submit Prayer Request
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <Sparkles className="w-12 h-12 text-[#8B0000] mx-auto mb-4" />
            <h2 className="text-3xl font-serif font-semibold text-gray-900 mb-4">Testimonies</h2>
            <p className="text-gray-600">See how God has answered prayers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <AnimatePresence>
              {answeredPrayers.map((testimony, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#F8F8F8] p-6 rounded-lg"
                >
                  <CheckCircle className="w-8 h-8 text-green-600 mb-4" />
                  <p className="text-gray-700 mb-4">"{testimony.prayer}"</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">{testimony.name}</span>
                    <span className="text-gray-500">{testimony.date}</span>
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
            Join Our Prayer Team
          </motion.h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Be part of our prayer team and stand in the gap for others. 
            Your prayers make a difference in our church family.
          </p>
          <Button className="bg-white text-[#8B0000] hover:bg-white/90 px-8 py-3 rounded-full">
            Join Prayer Team
          </Button>
        </div>
      </section>
    </>
  );
}