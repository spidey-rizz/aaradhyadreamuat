"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { apiFetch, endpoints } from "@/lib/api";
import { Loader2, ChevronLeft, Calendar, FileText, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function PayoutDetailPage() {
  const { status, profile } = useAuth({ redirectIfInvalid: "/login?expired=true" });
  const router = useRouter();

  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayouts = async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    try {
      // Calls the intercepted endpoint which proxies to GET /api/user/payouts
      const data = await apiFetch(endpoints.payouts);
      setPayouts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.detail || "Failed to fetch approved payouts.");
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchPayouts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatMonthName = (month: number, year: number) => {
    try {
      const date = new Date(year, month - 1);
      return date.toLocaleString("en-IN", { month: "long", year: "numeric" });
    } catch {
      return `${month}/${year}`;
    }
  };

  const totalPaidSum = payouts.reduce((acc, p) => acc + (p.final_payout || 0), 0);

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading payout details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Back Button */}
      <button 
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group text-sm font-semibold uppercase tracking-wider cursor-pointer"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Profile
      </button>

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-6 rounded-[2rem] shadow-sm">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
            Payout <span className="text-primary-text text-primary">Details</span>
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">Audit logs of your approved and cleared monthly payouts (Real-Time API).</p>
        </div>

        <div>
          <button
            onClick={() => fetchPayouts()}
            disabled={loading}
            className="bg-primary text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
            Refresh
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm font-semibold">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Total Paid Amount */}
      {!loading && payouts.length > 0 && (
        <div className="text-xs font-black uppercase tracking-widest text-muted-foreground bg-muted/40 border border-border px-5 py-3 rounded-2xl w-fit">
          Total Disbursed Payout : <span className="font-mono font-black text-primary ml-1">₹{totalPaidSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      )}

      {/* Payouts Table */}
      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] w-16">S.No</th>
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Payout Cycle</th>
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Payment Date</th>
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Status</th>
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-right">Self Sales</th>
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-right">Team Sales</th>
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-right">Total Amount</th>
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-right">Total Commission</th>
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-right">TDS (5%)</th>
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-right">Reward Payout</th>
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-right">Final Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center">
                    <Loader2 className="text-primary animate-spin mx-auto" size={28} />
                    <p className="text-muted-foreground text-xs mt-3 font-medium">Loading payout history...</p>
                  </td>
                </tr>
              ) : payouts.length > 0 ? (
                payouts.map((payout: any, index: number) => {
                  return (
                    <tr key={payout._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-5 px-5 text-xs font-mono text-muted-foreground">{index + 1}.</td>
                      <td className="py-5 px-5 text-sm font-semibold text-foreground whitespace-nowrap">
                        {formatMonthName(payout.month, payout.year)}
                      </td>
                      <td className="py-5 px-5 text-sm font-semibold text-foreground flex items-center gap-2 whitespace-nowrap border-none pt-6">
                        <Calendar size={14} className="text-muted-foreground" />
                        {formatDate(payout.payment_date)}
                      </td>
                      <td className="py-5 px-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border bg-green-500/10 border-green-500/20 text-green-500">
                          <CheckCircle2 size={12} />
                          Paid
                        </span>
                      </td>
                      <td className="py-5 px-5 text-sm text-foreground font-mono text-right whitespace-nowrap">
                        ₹{payout.self_sales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-5 px-5 text-sm text-foreground font-mono text-right whitespace-nowrap">
                        ₹{payout.team_sales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-5 px-5 text-sm text-foreground font-mono text-right whitespace-nowrap">
                        ₹{payout.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-5 px-5 text-sm text-foreground font-mono text-right whitespace-nowrap">
                        ₹{payout.total_commission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-5 px-5 text-sm text-red-500 font-mono text-right whitespace-nowrap">
                        ₹{payout.tds_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-5 px-5 text-sm text-emerald-500 font-mono text-right whitespace-nowrap">
                        ₹{payout.reward_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-5 px-5 text-sm text-primary font-black font-mono text-right whitespace-nowrap">
                        ₹{payout.final_payout.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-muted-foreground text-xs italic">
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={28} className="opacity-20 text-primary" />
                      <p>No approved payouts found in your history.</p>
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
