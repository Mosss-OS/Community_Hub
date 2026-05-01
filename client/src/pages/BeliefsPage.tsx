import { Link } from "wouter";
import { ArrowRight, ChevronLeft, Users, Award, BookOpen, Heart, Star, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageSEO } from "@/components/PageSEO";

export default function BeliefsPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("core");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const coreBeliefs = [
    {
      title: "The Bible",
      description: "We believe the Bible is the inspired Word of God, without error in its original manuscripts, and is the final authority for faith and practice."
    },
    {
      title: "The Trinity",
      description: "We believe in one God, existing eternally in three persons: Father, Son, and Holy Spirit. Each is fully God, yet there is only one God."
    },
    {
      title: "Jesus Christ",
      description: "We believe Jesus Christ is the Son of God, born of a virgin, fully divine and fully human. He died for our sins, rose bodily from the grave, and will return."
    },
    {
      title: "Salvation",
      description: "We believe salvation is by grace through faith in Christ alone. All who trust in Jesus as Lord and Savior are forgiven and adopted as children of God."
    },
    {
      title: "The Church",
      description: "We believe the church is the body of Christ, called to worship God, love one another, and make disciples of all nations."
    },
    {
      title: "Eternity",
      description: "We believe in the bodily return of Jesus Christ, the resurrection of the dead, and eternal life with God for believers."
    }
  ];

  const values = [
    { title: "Worship", description: "We prioritize authentic, Spirit-led worship in all we do" },
    { title: "Community", description: "We build meaningful relationships through fellowship" },
    { title: "Discipleship", description: "We grow together in faith through teaching and mentorship" },
    { title: "Service", description: "We use our gifts to serve others in love" },
    { title: "Evangelism", description: "We share the Good News of Jesus with the world" },
    { title: "Prayer", description: "We believe in the power of prayer to transform lives" }
  ];

  return (
    <>
      <PageSEO
        title="Statement of Faith | Watchman Lagos"
        description="Our core beliefs and values at Watchman Lagos."
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
                Watchman
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/about" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white"}`}>About</Link>
              <Link href="/sermons" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white"}`}>Sermons</Link>
              <Link href="/events" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white"}`}>Events</Link>
              <Link href="/beliefs" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white"}`}>Beliefs</Link>
              <Link href="/groups" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white"}`}>Groups</Link>
              <Link href="/live" className={`text-sm font-medium hover:text-[#8B0000] ${isScrolled ? "text-gray-700" : "text-white"}`}>Live</Link>
            </div>
            <Link href="/login">
              <Button className="bg-[#8B0000] hover:bg-[#6B0000] text-white px-6 py-2 rounded-full">
                Join Us
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
            Statement of Faith
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            The core beliefs that define our church and guide our mission
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="flex gap-8">
            <button 
              onClick={() => setActiveTab("core")}
              className={`pb-3 px-1 ${activeTab === "core" ? "border-b-2 border-[#8B0000] text-[#8B0000]" : "text-gray-600"}`}
            >
              Core Beliefs
            </button>
            <button 
              onClick={() => setActiveTab("values")}
              className={`pb-3 px-1 ${activeTab === "values" ? "border-b-2 border-[#8B0000] text-[#8B0000]" : "text-gray-600"}`}
            >
              Our Values
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 md:py-28 bg-[#F8F8F8]">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-8">
          {activeTab === "core" && (
            <div className="grid gap-6">
              {coreBeliefs.map((belief, index) => (
                <div key={index} className="bg-white p-8 rounded-lg shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#8B0000] flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{belief.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{belief.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "values" && (
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="w-5 h-5 text-[#8B0000]" />
                    <h3 className="text-lg font-semibold text-gray-900">{value.title}</h3>
                  </div>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-[#8B0000]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-6">
            Join Us in Faith
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            We invite you to be part of our church family. Come experience the love of God 
            and grow in your faith with us.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/login">
              <Button className="bg-white text-[#8B0000] hover:bg-white/90 px-8 py-3 rounded-full">
                Get Started
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3 rounded-full">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
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