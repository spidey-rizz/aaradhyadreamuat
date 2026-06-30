"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { copyToClipboard } from "@/lib/clipboard";
import { getAssociatePolicy, clearAssociateWarnings } from "@/lib/adminStore";
import {
  User,
  Copy,
  Check,
  Users,
  TrendingUp,
  Loader2,
  Megaphone,
  ChevronRight,
  AlertTriangle,
  XCircle
} from "lucide-react";

export default function DashboardPage() {
  const { status, profile } = useAuth({ redirectIfInvalid: "/login?expired=true" });
  const [copied, setCopied] = useState(false);

  const copyReferral = async () => {
    if (profile?.referral_code) {
      const success = await copyToClipboard(profile.referral_code);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }


  const referralList: any[] = profile.referral_list || [];
  const directSponsors = referralList.filter((item: any) => item.connection === 'direct' || item.level === 1);
  
  const selfBusiness = profile.direct_sale || profile.total_sales || 0;
  const teamBusiness = profile.team_sale || referralList.reduce((acc: number, curr: any) => acc + (curr.direct_sale || curr.total_sales || 0), 0);
  const totalBusiness = profile.lifetime_sale || (selfBusiness + teamBusiness);

  const policy = getAssociatePolicy(profile._id || profile.id);
  const warnings = policy?.warnings || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* WARNING NOTICES */}
      {warnings.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
             <AlertTriangle size={120} className="text-amber-500" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
             <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-amber-500 mb-2 flex items-center gap-3">
                   <AlertTriangle className="text-amber-500" size={24} /> Official Warning Notice
                </h3>
                <div className="space-y-3 mt-4">
                   {warnings.map((w, i) => (
                      <p key={i} className="text-foreground font-medium text-sm border-l-2 border-amber-500/50 pl-3">
                         "{w}"
                      </p>
                   ))}
                </div>
             </div>
             <button 
                onClick={() => { clearAssociateWarnings(profile._id || profile.id); window.location.reload(); }}
                className="shrink-0 bg-background border border-border text-foreground px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors flex items-center gap-2 cursor-pointer"
             >
                <XCircle size={16} /> Acknowledge
             </button>
          </div>
        </div>
      )}

      {/* TOP ROW: Profile & Notice */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Profile Card */}
        <div className="lg:col-span-8 bg-card border border-border rounded-3xl p-6 sm:p-8 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <User size={120} className="text-primary" />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
              <User size={48} />
            </div>
            <div className="text-center sm:text-left flex-grow">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                  {profile.first_name} {profile.last_name}
                </h1>
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                  LvL-{profile.level || 1}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-muted-foreground font-medium text-sm">
                <p className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-primary/60 w-16">Phone:</span> {profile.phone}
                </p>
                <p className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-primary/60 w-16">PAN:</span> {profile.pan_number || "—"}
                </p>
                <p className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-primary/60 w-16">Adhar:</span> {profile.adhar_number || "—"}
                </p>
                <p className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-primary/60 w-16">Referral:</span> {profile.referral_code}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notice Card */}
        <div className="lg:col-span-4 bg-primary border border-primary/20 rounded-3xl p-6 sm:p-8 text-black relative overflow-hidden shadow-lg shadow-primary/10">
          <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
            <Megaphone size={100} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4 opacity-70">Official Notice</h3>
          <p className="text-lg font-bold leading-tight mb-4 italic opacity-50">
            No new announcements.
          </p>
          <button className="text-[10px] font-black uppercase tracking-widest border-b-2 border-black/30 hover:border-black transition-all cursor-pointer">
            View Archive
          </button>
        </div>
      </div>

      {/* SECOND ROW: Referral Code & Total Business */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Referral Code Box */}
        <div className="md:col-span-5 bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">My Referral Link</h3>
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-background border border-border p-2 rounded-2xl">
              <code className="text-primary font-black text-lg tracking-wider bg-primary/5 px-4 py-2 rounded-xl flex-grow text-center sm:text-left overflow-hidden text-ellipsis whitespace-nowrap w-full">
                {profile.referral_code}
              </code>
              <button 
                onClick={copyReferral}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-foreground text-background px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-black transition-all shrink-0 cursor-pointer"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 font-medium uppercase tracking-widest text-center sm:text-left">
            Share this code to grow your network and earn commissions.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Detailed Business Breakdown */}
          <div className="bg-card border border-border rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:border-primary/30 transition-all group sm:col-span-2">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <TrendingUp size={16} />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Business Overview</h4>
              </div>
              
              <div className="space-y-2.5 font-sans">
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Self Business</span>
                  <span className="text-sm font-black text-foreground font-mono">₹{selfBusiness.toLocaleString()}</span>
                </div>
                <div className="border-t border-dashed border-border/60" />
                
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Team Business</span>
                  <span className="text-sm font-black text-foreground font-mono">₹{teamBusiness.toLocaleString()}</span>
                </div>
                <div className="border-t border-dashed border-border/60" />
                
                <div className="flex justify-between items-center py-2 bg-primary/5 px-3 rounded-xl border border-primary/20">
                  <span className="text-xs font-black text-primary uppercase tracking-widest">Total Business</span>
                  <span className="text-base font-black text-primary font-mono">₹{totalBusiness.toLocaleString()}</span>
                </div>
                
                {policy?.limit !== null && (
                   <div className="flex justify-between items-center py-2 mt-2 px-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Active Limit</span>
                      <span className="text-xs font-black text-amber-600 font-mono">₹{policy.limit.toLocaleString()}</span>
                   </div>
                )}
              </div>
            </div>
          </div>

          {/* Compact Network Size */}
          <div className="bg-card border border-border rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-sm hover:border-primary/30 transition-all group sm:col-span-1">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 mb-3 group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
            <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Network Size</h4>
            <p className="text-2xl font-black text-foreground">{referralList.length}</p>
            <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Associates</p>
          </div>

        </div>
      </div>

      {/* THIRD ROW: Direct Sponsors Table */}
      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-6 sm:p-8 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
            <Users className="text-primary" />
            Direct Sponsors
          </h2>
          <Link 
            href="/dashboard/network" 
            className="text-[10px] font-black uppercase tracking-[0.3em] bg-muted text-muted-foreground px-4 py-2 rounded-full hover:bg-primary hover:text-black transition-all flex items-center gap-2 cursor-pointer"
          >
            View Full Network <ChevronRight size={12} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">No.</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Name</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Contact</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Business</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">DOJ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {directSponsors.length > 0 ? (
                directSponsors.map((ref: any, idx: number) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-8 py-6 text-xs font-mono text-muted-foreground">{idx + 1}.</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <User size={14} />
                        </div>
                        <span className="font-bold text-foreground">{ref.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-muted-foreground font-medium text-sm">{ref.phone || "—"}</td>
                    <td className="px-8 py-6 font-black text-primary italic font-mono">₹{(ref.direct_sale || ref.total_sales || 0).toLocaleString()}</td>
                    <td className="px-8 py-6 text-muted-foreground text-sm">
                      {ref.created_at ? new Date(ref.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground font-medium">
                    <div className="flex flex-col items-center gap-3">
                      <Users size={40} className="opacity-20 text-primary" />
                      <p>No direct sponsors found in your network.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
