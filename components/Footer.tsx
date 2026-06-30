import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";

/* ── Simple SVG social icons ── */
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-zinc-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* ── Brand ── */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/10">
                <Image
                  src="/logo.png"
                  alt="Aaradhya Dream City"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Aaradhya <span className="text-primary">Dream City</span>
              </span>
            </Link>

            <p className="text-zinc-400 text-base leading-relaxed mb-3 max-w-md">
              Thousands are already dreaming here.
            </p>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6 max-w-md">
              Join the Aaradhya family — investors, Associates, and homeowners building the city of tomorrow.
            </p>

            <Link
              href="/register"
              className="inline-block bg-primary text-black font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors duration-200 mb-8"
            >
              Become a Part of It
            </Link>

            {/* Social Icons */}
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-primary hover:text-black transition-all duration-200"
              >
                <InstagramIcon />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-primary hover:text-black transition-all duration-200"
              >
                <FacebookIcon />
              </a>
              <a
                href="#"
                aria-label="Twitter / X"
                className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-primary hover:text-black transition-all duration-200"
              >
                <TwitterIcon />
              </a>
              <a
                href="mailto:support@aaradhyadreamcity.in"
                aria-label="Email"
                className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-primary hover:text-black transition-all duration-200"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-zinc-400 hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/register" className="text-zinc-400 hover:text-primary transition-colors">Join as Associate</Link></li>
              <li><Link href="/#features" className="text-zinc-400 hover:text-primary transition-colors">Associate Benefits</Link></li>
              <li><Link href="/login" className="text-zinc-400 hover:text-primary transition-colors">Associate Login</Link></li>
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h4 className="text-white font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-zinc-400">
                <MapPin className="text-primary shrink-0 mt-0.5" size={18} />
                <span>Varanasi, Uttar Pradesh</span>
              </li>
              <li className="flex gap-3 text-zinc-400">
                <Phone className="text-primary shrink-0 mt-0.5" size={18} />
                <span>+91 93356 02932</span>
              </li>
              <li className="flex gap-3 text-zinc-400">
                <Mail className="text-primary shrink-0 mt-0.5" size={18} />
                <div className="flex flex-col gap-1">
                  <a href="mailto:support@aaradhyadreamcity.in" className="hover:text-primary transition-colors">
                    support@aaradhyadreamcity.in
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} Aaradhya Dream City. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors">Privacy Policy</Link>
            <a href="#" className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
