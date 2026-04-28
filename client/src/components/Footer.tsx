import { Link } from "wouter";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Twitter } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#1b1b1c] px-4 sm:px-8 md:px-24 py-10 md:py-14">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/church_logo.jpeg" alt="CHub" className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-6 max-w-sm">
              CHub is your all-in-one church community platform. Connect, grow, and serve together.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://facebook.com/CHubApp" target="_blank" rel="noopener noreferrer" className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#a0a0a0] hover:text-white transition-opacity">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/chub_app" target="_blank" rel="noopener noreferrer" className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#a0a0a0] hover:text-white transition-opacity">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@CHubApp" target="_blank" rel="noopener noreferrer" className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#a0a0a0] hover:text-white transition-opacity">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://x.com/chub_app" target="_blank" rel="noopener noreferrer" className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#a0a0a0] hover:text-white transition-opacity">
                <Twitter className="w-5 h-5" />
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
            © {currentYear} CHub. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="mailto:hello@chub.app" className="text-sm text-[#a0a0a0] hover:text-white transition-colors">
              hello@chub.app
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
