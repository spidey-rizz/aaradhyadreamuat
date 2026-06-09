"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/useAuth";
import {
  User,
  Users,
  Wallet,
  UserCheck,
  Home,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Shield,
  ShieldAlert,
  Loader2
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status, profile } = useAuth({ redirectIfInvalid: "/login?expired=true" });
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [payoutSubmenuOpen, setPayoutSubmenuOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Keep submenu open if active route is an income/payout subpath
  useEffect(() => {
    if (pathname.includes("/dashboard/incomeorpayout")) {
      setPayoutSubmenuOpen(true);
    }
  }, [pathname]);

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin" || profile?.is_admin === true || profile?.is_super_admin === true;
  const isSuperAdmin = profile?.role === "super_admin" || profile?.is_super_admin === true;

  const menuItems = [
    {
      label: "Profile Summary",
      href: "/dashboard",
      icon: User,
    },
    {
      label: "Network Hierarchy",
      href: "/dashboard/network",
      icon: Users,
    },
    {
      label: "Payout & Income",
      href: "/dashboard/incomeorpayout",
      icon: Wallet,
    },
    {
      label: "Edit Profile",
      href: "/dashboard/edit-profile",
      icon: UserCheck,
    },
  ];

  if (isAdmin) {
    menuItems.push({
      label: "Admin Panel",
      href: "/dashboard/admin",
      icon: Shield,
    });
  }

  if (isSuperAdmin) {
    menuItems.push({
      label: "Super Admin Panel",
      href: "/dashboard/super",
      icon: ShieldAlert,
    });
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card border-r border-border/80 text-foreground">
      {/* Branding & Logo */}
      <div className="p-6 border-b border-border/60">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/40 group-hover:ring-primary/60 transition-all">
            <Image src="/logo.jpg" alt="Logo" fill sizes="40px" className="object-cover" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-black tracking-tight text-foreground">Aaradhya</span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mt-0.5">Dream City</span>
          </div>
        </Link>
      </div>

      {/* Profile summary card inside Sidebar */}
      <div className="p-4 mx-4 my-6 rounded-2xl bg-muted/50 border border-border/40 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black shrink-0">
          {profile?.first_name?.[0] || "U"}{profile?.last_name?.[0] || ""}
        </div>
        <div className="min-w-0 flex-grow">
          <h4 className="text-xs font-bold text-foreground truncate uppercase">
            {profile?.first_name} {profile?.last_name}
          </h4>
          <p className="text-[9px] text-muted-foreground font-semibold tracking-wider uppercase">
            Level {profile?.level || 1} Associate
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow px-4 space-y-1.5">
        <p className="text-[9px] font-black tracking-[0.3em] text-muted-foreground/60 uppercase px-3 mb-3">Navigation</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          
          if (item.href === "/dashboard/incomeorpayout") {
            const isActive = pathname.startsWith("/dashboard/incomeorpayout");
            return (
              <div key={item.href} className="space-y-1">
                <button
                  onClick={() => setPayoutSubmenuOpen(!payoutSubmenuOpen)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all w-full text-left cursor-pointer ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  <div className="ml-auto">
                    {payoutSubmenuOpen ? (
                      <ChevronDown size={14} className="transition-transform text-primary" />
                    ) : (
                      <ChevronRight size={14} className="transition-transform" />
                    )}
                  </div>
                </button>
                
                {payoutSubmenuOpen && (
                  <div className="pl-6 space-y-1 mt-1 border-l border-primary/20 ml-6 animate-in slide-in-from-top-1 duration-200">
                    <Link
                      href="/dashboard/incomeorpayout/self-deposit"
                      className={`block px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                        pathname === "/dashboard/incomeorpayout/self-deposit"
                          ? "text-primary bg-primary/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                      }`}
                    >
                      Self Deposit Amount
                    </Link>
                    <Link
                      href="/dashboard/incomeorpayout/team-deposit"
                      className={`block px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                        pathname === "/dashboard/incomeorpayout/team-deposit"
                          ? "text-primary bg-primary/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                      }`}
                    >
                      Team + Self Deposit
                    </Link>
                    <Link
                      href="/dashboard/incomeorpayout/payout-detail"
                      className={`block px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                        pathname === "/dashboard/incomeorpayout/payout-detail"
                          ? "text-primary bg-primary/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                      }`}
                    >
                      Payout Detail
                    </Link>
                  </div>
                )}
              </div>
            );
          }



          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                isActive
                  ? "bg-primary text-black font-black shadow-lg shadow-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
              {isActive && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer Actions */}
      <div className="p-4 border-t border-border/60 space-y-2.5">
        {/* Back to Home Button */}
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors w-full"
        >
          <Home size={16} className="text-primary" />
          <span>Back to Home</span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-border/40 hover:bg-muted/30 transition-all text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <div className="flex items-center gap-3">
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          </div>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-card border-b border-border/80 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/40">
            <Image src="/logo.jpg" alt="Logo" fill sizes="32px" className="object-cover" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-black tracking-tight text-foreground">Aaradhya</span>
            <span className="text-[8px] font-bold tracking-[0.2em] text-primary uppercase mt-0.5">Dream City</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-black shadow-md hover:scale-105 active:scale-95 transition-transform"
          >
            <Menu size={20} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay / Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="relative flex flex-col w-4/5 max-w-sm h-full bg-card shadow-2xl animate-in slide-in-from-left duration-300">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border/40 transition-transform"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:block w-72 fixed left-0 top-0 bottom-0 h-screen z-20">
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow min-w-0 min-h-screen flex flex-col bg-background/50 noise-overlay relative md:pl-72">
        <div className="flex-grow p-4 sm:p-8 lg:p-10 max-w-[1400px] w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
