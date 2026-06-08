"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { apiFetch, endpoints } from "@/lib/api";
import { Loader2, ChevronLeft, ShieldCheck, ChevronRight, Eye, AlertCircle, RefreshCw } from "lucide-react";

interface TeamMember {
  refId: string;
  memberName: string;
  selfAmount: number;
  teamDepositAmount: number;
  hasDownline: boolean;
  userId: string;
}

interface LevelData {
  userId: string;
  userName: string;
  self: number;
  team: number;
  total: number;
  members: TeamMember[];
}

export default function TeamDepositPage() {
  const { status, profile } = useAuth({ redirectIfInvalid: "/login?expired=true" });
  const router = useRouter();

  const now = new Date();

  // Navigation history: array of {userId, userName}
  const [history, setHistory] = useState<{ userId: string; userName: string }[]>([]);
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mainUserName = useMemo(() => {
    if (!profile) return "Associate";
    return `${profile.first_name} ${profile.last_name}`;
  }, [profile]);

  const mainUserId = profile?._id || profile?.id || "";

  // Build level data from the broker/me referral_list for root level
  const buildRootData = useCallback((): LevelData => {
    const referralList: any[] = profile?.referral_list || [];
    const selfSales = profile?.total_sales || 0;
    const teamTotal = referralList.reduce((acc: number, m: any) => acc + (m.total_sales || 0), 0);

    const members: TeamMember[] = referralList.map((m: any, idx: number) => ({
      refId: m.referral_code || `ADC_${1000 + idx}`,
      memberName: m.name || `${m.first_name || ""} ${m.last_name || ""}`.trim() || "Associate",
      selfAmount: m.total_sales || 0,
      teamDepositAmount: m.team_sales || 0,
      hasDownline: (m.team_sales || 0) > 0 || m.has_downline || false,
      userId: m._id || m.id || m.phone || String(idx),
    }));

    return {
      userId: mainUserId,
      userName: mainUserName,
      self: selfSales,
      team: teamTotal,
      total: selfSales + teamTotal,
      members,
    };
  }, [profile, mainUserId, mainUserName]);

  // Fetch monthly report for a specific user_id to get their team data
  const fetchUserTeamData = async (userId: string, userName: string): Promise<LevelData> => {
    const data = await apiFetch(
      `${endpoints.monthlyReport}?month=${now.getMonth() + 1}&year=${now.getFullYear()}&user_id=${userId}`
    );

    // Extract referral/team members from the report
    const referralList: any[] = data?.referral_list || data?.team_members || data?.members || [];
    const selfSales = data?.self_total || data?.summary?.self_sales || data?.total_sales || 0;
    const teamTotal = data?.team_total || data?.summary?.team_sales || 0;

    const members: TeamMember[] = referralList.map((m: any, idx: number) => ({
      refId: m.referral_code || `ADC_${1000 + idx}`,
      memberName: m.name || `${m.first_name || ""} ${m.last_name || ""}`.trim() || "Associate",
      selfAmount: m.total_sales || m.self_sales || 0,
      teamDepositAmount: m.team_sales || 0,
      hasDownline: (m.team_sales || 0) > 0 || false,
      userId: m._id || m.id || m.phone || String(idx),
    }));

    return {
      userId,
      userName,
      self: selfSales,
      team: teamTotal,
      total: selfSales + teamTotal,
      members,
    };
  };

  // Load data for current level
  useEffect(() => {
    if (!profile) return;

    if (history.length === 0) {
      // Root level — use profile data directly
      setLevelData(buildRootData());
    } else {
      // Drill-down level — fetch from API
      const current = history[history.length - 1];
      setLoading(true);
      setError(null);
      fetchUserTeamData(current.userId, current.userName)
        .then(setLevelData)
        .catch((err) => {
          setError(err.detail || "Failed to fetch team data for this member.");
          // Stay on current data
        })
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, history]);

  const currentUserName = history.length > 0 ? history[history.length - 1].userName : mainUserName;

  const handleDrillDown = (member: TeamMember) => {
    if (!member.hasDownline) return;
    setHistory([...history, { userId: member.userId, userName: member.memberName }]);
  };

  const handleBack = () => {
    if (history.length > 0) {
      setHistory(history.slice(0, -1));
    } else {
      router.push("/dashboard");
    }
  };

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading team deposits...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={handleBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group text-sm font-semibold uppercase tracking-wider cursor-pointer"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        {history.length > 0 ? "Back to Previous Level" : "Back to Profile"}
      </button>

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-6 rounded-[2rem] shadow-sm">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
            Team + <span className="text-primary">Self Deposit</span>
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">Detailed overview of self and downline team contributions.</p>
          
          {/* Breadcrumb Trail */}
          {history.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-3 bg-muted/40 px-3 py-1.5 rounded-lg border border-border/20 w-fit select-none">
              <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => setHistory([])}>Main</span>
              {history.map((item, index) => (
                <span key={item.userId} className="flex items-center gap-1">
                  <ChevronRight size={10} className="text-primary/60" />
                  <span 
                    className={`cursor-pointer hover:text-primary transition-colors ${index === history.length - 1 ? "text-primary font-black" : ""}`}
                    onClick={() => setHistory(history.slice(0, index + 1))}
                  >
                    {item.userName}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Active View User Badge */}
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-xl text-primary font-black text-xs uppercase tracking-widest">
          <ShieldCheck size={14} />
          {currentUserName}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm font-semibold">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Metrics Banner Card */}
      {levelData && (
        <div className="bg-card border border-border rounded-[2rem] p-6 sm:p-8 shadow-sm text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-border">
            <div className="flex flex-col justify-center py-2 sm:py-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Self Deposit</span>
              {loading ? (
                <Loader2 className="animate-spin text-primary mx-auto" size={18} />
              ) : (
                <span className="text-xl font-black text-foreground font-mono">₹{levelData.self.toLocaleString('en-IN')}</span>
              )}
            </div>
            <div className="flex flex-col justify-center py-2 sm:py-0 sm:pl-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Team Deposit</span>
              {loading ? (
                <Loader2 className="animate-spin text-primary mx-auto" size={18} />
              ) : (
                <span className="text-xl font-black text-foreground font-mono">₹{levelData.team.toLocaleString('en-IN')}</span>
              )}
            </div>
            <div className="flex flex-col justify-center py-2 sm:py-0 sm:pl-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Total Deposit</span>
              {loading ? (
                <Loader2 className="animate-spin text-primary mx-auto" size={18} />
              ) : (
                <span className="text-2xl font-black text-primary font-mono">₹{levelData.total.toLocaleString('en-IN')}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Team Details Table */}
      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="py-5 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em] w-20">No.</th>
                <th className="py-5 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Ref ID</th>
                <th className="py-5 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Member Name</th>
                <th className="py-5 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em] text-right">Self Amount</th>
                <th className="py-5 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em] text-right">Team Deposit Amount</th>
                <th className="py-5 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em] text-center w-36">More Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2 className="text-primary animate-spin mx-auto" size={28} />
                    <p className="text-muted-foreground text-xs mt-3 font-medium">Loading team data...</p>
                  </td>
                </tr>
              ) : levelData && levelData.members.length > 0 ? (
                levelData.members.map((member, idx) => (
                  <tr key={member.refId || idx} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-5 px-8 text-xs font-mono text-muted-foreground">{idx + 1}.</td>
                    <td className="py-5 px-8 text-sm font-bold text-foreground font-mono">{member.refId}</td>
                    <td className="py-5 px-8 text-sm font-semibold text-muted-foreground">{member.memberName}</td>
                    <td className="py-5 px-8 text-sm text-foreground font-bold font-mono text-right">
                      {member.selfAmount > 0 ? `₹${member.selfAmount.toLocaleString('en-IN')}` : "—"}
                    </td>
                    <td className="py-5 px-8 text-sm text-primary font-black font-mono text-right">
                      {member.teamDepositAmount > 0 ? `₹${member.teamDepositAmount.toLocaleString('en-IN')}` : "—"}
                    </td>
                    <td className="py-5 px-8 text-center">
                      {member.hasDownline ? (
                        <button
                          onClick={() => handleDrillDown(member)}
                          className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-black text-primary px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all shadow-sm shadow-primary/5 active:scale-95"
                          title={`View ${member.memberName}'s downline team`}
                        >
                          <Eye size={12} />
                          <span>View Team</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider select-none">No Downline</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted-foreground text-xs italic">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw size={28} className="opacity-20 text-primary" />
                      <p>This user has no downline team members.</p>
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
