"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";
import { apiFetch, endpoints } from "@/lib/api";
import { Loader2, ChevronLeft, Calendar, FileText, CheckCircle2, AlertCircle, CalendarRange, RefreshCw } from "lucide-react";

export default function PayoutDetailPage() {
  const { status, profile } = useAuth({ redirectIfInvalid: "/login?expired=true" });
  const router = useRouter();
  const { theme } = useTheme();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [rawPlots, setRawPlots] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const monthInputRef = useRef<HTMLInputElement>(null);

  const fetchReport = async (pNum = page) => {
    if (!profile) return;
    setReportLoading(true);
    setReportError(null);
    try {
      const url = `${endpoints.soldPlots}?page=${pNum}&page_size=100`;
      const data = await apiFetch(url);
      
      let list: any[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data) {
        list =
          data.plots ||
          data.sold_plots ||
          data.sales ||
          data.transactions ||
          data.data ||
          data.self_sales ||
          data.team_sales ||
          data.all_sales ||
          [];
      }
      setRawPlots(Array.isArray(list) ? list : []);
      setPage(pNum);
    } catch (err: any) {
      setReportError(err.detail || "Failed to fetch payout data.");
      setRawPlots([]);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchReport(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const handleMonthYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [y, m] = val.split("-").map(Number);
    setSelectedMonth(m);
    setSelectedYear(y);
  };

  // Build payout rows from rawPlots
  const payouts = useMemo(() => {
    const currentUserId = profile?._id || profile?.id;
    if (!currentUserId) return [];

    return rawPlots
      .filter((p: any) => {
        // 1. Filter by current logged-in user
        const pUid = p.user_id || p.userId || (p.sale_data && (p.sale_data.user_id || p.sale_data.userId));
        if (pUid !== currentUserId) return false;

        // 2. Filter by selected month & year
        const dateStr = p.created_at || p.date || p.createdAt || (p.sale_data && (p.sale_data.created_at || p.sale_data.date || p.sale_data.createdAt));
        if (dateStr) {
          const d = new Date(dateStr);
          const m = d.getMonth() + 1;
          const y = d.getFullYear();
          if (m !== selectedMonth || y !== selectedYear) return false;
        } else {
          return false;
        }
        return true;
      })
      .map((p: any, idx: number) => {
        const amt = (p.payout_amount !== undefined && p.payout_amount !== null)
          ? Number(p.payout_amount)
          : (p.amount !== undefined && p.amount !== null)
          ? Number(p.amount)
          : (p.paid_amount !== undefined && p.paid_amount !== null)
          ? Number(p.paid_amount)
          : p.sale_data
          ? ((p.sale_data.payout_amount !== undefined && p.sale_data.payout_amount !== null)
            ? Number(p.sale_data.payout_amount)
            : (p.sale_data.amount !== undefined && p.sale_data.amount !== null)
            ? Number(p.sale_data.amount)
            : (p.sale_data.paid_amount !== undefined && p.sale_data.paid_amount !== null)
            ? Number(p.sale_data.paid_amount)
            : 0)
          : 0;

        return {
          no: idx + 1,
          date: p.created_at || p.date || p.createdAt || (p.sale_data && (p.sale_data.created_at || p.sale_data.date || p.sale_data.createdAt)),
          amount: amt,
          status: p.status || p.payout_status || "PAID",
          type: p.type || p.sale_data?.type || "sell income",
          plot_id: p.plot_id || p.plotId || p.plot_number || "—",
          processing_fee: p.processing_fee !== undefined ? p.processing_fee : p.processing !== undefined ? p.processing : (p.sale_data?.processing_fee !== undefined ? p.sale_data.processing_fee : p.sale_data?.processing)
        };
      });
  }, [rawPlots, selectedMonth, selectedYear, profile]);

  const totalPaidAmountSum = useMemo(() => {
    return payouts
      .filter((p: any) => p.status === "PAID")
      .reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
  }, [payouts]);

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

  const monthYearValue = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading payout details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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
            Payout <span className="text-primary-text">Details</span>
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">Audit logs of commissions cleared or pending clearance (Real-Time API).</p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          {/* Month-Year Picker */}
          <div
            onClick={() => monthInputRef.current?.showPicker?.()}
            className="flex items-center gap-3 bg-background border border-border px-3 py-2 rounded-xl w-full sm:w-auto cursor-pointer select-none hover:border-primary/45 transition-colors"
          >
            <CalendarRange size={14} className="text-primary-text shrink-0" />
            <input
              ref={monthInputRef}
              type="month"
              value={monthYearValue}
              max={`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`}
              onChange={handleMonthYearChange}
              style={{ colorScheme: theme }}
              className="bg-transparent border-none text-xs text-foreground focus:outline-none w-full sm:w-auto cursor-pointer font-bold uppercase outline-none"
            />
            <button
              onClick={(e) => { e.stopPropagation(); fetchReport(1); }}
              disabled={reportLoading}
              className="text-primary-text hover:text-primary/70 transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={13} className={reportLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {reportError && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm font-semibold">
          <AlertCircle size={18} className="shrink-0" />
          {reportError}
        </div>
      )}

      {/* Total Paid Amount */}
      {!reportLoading && payouts.length > 0 && (
        <div className="text-xs font-black uppercase tracking-widest text-muted-foreground bg-muted/40 border border-border px-5 py-3 rounded-2xl w-fit">
          Total Paid Amount : <span className="font-mono font-black text-primary-text ml-1">₹{totalPaidAmountSum.toLocaleString('en-IN')}</span>
        </div>
      )}

      {/* Payouts Table */}
      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] w-16">No.</th>
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Payout Date</th>
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Plot ID</th>
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Payout Type</th>
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Status</th>
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-right">Total Amt.</th>
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-right">TDS (5%)</th>
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-right">Processsing (5%)</th>
                <th className="py-5 px-5 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-right">Payout Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reportLoading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <Loader2 className="text-primary-text animate-spin mx-auto" size={28} />
                    <p className="text-muted-foreground text-xs mt-3 font-medium">Loading payout data...</p>
                  </td>
                </tr>
              ) : payouts.length > 0 ? (
                payouts.map((payout: any, index: number) => {
                  const totalAmt = payout.amount || 0;
                  const tds = Math.round(totalAmt * 0.05);
                  
                  // Processing fee logic
                  const processingVal = payout.processing_fee !== undefined ? payout.processing_fee : null;
                  const processingFee = processingVal !== null ? Number(processingVal) : 0;
                  const processingDisplay = processingVal !== null && processingVal !== "" ? `₹${processingFee.toLocaleString('en-IN')}` : "—";
                  
                  const netPayoutAmt = totalAmt - tds - processingFee;

                  return (
                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                      <td className="py-5 px-5 text-xs font-mono text-muted-foreground">{index + 1}.</td>
                      <td className="py-5 px-5 text-sm font-semibold text-foreground flex items-center gap-2 whitespace-nowrap">
                        <Calendar size={14} className="text-muted-foreground" />
                        {formatDate(payout.date)}
                      </td>
                      <td className="py-5 px-5 text-sm text-muted-foreground font-mono">{payout.plot_id}</td>
                      <td className="py-5 px-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{payout.type}</td>
                      <td className="py-5 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          payout.status === "PAID"
                            ? "bg-green-500/10 border-green-500/20 text-green-500"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                        }`}>
                          {payout.status === "PAID" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                          {payout.status}
                        </span>
                      </td>
                      <td className="py-5 px-5 text-sm text-foreground font-black font-mono text-right whitespace-nowrap">
                        ₹{totalAmt.toLocaleString('en-IN')}
                      </td>
                      <td className="py-5 px-5 text-sm text-red-500 font-bold font-mono text-right whitespace-nowrap">
                        ₹{tds.toLocaleString('en-IN')}
                      </td>
                      <td className="py-5 px-5 text-sm text-muted-foreground font-bold font-mono text-right whitespace-nowrap">
                        {processingDisplay}
                      </td>
                      <td className="py-5 px-5 text-sm text-primary-text font-black font-mono text-right whitespace-nowrap">
                        ₹{netPayoutAmt.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-muted-foreground text-xs italic">
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={28} className="opacity-20 text-primary-text" />
                      <p>No payouts found for {new Date(selectedYear, selectedMonth - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {rawPlots.length === 100 || page > 1 ? (
          <div className="flex items-center justify-between px-8 py-4 border-t border-border bg-muted/20">
            <button
              type="button"
              disabled={page === 1 || reportLoading}
              onClick={() => fetchReport(page - 1)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-border rounded-xl hover:bg-muted disabled:opacity-50 transition-colors cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs font-black font-mono">Page {page}</span>
            <button
              type="button"
              disabled={rawPlots.length < 100 || reportLoading}
              onClick={() => fetchReport(page + 1)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-border rounded-xl hover:bg-muted disabled:opacity-50 transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
