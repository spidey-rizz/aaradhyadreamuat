"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { User, LogOut, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    const checkAuth = () =>
      setIsLoggedIn(!!localStorage.getItem("access_token"));

    window.addEventListener("scroll", handleScroll);
    checkAuth();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-black/40 backdrop-blur-2xl border-b border-white/[0.07] shadow-[0_4px_40px_rgba(0,0,0,0.5)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">

          {/* ── Single row: Logo | Two-row links | Auth ── */}
          <div className="flex items-center justify-between py-4">

            {/* ── Logo (circle) ── */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div
                className="
                  relative w-12 h-12 rounded-full overflow-hidden
                  ring-2 ring-white/20
                  group-hover:ring-primary/60
                  transition-all duration-300
                "
              >
                <Image
                  src="/logo.jpg"
                  alt="Aaradhya Dream City"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="text-[15px] font-extrabold tracking-tight text-white">
                  Aaradhya
                </span>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-primary/80 uppercase mt-[3px]">
                  Dream City
                </span>
              </div>
            </Link>

            {/* ── Desktop: Two-row nav links (centred) ── */}
            <div className="hidden md:flex flex-col items-center gap-y-[2px] flex-1 mx-8">

              {/* Row 1 — primary links */}
              <div className="flex items-center gap-1">
                {[
                  { label: "HOME",       href: "/" },
                  { label: "ABOUTS",     href: "/about" },
                  { label: "CONTACT US", href: "/contact" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="
                      relative px-5 py-1.5
                      text-[13px] font-bold tracking-widest
                      text-white/80 hover:text-white
                      transition-colors duration-200
                      rounded-md hover:bg-white/[0.05]
                      group
                    "
                  >
                    {item.label}
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-primary group-hover:w-3/4 transition-all duration-300" />
                  </Link>
                ))}
              </div>

              {/* Row 2 — secondary links (slightly smaller, dimmer) */}
              <div className="flex items-center gap-1">
                {[
                  { label: "Projects",  href: "/#projects" },
                  { label: "Career",    href: "/career" },
                  { label: "Investor",  href: "/investor" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="
                      relative px-5 py-1
                      text-[12px] font-medium tracking-wider
                      text-white/50 hover:text-white/85
                      transition-colors duration-200
                      rounded-md hover:bg-white/[0.04]
                      group
                    "
                  >
                    {item.label}
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-px bg-primary/70 group-hover:w-3/4 transition-all duration-300" />
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Auth (right side) ── */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white/70 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
                  >
                    <User size={14} className="text-primary" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white/50 hover:text-red-400 rounded-lg hover:bg-red-500/[0.07] transition-colors cursor-pointer"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="
                    px-5 py-2 rounded-md
                    border border-white/25 hover:border-white/50
                    text-sm font-semibold tracking-wide text-white/80 hover:text-white
                    hover:bg-white/[0.05]
                    transition-all duration-200
                  "
                >
                  Login / Sign up
                </Link>
              )}
            </div>

            {/* ── Mobile Toggle ── */}
            <button
              className="md:hidden text-white/80 p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/85 backdrop-blur-2xl border-t border-white/[0.07]">
            <div className="px-6 pt-5 pb-8 space-y-1">

              <p className="text-[10px] font-bold tracking-[0.25em] text-white/30 uppercase px-4 pb-2">
                Main
              </p>
              {[
                { label: "HOME",       href: "/" },
                { label: "ABOUTS",     href: "/about" },
                { label: "CONTACT US", href: "/contact" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block px-4 py-3 text-sm font-bold tracking-widest text-white/80 rounded-xl hover:bg-white/[0.05]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="h-px bg-white/[0.06] my-3" />

              <p className="text-[10px] font-bold tracking-[0.25em] text-white/30 uppercase px-4 pb-2">
                Explore
              </p>
              {[
                { label: "Projects",  href: "/#projects" },
                { label: "Career",    href: "/career" },
                { label: "Investor",  href: "/investor" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block px-4 py-3 text-sm font-medium text-white/60 rounded-xl hover:bg-white/[0.05]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="h-px bg-white/[0.06] my-3" />

              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-3 text-sm font-medium text-white/80 rounded-xl hover:bg-white/[0.05]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-sm font-medium text-red-400 rounded-xl hover:bg-red-500/[0.06]"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block mt-2 mx-2 px-4 py-3 text-center text-sm font-semibold text-white border border-white/20 rounded-xl hover:bg-white/[0.05]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login / Sign up
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}