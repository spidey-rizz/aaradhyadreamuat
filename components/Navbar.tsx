"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { User, LogOut, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem("access_token"));
    
    window.addEventListener("scroll", handleScroll);
    checkAuth();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-black/80 backdrop-blur-2xl border-b border-zinc-800/60 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : "bg-black/40 backdrop-blur-md py-5 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 gold-gradient rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-shadow duration-300">
              <span className="text-black font-black text-lg leading-none">A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold tracking-tight text-white leading-none">
                Aaradhya
              </span>
              <span className="text-[10px] font-semibold tracking-[0.15em] text-primary/80 uppercase leading-none mt-0.5">
                Real Estate
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]">
              Home
            </Link>
            <Link href="/#features" className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]">
              Benefits
            </Link>
            
            <div className="w-px h-5 bg-zinc-800 mx-3" />

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]">
                  <User size={16} className="text-primary" />
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-red-500/[0.06]">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="px-5 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]">
                  Login
                </Link>
                <Link href="/register" className="gold-gradient px-6 py-2 rounded-full text-black font-bold text-sm hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                  Join as Broker
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-zinc-300 p-2 rounded-lg hover:bg-white/[0.04] transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-2xl border-t border-zinc-800/60 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-4 pb-8 space-y-1">
            <Link href="/" className="block px-4 py-3 text-base font-medium text-zinc-300 rounded-xl hover:bg-white/[0.04]" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/#features" className="block px-4 py-3 text-base font-medium text-zinc-300 rounded-xl hover:bg-white/[0.04]" onClick={() => setMobileMenuOpen(false)}>Broker Benefits</Link>
            
            <div className="h-px bg-zinc-800/60 my-3" />
            
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="block px-4 py-3 text-base font-medium text-zinc-300 rounded-xl hover:bg-white/[0.04]" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-base font-medium text-red-400 rounded-xl hover:bg-red-500/[0.06]">Logout</button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link href="/login" className="block px-4 py-3 text-base font-medium text-zinc-300 rounded-xl hover:bg-white/[0.04]" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link href="/register" className="block gold-gradient w-full py-3.5 rounded-xl text-black text-center font-bold" onClick={() => setMobileMenuOpen(false)}>Join as Broker</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
