import { Link } from "wouter";
import { ArrowRight, Play, Calendar, BookOpen, Heart, Clock, MapPin, Phone, Mail, Quote, ChevronRight, Menu, X, Star, Award, Cross } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageSEO } from "@/components/PageSEO";
import { StaffDirectory } from "@/components/StaffDirectory";

export default function AboutPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const coreValues = [
    { title: "Worship", description: "We prioritize authentic worship in everything we do", icon: Heart },
    { title: "Community", description: "Building meaningful relationships with one another", icon: Users },
    { title: "Discipleship", description: "Growing together in faith and knowledge", icon: BookOpen },
    { title: "Service", description: "Using our gifts to serve others", icon: Award },
  ];

  return (
    <>
      <PageSEO
        title="About Us | Watchman Lekki"
        description="Learn more about Watchman Lekki - our story, leadership, and core values."
      />

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[45] transition-all duration-300 ${isScrolled ? "bg-white shadow-md" : "bg-transparent"}`}>
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
            <Link href="/contact">
              <Button className={`px-6 py-2 rounded-full ${isScrolled ? "bg-[#8B0000] hover:bg-[#6B0000] text-white" : "bg-[#8B0000] hover:bg-[#6B0000] text-white"}`}>
                Contact Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/church_building.avif")' }}
        >
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-8 text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold mb-6 text-white">
            About Our Church
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            We are a community of believers dedicated to spreading the love of God 
            and making a positive impact in our world.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-900 mb-6">
                Our <span className="text-[#8B0000]">Story</span>
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Watchman Lekki was founded with a vision to create a welcoming 
                community where people can experience the love of God and grow in their faith.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Over the years, we have expanded our ministries to include worship, 
                youth programs, children's church, small groups, and community outreach. 
                Today, we continue to be a beacon of hope in our city and beyond.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our mission remains simple: to love God, love others, and make a difference.
              </p>
            </div>
            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <Star className="w-20 h-20 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 md:py-28 bg-[#F8F8F8]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {coreValues.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#8B0000]/10 flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-[#8B0000]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Leadership */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-900 mb-4">
                Our Leadership
              </h2>
              <p className="text-gray-600">Meet the team that guides our vision</p>
            </div>

            <StaffDirectory />
          </div>
        </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-[#8B0000]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-6">
            Join Our Church Family
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            We invite you to be part of our growing community. 
            Come experience the love and warmth of our church family.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/contact">
              <Button className="bg-white text-[#8B0000] hover:bg-white/90 px-8 py-3 rounded-full">
                Get Started
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3 rounded-full">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}