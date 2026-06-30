"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { apiFetch, endpoints, clearSessionData } from "@/lib/api";
import {
  getAdminLogs,
  addAdminLog,
  AdminLog,
  getAssociatePolicy,
  updateAssociatePolicy,
  addAssociateWarning,
  getWebsiteVisits
} from "@/lib/adminStore";
import {
  Loader2,
  ShieldAlert,
  Users,
  Search,
  Activity,
  Globe,
  Briefcase,
  TrendingUp,
  MapPin,
  X,
  Shield,
  Ban,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  MailWarning
} from "lucide-react";

type Tab = "overview" | "admins" | "associates" | "logs";

export default function SuperAdminPanelPage() {
  const { status, profile } = useAuth({ redirectIfInvalid: "/login?expired=true" });
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  
  // ── Global States ──
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [globalSales, setGlobalSales] = useState<any[]>([]);
  const [visitsCount, setVisitsCount] = useState(14850);

  // ── Admin Control States ──
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [associateSearchQuery, setAssociateSearchQuery] = useState("");
  const [privilegeUpdatingId, setPrivilegeUpdatingId] = useState<string | null>(null);

  // ── Modal States ──
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [limitInput, setLimitInput] = useState("");
  const [warningInput, setWarningInput] = useState("");
  
  // ── Admin Logs ──
  const [logs, setLogs] = useState<AdminLog[]>([]);

  // Role guard
  const userRole = profile?.role?.toUpperCase();
  const isSuperAdmin = userRole === "SUPERADMIN" || profile?.is_super_admin === true;

  useEffect(() => {
    if (status === "authenticated" && !isSuperAdmin) {
      router.replace("/dashboard");
    }
  }, [status, isSuperAdmin, router]);

  const fetchAllData = async () => {
    setLoadingUsers(true);
    
    // Fetch users (real-time data) with page_size=100 (API maximum)
    try {
      const usersData = await apiFetch(`${endpoints.allUsers}?page=1&page_size=100`);
      setAllUsers(usersData.users || []);
    } catch (err) {
      console.error("Failed to fetch users list:", err);
    }
    
    // Fetch global sales (only super admin can do this without user_id)
    try {
      const now = new Date();
      const salesData = await apiFetch(`${endpoints.monthlyReport}?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
      setGlobalSales(salesData.sales || salesData.transactions || salesData.all_sales || []);
    } catch (err) {
      console.error("Failed to fetch monthly report:", err);
    }

    // Fetch real-time global website visits from Abacus API
    try {
      const res = await fetch("https://abacus.jasoncameron.dev/get/aaradhyadreamcity/visits");
      const data = await res.json();
      if (data && typeof data.value === "number") {
        setVisitsCount(14850 + data.value);
      }
    } catch (err) {
      console.warn("Failed to fetch real-time website visits (offline)");
    }
    
    setLoadingUsers(false);
  };

  useEffect(() => {
    if (status === "authenticated" && isSuperAdmin) {
      fetchAllData();
      setLogs(getAdminLogs());
      setVisitsCount(getWebsiteVisits());
    }
  }, [status, isSuperAdmin]);

  // Derived Metrics (Calculated in real-time from the real users list)
  const adminsList = useMemo(() => {
    return allUsers.filter(u => u.role === "admin" || u.role === "super_admin" || u.is_admin || u.is_super_admin);
  }, [allUsers]);

  const associatesList = useMemo(() => {
    return allUsers.filter(u => u.role !== "admin" && u.role !== "super_admin" && !u.is_admin && !u.is_super_admin);
  }, [allUsers]);

  const activeAdminsCount = adminsList.length;
  const activeAssociatesCount = associatesList.length;

  // Real-time Total Business: Sum direct sales/total sales of all users currently in database
  const totalBusiness = useMemo(() => {
    return allUsers.reduce((acc, curr) => acc + (curr.direct_sale || curr.total_sales || 0), 0);
  }, [allUsers]);

  // Real-time Active Teams: Count distinct sponsors who have sponsored someone
  const totalTeamsCount = useMemo(() => {
    const sponsors = new Set(allUsers.map(u => u.referred_by).filter(Boolean));
    return sponsors.size;
  }, [allUsers]);

  // Real-time Plots Sold: Estimated realistically from business (at avg 2.5L/plot) + current month report
  const totalPlotsSold = useMemo(() => {
    return Math.round(totalBusiness / 250000) || globalSales.length;
  }, [totalBusiness, globalSales]);

  // Actions
  const toggleUserPrivilege = async (userId: string, isCurrentlyAdmin: boolean, userName: string) => {
    setPrivilegeUpdatingId(userId);
    try {
      const isMakeAdmin = !isCurrentlyAdmin;
      await apiFetch(endpoints.setPrivilege, {
        method: "POST",
        body: JSON.stringify({ user_id: userId, admin: isMakeAdmin })
      });
      
      // Log action
      const actionDesc = isMakeAdmin ? `Promoted ${userName} to Admin` : `Revoked Admin status from ${userName}`;
      const adminName = `${profile.first_name} ${profile.last_name}`;
      addAdminLog(adminName, actionDesc);
      setLogs(getAdminLogs());

      // Update local state
      setAllUsers(prev => 
        prev.map(u => (u._id || u.id) === userId ? { ...u, role: isMakeAdmin ? "admin" : "broker", is_admin: isMakeAdmin } : u)
      );

      // If the updated user is the current logged-in user, clear session and redirect to restart session
      if (userId === (profile._id || profile.id)) {
        clearSessionData();
        window.location.href = "/login?expired=true&role_updated=true";
        return;
      }
    } catch (err: any) {
      alert(err.detail || "Failed to update privilege.");
    } finally {
      setPrivilegeUpdatingId(null);
    }
  };

  const toggleSuspension = (userId: string, userName: string) => {
    const policy = getAssociatePolicy(userId);
    const newStatus = !policy.suspended;
    updateAssociatePolicy(userId, { suspended: newStatus });
    
    // Log action
    const actionDesc = newStatus ? `Suspended Associate ${userName}` : `Reactivated Associate ${userName}`;
    const adminName = `${profile.first_name} ${profile.last_name}`;
    addAdminLog(adminName, actionDesc);
    setLogs(getAdminLogs());
    
    // Force re-render trick for this component by cloning users
    setAllUsers([...allUsers]);
  };

  const handleSetLimit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const limitVal = limitInput ? parseInt(limitInput) : null;
    updateAssociatePolicy(selectedUser._id || selectedUser.id, { limit: limitVal });
    
    // Log action
    const actionDesc = limitVal ? `Set limit of ₹${limitVal.toLocaleString()} for ${selectedUser.first_name}` : `Removed limit for ${selectedUser.first_name}`;
    const adminName = `${profile.first_name} ${profile.last_name}`;
    addAdminLog(adminName, actionDesc);
    setLogs(getAdminLogs());
    
    setLimitModalOpen(false);
    setSelectedUser(null);
    setLimitInput("");
    setAllUsers([...allUsers]);
  };

  const handleSendWarning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !warningInput.trim()) return;
    
    addAssociateWarning(selectedUser._id || selectedUser.id, warningInput.trim());
    
    // Log action
    const actionDesc = `Sent warning notice to ${selectedUser.first_name}: "${warningInput.trim().substring(0, 30)}..."`;
    const adminName = `${profile.first_name} ${profile.last_name}`;
    addAdminLog(adminName, actionDesc);
    setLogs(getAdminLogs());
    
    setWarningModalOpen(false);
    setSelectedUser(null);
    setWarningInput("");
    setAllUsers([...allUsers]);
  };

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading Control Center...</p>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
      </div>
    );
  }

  const filteredAdmins = adminsList.filter(u => {
    const q = adminSearchQuery.toLowerCase();
    return (u.first_name?.toLowerCase().includes(q) || u.phone?.includes(q) || u.email?.toLowerCase().includes(q));
  });

  const filteredAssociates = associatesList.filter(u => {
    const q = associateSearchQuery.toLowerCase();
    return (u.first_name?.toLowerCase().includes(q) || u.phone?.includes(q) || u.email?.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Premium Header - Replaced Indigo/Purple with Gold Theme */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-card border border-border p-8 sm:p-10 shadow-md">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <ShieldAlert size={160} className="text-primary" />
        </div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground mb-2 flex items-center gap-3">
              <ShieldAlert className="text-primary" size={36} />
              Super Admin <span className="text-primary">Center</span>
            </h1>
            <p className="text-muted-foreground font-medium max-w-xl text-sm sm:text-base">
              Absolute system control. Monitor global business metrics, manage administrator privileges, and enforce associate policies.
            </p>
          </div>
          <div className="bg-primary/10 border border-primary/20 text-primary px-5 py-3 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest shadow-sm">
            <Lock size={16} /> Registry Control Mode
          </div>
        </div>
      </div>

      {/* Modern Tabs styled with Gold */}
      <div className="flex flex-wrap gap-3">
        {[
          { id: "overview", icon: Activity, label: "Overview" },
          { id: "admins", icon: Shield, label: "Admin Registry" },
          { id: "associates", icon: Users, label: "Associate Controls" },
          { id: "logs", icon: History, label: "Action Logs" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as Tab)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === t.id
                ? "bg-primary text-black shadow-lg shadow-primary/20 scale-[1.02]"
                : "bg-card border border-border text-muted-foreground hover:border-primary/45 hover:text-foreground"
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* --- TAB CONTENT --- */}
      
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-300">
          
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-primary/30 transition-all group relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform p-4"><Globe size={80} className="text-primary" /></div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2"><Globe size={14}/> Website Visits</h4>
            <p className="text-4xl font-black text-foreground font-mono">{visitsCount.toLocaleString("en-IN")}</p>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-2 flex items-center gap-1"><TrendingUp size={12}/> Live Tracking Active</p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-primary/30 transition-all group relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform p-4"><Shield size={80} className="text-primary" /></div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2"><Shield size={14}/> Active Admins</h4>
            <p className="text-4xl font-black text-foreground font-mono">{activeAdminsCount}</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-2">Managing Operations</p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-primary/30 transition-all group relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform p-4"><Users size={80} className="text-primary" /></div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2"><Users size={14}/> Working Associates</h4>
            <p className="text-4xl font-black text-foreground font-mono">{activeAssociatesCount}</p>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-2">Registered Brokers</p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-primary/30 transition-all group relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform p-4"><Briefcase size={80} className="text-primary" /></div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2"><Briefcase size={14}/> Total Teams</h4>
            <p className="text-4xl font-black text-foreground font-mono">{totalTeamsCount}</p>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-2">Active Networks</p>
          </div>

          {/* Business Overview in Gold styling to match the site's colors */}
          <div className="bg-primary border border-primary/20 rounded-3xl p-6 shadow-lg shadow-primary/10 text-black sm:col-span-2 relative overflow-hidden group">
            <div className="absolute right-0 top-0 opacity-10 group-hover:scale-110 transition-transform p-4"><TrendingUp size={120} /></div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/70 mb-4 flex items-center gap-2"><TrendingUp size={14}/> Total Global Business</h4>
            <p className="text-5xl sm:text-6xl font-black font-mono tracking-tight">₹{totalBusiness.toLocaleString("en-IN")}</p>
            <div className="mt-6 flex items-center gap-6">
               <div>
                  <p className="text-[10px] font-bold text-black/60 uppercase tracking-widest mb-1">Plots Sold</p>
                  <p className="text-xl font-black font-mono">{totalPlotsSold}</p>
               </div>
               <div className="w-px h-8 bg-black/20" />
               <div>
                  <p className="text-[10px] font-bold text-black/60 uppercase tracking-widest mb-1">System Status</p>
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-800 flex items-center gap-1.5"><CheckCircle2 size={14} /> Operational</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "admins" && (
        <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 shadow-sm animate-in slide-in-from-bottom-4 duration-300">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                 <Shield className="text-primary" /> Administrative Staff
              </h2>
              <div className="relative w-full sm:w-auto">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                 <input 
                    type="text" 
                    placeholder="Search admins..." 
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    className="w-full sm:w-64 bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary outline-none transition-all"
                 />
              </div>
           </div>

           <div className="border border-border rounded-2xl overflow-hidden divide-y divide-border">
              {loadingUsers ? (
                 <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
              ) : filteredAdmins.length > 0 ? (
                 filteredAdmins.map(user => {
                    const isSelf = user._id === profile._id || user.id === profile._id;
                    return (
                       <div key={user._id || user.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black shrink-0">
                                {user.first_name?.[0]}{user.last_name?.[0]}
                             </div>
                             <div>
                                <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                                   {user.first_name} {user.last_name}
                                   <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${user.role === 'super_admin' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                                      {user.role}
                                   </span>
                                </h4>
                                <p className="text-xs text-muted-foreground font-mono mt-1">{user.phone} | {user.email || "No Email"}</p>
                             </div>
                          </div>
                          <div>
                             {isSelf ? (
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic px-4">You (Self)</span>
                             ) : user.role !== "super_admin" ? (
                                <button
                                   onClick={() => toggleUserPrivilege(user._id || user.id, true, `${user.first_name} ${user.last_name}`)}
                                   disabled={privilegeUpdatingId === (user._id || user.id)}
                                   className="px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                                >
                                   {privilegeUpdatingId === (user._id || user.id) ? <Loader2 className="animate-spin text-red-500" size={14} /> : "Revoke Admin"}
                                </button>
                             ) : (
                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-4">Super Admin</span>
                             )}
                          </div>
                       </div>
                    );
                 })
              ) : (
                 <div className="p-12 text-center text-muted-foreground font-medium text-sm">No administrators found.</div>
              )}
           </div>

           <div className="mt-8 pt-8 border-t border-border">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-4">Promote Associate to Admin</h3>
              <p className="text-xs text-muted-foreground mb-4">Search for an associate below to grant them administrative privileges.</p>
              <button onClick={() => setActiveTab("associates")} className="text-xs font-bold uppercase tracking-widest bg-muted border border-border px-6 py-3 rounded-xl hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-pointer">
                 Go to Associate Controls
              </button>
           </div>
        </div>
      )}

      {activeTab === "associates" && (
        <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 shadow-sm animate-in slide-in-from-bottom-4 duration-300">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                 <Users className="text-primary" /> Associate Policy Controls
              </h2>
              <div className="relative w-full sm:w-auto">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                 <input 
                    type="text" 
                    placeholder="Search by phone/name..." 
                    value={associateSearchQuery}
                    onChange={(e) => setAssociateSearchQuery(e.target.value)}
                    className="w-full sm:w-64 bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary outline-none transition-all"
                 />
              </div>
           </div>

           <div className="border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                       <tr className="bg-muted/50 border-b border-border">
                          <th className="py-4 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Associate</th>
                          <th className="py-4 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Phone</th>
                          <th className="py-4 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status / Limit</th>
                          <th className="py-4 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                       {filteredAssociates.length > 0 ? (
                         filteredAssociates.map(user => {
                            const uid = user._id || user.id;
                            const policy = getAssociatePolicy(uid);
                            const isSelf = uid === profile._id;
                            if (isSelf || user.role === "super_admin") return null;

                            return (
                               <tr key={uid} className={`transition-colors ${policy.suspended ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-muted/30'}`}>
                                  <td className="py-4 px-6">
                                     <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${policy.suspended ? 'bg-red-500/20 text-red-500' : 'bg-muted border border-border text-foreground'}`}>
                                           {user.first_name?.[0]}{user.last_name?.[0]}
                                        </div>
                                        <span className="font-bold text-sm text-foreground">{user.first_name} {user.last_name}</span>
                                     </div>
                                  </td>
                                  <td className="py-4 px-6 text-sm font-mono text-muted-foreground">{user.phone}</td>
                                  <td className="py-4 px-6">
                                     <div className="flex flex-col items-start gap-1">
                                        {policy.suspended ? (
                                           <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><Ban size={10}/> Suspended</span>
                                        ) : (
                                           <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={10}/> Active</span>
                                        )}
                                        {policy.limit !== null && (
                                           <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">Limit: ₹{policy.limit.toLocaleString("en-IN")}</span>
                                        )}
                                     </div>
                                  </td>
                                  <td className="py-4 px-6 text-right space-x-2">
                                     {!user.is_admin && user.role !== "admin" && (
                                        <button 
                                           onClick={() => toggleUserPrivilege(uid, false, `${user.first_name} ${user.last_name}`)}
                                           className="px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all cursor-pointer"
                                        >
                                           Make Admin
                                        </button>
                                     )}
                                     <button 
                                        onClick={() => { setSelectedUser(user); setLimitInput(policy.limit ? policy.limit.toString() : ""); setLimitModalOpen(true); }}
                                        className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all cursor-pointer"
                                     >
                                        Set Limit
                                     </button>
                                     <button 
                                        onClick={() => { setSelectedUser(user); setWarningModalOpen(true); }}
                                        className="px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all cursor-pointer"
                                     >
                                        <MailWarning size={12} className="inline mr-1 -mt-0.5" /> Warn
                                     </button>
                                     <button 
                                        onClick={() => toggleSuspension(uid, `${user.first_name} ${user.last_name}`)}
                                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                                           policy.suspended 
                                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                                              : "border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                        }`}
                                     >
                                        {policy.suspended ? "Reactivate" : "Suspend"}
                                     </button>
                                  </td>
                               </tr>
                            );
                         })
                       ) : (
                         <tr><td colSpan={4} className="py-12 text-center text-muted-foreground text-sm font-medium">No associates found.</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 shadow-sm animate-in slide-in-from-bottom-4 duration-300">
           <div className="flex items-center gap-3 mb-8">
              <History className="text-primary" size={24} />
              <div>
                 <h2 className="text-xl font-black uppercase tracking-tight">Admin Action Logs</h2>
                 <p className="text-xs text-muted-foreground font-medium mt-1">Immutable ledger of all administrative system actions.</p>
              </div>
           </div>

           <div className="border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                       <tr className="bg-muted/50 border-b border-border">
                          <th className="py-4 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date & Time</th>
                          <th className="py-4 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Administrator</th>
                          <th className="py-4 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Action Description</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                       {logs.length > 0 ? (
                          logs.map(log => (
                             <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                                <td className="py-4 px-6">
                                   <p className="text-sm font-bold text-foreground font-mono">{log.date}</p>
                                   <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{log.time}</p>
                                </td>
                                <td className="py-4 px-6">
                                   <span className="px-3 py-1 rounded bg-primary/10 text-primary border border-primary/20 text-xs font-black tracking-wide">
                                      {log.adminName}
                                   </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-muted-foreground font-medium leading-relaxed">
                                   {log.action}
                                </td>
                             </tr>
                          ))
                       ) : (
                          <tr><td colSpan={3} className="py-12 text-center text-muted-foreground text-sm">No administrative logs recorded yet.</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* MODALS */}
      {limitModalOpen && selectedUser && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
               <h3 className="text-lg font-black uppercase tracking-tight mb-2">Set Transaction Limit</h3>
               <p className="text-xs text-muted-foreground mb-6">Enter maximum booking/settlement limit for <b>{selectedUser.first_name}</b>. Leave blank to remove limit.</p>
               <form onSubmit={handleSetLimit}>
                  <div className="relative mb-6">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground">₹</span>
                     <input 
                        type="number" 
                        placeholder="Unlimited"
                        value={limitInput}
                        onChange={(e) => setLimitInput(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl py-3 pl-8 pr-4 font-mono font-bold focus:border-primary outline-none"
                     />
                  </div>
                  <div className="flex gap-3 justify-end">
                     <button type="button" onClick={() => setLimitModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold uppercase tracking-widest hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                     <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:bg-primary-hover transition-colors cursor-pointer shadow-lg shadow-primary/20">Save Limit</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {warningModalOpen && selectedUser && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
               <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-amber-500 flex items-center gap-2"><AlertTriangle size={20}/> Issue Warning</h3>
               <p className="text-xs text-muted-foreground mb-6">Send an official notice to <b>{selectedUser.first_name}</b>. This will appear on their dashboard.</p>
               <form onSubmit={handleSendWarning}>
                  <textarea 
                     required
                     placeholder="Type warning message here..."
                     value={warningInput}
                     onChange={(e) => setWarningInput(e.target.value)}
                     className="w-full h-32 bg-background border border-border rounded-xl p-4 text-sm focus:border-amber-500 outline-none resize-none mb-6"
                  />
                  <div className="flex gap-3 justify-end">
                     <button type="button" onClick={() => setWarningModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold uppercase tracking-widest hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                     <button type="submit" className="px-5 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-colors cursor-pointer shadow-lg shadow-amber-500/20">Send Warning</button>
                  </div>
               </form>
            </div>
         </div>
      )}

    </div>
  );
}
