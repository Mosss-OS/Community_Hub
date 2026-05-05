import { Link, useLocation } from "wouter";
import { ArrowRight, Play, Calendar, Users, BookOpen, Heart, Clock, MapPin, Phone, Mail, Quote, ChevronRight, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageSEO } from "@/components/PageSEO";

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const scheduleData = [
    { day: "Sunday", time: "8:00 AM - 12:00 PM", service: "Morning Service", location: "Main Sanctuary" },
    { day: "Sunday", time: "2:00 PM - 4:00 PM", service: "Children's Church", location: "Children's Wing" },
    { day: "Wednesday", time: "6:00 PM - 8:00 PM", service: "Midweek Service", location: "Main Sanctuary" },
    { day: "Friday", time: "7:00 PM - 9:00 PM", service: "Youth Service", location: "Youth Hall" },
  ];

  const testimonials = [
    {
      quote: "This church has been a blessing to our family. The community and teachings have transformed our walk with God.",
      name: "Sarah Johnson",
      role: "Member since 2020"
    },
    {
      quote: "A place where true worship happens. I've grown so much in my faith since joining this congregation.",
      name: "Michael Chen",
      role: "Member since 2019"
    },
    {
      quote: "The warmest church family I've ever been part of. Everyone genuinely cares for one another.",
      name: "Grace Williams",
      role: "Member since 2021"
    },
  ];

  const events = [
    { title: "Sunday Service", date: "Every Sunday", category: "Worship", image: "/church_building.avif" },
    { title: "Youth Night", date: "Fridays", category: "Youth", image: "/church_building.avif" },
    { title: "Bible Study", date: "Wednesdays", category: "Discipleship", image: "/church_building.avif" },
  ];

  const announcements = [
    { date: "MAY 04", title: "Easter Celebration Service", description: "Join us for a special Easter service with extended worship" },
    { date: "MAY 11", title: "Mother's Day Fellowship", description: "Celebrating all mothers in our church family" },
    { date: "MAY 18", title: "Youth Conference", description: "Annual youth conference with guest speakers" },
    { date: "MAY 25", title: "Church Anniversary", description: "Celebrating another year of God's faithfulness" },
  ];

  return (
    <>
      <PageSEO
        title="Watchman Lekki Lagos | Welcome Home"
        description="Welcome to Watchman Lekki Lagos - your church family. Join us for worship, fellowship, and growth in faith."
      />

      {/* Navbar - Transparent to solid on scroll */}
      <nav className={`fixed top-0 left-0 right-0 z-[45] transition-all duration-300 ${isScrolled ? "bg-white shadow-md" : "bg-transparent"}`}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img 
                src="https://res.cloudinary.com/dv0tt80vn/image/upload/v1777633359/watchman_logo_uc5f1m.webp" 
                alt="Watchman Lekki" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className={`text-xl font-semibold ${isScrolled ? "text-gray-900" : "text-white"} hidden sm:block`}>
                Watchman Lekki
              </span>
            </Link>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Link href="/contact">
                <Button className={`px-6 py-2 rounded-full ${isScrolled ? "bg-[#8B0000] hover:bg-[#6B0000] text-white" : "bg-[#8B0000] hover:bg-[#6B0000] text-white"}`}>
                  Contact Now
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className={isScrolled ? "text-gray-900" : "text-white"} />
              ) : (
                <Menu className={isScrolled ? "text-gray-900" : "text-white"} />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4 px-4">
              <div className="flex flex-col gap-4">
                <Link href="/about" className="text-gray-700 hover:text-[#8B0000]">About</Link>
                <Link href="/sermons" className="text-gray-700 hover:text-[#8B0000]">Sermons</Link>
                <Link href="/events" className="text-gray-700 hover:text-[#8B0000]">Events</Link>
                <Link href="/groups" className="text-gray-700 hover:text-[#8B0000]">Groups</Link>
                <Link href="/live" className="text-gray-700 hover:text-[#8B0000]">Live</Link>
                <Link href="/give" className="text-gray-700 hover:text-[#8B0000]">Give</Link>
                <Link href="/login">
                  <Button className="bg-[#8B0000] hover:bg-[#6B0000] text-white w-full">
                    Contact Now
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920&h=1080&fit=crop&q=80")' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-8 w-full py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-semibold leading-[1.1] mb-6">
                <span className="text-white">Welcome Home to Your</span> <br />
                <span className="italic font-light bg-gradient-to-r from-[#E8B4B4] via-[#FBBF24] to-[#E8B4B4] bg-clip-text text-transparent animate-pulse">Church Family</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/80 max-w-xl mb-8 leading-relaxed">
                Experience the love of God in a community that cares. Join us for worship, 
                fellowship, and spiritual growth as we journey together in faith.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/login">
                  <Button className="bg-[#8B0000] hover:bg-[#6B0000] text-white px-8 py-3 rounded-full text-lg">
                    Join Us This Sunday
                  </Button>
                </Link>
                <Link href="/live">
                  <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 px-8 py-3 rounded-full text-lg">
                    Watch Live
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Floating Card */}
            <div className="hidden md:block relative">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-full h-full border-2 border-white/30 rounded-lg" />
                <div className="relative bg-white p-8 rounded-lg shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-[#8B0000]/10 flex items-center justify-center">
                      <Play className="w-6 h-6 text-[#8B0000]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Next Service</p>
                      <p className="text-lg font-semibold text-gray-900">Sunday at 8:00 AM</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Clock className="w-5 h-5 text-[#8B0000]" />
                      <span>8:00 AM - 12:00 PM</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin className="w-5 h-5 text-[#8B0000]" />
                      <span>Main Sanctuary</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Users className="w-5 h-5 text-[#8B0000]" />
                      <span>500+ Members</span>
                    </div>
                  </div>
                  <Link href="/events" className="block mt-6">
                    <Button className="w-full bg-[#8B0000] hover:bg-[#6B0000]">
                      View Full Schedule
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About / Intro Section */}
      <section className="py-20 md:py-28 bg-[#F8F8F8]">
        <div className="max-w-[900px] mx-auto px-4 sm:px-8 text-center">
          <div className="relative inline-block">
            {/* Corner decorations */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-[#8B0000]" />
            <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-[#8B0000]" />
            <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-[#8B0000]" />
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-[#8B0000]" />
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-gray-900 mb-6 leading-tight">
              A Place Where Faith <br />
              <span className="italic font-light bg-gradient-to-r from-[#8B0000] via-[#E8B4B4] to-[#8B0000] bg-clip-text text-transparent animate-pulse">Comes Alive</span>
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            At Watchman Lekki Lagos, we believe in the transformative power of God's love. 
            Our mission is to create an environment where everyone can experience 
            authentic worship, meaningful community, and spiritual growth.
          </p>
        </div>
      </section>

      {/* Announcements / Timeline Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left - Image Card */}
            <div className="relative">
              <div className="aspect-[4/5] bg-gradient-to-br from-[#8B0000] to-[#6B0000] rounded-lg p-8 flex flex-col justify-end">
                <h3 className="text-3xl font-serif font-semibold text-white mb-4">
                  Upcoming Events
                </h3>
                <p className="text-white/80 mb-6">
                  Mark your calendars and be part of these special moments
                </p>
                <Link href="/events">
                  <Button className="bg-white text-[#8B0000] hover:bg-white/90 w-full">
                    View All Events
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right - Timeline */}
            <div className="space-y-6">
              {announcements.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[#8B0000] flex items-center justify-center text-white font-semibold text-sm text-center leading-tight">
                      {item.date}
                    </div>
                    {index < announcements.length - 1 && (
                      <div className="w-px h-full bg-gray-200 my-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dark Feature Section */}
      <section className="py-20 md:py-28 bg-[#1A1A1A]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-white mb-6">
                Experience God's <br />
                <span className="text-[#8B0000]">Presence</span>
              </h2>
              <p className="text-white/70 mb-8 leading-relaxed">
                Our worship services are designed to create an atmosphere where 
                you can encounter God's presence. Through passionate worship, 
                relevant preaching, and community fellowship, we aim to help 
                you grow in your faith journey.
              </p>
              <div className="flex gap-4">
                <Link href="/about">
                  <Button className="bg-[#8B0000] hover:bg-[#6B0000]">
                    Learn More
                  </Button>
                </Link>
                <Link href="/live">
                  <Button variant="outline" className="border-white/40 text-white hover:bg-white/10">
                    Watch Service
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right - Image */}
            <div className="relative">
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                <Play className="w-20 h-20 text-white/50" />
              </div>
              {/* Decorative cross */}
              <div className="absolute -bottom-4 -right-4 w-16 h-16 border-2 border-[#8B0000] rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-[#8B0000] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-20 md:py-28 bg-[#F8F8F8]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-900 mb-4">
              Service Schedule
            </h2>
            <p className="text-gray-600">Join us at any of our weekly services</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {scheduleData.map((schedule, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[#8B0000] font-semibold mb-2">{schedule.day}</p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{schedule.service}</h3>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  <span>{schedule.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{schedule.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-28 bg-[#1A1A1A]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-white mb-4">
              What Our Members Say
            </h2>
            <p className="text-white/60">Hear from our church family</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-900 p-8 rounded-lg">
                <Quote className="w-10 h-10 text-[#8B0000] mb-4" />
                <p className="text-white/80 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#8B0000] flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-white/60 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-900 mb-6">
                Ready to Join Our <span className="text-[#8B0000]">Family</span>?
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We would love to have you join us this Sunday. Whether you're new to faith 
                or looking for a church home, you'll find a welcoming community here.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/login">
                  <Button className="bg-[#8B0000] hover:bg-[#6B0000] text-white px-8 py-3 rounded-full">
                    Get Started
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-full">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="aspect-square bg-gradient-to-br from-[#8B0000] to-[#6B0000] rounded-lg flex items-center justify-center">
                <Users className="w-24 h-24 text-white/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid Section */}
      <section className="py-20 md:py-28 bg-[#F8F8F8]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-900">
              Upcoming Events
            </h2>
            <Link href="/events" className="text-[#8B0000] hover:underline flex items-center gap-2">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-[16/10] bg-gray-200 flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-gray-400" />
                </div>
                <div className="p-4">
                  <p className="text-sm text-[#8B0000] font-medium mb-1">{event.category}</p>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
                  <p className="text-gray-600 text-sm">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}