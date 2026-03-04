import { Link } from "wouter";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, ChevronRight, Twitter, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <img 
                src="/church_logo.jpeg" 
                alt="CHub" 
                className="h-12 w-auto object-contain rounded-full"
              />
              <span className="font-semibold text-white text-xl">
                CHub
              </span>
            </Link>
            <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-sm">
              CHub - Your Church Management Solution. Helping churches connect, grow, and disciple their members.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://facebook.com/CHubApp" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/chub_app" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all duration-200">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@CHubApp" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all duration-200">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://x.com/chub_app" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://wa.me/2340000000000" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all duration-200">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6 text-lg">Quick Links</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/events" className="text-gray-400 hover:text-indigo-400 text-lg flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link href="/sermons" className="text-gray-400 hover:text-indigo-400 text-lg flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                  Sermon Archive
                </Link>
              </li>
              <li>
                <Link href="/devotionals" className="text-gray-400 hover:text-indigo-400 text-lg flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                  Daily Devotionals
                </Link>
              </li>
              <li>
                <Link href="/prayer" className="text-gray-400 hover:text-indigo-400 text-lg flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                  Prayer Requests
                </Link>
              </li>
              <li>
                <Link href="/give" className="text-gray-400 hover:text-indigo-400 text-lg flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                  Ways to Give
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6 text-lg">Service Times</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <div className="w-3 h-3 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                <div>
                  <p className="font-medium text-white text-lg">Sunday Service</p>
                  <p className="text-gray-400 text-base">8:30 AM - 12:00 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-3 h-3 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                <div>
                  <p className="font-medium text-white text-lg">Tuesday Bible Study</p>
                  <p className="text-gray-400 text-base">6:00 PM - 8:00 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-3 h-3 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                <div>
                  <p className="font-medium text-white text-lg">Thursday Prayers</p>
                  <p className="text-gray-400 text-base">6:00 PM - 8:00 PM</p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6 text-lg">Contact</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-indigo-500 mt-1 shrink-0" />
                <p className="text-gray-400 text-lg leading-relaxed">
                  Lagos, Nigeria<br/>
                  (For your church address)
                </p>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="w-6 h-6 text-indigo-500 shrink-0" />
                <a href="tel:+2340000000000" className="text-gray-400 hover:text-indigo-400 text-lg transition-colors">
                  +234 000 000 0000
                </a>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="w-6 h-6 text-indigo-500 shrink-0" />
                <a href="mailto:hello@chub.app" className="text-gray-400 hover:text-indigo-400 text-lg transition-colors">
                  hello@chub.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-10 flex flex-col sm:flex-row justify-between items-center gap-5">
          <p className="text-gray-500 text-base">
            &copy; {new Date().getFullYear()} CHub. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="text-gray-500 hover:text-indigo-400 text-base transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-700">|</span>
            <a href="#" className="text-gray-500 hover:text-indigo-400 text-base transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
