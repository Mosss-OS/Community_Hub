import { Link, useLocation } from "wouter";
import { Heart, CreditCard, Banknote, Smartphone, Gift, ChevronRight, ArrowUpRight, Menu, Shield, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageSEO } from "@/components/PageSEO";
import { motion, AnimatePresence } from "framer-motion";

export default function GivePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [amount, setAmount] = useState("100");
  const [activeMethod, setActiveMethod] = useState("card");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const givingOptions = [
    { title: "Tithe", description: "10% of your income" },
    { title: "Offering", description: "Freewill offering" },
    { title: "Building Fund", description: "Church expansion" },
    { title: "Missions", description: "Support outreach" },
  ];

  const amounts = ["50", "100", "250", "500", "1000", "5000"];

  const methods = [
    { id: "card", icon: CreditCard, label: "Card" },
    { id: "bank", icon: Banknote, label: "Bank Transfer" },
    { id: "ussd", icon: Smartphone, label: "USSD" },
  ];

  return (
    <>
      <PageSEO title="Give | Watchman Lekki" description="Give online to Watchman Lekki." />

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
              <Link href="/give" className="text-sm font-medium text-[#8B0000]">Give</Link>
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
            Give & Support
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80 max-w-2xl mx-auto"
          >
            Your generous giving helps us continue the work of God's kingdom 
            and impact our community for Christ
          </motion.p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-4 gap-4">
            <AnimatePresence>
              {givingOptions.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 border border-gray-200 rounded-lg text-center hover:border-[#8B0000] hover:shadow-md transition-all cursor-pointer"
                >
                  <Heart className="w-8 h-8 text-[#8B0000] mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">{option.title}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#F8F8F8]">
        <div className="max-w-[800px] mx-auto px-4 sm:px-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-[#8B0000] px-8 py-6 text-white text-center">
              <h2 className="text-2xl font-serif font-semibold">Make Your Giving</h2>
              <p className="text-white/80">Secure online giving</p>
            </div>
            
            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Amount (₦)</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {amounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`py-3 rounded-lg font-semibold transition-colors ${
                        amount === amt 
                          ? "bg-[#8B0000] text-white" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      ₦{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Or enter custom amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8B0000]"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                <div className="grid grid-cols-3 gap-4">
                  {methods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setActiveMethod(method.id)}
                      className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                        activeMethod === method.id 
                          ? "border-[#8B0000] bg-[#8B0000]/5" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <method.icon className={`w-6 h-6 ${activeMethod === method.id ? "text-[#8B0000]" : "text-gray-600"}`} />
                      <span className={`text-sm font-medium ${activeMethod === method.id ? "text-[#8B0000]" : "text-gray-600"}`}>
                        {method.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <Button className="w-full bg-[#8B0000] hover:bg-[#6B0000] text-white py-4 text-lg rounded-lg flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Give ₦{amount}
              </Button>

              <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Secure
                </div>
                <div className="flex items-center gap-1">
                  <Lock className="w-4 h-4" />
                  Encrypted
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-semibold text-gray-900 mb-4">Other Ways to Give</h2>
            <p className="text-gray-600">Multiple convenient options to support the ministry</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                title: "Bank Transfer", 
                desc: "Account: 1234567890\nWatchman Lekki\nFirst Bank of Nigeria",
                icon: Banknote 
              },
              { 
                title: "USSD", 
                desc: "*123*1234567890#", 
                icon: Smartphone 
              },
              { 
                title: "Cash Deposit", 
                desc: "Visit the church office\nMonday - Friday\n9AM - 5PM",
                icon: CreditCard 
              }
            ].map((way, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 border border-gray-200 rounded-lg"
              >
                <way.icon className="w-10 h-10 text-[#8B0000] mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{way.title}</h3>
                <p className="text-gray-600 whitespace-pre-line text-sm">{way.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}