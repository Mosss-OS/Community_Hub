import { Link } from "wouter";
import { MapPin, Phone, Mail, Clock, Send, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageSEO } from "@/components/PageSEO";

export default function ContactPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for your message! We will get back to you soon.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const serviceTimes = [
    { day: "Sunday", time: "8:00 AM - 12:00 PM", service: "Morning Service" },
    { day: "Sunday", time: "2:00 PM - 4:00 PM", service: "Children's Church" },
    { day: "Wednesday", time: "6:00 PM - 8:00 PM", service: "Midweek Service" },
    { day: "Friday", time: "7:00 PM - 9:00 PM", service: "Youth Service" },
  ];

  return (
    <>
      <PageSEO
        title="Contact Us | Winners Chapel Lagos"
        description="Get in touch with Winners Chapel Lagos. We'd love to hear from you."
      />

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow-md" : "bg-transparent"}`}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#8B0000]">
                <span className="text-xl font-serif font-bold text-white">W</span>
              </div>
              <span className={`text-xl font-semibold ${isScrolled ? "text-gray-900" : "text-white"} hidden sm:block`}>
                Winners Chapel
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/about" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white"}`}>About</Link>
              <Link href="/sermons" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white"}`}>Sermons</Link>
              <Link href="/events" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white"}`}>Events</Link>
              <Link href="/groups" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white"}`}>Groups</Link>
              <Link href="/live" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white"}`}>Live</Link>
              <Link href="/give" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white"}`}>Give</Link>
            </div>
            <Link href="/login">
              <Button className="bg-[#8B0000] hover:bg-[#6B0000] text-white px-6 py-2 rounded-full">
                Contact Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/church_building.avif")' }}
        >
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-8 text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-white/80">
            We'd love to hear from you. Reach out anytime.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-serif font-semibold text-gray-900 mb-6">
                Send Us a <span className="text-[#8B0000]">Message</span>
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B0000]"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B0000]"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B0000]"
                    placeholder="+234..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B0000]"
                    placeholder="How can we help you?"
                  />
                </div>
                <Button type="submit" className="w-full bg-[#8B0000] hover:bg-[#6B0000] text-white py-3 rounded-lg flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-serif font-semibold text-gray-900 mb-6">
                Get In <span className="text-[#8B0000]">Touch</span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#8B0000]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#8B0000]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-600">Victoria Island, Lagos, Nigeria</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#8B0000]/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-[#8B0000]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-600">+234 800 CHURCH</p>
                    <p className="text-gray-600">+234 800 WINNERS</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#8B0000]/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-[#8B0000]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">info@winnerschapel.org</p>
                    <p className="text-gray-600">support@winnerschapel.org</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#8B0000]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-[#8B0000]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Times</h3>
                    <div className="space-y-2">
                      {serviceTimes.map((service, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{service.day} - {service.service}</span>
                          <span className="text-gray-900 font-medium">{service.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="h-[400px] bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Map integration coming soon</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#8B0000] flex items-center justify-center">
              <span className="text-xl font-serif font-bold text-white">W</span>
            </div>
            <span className="text-xl font-semibold">Winners Chapel</span>
          </div>
          <p className="text-white/40 text-sm">&copy; {new Date().getFullYear()} Winners Chapel Lagos. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}