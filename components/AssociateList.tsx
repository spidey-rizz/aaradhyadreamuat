"use client";

import React, { useState, useEffect, useMemo } from "react";
import { apiFetch, endpoints } from "@/lib/api";
import { Loader2, Search, X, AlertCircle, Users } from "lucide-react";

const inputCls =
  "w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:border-primary outline-none transition-all text-sm";

export default function AssociateList() {
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [rawResults, setRawResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const fetchAllAssociates = async () => {
    setLoading(true);
    setError(null);
    setSearched(false);
    try {
      const data = await apiFetch(`${endpoints.allUsers}?page=1&page_size=100`);
      setRawResults(data.users || []);
    } catch (err: any) {
      setError(err.detail || "Failed to fetch associates.");
      setRawResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAssociates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      fetchAllAssociates();
      return;
    }
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (cleanQuery.includes("@")) {
        params.append("email", cleanQuery);
      } else {
        const sanitizedPhone = cleanQuery.replace(/\D/g, "");
        const phoneToSend = sanitizedPhone.length === 10 ? "91" + sanitizedPhone : sanitizedPhone;
        params.append("phone", phoneToSend);
      }
      const data = await apiFetch(`${endpoints.userLookup}?${params.toString()}`);
      let list = Array.isArray(data) ? data : [data].filter(Boolean);
      setRawResults(list);
    } catch (err: any) {
      setError(err.detail || "No associate found.");
      setRawResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setQuery("");
    fetchAllAssociates();
  };

  const displayedResults = useMemo(() => {
    if (levelFilter === "all") return rawResults;
    return rawResults.filter((u: any) => String(u.level || 1) === levelFilter);
  }, [rawResults, levelFilter]);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by phone or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${inputCls} pl-10 pr-10`}
          />
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={15} />
            </button>
          )}
        </div>
        {/* Level Filter */}
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className={`${inputCls} sm:w-44 cursor-pointer`}
        >
          <option value="all">All Levels</option>
          {[1, 2, 3, 4, 5, 6, 7].map((l) => (
            <option key={l} value={String(l)}>
              Level {l}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="animate-spin" size={15} /> : <Search size={15} />}
          Search
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm font-semibold bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Results Table */}
      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="py-5 px-6 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Joining Date</th>
                <th className="py-5 px-6 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Name</th>
                <th className="py-5 px-6 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Referral Code</th>
                <th className="py-5 px-6 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Phone</th>
                <th className="py-5 px-6 text-[10px] text-primary font-black uppercase tracking-[0.2em] text-center">Level</th>
                <th className="py-5 px-6 text-[10px] text-primary font-black uppercase tracking-[0.2em] text-right">
                  Business (Self / Team / Total)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2 className="text-primary animate-spin mx-auto" size={28} />
                    <p className="text-muted-foreground text-xs mt-3 font-medium">Loading associates...</p>
                  </td>
                </tr>
              ) : displayedResults.length > 0 ? (
                displayedResults.map((user: any, idx: number) => {
                  const selfBusiness = user.direct_sale || user.total_sales || 0;
                  const teamBusiness = user.team_sale || 0;
                  const totalBusiness = user.lifetime_sale || selfBusiness + teamBusiness;
                  return (
                    <tr key={user._id || idx} className="hover:bg-muted/30 transition-colors group">
                      <td className="py-5 px-6 text-sm text-muted-foreground">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shrink-0 group-hover:scale-110 transition-transform">
                            {user.first_name?.[0]}
                            {user.last_name?.[0]}
                          </div>
                          <span className="font-bold text-foreground text-sm">
                            {user.first_name || user.name
                              ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.name
                              : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-sm text-muted-foreground font-mono">{user.referral_code || "—"}</td>
                      <td className="py-5 px-6 text-sm text-muted-foreground font-mono">{user.phone || "—"}</td>
                      <td className="py-5 px-6 text-center">
                        <span className="px-3 py-1 bg-muted border border-border text-foreground rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                          LvL-{user.level || 1}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-black text-primary font-mono">
                            ₹{Number(totalBusiness).toLocaleString("en-IN")}
                          </span>
                          <span className="text-[9px] text-muted-foreground font-mono mt-0.5">
                            Self: ₹{Number(selfBusiness).toLocaleString("en-IN")} | Team: ₹
                            {Number(teamBusiness).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Users size={32} className="mx-auto mb-3 opacity-20 text-primary" />
                    <p className="text-muted-foreground text-xs font-semibold">No associates found.</p>
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
