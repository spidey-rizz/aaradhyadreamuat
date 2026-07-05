"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { apiFetch, endpoints } from "@/lib/api";
import {
  Loader2,
  ChevronLeft,
  CalendarRange,
  Search,
  CheckCircle2,
  AlertCircle,
  Check,
  RefreshCw,
  Wallet,
  Building2,
  TrendingUp,
  User,
  Users,
  Percent,
  X,
  FileText
} from "lucide-react";

export default function AdminMonthlyPayoutsPage() {
  const { status, profile } = useAuth({ redirectIfInvalid: "/login?expired=true" });
  const router = useRouter();

  // Role guard — check admin role
  const userRole = profile?.role?.toUpperCase();
  const isAdmin =
    userRole === "ADMIN" ||
    userRole === "SUPERADMIN" ||
    profile?.is_admin === true ||
    profile?.admin === true ||
    profile?.is_super_admin === true ||
    profile?.super_admin === true;

  // Filters State
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [searchQuery, setSearchQuery] = useState(""); // Combined name/phone/email field
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, PAID, UNPAID
  const [filterActive, setFilterActive] = useState("ALL"); // ALL, ACTIVE, INACTIVE

  // Data state
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Approve Confirmation Modal State
  const [approveConfirmRecord, setApproveConfirmRecord] = useState<any | null>(null);
  const [approveSubmitting, setApproveSubmitting] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [status, isAdmin, router]);

  const fetchRecords = async () => {
    if (!profile || !isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        month: String(selectedMonth),
        year: String(selectedYear),
      });

      const query = searchQuery.trim();
      if (query) {
        if (/^\d+$/.test(query)) {
          params.append("phone", query);
        } else if (query.includes("@")) {
          params.append("email", query);
        } else {
          params.append("name", query);
        }
      }

      if (filterStatus !== "ALL") params.append("status", filterStatus);
      if (filterActive !== "ALL") {
        params.append("account_active", filterActive === "ACTIVE" ? "true" : "false");
      }

      const data = await apiFetch(`${endpoints.adminPayouts}?${params.toString()}`);
      setRecords(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.detail || "Failed to fetch payout records.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && isAdmin) {
      fetchRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, selectedMonth, selectedYear]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords();
  };

  const handleMonthYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [y, m] = val.split("-").map(Number);
    setSelectedMonth(m);
    setSelectedYear(y);
  };

  const triggerApprove = (record: any) => {
    setApproveError(null);
    if (record.error) {
      setApproveError(record.error);
      return;
    }
    if (record.status === "PAID") {
      setApproveError("Payout for this user and month already exists.");
      return;
    }
    if (record.final_payout < 0) {
      setApproveError("Invalid payout amount. Please review commission data.");
      return;
    }

    setApproveConfirmRecord(record);
  };

  const executeApprove = async () => {
    if (!approveConfirmRecord) return;
    setApproveSubmitting(true);
    setApproveError(null);
    try {
      const result = await apiFetch(endpoints.approvePayout, {
        method: "POST",
        body: JSON.stringify({
          user_id: approveConfirmRecord.user_id,
          month: selectedMonth,
          year: selectedYear,
        }),
      });

      if (result.success) {
        setApproveConfirmRecord(null);
        fetchRecords();
      }
    } catch (err: any) {
      setApproveError(err.detail || "Failed to approve payout.");
    } finally {
      setApproveSubmitting(false);
    }
  };

  const totals = useMemo(() => {
    const list = records;
    const count = list.length;
    let selfSales = 0;
    let teamSales = 0;
    let totalSales = 0;
    let directComm = 0;
    let teamComm = 0;
    let totalComm = 0;
    let rewards = 0;
    let grossPayout = 0;
    let tds = 0;
    let finalPayable = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    list.forEach((r) => {
      selfSales += r.self_sales || 0;
      teamSales += r.team_sales || 0;
      totalSales += r.total_amount || 0;
      directComm += r.direct_commission || 0;
      teamComm += r.team_commission || 0;
      totalComm += r.total_commission || 0;
      rewards += r.reward_amount || 0;
      grossPayout += r.gross_payout || 0;
      tds += r.tds_amount || 0;
      finalPayable += r.final_payout || 0;

      if (r.status === "PAID") {
        paidCount++;
      } else {
        unpaidCount++;
      }
    });

    const roundVal = (v: number) => Math.round(v * 100) / 100;

    return {
      associates: count,
      selfSales: roundVal(selfSales),
      teamSales: roundVal(teamSales),
      totalSales: roundVal(totalSales),
      directComm: roundVal(directComm),
      teamComm: roundVal(teamComm),
      totalComm: roundVal(totalComm),
      rewards: roundVal(rewards),
      grossPayout: roundVal(grossPayout),
      tds: roundVal(tds),
      finalPayable: roundVal(finalPayable),
      paidCount,
      unpaidCount,
    };
  }, [records]);

  const monthYearValue = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading Payout Controls...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20 max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard/admin")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group text-sm font-semibold uppercase tracking-wider cursor-pointer"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Admin Panel
      </button>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-card border border-border p-8 rounded-[2.5rem] shadow-sm">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground mb-2 flex items-center gap-3">
            <Wallet className="text-primary" size={32} />
            User Monthly <span className="text-primary">Payouts</span>
          </h1>
          <p className="text-muted-foreground font-medium text-xs sm:text-sm">
            Validate associate business activities, manage TDS deductions, and approve monthly payout clearances securely.
          </p>
        </div>
        <button
          onClick={() => fetchRecords()}
          disabled={loading}
          className="bg-transparent border border-border text-foreground hover:border-primary/45 px-5 py-3 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
          Refresh Data
        </button>
      </div>

      {/* Filter Section - Single Row Horizontal Bar matching Reference */}
      <div className="bg-card border border-border p-4 rounded-[2rem] shadow-sm">
        <form onSubmit={handleFilterSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          
          {/* DD/MM/YYYY Month Year Input */}
          <div className="flex-1 min-w-[150px] relative">
            <CalendarRange size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="month"
              value={monthYearValue}
              onChange={handleMonthYearChange}
              className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 text-foreground focus:border-primary outline-none transition-all text-xs font-bold uppercase tracking-wider"
              title="Select Month/Year"
            />
          </div>

          {/* Name/Phone/Email Input */}
          <div className="flex-[2] relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Phone No. / E-mail / Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 text-foreground focus:border-primary outline-none transition-all text-xs"
            />
          </div>

          {/* Payout Status dropdown */}
          <div className="flex-1 min-w-[140px]">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:border-primary outline-none transition-all text-xs font-bold cursor-pointer"
            >
              <option value="ALL">Payout Status: All</option>
              <option value="UNPAID">UNPAID</option>
              <option value="PAID">PAID</option>
            </select>
          </div>

          {/* Account Status dropdown */}
          <div className="flex-1 min-w-[140px]">
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:border-primary outline-none transition-all text-xs font-bold cursor-pointer"
            >
              <option value="ALL">Account: All</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />}
              Search Records
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("ALL");
                setFilterActive("ALL");
                setSelectedMonth(now.getMonth() + 1);
                setSelectedYear(now.getFullYear());
              }}
              className="bg-muted border border-border text-foreground px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-muted/70 transition-all cursor-pointer"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm font-semibold">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Associates Cards List Section matching Reference Layout */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-20 bg-card border border-border rounded-[2.5rem] flex flex-col items-center justify-center shadow-sm">
            <Loader2 className="text-primary animate-spin mb-3" size={32} />
            <p className="text-muted-foreground text-xs font-semibold animate-pulse">Fetching monthly payout details...</p>
          </div>
        ) : records.length > 0 ? (
          records.map((r) => {
            const hasBank = !!(r.Bank_Name || r.Account_Number || r.IFSC_Code);
            return (
              <div
                key={r.user_id}
                className={`bg-card border rounded-[2rem] p-6 sm:p-8 shadow-sm transition-all hover:shadow-md relative overflow-hidden group ${
                  r.status === "PAID" ? "border-green-500/20" : "border-border hover:border-primary/40"
                }`}
              >
                {/* Decorative border bar for Paid/Unpaid */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    r.status === "PAID" ? "bg-green-500" : "bg-amber-500"
                  }`}
                />

                {/* Grid Container */}
                <div className="space-y-6">
                  
                  {/* Row 1: Basic Information Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-black uppercase text-foreground">
                        {r.first_name} {r.last_name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded bg-muted border border-border text-foreground text-[10px] font-black uppercase tracking-wider">
                        Lvl-{r.level}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                          r.account_active
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                        }`}
                      >
                        {r.account_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Payout Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          r.status === "PAID"
                            ? "bg-green-500/10 border-green-500/20 text-green-500"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                        }`}
                      >
                        {r.status === "PAID" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {r.status}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-0.5">Phone no:</span>
                      <span className="text-foreground font-mono font-semibold">{r.phone || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-0.5">Email:</span>
                      <span className="text-foreground font-semibold">{r.email || "—"}</span>
                    </div>
                  </div>

                  {/* Row 3: Bank Details Section */}
                  <div className="bg-muted/40 border border-border p-5 rounded-2xl space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Building2 size={13} /> Bank Details:
                    </span>
                    {!r.Bank_Name && !r.Account_Number && !r.IFSC_Code ? (
                      <p className="text-xs text-red-500 font-bold italic">Bank details not added</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">Bank Name</span>
                          <span className="text-foreground font-bold">{r.Bank_Name || "Bank details not added"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">Branch</span>
                          <span className="text-foreground font-semibold">{r.Branch_Name || "Bank details not added"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">Account Number</span>
                          <span className="text-foreground font-mono font-bold tracking-wider">{r.Account_Number || "Bank details not added"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">IFSC</span>
                          <span className="text-foreground font-mono font-bold uppercase">{r.IFSC_Code || "Bank details not added"}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Row 4: Sales and Commissions Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-2">
                    
                    {/* Left Column: Direct */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium">Direct Sales:</span>
                        <span className="font-mono font-bold text-foreground">₹{r.self_sales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="border-t border-dashed border-border" />
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium">Total Direct Commission:</span>
                        <span className="font-mono font-bold text-foreground">₹{r.direct_commission.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* Right Column: Indirect (Team) */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium">Indirect (Team) Sales:</span>
                        <span className="font-mono font-bold text-foreground">₹{r.team_sales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="border-t border-dashed border-border" />
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium">Total Indirect (Team) Commission:</span>
                        <span className="font-mono font-bold text-foreground">₹{r.team_commission.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                  </div>

                  {/* Row 5: Total Commission and Rewards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-foreground">Total Commission:</span>
                      <span className="font-mono font-black text-foreground">₹{r.total_commission.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-foreground">Rewards:</span>
                      <span className="font-mono font-black text-emerald-500">₹{r.reward_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Row 6: Highlight Box for Monthly Payout Amount & Approvals */}
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
                    
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
                        This Month payout amount [-TDS]
                      </span>
                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-black font-mono text-primary">
                          ₹{r.final_payout.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          (Gross: ₹{r.gross_payout.toLocaleString("en-IN")} | TDS: ₹{r.tds_amount.toLocaleString("en-IN")})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* If PAID, show log. If UNPAID, show action button */}
                      {r.status === "PAID" ? (
                        <div className="text-right text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          <div>Approved by {r.approved_by || "Admin"}</div>
                          <div className="opacity-70 mt-0.5">
                            {new Date(r.approved_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => triggerApprove(r)}
                          className="bg-primary text-black px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer w-full md:w-auto"
                        >
                          Approve Payout
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 bg-card border border-border rounded-[2.5rem] text-center text-muted-foreground text-xs italic shadow-sm">
            <div className="flex flex-col items-center gap-2">
              <FileText size={28} className="opacity-20 text-primary" />
              <p>No payout records found matching your filters for {selectedMonth}/{selectedYear}.</p>
            </div>
          </div>
        )}
      </div>

      {/* Approve Confirmation Modal */}
      {approveConfirmRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black uppercase tracking-tight text-foreground mb-4">Confirm Payout Approval</h3>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-medium">
                Are you sure you want to approve this payout for <strong className="text-foreground">{approveConfirmRecord.first_name} {approveConfirmRecord.last_name}</strong>?
              </p>

              <div className="bg-muted/40 border border-border p-4 rounded-2xl space-y-2 text-xs font-medium">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payout Cycle:</span>
                  <span className="text-foreground font-bold">{selectedMonth}/{selectedYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Commission:</span>
                  <span className="text-foreground font-mono">₹{approveConfirmRecord.total_commission.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reward Payout:</span>
                  <span className="text-emerald-500 font-mono">₹{approveConfirmRecord.reward_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-red-500">
                  <span>TDS (5%):</span>
                  <span className="font-mono">-₹{approveConfirmRecord.tds_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-dashed border-border my-2 pt-2 flex justify-between font-black text-sm text-primary">
                  <span>Final Payable:</span>
                  <span className="font-mono">₹{approveConfirmRecord.final_payout.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 p-3 rounded-xl text-[11px] font-semibold leading-relaxed">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                This action is permanent and cannot be undone. An approved payout cannot be returned to unpaid status.
              </div>

              {approveError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs font-bold">
                  <AlertCircle size={15} />
                  {approveError}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={executeApprove}
                disabled={approveSubmitting}
                className="bg-primary text-black px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-md cursor-pointer flex-grow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {approveSubmitting && <Loader2 className="animate-spin" size={14} />}
                YES, APPROVE
              </button>
              <button
                onClick={() => setApproveConfirmRecord(null)}
                disabled={approveSubmitting}
                className="bg-muted border border-border text-foreground px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-muted/70 transition-all cursor-pointer flex-grow text-center"
              >
                NO, CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
