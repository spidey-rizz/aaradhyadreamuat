"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { apiFetch, endpoints } from "@/lib/api";
import {
  Loader2,
  ShieldAlert,
  Users,
  Search
} from "lucide-react";

export default function SuperAdminPanelPage() {
  const { status, profile } = useAuth({ redirectIfInvalid: "/login?expired=true" });
  const router = useRouter();

  // ── Super Admin Control States ──
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [userSearchError, setUserSearchError] = useState<string | null>(null);
  const [privilegeUpdatingId, setPrivilegeUpdatingId] = useState<string | null>(null);

  // Superadmin role check — computed before any hooks that depend on it
  const userRole = profile?.role?.toUpperCase();
  const isSuperAdmin = userRole === "SUPERADMIN" || profile?.is_super_admin === true;

  // Role guard — only super_admin can access this page (must be before early returns)
  useEffect(() => {
    if (status === "authenticated" && !isSuperAdmin) {
      router.replace("/dashboard");
    }
  }, [status, isSuperAdmin, router]);

  const handleUserSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSearchQuery.trim()) return;
    setUserSearchLoading(true);
    setUserSearchError(null);
    setUserSearchResults([]);
    try {
      // Find user by phone or email query parameters
      const params = new URLSearchParams();
      const query = userSearchQuery.trim();
      if (query.includes("@")) {
        params.append("email", query);
      } else {
        const sanitizedPhone = query.replace(/\D/g, "");
        const phoneToSend = sanitizedPhone.length === 10 ? "91" + sanitizedPhone : sanitizedPhone;
        params.append("phone", phoneToSend);
      }

      const data = await apiFetch(`${endpoints.userLookup}?${params.toString()}`);
      setUserSearchResults(Array.isArray(data) ? data : [data].filter(Boolean));
    } catch (err: any) {
      setUserSearchError(err.detail || "No users found matching query.");
    } finally {
      setUserSearchLoading(false);
    }
  };

  const toggleUserPrivilege = async (userId: string, isCurrentlyAdmin: boolean) => {
    setPrivilegeUpdatingId(userId);
    try {
      const isMakeAdmin = !isCurrentlyAdmin;
      await apiFetch(endpoints.setPrivilege, {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          admin: isMakeAdmin
        })
      });
      // Update state locally so UI updates immediately
      setUserSearchResults(prev => 
        prev.map(u => u._id === userId ? { ...u, role: isMakeAdmin ? "admin" : "broker", is_admin: isMakeAdmin } : u)
      );
    } catch (err: any) {
      alert(err.detail || "Failed to update privilege.");
    } finally {
      setPrivilegeUpdatingId(null);
    }
  };

  // ── Early returns after all hooks ──
  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading Super Admin Panel...</p>
      </div>
    );
  }

  // Block render while redirecting unauthorized users
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Super Admin <span className="text-primary">Panel</span></h1>
          <p className="text-muted-foreground font-medium mt-1">Look up associate profiles and modify system administrative privileges.</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert size={16} /> Registry Control Mode
        </div>
      </div>

      {/* User Lookup & Privilege Manager */}
      <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 shadow-sm max-w-4xl mx-auto">
        <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
          <Users className="text-primary" />
          Associate Registry Lookup & Role Manager
        </h2>

        <form onSubmit={handleUserSearch} className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              required
              type="text"
              placeholder="Search by 10-digit phone number or email address..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-3.5 pl-12 pr-4 text-foreground focus:border-primary outline-none transition-all text-sm font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={userSearchLoading}
            className="bg-primary text-black px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {userSearchLoading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
            Search Associate
          </button>
        </form>

        {userSearchError && (
          <p className="text-red-500 text-sm font-semibold mb-6 text-center">{userSearchError}</p>
        )}

        {userSearchResults.length > 0 ? (
          <div className="border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {userSearchResults.map((user: any) => {
              const userIsAdmin = user.role === "admin" || user.role === "super_admin" || user.is_admin || user.is_super_admin;
              const isSelf = profile && user._id === profile._id;
              
              return (
                <div key={user._id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black shrink-0">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-foreground">{user.first_name} {user.last_name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                          user.role === "super_admin" 
                            ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                            : userIsAdmin 
                            ? "bg-primary/10 text-primary border border-primary/20" 
                            : "bg-muted text-muted-foreground border border-border"
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-1">Phone: {user.phone} | Email: {user.email || "—"}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">ID: {user._id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {isSuperAdmin && !isSelf && user.role !== "super_admin" ? (
                      <button
                        disabled={privilegeUpdatingId === user._id}
                        onClick={() => toggleUserPrivilege(user._id, userIsAdmin)}
                        className={`px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                          userIsAdmin 
                            ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20" 
                            : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                        }`}
                      >
                        {privilegeUpdatingId === user._id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : userIsAdmin ? (
                          "Revoke Admin"
                        ) : (
                          "Make Admin"
                        )}
                      </button>
                    ) : isSelf ? (
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic pr-4">You (Self)</span>
                    ) : !isSuperAdmin && !isSelf ? (
                      <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest bg-muted border border-border px-3 py-1.5 rounded-xl">
                        Super Admin Access Only
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : !userSearchLoading && !userSearchError && (
          <div className="text-center py-12 text-muted-foreground">
            <Users size={32} className="mx-auto mb-3 opacity-30 text-primary" />
            <p className="text-xs font-semibold">Search for any registered associate by phone or email above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
