import Link from "next/link";
import { Globe, Share2, MessageCircle, ExternalLink, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-zinc-900 pt-16 pb-8 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 gold-gradient rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Aaradhya <span className="gold-text-gradient">Real Estate</span>
              </span>
            </Link>
            <p className="text-zinc-400 text-base leading-relaxed mb-8 max-w-md">
              The premier destination for real estate investment and development in Dream City. 
              Join our exclusive broker network and be part of the future of urban living.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-primary hover:text-black transition-all">
                <Globe size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-primary hover:text-black transition-all">
                <Share2 size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-primary hover:text-black transition-all">
                <MessageCircle size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-primary hover:text-black transition-all">
                <ExternalLink size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-zinc-400 hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/register" className="text-zinc-400 hover:text-primary transition-colors">Join as Broker</Link></li>
              <li><Link href="/#features" className="text-zinc-400 hover:text-primary transition-colors">Broker Benefits</Link></li>
              <li><Link href="/login" className="text-zinc-400 hover:text-primary transition-colors">Broker Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-zinc-400">
                <MapPin className="text-primary shrink-0" size={20} />
                <span>Sector 15, Dream City Plaza, HQ Suite 201</span>
              </li>
              <li className="flex gap-3 text-zinc-400">
                <Phone className="text-primary shrink-0" size={20} />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex gap-3 text-zinc-400">
                <Mail className="text-primary shrink-0" size={20} />
                <span>brokers@aaradhyacity.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-900 pt-8 flex flex-col md:row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} Aaradhya Real Estate. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-zinc-500 text-sm hover:text-zinc-300">Privacy Policy</a>
            <a href="#" className="text-zinc-500 text-sm hover:text-zinc-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
