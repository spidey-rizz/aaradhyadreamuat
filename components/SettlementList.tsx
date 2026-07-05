"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiFetch, endpoints } from "@/lib/api";
import { Loader2, Users, Phone, X, AlertCircle, RefreshCw, CheckCircle2, Calendar } from "lucide-react";

const inputCls =
  "w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:border-primary outline-none transition-all text-sm";

export default function SettlementList() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);
  const [page, setPage] = useState(1);

  // Associate mapping and filter states
  const [associates, setAssociates] = useState<any[]>([]);
  const [associatePhone, setAssociatePhone] = useState("");
  const [associateFound, setAssociateFound] = useState<any>(null);
  const [associateLoading, setAssociateLoading] = useState(false);
  const [associateError, setAssociateError] = useState("");
  const [userId, setUserId] = useState("");
  const phoneDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAssociatesMap = async () => {
    try {
      const data = await apiFetch(`${endpoints.allUsers}?page=1&page_size=100`);
      setAssociates(data.users || []);
    } catch (err) {
      console.error("Failed to fetch associates map", err);
    }
  };

  const fetchPayoutsList = async (pNum = page) => {
    setLoading(true);
    setError(null);
    setFetched(true);
    try {
      const url = `${endpoints.payoutsList}?page=${pNum}&page_size=100`;
      const data = await apiFetch(url);

      let list: any[] = [];
      if (data && Array.isArray(data.payouts)) {
        list = data.payouts;
      } else if (Array.isArray(data)) {
        list = data;
      }

      setPayouts(list);
      setPage(pNum);
    } catch (err: any) {
      setError(err.detail || "Failed to fetch payouts.");
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssociatesMap();
    fetchPayoutsList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAssociatePhone = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    setAssociatePhone(cleaned);
    setAssociateFound(null);
    setAssociateError("");
    setUserId("");

    if (phoneDebounce.current) clearTimeout(phoneDebounce.current);
    if (cleaned.length >= 10) {
      setAssociateLoading(true);
      phoneDebounce.current = setTimeout(async () => {
        try {
          const phoneToSend = "91" + cleaned;
          const data = await apiFetch(`${endpoints.userLookup}?phone=${phoneToSend}`);
          const user = Array.isArray(data) ? data[0] : data;
          if (user && (user._id || user.id)) {
            setAssociateFound(user);
            setAssociateLoading(false);
            setAssociateError("");
            const uid = user._id || user.id;
            setUserId(uid);
          } else {
            setAssociateFound(null);
            setAssociateLoading(false);
            setAssociateError("No associate found with this phone.");
            setUserId("");
          }
        } catch (err: any) {
          setAssociateFound(null);
          setAssociateLoading(false);
          setAssociateError(err.detail || "Associate not found.");
          setUserId("");
        }
      }, 600);
    } else {
      setAssociateLoading(false);
    }
  };

  const clearAssociate = () => {
    setAssociatePhone("");
    setAssociateFound(null);
    setAssociateError("");
    setAssociateLoading(false);
    setUserId("");
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [y, m] = val.split("-").map(Number);
    setMonth(m);
    setYear(y);
  };

  const monthValue = `${year}-${String(month).padStart(2, "0")}`;

  const filtered = payouts.filter((p: any) => {
    // 1. Filter by Associate ID if active
    if (userId) {
      const pUid = p.user_id || p.userId;
      if (pUid !== userId) return false;
    }

    // 2. Filter by Payout Target Month & Year
    if (p.month !== month || p.year !== year) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Associate Filter Lookup */}
      <div className="bg-muted/30 border border-border/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary flex items-center gap-2">
            <Users size={14} /> Filter by Associate (Optional)
          </p>
          {userId && (
            <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
              Active Filter
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex items-center w-full sm:max-w-xs">
            <div className="absolute left-4 flex items-center gap-2 text-primary font-bold border-r border-border pr-3">
              <Phone size={14} />
              <span className="text-sm">+91</span>
            </div>
            <input
              type="tel"
              maxLength={10}
              placeholder="10 Digits"
              value={associatePhone}
              onChange={(e) => handleAssociatePhone(e.target.value)}
              className={`${inputCls} pl-24 pr-10`}
            />
            {associatePhone && (
              <button
                type="button"
                onClick={clearAssociate}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {associateLoading && (
            <div className="flex items-center gap-2 text-xs text-primary font-semibold shrink-0">
              <Loader2 size={13} className="animate-spin" /> Looking up associate...
            </div>
          )}
          {associateError && (
            <p className="text-xs text-red-500 font-semibold flex items-center gap-1.5 shrink-0">
              <AlertCircle size={13} /> {associateError}
            </p>
          )}
          {associateFound && (
            <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 p-3 rounded-xl">
              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                {associateFound.first_name?.[0]}
                {associateFound.last_name?.[0]}
              </div>
              <div className="text-xs">
                <span className="font-bold text-foreground">
                  {associateFound.first_name} {associateFound.last_name}
                </span>
                <span className="text-muted-foreground ml-2">({associateFound.phone})</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-end">
        <div className="flex items-center gap-3 bg-background border border-border px-3 py-2 rounded-xl w-full sm:w-auto">
          <Calendar size={14} className="text-primary shrink-0" />
          <input
            type="month"
            value={monthValue}
            max={`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`}
            onChange={handleMonthChange}
            className="bg-transparent border-none text-xs text-foreground focus:outline-none w-full sm:w-auto cursor-pointer font-bold uppercase outline-none"
          />
        </div>
        <button
          onClick={() => fetchPayoutsList(1)}
          disabled={loading}
          className="bg-primary text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 w-full sm:w-auto"
        >
          {loading ? <Loader2 className="animate-spin" size={15} /> : <RefreshCw size={15} />}
          Load
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm font-semibold bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] w-16">No.</th>
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Associate Name</th>
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Associate Phone</th>
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Target Period</th>
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Settled Date</th>
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-right">Settled Amount (Net Paid)</th>
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Loader2 className="text-primary animate-spin mx-auto" size={28} />
                    <p className="text-muted-foreground text-xs mt-3 font-medium">Loading commission settlements...</p>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((payout: any, idx: number) => {
                  const assoc = associates.find((a: any) => (a._id || a.id) === payout.user_id);
                  const assocName = assoc
                    ? `${assoc.first_name} ${assoc.last_name}`.trim()
                    : "—";
                  const assocPhone = assoc ? assoc.phone : "—";
                  
                  const targetPeriod = payout.month && payout.year 
                    ? new Date(payout.year, payout.month - 1).toLocaleDateString("en-IN", {
                        month: "long",
                        year: "numeric",
                      })
                    : "—";

                  const settledDateStr = payout.created_at || payout.createdAt;
                  const formattedDate = settledDateStr
                    ? new Date(settledDateStr).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "—";

                  return (
                    <tr
                      key={payout._id || payout.id || `payout-${idx}`}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-5 px-6 text-xs font-mono text-muted-foreground">{idx + 1}.</td>
                      <td className="py-5 px-6 text-sm font-semibold text-foreground">{assocName}</td>
                      <td className="py-5 px-6 text-sm text-muted-foreground font-mono">{assocPhone}</td>
                      <td className="py-5 px-6 text-sm text-muted-foreground font-bold uppercase">{targetPeriod}</td>
                      <td className="py-5 px-6 text-sm text-muted-foreground">{formattedDate}</td>
                      <td className="py-5 px-6 text-sm font-black text-foreground font-mono text-right">
                        ₹{Number(payout.pay_out_amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                          <CheckCircle2 size={10} /> Settled
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <CheckCircle2 size={32} className="mx-auto mb-3 opacity-20 text-primary" />
                    <p className="text-muted-foreground text-xs font-semibold">
                      {fetched ? "No commission settlements found for this filter." : "Click Load to fetch commission settlements."}
                    </p>
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
