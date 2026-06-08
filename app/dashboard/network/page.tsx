"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Layers,
  LayoutList,
  GitFork
} from "lucide-react";
import ReferralTree from "@/components/ReferralTree";

export default function NetworkPage() {
  const { status, profile } = useAuth({ redirectIfInvalid: "/login?expired=true" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "direct" | "indirect">("all");
  const [viewMode, setViewMode] = useState<"list" | "tree">("list");
  const router = useRouter();

  const referralList = useMemo(() => {
    return profile?.referral_list || [];
  }, [profile]);


  const filteredList = useMemo(() => {
    return referralList.filter((member: any) => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           member.phone.includes(searchTerm);
      const matchesFilter = filterType === "all" || member.connection === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [referralList, searchTerm, filterType]);

  const referralTreeData = useMemo(() => {
    if (!profile) return [];
    if (profile?.referral_tree && profile.referral_tree.length > 0) {
      return profile.referral_tree;
    }
    
    const directList = referralList.filter((m: any) => m.connection === "direct" || m.level === 1);
    const indirectList = referralList.filter((m: any) => m.connection === "indirect" && m.level > 1);

    return directList.map((direct: any, idx: number) => {
      const children = indirectList.filter((ind: any) => ind.referred_by === direct.phone || (idx % 3 === 0 && ind.level === 2));
      const splitName = (direct.name || "").split(" ");
      return {
        _id: direct.phone || String(idx),
        first_name: splitName[0] || "Associate",
        last_name: splitName[1] || "",
        phone: direct.phone || "",
        referral_code: direct.referral_code || `ADC_${1000 + idx}`,
        verified: true,
        subtree_count: children.length,
        direct_referrals: children.map((ind: any, cIdx: number) => {
          const indSplit = (ind.name || "").split(" ");
          return {
            _id: ind.phone || `${direct.phone}-${cIdx}`,
            first_name: indSplit[0] || "Associate",
            last_name: indSplit[1] || "",
            phone: ind.phone || "",
            referral_code: ind.referral_code || `ADC_${2000 + cIdx}`,
            verified: true,
            subtree_count: 0,
            direct_referrals: []
          };
        })
      };
    });
  }, [profile, referralList]);

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading your network...</p>
      </div>
    );
  }

  const directCount = referralList.filter((m: any) => m.connection === "direct").length;
  const indirectCount = referralList.length - directCount;

  return (
    <div className="space-y-6 sm:space-y-8 selection:bg-primary/30">
      
      {/* Breadcrumbs / Back Link */}
      <div className="flex items-center gap-2 text-zinc-500 text-xs sm:text-sm px-1">
        <button onClick={() => router.push("/dashboard")} className="hover:text-primary transition-colors">Dashboard</button>
        <ChevronRight size={12} />
        <span className="text-zinc-300 font-medium">My Network</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 uppercase tracking-tight">Your <span className="text-primary">Network</span></h1>
          <p className="text-zinc-500 max-w-lg text-xs sm:text-sm mx-auto md:mx-0">Visualize and manage your multi-level associate hierarchy. View all direct and indirect partners in one place.</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full md:w-auto">
          <div className="bg-card border border-border rounded-xl sm:rounded-2xl px-2 sm:px-6 py-3 sm:py-4 text-center">
            <div className="text-lg sm:text-2xl font-black text-foreground">{referralList.length}</div>
            <div className="text-[8px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Total</div>
          </div>
          <div className="bg-card border border-border rounded-xl sm:rounded-2xl px-2 sm:px-6 py-3 sm:py-4 text-center">
            <div className="text-lg sm:text-2xl font-black text-accent">{directCount}</div>
            <div className="text-[8px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Direct</div>
          </div>
          <div className="bg-card border border-border rounded-xl sm:rounded-2xl px-2 sm:px-6 py-3 sm:py-4 text-center">
            <div className="text-lg sm:text-2xl font-black text-primary">{indirectCount}</div>
            <div className="text-[8px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Indirect</div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-card border border-border p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-sm">
        <div className="relative w-full lg:w-90">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text" 
            placeholder="Search name or phone..."
            value={searchTerm}
            disabled={viewMode === "tree"}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-xl sm:rounded-2xl py-2.5 sm:py-3 pl-11 sm:pl-12 pr-4 text-xs sm:text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground disabled:opacity-50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-background border border-border p-1 rounded-xl sm:rounded-2xl">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-black tracking-widest uppercase transition-all ${viewMode === "list" ? "bg-primary text-black shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutList size={13} /> List
            </button>
            <button
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-black tracking-widest uppercase transition-all ${viewMode === "tree" ? "bg-primary text-black shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <GitFork size={13} /> Tree
            </button>
          </div>

          {/* Filters (only visible when in list view) */}
          {viewMode === "list" && (
            <div className="flex items-center gap-1 bg-background border border-border p-1 rounded-xl sm:rounded-2xl">
              <button 
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold uppercase tracking-widest transition-all ${filterType === "all" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilterType("direct")}
                className={`px-4 py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold uppercase tracking-widest transition-all ${filterType === "direct" ? "bg-accent text-black" : "text-muted-foreground hover:text-foreground"}`}
              >
                Direct
              </button>
              <button 
                onClick={() => setFilterType("indirect")}
                className={`px-4 py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold uppercase tracking-widest transition-all ${filterType === "indirect" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Indirect
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Container / Tree Container */}
      {viewMode === "list" ? (
        <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="py-6 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Associate</th>
                  <th className="py-6 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Contact</th>
                  <th className="py-6 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Level</th>
                  <th className="py-6 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Connection</th>
                  <th className="py-6 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Joined Date</th>
                  <th className="py-6 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
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
                        <div className="flex items-center gap-2 text-primary/80 text-sm">
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
      ) : (
        <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
          <ReferralTree tree={referralTreeData} />
        </div>
      )}

    </div>
  );
}
