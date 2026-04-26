"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";
import { User, LogOut, Menu, X, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

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

  const isHome = pathname === "/";
  // Force white text ONLY on home page when not scrolled (over video)
  const shouldForceWhite = isHome && !isScrolled;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-2xl border-b border-border shadow-sm"
            : isHome ? "bg-transparent" : "bg-background/80 backdrop-blur-md border-b border-border/50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-14">
          <div className="flex items-center justify-between py-3 sm:py-4 gap-4">

            {/* ── Logo Container (Shrinkable) ── */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-shrink">
              <div
                className={`
                  relative w-9 h-9 sm:w-12 sm:h-12 rounded-full overflow-hidden
                  ring-2 transition-all duration-300 flex-shrink-0
                  ${shouldForceWhite ? "ring-white/20" : "ring-foreground/10"}
                  group-hover:ring-primary/60
                `}
              >
                <Image
                  src="/logo.jpg"
                  alt="Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col leading-none min-w-0 overflow-hidden">
                <span className={`text-[13px] sm:text-[15px] font-black tracking-tight transition-colors duration-300 truncate ${shouldForceWhite ? "text-white" : "text-foreground"}`}>
                  Aaradhya
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold tracking-[0.1em] text-primary uppercase mt-[2px] truncate opacity-80">
                  Dream City
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav Links (Centred) ── */}
            <div className="hidden md:flex flex-col items-center gap-y-[2px] flex-grow">
              <div className="flex items-center gap-1">
                {[
                  { label: "HOME",       href: "/" },
                  { label: "ABOUTS",     href: "/about" },
                  { label: "CONTACT US", href: "/contact" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`relative px-5 py-1.5 text-[13px] font-bold tracking-widest transition-colors duration-200 rounded-md hover:bg-foreground/[0.05] group ${shouldForceWhite ? "text-white/80 hover:text-white" : "text-foreground/80 hover:text-foreground"}`}
                  >
                    {item.label}
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-primary group-hover:w-3/4 transition-all duration-300" />
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[
                  { label: "Projects",  href: "/#projects" },
                  { label: "Career",    href: "/career" },
                  { label: "Investor",  href: "/investor" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`relative px-5 py-1 text-[12px] font-medium tracking-wider transition-colors duration-200 rounded-md hover:bg-foreground/[0.04] group ${shouldForceWhite ? "text-white/50 hover:text-white/85" : "text-foreground/50 hover:text-foreground/85"}`}
                  >
                    {item.label}
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-px bg-primary/70 group-hover:w-3/4 transition-all duration-300" />
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Right Actions (Desktop Auth + Mobile Toggle) ── */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              
              {/* Desktop Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className={`hidden md:flex p-2.5 rounded-xl transition-colors border ${
                  shouldForceWhite 
                    ? "bg-white/5 border-white/10 text-white/70 hover:bg-white/10" 
                    : "bg-foreground/[0.03] border-border text-foreground/70 hover:bg-foreground/[0.06]" 
                }`}
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              <div className={`hidden md:block h-8 w-px mx-1 transition-colors ${shouldForceWhite ? "bg-white/10" : "bg-border"}`} />

              {/* Desktop Auth */}
              <div className="hidden md:flex items-center gap-2">
                {isLoggedIn ? (
                  <>
                    <Link href="/dashboard" className={`px-4 py-2 text-sm font-bold transition-colors uppercase tracking-widest ${shouldForceWhite ? "text-white/70 hover:text-white" : "text-foreground/70 hover:text-foreground"}`}>
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className={`px-4 py-2 text-sm font-bold transition-colors uppercase tracking-widest ${shouldForceWhite ? "text-white/40 hover:text-red-400" : "text-foreground/40 hover:text-red-500"}`}>
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" className={`px-5 py-2 rounded-md border text-sm font-bold tracking-widest uppercase transition-all ${shouldForceWhite ? "border-white/20 text-white/80 hover:bg-white/10" : "border-foreground/20 text-foreground/80 hover:bg-foreground/[0.05]"}`}>
                    Login
                  </Link>
                )}
              </div>

              {/* ── MOBILE HAMBURGER (Visible on mobile) ── */}
              <button
                className={`md:hidden flex items-center justify-center p-2.5 rounded-xl transition-all border shadow-lg relative z-[110] ${
                  shouldForceWhite 
                    ? "bg-primary border-primary text-black" 
                    : "bg-primary border-primary text-black"
                }`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu Overlay ── */}
        {mobileMenuOpen && (
          <div className={`md:hidden fixed inset-0 z-[105] animate-in fade-in duration-300 ${
            theme === 'dark' ? "bg-black/95" : "bg-white/98"
          }`}>
            <div className="flex flex-col h-full pt-24 px-8 pb-12 overflow-y-auto">
              <p className="text-[10px] font-black tracking-[0.3em] text-primary uppercase mb-6 opacity-60">Navigation</p>
              <div className="space-y-1 mb-12">
                {[
                  { label: "HOME",       href: "/" },
                  { label: "ABOUT US",   href: "/about" },
                  { label: "CONTACT US", href: "/contact" },
                  { label: "PROJECTS",  href: "/#projects" },
                  { label: "CAREER",    href: "/career" },
                  { label: "INVESTOR",  href: "/investor" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block py-4 text-2xl font-serif tracking-tight border-b border-border/50 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="mt-auto space-y-4">
                {isLoggedIn ? (
                  <>
                    <Link href="/dashboard" className="block w-full py-4 bg-primary text-black text-center font-black tracking-widest text-sm rounded-2xl" onClick={() => setMobileMenuOpen(false)}>
                      DASHBOARD
                    </Link>
                    <button onClick={handleLogout} className="block w-full py-4 text-center font-black tracking-widest text-sm text-red-500 rounded-2xl border border-red-500/20">
                      LOGOUT
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="block w-full py-5 bg-primary text-black text-center font-black tracking-widest text-sm rounded-2xl shadow-xl shadow-primary/20" onClick={() => setMobileMenuOpen(false)}>
                    LOGIN / SIGN UP
                  </Link>
                )}

                <button
                  onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
                  className={`flex items-center justify-between w-full p-5 rounded-2xl border border-border ${theme === 'dark' ? "bg-white/5" : "bg-black/5"}`}
                >
                  <span className="text-[10px] font-black tracking-widest uppercase">Switch Appearance</span>
                  {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}