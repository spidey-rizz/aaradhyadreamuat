"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/useAuth";
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Loader2,
  ChevronRight,
  User,
  Phone,
  Calendar,
  Layers
} from "lucide-react";

export default function NetworkPage() {
  const { status, profile } = useAuth({ redirectIfInvalid: "/login?expired=true" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "direct" | "indirect">("all");
  const router = useRouter();

  const referralList = useMemo(() => profile?.referral_list || [], [profile]);

  const filteredList = useMemo(() => {
    return referralList.filter((member: any) => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           member.phone.includes(searchTerm);
      const matchesFilter = filterType === "all" || member.connection === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [referralList, searchTerm, filterType]);

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-zinc-500 font-medium animate-pulse">Loading your network...</p>
      </div>
    );
  }

  const directCount = referralList.filter((m: any) => m.connection === "direct").length;
  const indirectCount = referralList.length - directCount;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-primary/30">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Breadcrumbs / Back Link */}
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <button onClick={() => router.push("/dashboard")} className="hover:text-primary transition-colors">Dashboard</button>
            <ChevronRight size={14} />
            <span className="text-zinc-300 font-medium">My Network</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">Your <span className="text-primary">Network</span></h1>
              <p className="text-zinc-500 max-w-lg text-sm">Visualize and manage your multi-level associate hierarchy. View all direct and indirect partners in one place.</p>
            </div>

            {/* Stats Summary */}
            <div className="flex gap-4">
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl px-6 py-4 text-center">
                <div className="text-2xl font-black text-white">{referralList.length}</div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Total Members</div>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl px-6 py-4 text-center">
                <div className="text-2xl font-black text-accent">{directCount}</div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Direct</div>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl px-6 py-4 text-center">
                <div className="text-2xl font-black text-primary">{indirectCount}</div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Indirect</div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-950 border border-zinc-800 p-4 rounded-3xl">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 bg-black border border-zinc-800 p-1 rounded-2xl w-full md:w-auto">
              <button 
                onClick={() => setFilterType("all")}
                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filterType === "all" ? "bg-primary text-black" : "text-zinc-500 hover:text-white"}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilterType("direct")}
                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filterType === "direct" ? "bg-accent text-black" : "text-zinc-500 hover:text-white"}`}
              >
                Direct
              </button>
              <button 
                onClick={() => setFilterType("indirect")}
                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filterType === "indirect" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white"}`}
              >
                Indirect
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-[2rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/20">
                    <th className="py-6 px-8 text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Associate</th>
                    <th className="py-6 px-8 text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Contact</th>
                    <th className="py-6 px-8 text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Level</th>
                    <th className="py-6 px-8 text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Connection</th>
                    <th className="py-6 px-8 text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Joined Date</th>
                    <th className="py-6 px-8 text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredList.length > 0 ? (
                    filteredList.map((member: any, idx: number) => (
                      <tr key={idx} className="group hover:bg-zinc-900/30 transition-all duration-300">
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                              <User size={18} />
                            </div>
                            <div className="text-white font-bold">{member.name}</div>
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-2 text-zinc-400 text-sm">
                            <Phone size={14} className="text-zinc-600" />
                            {member.phone}
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-2">
                             <Layers size={14} className="text-primary/60" />
                             <span className="bg-zinc-900 text-zinc-400 px-3 py-1 rounded-full text-[10px] font-black border border-zinc-800">LVL {member.level}</span>
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                            member.connection === "direct" 
                              ? "bg-accent/10 text-accent border-accent/20" 
                              : "bg-zinc-800/50 text-zinc-400 border-zinc-700"
                          }`}>
                            {member.connection}
                          </span>
                        </td>
                        <td className="py-6 px-8">
                          <div className="flex items-center gap-2 text-zinc-500 text-sm">
                            <Calendar size={14} className="text-zinc-700" />
                            {member.created_at ? new Date(member.created_at).toLocaleDateString() : "—"}
                          </div>
                        </td>
                        <td className="py-6 px-8">
                          <div className="text-white font-black font-mono">₹{(member.total_sales || 0).toLocaleString()}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4 text-zinc-600">
                          <Users size={48} className="opacity-20" />
                          <p className="italic">No associates found matching your search or filters.</p>
                        </div>
                      </td>
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
