"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReferralTree from "@/components/ReferralTree";
import { useAuth } from "@/lib/useAuth";
import { 
  User, 
  Copy, 
  Check, 
  Users, 
  TrendingUp, 
  UserPlus, 
  Loader2, 
  LayoutDashboard, 
  IdCard,
  Target,
  Globe,
  Link as LinkIcon
} from "lucide-react";

export default function DashboardPage() {
  // ── Session verification: redirect to login if JWT is invalid/missing ──
  const { status, profile } = useAuth({ redirectIfInvalid: "/login?expired=true" });
  const [copySuccess, setCopySuccess] = useState(false);
  const router = useRouter();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-zinc-500 font-medium animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  const directReferrals = profile.referral_tree ? profile.referral_tree.length : 0;

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 text-primary mb-2">
                <LayoutDashboard size={20} />
                <span className="text-sm font-bold uppercase tracking-[0.2em]">Broker Portal</span>
              </div>
              <h1 className="text-4xl font-bold text-white">Welcome, <span className="gold-text-gradient">{profile.first_name}</span></h1>
            </div>
            
            <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 p-2 rounded-2xl backdrop-blur-md">
              <div className="pl-4 pr-2">
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Your Referral Code</div>
                <div className="text-white font-mono font-bold text-lg select-all">{profile.referral_code}</div>
              </div>
              <button 
                onClick={() => copyToClipboard(profile.referral_code)}
                className={`p-3 rounded-xl transition-all ${copySuccess ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "bg-black text-primary hover:bg-zinc-800"}`}
              >
                {copySuccess ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              {/* Profile Card */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 gold-gradient rounded-full flex items-center justify-center text-black text-3xl font-black mb-6 shadow-2xl">
                    {profile.first_name[0]}{profile.last_name[0]}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{profile.first_name} {profile.last_name}</h2>
                  <p className="text-zinc-500 flex items-center gap-2 mb-6">
                    <IdCard size={16} className="text-primary" />
                    Verified Broker
                  </p>
                  
                  <div className="space-y-4 pt-6 border-t border-zinc-800/50">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500">Phone</span>
                      <span className="text-zinc-300 font-medium">{profile.phone}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500">Email</span>
                      <span className="text-zinc-300 font-medium">{profile.email || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500">PAN</span>
                      <span className="text-zinc-300 font-medium font-mono">{profile.pan_number}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Referred By Section */}
              {profile.referred_by_user ? (
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 gold-gradient opacity-50"></div>
                  <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <LinkIcon size={14} className="text-primary" />
                    Referred By
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-400">
                      {profile.referred_by_user.first_name[0]}{profile.referred_by_user.last_name[0]}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{profile.referred_by_user.first_name} {profile.referred_by_user.last_name}</div>
                      <div className="text-zinc-500 text-xs mt-0.5">ID: {profile.referred_by_user.referral_code}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900/10 border border-zinc-800/50 rounded-3xl p-6 text-center italic text-zinc-600 text-sm">
                  Direct Join (No Referrer)
                </div>
              )}

              {/* Stats Cards (Split into two as requested) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 group hover:border-primary/50 transition-all duration-300">
                  <UserPlus className="text-primary mb-4 group-hover:scale-110 transition-transform" size={24} />
                  <div className="text-3xl font-bold text-white">{directReferrals}</div>
                  <div className="text-xs text-zinc-500 uppercase font-bold tracking-widest mt-1">Direct Referrals</div>
                </div>
                
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 group hover:border-accent/50 transition-all duration-300">
                  <Globe className="text-accent mb-4 group-hover:rotate-12 transition-transform" size={24} />
                  <div className="text-3xl font-bold text-white">{profile.total_in_tree}</div>
                  <div className="text-xs text-zinc-500 uppercase font-bold tracking-widest mt-1">Total Network</div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-8">
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 min-h-[600px] relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Referral Network</h3>
                    <p className="text-zinc-500 text-sm">Visualize and manage your multi-level network.</p>
                  </div>
                  <div className="bg-black/50 border border-zinc-800 px-4 py-2 rounded-full text-xs font-bold text-zinc-400 uppercase tracking-widest self-start md:self-center">
                    Recursive Hierarchy
                  </div>
                </div>

                <ReferralTree tree={profile.referral_tree} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
