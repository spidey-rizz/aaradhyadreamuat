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
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const monthInputRef = useRef<HTMLInputElement>(null);

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
      setReportError(err.detail || "Failed to fetch payout data.");
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
    const val = e.target.value;
    if (!val) return;
    const [y, m] = val.split("-").map(Number);
    setSelectedMonth(m);
    setSelectedYear(y);
    setSelectedDate(""); // reset date filter on month change
    fetchReport(m, y);
  };

  // Extract payouts from the monthly report
  const payouts = useMemo(() => {
    if (!reportData) return [];
    // Try to extract payout/income records from report
    const records: any[] = 
      reportData?.payouts ||
      reportData?.payout_list ||
      reportData?.income_list ||
      reportData?.transactions ||
      reportData?.sales ||
      reportData?.self_sales ||
      [];

    if (Array.isArray(records) && records.length > 0) {
      return records.map((r: any, idx: number) => ({
        no: idx + 1,
        date: r.date || r.created_at || r.payout_date || `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`,
        amount: r.payout_amount || r.amount || r.paid_amount || 0,
        status: r.status || r.payout_status || "PAID",
        type: r.sale_data?.type || r.type || r.payout_type || r.income_type || "sell income",
        plot_id: r.plot_id || "—",
      }));
    }

    // Fallback: if report has a summary total, show it as a single entry
    const selfTotal = reportData?.self_total || reportData?.summary?.self_sales || reportData?.total_amount || 0;
    if (selfTotal > 0) {
      return [{
        no: 1,
        date: `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`,
        amount: selfTotal,
        status: "PAID",
        type: "sell income",
        plot_id: "—",
      }];
    }

    return [];
  }, [reportData, selectedMonth, selectedYear]);

  // Apply date filter (optional secondary filter on top of month)
  const filteredPayouts = useMemo(() => {
    if (!selectedDate) return payouts;
    return payouts.filter((p: any) => p.date === selectedDate);
  }, [selectedDate, payouts]);

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
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group text-sm font-semibold uppercase tracking-wider"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Profile
      </button>

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-6 rounded-[2rem] shadow-sm">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
            Payout <span className="text-primary">Details</span>
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">Audit logs of commissions cleared or pending clearance.</p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          {/* Month-Year Picker */}
          <div
            onClick={() => monthInputRef.current?.showPicker?.()}
            className="flex items-center gap-3 bg-background border border-border px-3 py-2 rounded-xl w-full sm:w-auto cursor-pointer select-none hover:border-primary/45 transition-colors"
          >
            <CalendarRange size={14} className="text-primary shrink-0" />
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
              onClick={(e) => { e.stopPropagation(); fetchReport(selectedMonth, selectedYear); }}
              disabled={reportLoading}
              className="text-primary hover:text-primary/70 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={13} className={reportLoading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Day filter picker (optional) */}
          <div 
            onClick={() => dateInputRef.current?.showPicker()}
            className="flex items-center gap-3 bg-background border border-border px-3 py-2 rounded-xl w-full sm:w-auto cursor-pointer select-none hover:border-primary/45 transition-colors"
          >
            <Calendar size={14} className="text-muted-foreground shrink-0" />
            <input 
              ref={dateInputRef}
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ colorScheme: theme }}
              className="bg-transparent border-none text-xs text-foreground focus:outline-none w-full sm:w-auto cursor-pointer font-bold uppercase select-none outline-none"
            />
            {selectedDate && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate("");
                }}
                className="text-[9px] font-black uppercase text-red-500 hover:text-red-400 px-2 py-1 rounded bg-red-500/10 border border-red-500/20 shrink-0 cursor-pointer"
              >
                Clear
              </button>
            )}
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

      {/* Payouts Table */}
      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="py-5 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em] w-20">No.</th>
                <th className="py-5 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Payout Date</th>
                <th className="py-5 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Plot ID</th>
                <th className="py-5 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Payout Type</th>
                <th className="py-5 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Status</th>
                <th className="py-5 px-8 text-[10px] text-primary font-black uppercase tracking-[0.2em] text-right">Payout Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reportLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2 className="text-primary animate-spin mx-auto" size={28} />
                    <p className="text-muted-foreground text-xs mt-3 font-medium">Loading payout data...</p>
                  </td>
                </tr>
              ) : filteredPayouts.length > 0 ? (
                filteredPayouts.map((payout: any, index: number) => (
                  <tr key={index} className="hover:bg-muted/30 transition-colors">
                    <td className="py-5 px-8 text-xs font-mono text-muted-foreground">{index + 1}.</td>
                    <td className="py-5 px-8 text-sm font-semibold text-foreground flex items-center gap-2">
                      <Calendar size={14} className="text-muted-foreground" />
                      {formatDate(payout.date)}
                    </td>
                    <td className="py-5 px-8 text-sm text-muted-foreground font-mono">{payout.plot_id}</td>
                    <td className="py-5 px-8 text-xs font-bold uppercase tracking-wider text-muted-foreground">{payout.type}</td>
                    <td className="py-5 px-8">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        payout.status === "PAID"
                          ? "bg-green-500/10 border-green-500/20 text-green-500"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                      }`}>
                        {payout.status === "PAID" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {payout.status}
                      </span>
                    </td>
                    <td className="py-5 px-8 text-sm text-foreground font-black font-mono text-right">
                      ₹{(payout.amount || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted-foreground text-xs italic">
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={28} className="opacity-20 text-primary" />
                      <p>No payouts found for {new Date(selectedYear, selectedMonth - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}{selectedDate ? ` on ${formatDate(selectedDate)}` : ""}.</p>
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
