"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const fetchReport = async (month: number, year: number) => {
    if (!profile) return;
    setReportLoading(true);
    setReportError(null);
    try {
      const data = await apiFetch(
        `${endpoints.monthlyReport}?month=${month}&year=${year}`
      );
      setReportData(data);
    } catch (err: any) {
      setReportError(err.detail || "Failed to fetch monthly report.");
      setReportData(null);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchReport(selectedMonth, selectedYear);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const handleMonthYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // "YYYY-MM"
    if (!val) return;
    const [y, m] = val.split("-").map(Number);
    setSelectedMonth(m);
    setSelectedYear(y);
    fetchReport(m, y);
  };

  // Build deposit rows from monthly report
  const deposits = useMemo(() => {
    if (!reportData) return [];
    // The monthly-report returns an object with self_sales / transactions / summary
    // We try to extract individual self transactions for this user
    const selfSales: any[] = reportData?.self_sales || reportData?.transactions || reportData?.sales || [];
    if (Array.isArray(selfSales) && selfSales.length > 0) {
      return selfSales.map((s: any, idx: number) => ({
        no: idx + 1,
        date: s.date || s.created_at || `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`,
        amount: s.paid_amount || s.amount || 0,
        plot_id: s.plot_id || "—",
        type: s.sale_data?.type || s.type || "NEW",
      }));
    }
    // Fallback: use summary total_sales from report
    if (reportData?.summary?.self_sales || reportData?.self_total || reportData?.total_amount) {
      const total = reportData?.summary?.self_sales || reportData?.self_total || reportData?.total_amount || 0;
      if (total > 0) {
        return [{
          no: 1,
          date: `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`,
          amount: total,
          plot_id: "—",
          type: "Summary",
        }];
      }
    }
    return [];
  }, [reportData, selectedMonth, selectedYear]);

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
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group text-sm font-semibold uppercase tracking-wider"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Profile
      </button>

      {/* Header & Filter Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-6 rounded-[2rem] shadow-sm">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
            Self <span className="text-primary">Deposit Amount</span>
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">Your monthly self deposit sales report from the API.</p>
        </div>

        {/* Month-Year Picker */}
        <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl w-full sm:w-auto cursor-pointer hover:border-primary/40 transition-colors">
          <CalendarRange size={14} className="text-primary shrink-0" />
          <input 
            type="month"
            value={monthYearValue}
            max={`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`}
            onChange={handleMonthYearChange}
            style={{ colorScheme: theme }}
            className="bg-transparent border-none text-xs text-foreground focus:outline-none w-full sm:w-auto cursor-pointer font-bold uppercase outline-none"
          />
          <button
            onClick={() => fetchReport(selectedMonth, selectedYear)}
            disabled={reportLoading}
            className="ml-1 text-primary hover:text-primary/70 transition-colors disabled:opacity-50"
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
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/80 mb-1">
              Self Deposit — {new Date(selectedYear, selectedMonth - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
            {reportLoading ? (
              <Loader2 className="text-primary animate-spin mt-1" size={20} />
            ) : (
              <p className="text-3xl font-black text-primary font-mono">₹{totalAmount.toLocaleString('en-IN')}</p>
            )}
          </div>
          <div className="p-3 bg-primary/20 text-primary rounded-2xl">
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
                <th className="py-5 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em] w-20">No.</th>
                <th className="py-5 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Deposit Date</th>
                <th className="py-5 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Plot ID</th>
                <th className="py-5 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Type</th>
                <th className="py-5 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em] text-right">Deposit Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reportLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Loader2 className="text-primary animate-spin mx-auto" size={28} />
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
                      <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-[9px] font-black uppercase tracking-wider">
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
                      <IndianRupee size={28} className="opacity-20 text-primary" />
                      <p>No self deposits found for {new Date(selectedYear, selectedMonth - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}.</p>
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
