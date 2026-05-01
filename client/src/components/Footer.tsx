import { Link } from "wouter";
import { FaFacebookF, FaInstagram, FaYoutube, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#1b1b1c] px-4 sm:px-8 md:px-24 py-10 md:py-14">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#8B0000] flex items-center justify-center">
                <span className="text-xl font-serif font-bold text-white">W</span>
              </div>
            </Link>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-6 max-w-sm">
              Watchman Lagos - A community of believers dedicated to spreading the love of God and making a positive impact in our world.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://facebook.com/WinnersChapelLagos" target="_blank" rel="noopener noreferrer" className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#a0a0a0] hover:text-white transition-opacity">
                <FaFacebookF className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/winnerschapellagos" target="_blank" rel="noopener noreferrer" className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#a0a0a0] hover:text-white transition-opacity">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@WinnersChapelLagos" target="_blank" rel="noopener noreferrer" className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#a0a0a0] hover:text-white transition-opacity">
                <FaYoutube className="w-5 h-5" />
              </a>
              <a href="https://x.com/winnerschapellagos" target="_blank" rel="noopener noreferrer" className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#a0a0a0] hover:text-white transition-opacity">
                <FaTwitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-7">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <h4 className="text-sm font-light text-white mb-4">Platform</h4>
                <ul className="space-y-3">
                  <li><Link href="/sermons" className="text-sm text-[#a0a0a0] hover:text-white transition-colors">Sermons</Link></li>
                  <li><Link href="/events" className="text-sm text-[#a0a0a0] hover:text-white transition-colors">Events</Link></li>
                  <li><Link href="/devotionals" className="text-sm text-[#a0a0a0] hover:text-white transition-colors">Devotionals</Link></li>
                  <li><Link href="/give" className="text-sm text-[#a0a0a0] hover:text-white transition-colors">Give</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-light text-white mb-4">Community</h4>
                <ul className="space-y-3">
                  <li><Link href="/members" className="text-sm text-[#a0a0a0] hover:text-white transition-colors">Members</Link></li>
                  <li><Link href="/groups" className="text-sm text-[#a0a0a0] hover:text-white transition-colors">Groups</Link></li>
                  <li><Link href="/prayer" className="text-sm text-[#a0a0a0] hover:text-white transition-colors">Prayer</Link></li>
                  <li><Link href="/feed" className="text-sm text-[#a0a0a0] hover:text-white transition-colors">Feed</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-light text-white mb-4">Company</h4>
                <ul className="space-y-3">
                  <li><Link href="/about" className="text-sm text-[#a0a0a0] hover:text-white transition-colors">About</Link></li>
                  <li><Link href="/contact" className="text-sm text-[#a0a0a0] hover:text-white transition-colors">Contact</Link></li>
                  <li><Link href="/careers" className="text-sm text-[#a0a0a0] hover:text-white transition-colors">Careers</Link></li>
                  <li><Link href="/blog" className="text-sm text-[#a0a0a0] hover:text-white transition-colors">Blog</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-light text-white mb-4">Legal</h4>
                <ul className="space-y-3">
                  <li><Link href="/privacy" className="text-sm text-[#a0a0a0] hover:text-white transition-colors">Privacy</Link></li>
                  <li><Link href="/terms" className="text-sm text-[#a0a0a0] hover:text-white transition-colors">Terms</Link></li>
                  <li><Link href="/cookies" className="text-sm text-[#a0a0a0] hover:text-white transition-colors">Cookies</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full border-t border-white/10 mt-12 pt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#a0a0a0]">
            © {currentYear} Watchman Lagos. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="mailto:info@winnerschapel.org" className="text-sm text-[#a0a0a0] hover:text-white transition-colors">
              info@winnerschapel.org
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
