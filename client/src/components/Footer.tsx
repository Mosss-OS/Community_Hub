import { Link } from "wouter";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { FaFacebookF, FaInstagram, FaYoutube, FaTwitter } from "react-icons/fa";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1A1A] text-white py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="https://res.cloudinary.com/dv0tt80vn/image/upload/v1777633359/watchman_logo_uc5f1m.webp" 
                alt="Watchman Lekki" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-xl font-semibold">Watchman Lekki</span>
            </div>
            <p className="text-white/60 text-sm mb-4">
              A community of believers dedicated to spreading the love of God and making a positive impact in our world.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://facebook.com/watchmanlekki" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                <FaFacebookF className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/watchmanlekki" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@watchmanlekki" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                <FaYoutube className="w-5 h-5" />
              </a>
              <a href="https://x.com/watchmanlekki" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-white/60 hover:text-white">About</Link></li>
              <li><Link href="/sermons" className="text-white/60 hover:text-white">Sermons</Link></li>
              <li><Link href="/events" className="text-white/60 hover:text-white">Events</Link></li>
              <li><Link href="/groups" className="text-white/60 hover:text-white">Small Groups</Link></li>
              <li><Link href="/live" className="text-white/60 hover:text-white">Live</Link></li>
              <li><Link href="/give" className="text-white/60 hover:text-white">Give</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/60">
                <MapPin className="w-4 h-4" />
                <span>Victoria Island, Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-2 text-white/60">
                <Phone className="w-4 h-4" />
                <span>+234 800 CHURCH</span>
              </li>
              <li className="flex items-center gap-2 text-white/60">
                <Mail className="w-4 h-4" />
                <span>info@watchmanlekki.org</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-white/60 text-sm mb-4">Stay updated with our latest announcements</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-l-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
              />
              <button className="bg-[#8B0000] hover:bg-[#6B0000] rounded-r-lg px-3">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 text-center text-white/40 text-sm">
          <p>&copy; {currentYear} Watchman Lekki. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}