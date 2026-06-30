"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { apiFetch, endpoints } from "@/lib/api";
import { Loader2, ChevronLeft, Calendar, IndianRupee, AlertCircle, RefreshCw, CalendarRange } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

export default function SelfDepositPage() {
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

  const fetchReport = async (pNum = page) => {
    if (!profile) return;
    setReportLoading(true);
    setReportError(null);
    try {
      const data = await apiFetch(`${endpoints.soldPlots}?page=${pNum}&page_size=100`);
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
      setReportError(err.detail || "Failed to fetch sold plots.");
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
    const val = e.target.value; // "YYYY-MM"
    if (!val) return;
    const [y, m] = val.split("-").map(Number);
    setSelectedMonth(m);
    setSelectedYear(y);
  };

  // Build deposit rows by filtering sold plots for current logged-in user and selected month/year
  const deposits = useMemo(() => {
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
        return {
          no: idx + 1,
          date: p.created_at || p.date || p.createdAt || (p.sale_data && (p.sale_data.created_at || p.sale_data.date || p.sale_data.createdAt)),
          amount: p.paid_amount || p.amount || (p.sale_data && (p.sale_data.paid_amount || p.sale_data.amount)) || 0,
          plot_id: p.plot_id || p.plotId || p.plot_number || "—",
          type: p.type || p.sale_data?.type || "NEW"
        };
      });
  }, [rawPlots, selectedMonth, selectedYear, profile]);

  const totalAmount = useMemo(() => {
    return deposits.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
  }, [deposits]);

  const monthYearValue = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading self deposits...</p>
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

      {/* Header & Filter Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-6 rounded-[2rem] shadow-sm">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
            Self <span className="text-primary-text">Deposit Amount</span>
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">Your monthly self deposit sales report (Real-Time API).</p>
        </div>

        {/* Month-Year Picker */}
        <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl w-full sm:w-auto cursor-pointer hover:border-primary/40 transition-colors">
          <CalendarRange size={14} className="text-primary-text shrink-0" />
          <input 
            type="month"
            value={monthYearValue}
            max={`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`}
            onChange={handleMonthYearChange}
            style={{ colorScheme: theme }}
            className="bg-transparent border-none text-xs text-foreground focus:outline-none w-full sm:w-auto cursor-pointer font-bold uppercase outline-none"
          />
          <button
            onClick={() => fetchReport(1)}
            disabled={reportLoading}
            className="ml-1 text-primary-text hover:text-primary/70 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={14} className={reportLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Total Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary-text/90 mb-1">
              Self Deposit — {new Date(selectedYear, selectedMonth - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
            {reportLoading ? (
              <Loader2 className="text-primary-text animate-spin mt-1" size={20} />
            ) : (
              <p className="text-3xl font-black text-primary-text font-mono">₹{totalAmount.toLocaleString('en-IN')}</p>
            )}
          </div>
          <div className="p-3 bg-primary/20 text-primary-text rounded-2xl">
            <IndianRupee size={24} />
          </div>
        </div>
      </div>

      {/* Error State */}
      {reportError && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm font-semibold">
          <AlertCircle size={18} className="shrink-0" />
          {reportError}
        </div>
      )}

      {/* Deposits Table */}
      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="py-5 px-8 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] w-20">No.</th>
                <th className="py-5 px-8 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Deposit Date</th>
                <th className="py-5 px-8 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Plot ID</th>
                <th className="py-5 px-8 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Type</th>
                <th className="py-5 px-8 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-right">Deposit Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reportLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Loader2 className="text-primary-text animate-spin mx-auto" size={28} />
                    <p className="text-muted-foreground text-xs mt-3 font-medium">Loading report data...</p>
                  </td>
                </tr>
              ) : deposits.length > 0 ? (
                deposits.map((dep: any, index: number) => (
                  <tr key={index} className="hover:bg-muted/30 transition-colors">
                    <td className="py-5 px-8 text-xs font-mono text-muted-foreground">{index + 1}.</td>
                    <td className="py-5 px-8 text-sm text-foreground font-semibold flex items-center gap-2">
                      <Calendar size={14} className="text-muted-foreground" />
                      {dep.date
                        ? new Date(dep.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="py-5 px-8 text-sm text-muted-foreground font-mono">{dep.plot_id}</td>
                    <td className="py-5 px-8">
                      <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary-text rounded-full text-[9px] font-black uppercase tracking-wider">
                        {dep.type}
                      </span>
                    </td>
                    <td className="py-5 px-8 text-sm text-foreground font-black font-mono text-right">
                      ₹{(dep.amount || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-muted-foreground text-xs italic">
                    <div className="flex flex-col items-center gap-2">
                      <IndianRupee size={28} className="opacity-20 text-primary-text" />
                      <p>No self deposits found for {new Date(selectedYear, selectedMonth - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}.</p>
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
