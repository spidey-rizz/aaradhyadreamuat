"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  Link as LinkIcon,
  Bell,
  Wallet,
  Briefcase
} from "lucide-react";

export default function DashboardPage() {
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

  const referralList = profile.referral_list || [];
  const directSponsors = referralList.filter((item: any) => item.connection === 'direct');
  
  const selfBusiness = profile.total_sales || 0;
  const teamBusiness = referralList.reduce((acc: number, curr: any) => acc + (curr.total_sales || 0), 0);
  const totalBusiness = selfBusiness + teamBusiness;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-primary/30">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Links Section (Home, Network, Payout/Income) */}
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-2 flex items-center justify-center gap-8 md:gap-16 mb-8">
            <button onClick={() => router.push("/")} className="text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors py-2 px-4">Home</button>
            <button onClick={() => router.push("/network")} className="text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors py-2 px-4">Network</button>
            <button onClick={() => router.push("/payouts")} className="text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors py-2 px-4">Payout/Income</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Profile Box */}
              <div className="bg-zinc-950 border-2 border-accent/40 rounded-[2rem] p-8 relative overflow-hidden group min-h-[320px]">
                <div className="flex gap-8">
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-40 border-2 border-white/20 rounded-full flex items-center justify-center relative mb-4 bg-zinc-900/50">
                       <User size={64} className="text-cyan-400/60" />
                       <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex-grow space-y-3 pt-2">
                    <div className="flex gap-4 items-baseline">
                      <span className="text-cyan-400 text-sm font-bold uppercase tracking-wider w-20">name</span>
                      <span className="text-white text-lg font-bold">{profile.first_name} {profile.last_name}</span>
                    </div>
                    <div className="flex gap-4 items-baseline">
                      <span className="text-cyan-400 text-sm font-bold uppercase tracking-wider w-20">age</span>
                      <span className="text-white font-medium">—</span>
                    </div>
                    <div className="flex gap-4 items-baseline">
                      <span className="text-cyan-400 text-sm font-bold uppercase tracking-wider w-20">pan</span>
                      <span className="text-white font-mono">{profile.pan_number || "—"}</span>
                    </div>
                    <div className="flex gap-4 items-baseline">
                      <span className="text-cyan-400 text-sm font-bold uppercase tracking-wider w-20">adhar</span>
                      <span className="text-white">{profile.adhar_number || "—"}</span>
                    </div>
                    <div className="flex gap-4 items-baseline">
                      <span className="text-cyan-400 text-sm font-bold uppercase tracking-wider w-20">phone no</span>
                      <span className="text-white">{profile.phone}</span>
                    </div>
                    <div className="flex gap-4 items-baseline">
                      <span className="text-cyan-400 text-sm font-bold uppercase tracking-wider w-20">Level:</span>
                      <span className="text-white font-bold">1</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Code Box */}
              <div className="bg-zinc-950 border-2 border-red-500/40 rounded-[1.5rem] p-6 relative overflow-hidden">
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-cyan-400 text-lg font-bold uppercase tracking-[0.2em] mb-4">Your Referral Code</h3>
                  <div className="flex items-center gap-4 bg-black/50 border border-zinc-800 p-2 pl-6 rounded-xl w-full">
                    <div className="text-white font-mono font-black text-2xl flex-grow tracking-widest">{profile.referral_code}</div>
                    <button
                      onClick={() => copyToClipboard(profile.referral_code)}
                      className={`p-3 rounded-lg transition-all ${copySuccess ? "bg-green-500 text-black" : "bg-zinc-900 text-primary hover:bg-zinc-800"}`}
                    >
                      {copySuccess ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Notice Box */}
              <div className="bg-zinc-950 border-2 border-red-500/40 rounded-[1.5rem] p-6 min-h-[120px] flex items-center justify-center">
                <div className="text-center">
                  <span className="text-red-500 text-2xl font-bold uppercase tracking-[0.3em] flex items-center gap-4">
                    <Bell className="animate-bounce" />
                    notice
                  </span>
                  <p className="text-zinc-500 text-xs mt-2 italic">No new notifications at this time.</p>
                </div>
              </div>

              {/* Total Business Box */}
              <div className="bg-zinc-950 border-2 border-accent/40 rounded-[2rem] p-8 min-h-[320px]">
                <h3 className="text-cyan-400 text-lg font-bold uppercase tracking-[0.2em] text-center mb-8 border-b border-zinc-800 pb-4">
                  ---------- Total Business ----------
                </h3>
                <div className="space-y-8 max-w-md mx-auto">
                  <div className="flex justify-between items-end border-b border-zinc-800 border-dashed pb-2">
                    <span className="text-cyan-400 text-lg font-bold">Self Business :</span>
                    <span className="text-white text-2xl font-mono font-bold">₹{selfBusiness.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-zinc-800 border-dashed pb-2">
                    <span className="text-cyan-400 text-lg font-bold">Team Business :</span>
                    <span className="text-white text-2xl font-mono font-bold">₹{teamBusiness.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end pb-2">
                    <span className="text-cyan-400 text-lg font-bold">Total Business :</span>
                    <span className="text-white text-2xl font-mono font-bold">₹{totalBusiness.toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* BOTTOM SECTION: Table */}
          <div className="bg-zinc-950 border-2 border-accent/40 rounded-[2rem] p-8 overflow-hidden">
            <h3 className="text-cyan-400 text-xl font-bold uppercase tracking-widest mb-6">My Direct Sponser:-</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-accent/20">
                    <th className="pb-4 text-cyan-400 font-bold uppercase text-sm w-12">No.</th>
                    <th className="pb-4 text-cyan-400 font-bold uppercase text-sm border-l-2 border-accent/20 pl-4">Associate Name</th>
                    <th className="pb-4 text-cyan-400 font-bold uppercase text-sm border-l-2 border-accent/20 pl-4">Associate Phone</th>
                    <th className="pb-4 text-cyan-400 font-bold uppercase text-sm border-l-2 border-accent/20 pl-4">DOJ</th>
                    <th className="pb-4 text-cyan-400 font-bold uppercase text-sm border-l-2 border-accent/20 pl-4">Associate Business</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {directSponsors.length > 0 ? (
                    directSponsors.map((member: any, idx: number) => (
                      <tr key={idx} className="group hover:bg-zinc-900/30 transition-colors">
                        <td className="py-4 text-zinc-400 font-mono">{idx + 1}.</td>
                        <td className="py-4 border-l-2 border-accent/10 pl-4 text-white font-medium">{member.name}</td>
                        <td className="py-4 border-l-2 border-accent/10 pl-4 text-zinc-400">{member.phone || "—"}</td>
                        <td className="py-4 border-l-2 border-accent/10 pl-4 text-zinc-400">{member.created_at ? new Date(member.created_at).toLocaleDateString() : "—"}</td>
                        <td className="py-4 border-l-2 border-accent/10 pl-4 text-primary font-bold">₹{(member.total_sales || 0).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-600 italic">No direct sponsors found in your network.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
