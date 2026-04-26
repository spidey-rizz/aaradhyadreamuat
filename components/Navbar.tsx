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
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-2xl border-b border-border shadow-sm"
            : isHome ? "bg-transparent" : "bg-background/80 backdrop-blur-md border-b border-border/50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">

          {/* ── Single row: Logo | Two-row links | Auth ── */}
          <div className="flex items-center justify-between py-4">

            {/* ── Logo (circle) ── */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div
                className={`
                  relative w-12 h-12 rounded-full overflow-hidden
                  ring-2 transition-all duration-300
                  ${shouldForceWhite ? "ring-white/20" : "ring-foreground/10"}
                  group-hover:ring-primary/60
                `}
              >
                <Image
                  src="/logo.jpg"
                  alt="Aaradhya Dream City"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className={`text-[15px] font-extrabold tracking-tight transition-colors duration-300 ${shouldForceWhite ? "text-white" : "text-foreground"}`}>
                  Aaradhya
                </span>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase mt-[3px]">
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
                    className={`
                      relative px-5 py-1.5
                      text-[13px] font-bold tracking-widest
                      transition-colors duration-200
                      rounded-md hover:bg-foreground/[0.05]
                      group
                      ${shouldForceWhite ? "text-white/80 hover:text-white" : "text-foreground/80 hover:text-foreground"}
                    `}
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
                    className={`
                      relative px-5 py-1
                      text-[12px] font-medium tracking-wider
                      transition-colors duration-200
                      rounded-md hover:bg-foreground/[0.04]
                      group
                      ${shouldForceWhite ? "text-white/50 hover:text-white/85" : "text-foreground/50 hover:text-foreground/85"}
                    `}
                  >
                    {item.label}
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-px bg-primary/70 group-hover:w-3/4 transition-all duration-300" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4 shrink-0">
              <button 
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl transition-colors border ${
                  shouldForceWhite 
                    ? "bg-white/5 border-white/10 text-white/70 hover:bg-white/10" 
                    : "bg-foreground/[0.03] border-border text-foreground/70 hover:bg-foreground/[0.06]" 
                }`}
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              <div className={`h-8 w-px mx-2 transition-colors ${shouldForceWhite ? "bg-white/10" : "bg-border"}`} />

              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg transition-colors uppercase tracking-widest ${
                      shouldForceWhite ? "text-white/70 hover:text-white hover:bg-white/10" : "text-foreground/70 hover:text-foreground hover:bg-foreground/[0.05]"
                    }`}
                  >
                    <User size={14} className="text-primary" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg transition-colors cursor-pointer uppercase tracking-widest ${
                      shouldForceWhite ? "text-white/40 hover:text-red-400 hover:bg-red-500/10" : "text-foreground/40 hover:text-red-500 hover:bg-red-500/[0.07]"
                    }`}
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className={`
                    px-5 py-2 rounded-md border transition-all uppercase
                    text-sm font-bold tracking-widest
                    ${shouldForceWhite 
                      ? "border-white/20 text-white/80 hover:text-white hover:border-white/50 hover:bg-white/10"
                      : "border-foreground/20 text-foreground/80 hover:text-foreground hover:border-foreground/50 hover:bg-foreground/[0.05]" }
                  `}
                >
                  Login / Sign up
                </Link>
              )}
            </div>

            {/* ── Mobile Toggle ── */}
            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${shouldForceWhite ? "text-white hover:bg-white/10" : "text-foreground hover:bg-foreground/[0.05]"}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileMenuOpen && (
          <div className={`md:hidden backdrop-blur-2xl border-t transition-colors ${shouldForceWhite ? "bg-black/85 border-white/[0.07]" : "bg-background/95 border-border"}`}>
            <div className="px-6 pt-5 pb-8 space-y-1">

              <p className={`text-[10px] font-bold tracking-[0.25em] uppercase px-4 pb-2 ${shouldForceWhite ? "text-white/30" : "text-foreground/30"}`}>
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
                  className={`block px-4 py-3 text-sm font-bold tracking-widest rounded-xl transition-colors ${shouldForceWhite ? "text-white/80 hover:bg-white/[0.05]" : "text-foreground/80 hover:bg-foreground/[0.05]"}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className={`h-px my-3 ${shouldForceWhite ? "bg-white/[0.06]" : "bg-border"}`} />

              <p className={`text-[10px] font-bold tracking-[0.25em] uppercase px-4 pb-2 ${shouldForceWhite ? "text-white/30" : "text-foreground/30"}`}>
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
                  className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${shouldForceWhite ? "text-white/60 hover:bg-white/[0.05]" : "text-foreground/60 hover:bg-foreground/[0.05]"}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className={`h-px my-3 ${shouldForceWhite ? "bg-white/[0.06]" : "bg-border"}`} />

              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${shouldForceWhite ? "text-white/80 hover:bg-white/[0.05]" : "text-foreground/80 hover:bg-foreground/[0.05]"}`}
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
                  className={`block mt-2 mx-2 px-4 py-3 text-center text-sm font-semibold border rounded-xl transition-all ${shouldForceWhite ? "text-white border-white/20 hover:bg-white/[0.05]" : "text-foreground border-border hover:bg-foreground/[0.05]"}`}
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