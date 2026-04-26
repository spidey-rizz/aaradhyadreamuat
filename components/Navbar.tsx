"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";
import { Menu, X, Sun, Moon, LogOut, User } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    setIsLoggedIn(!!localStorage.getItem("access_token"));
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll lock when menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  const isHome = pathname === "/";
  const shouldForceWhite = isHome && !isScrolled;

  return (
    <>
      {/* ━━━ NAVBAR ━━━ (no backdrop-blur so it doesn't create a stacking context on mobile) */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[90] transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 border-b border-border shadow-md py-2 sm:py-3"
            : isHome
            ? "bg-transparent py-5"
            : "bg-background border-b border-border py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-14">
          <div className="flex items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 transition-all duration-300 ${shouldForceWhite ? "ring-white/20" : "ring-primary/40"} group-hover:ring-primary/60`}>
                <Image src="/logo.jpg" alt="Logo" fill className="object-cover" priority />
              </div>
              <div className="flex flex-col leading-none">
                <span className={`text-[15px] sm:text-[16px] font-black tracking-tight transition-colors ${shouldForceWhite ? "text-white" : "text-foreground"}`}>Aaradhya</span>
                <span className="text-[9px] sm:text-[11px] font-bold tracking-[0.2em] text-primary uppercase mt-0.5">Dream City</span>
              </div>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { label: "HOME",     href: "/" },
                { label: "ABOUT",    href: "/about" },
                { label: "PROJECTS", href: "/#projects" },
                { label: "CONTACT",  href: "/contact" },
                { label: "CAREER",   href: "/career" },
                { label: "INVESTOR", href: "/investor" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-[11px] font-black tracking-[0.2em] transition-colors ${shouldForceWhite ? "text-white/70 hover:text-white" : "text-foreground/70 hover:text-primary"}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Desktop Right Actions */}
            <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className={`hidden md:block p-2 transition-colors ${shouldForceWhite ? "text-white/70 hover:text-white" : "text-foreground/70 hover:text-primary"}`}>
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <div className="hidden md:block">
                {isLoggedIn ? (
                  <Link href="/dashboard" className="px-7 py-2.5 bg-primary text-black rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg shadow-primary/20">Dashboard</Link>
                ) : (
                  <Link href="/login" className={`px-7 py-2.5 border rounded-full text-[10px] font-black tracking-widest uppercase ${shouldForceWhite ? "border-white/20 text-white hover:bg-white/10" : "border-border text-foreground hover:bg-foreground/[0.05]"}`}>Login</Link>
                )}
              </div>

              {/* Mobile Hamburger — always gold, always visible */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-12 h-12 flex items-center justify-center rounded-2xl bg-primary text-black shadow-lg active:scale-90 transition-transform"
              >
                <Menu size={26} strokeWidth={3} />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* ━━━ MOBILE MENU ━━━ Lives OUTSIDE the nav so backdrop-blur doesn't trap it */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[999] flex flex-col" style={{ background: theme === "dark" ? "#090909" : "#ffffff" }}>
          {/* Close Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-5 w-12 h-12 flex items-center justify-center rounded-2xl bg-primary text-black shadow-xl active:scale-90 transition-transform z-10"
          >
            <X size={26} strokeWidth={3} />
          </button>

          {/* Nav Links */}
          <div className="flex-grow overflow-y-auto pt-28 px-8 space-y-1">
            <p className="text-[10px] font-black tracking-[0.5em] text-primary uppercase opacity-50 mb-8">Navigate</p>
            {[
              { label: "Home",       href: "/" },
              { label: "About Us",   href: "/about" },
              { label: "Projects",   href: "/#projects" },
              { label: "Contact",    href: "/contact" },
              { label: "Career",     href: "/career" },
              { label: "Investor",   href: "/investor" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block py-5 text-4xl font-serif tracking-tighter border-b border-gray-200/10 hover:text-primary transition-colors"
                style={{ color: theme === "dark" ? "#f5f5f5" : "#1a1a1a" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="shrink-0 px-8 pb-12 space-y-4">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-3 w-full py-5 bg-primary text-black rounded-3xl font-black text-xs tracking-widest uppercase shadow-xl shadow-primary/30">
                  <User size={18} /> Dashboard
                </Link>
                <button onClick={handleLogout}
                  className="w-full py-4 text-xs font-black tracking-widest uppercase text-red-500 border border-red-500/20 rounded-3xl">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-5 bg-primary text-black text-center rounded-3xl font-black text-xs tracking-widest uppercase shadow-xl shadow-primary/30">
                Login / Sign Up
              </Link>
            )}
            <button onClick={() => { toggleTheme(); }}
              className="flex items-center justify-between w-full px-6 py-4 rounded-3xl border"
              style={{ borderColor: "rgba(128,128,128,0.15)", background: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}>
              <span className="text-[10px] font-black tracking-widest uppercase opacity-50">Switch Theme</span>
              {theme === "light" ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-primary" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}