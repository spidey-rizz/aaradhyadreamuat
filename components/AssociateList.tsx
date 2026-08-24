"use client";

import React, { useState, useEffect, useMemo } from "react";
import { apiFetch, endpoints } from "@/lib/api";
import { Loader2, Search, X, AlertCircle, Users, Calendar, CheckCircle2, Wallet, Award, Landmark, FileEdit, Trash2, UserMinus } from "lucide-react";
import { getAssociatePolicy } from "@/lib/adminStore";
import { useAuth } from "@/lib/useAuth";

const inputCls =
  "w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:border-primary outline-none transition-all text-sm";

export default function AssociateList() {
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [rawResults, setRawResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const { profile } = useAuth();
  const isSuperAdmin = profile?.super_admin === true || profile?.is_super_admin === true || profile?.role?.toLowerCase() === 'super_admin';

  // Monthly Report and Payout Modal State
  const [selectedUserForReport, setSelectedUserForReport] = useState<any | null>(null);
  const [selectedUserForBank, setSelectedUserForBank] = useState<any | null>(null);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<any | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);

  // Direct Sales Modal State
  const [selectedUserForSales, setSelectedUserForSales] = useState<any | null>(null);
  const [directSalesData, setDirectSalesData] = useState<any[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [salesError, setSalesError] = useState<string | null>(null);

  // Edit Sale Modal State
  const [selectedSaleForEdit, setSelectedSaleForEdit] = useState<any | null>(null);
  const [editSaleForm, setEditSaleForm] = useState<any>({});
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const fetchDirectSales = async (userId: string) => {
    setLoadingSales(true);
    setSalesError(null);
    try {
      const data = await apiFetch(`/sales/direct/${userId}`);
      setDirectSalesData(data.sales || []);
    } catch (err: any) {
      setSalesError(err.detail || "Failed to load direct sales.");
    } finally {
      setLoadingSales(false);
    }
  };

  const handleOpenSalesModal = (user: any) => {
    setSelectedUserForSales(user);
    fetchDirectSales(user._id || user.id);
  };

  const handleDeleteUser = async (user: any) => {
    if (!confirm(`Are you sure you want to delete ${user.first_name || user.name}? This cannot be undone.`)) return;
    try {
      await apiFetch(`/broker/admin/user/${user._id || user.id}`, { method: "DELETE" });
      alert("User deleted successfully.");
      fetchAllAssociates();
    } catch (err: any) {
      alert(err.detail || "Failed to delete user.");
    }
  };

  const handleDeleteSale = async (sale: any) => {
    if (!confirm("Are you sure you want to delete this sale? It may affect payouts and commissions.")) return;
    try {
      const saleId = sale._id || sale.id;
      const month = sale.month || (sale.created_at ? new Date(sale.created_at).getMonth() + 1 : 1);
      const year = sale.year || (sale.created_at ? new Date(sale.created_at).getFullYear() : new Date().getFullYear());
      await apiFetch(`/sales/${saleId}?month=${month}&year=${year}`, { method: "DELETE" });
      alert("Sale deleted successfully.");
      if (selectedUserForSales) fetchDirectSales(selectedUserForSales._id || selectedUserForSales.id);
    } catch (err: any) {
      alert(err.detail || "Failed to delete sale.");
    }
  };

  const handleEditSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaleForEdit) return;
    setSubmittingEdit(true);
    try {
      const saleId = selectedSaleForEdit._id || selectedSaleForEdit.id;
      await apiFetch(`/sales/${saleId}`, {
        method: "PATCH",
        body: JSON.stringify(editSaleForm)
      });
      alert("Sale updated successfully.");
      setSelectedSaleForEdit(null);
      if (selectedUserForSales) fetchDirectSales(selectedUserForSales._id || selectedUserForSales.id);
    } catch (err: any) {
      alert(err.detail || "Failed to update sale.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const fetchMonthlyReport = async (userId: string, m: number, y: number) => {
    setLoadingReport(true);
    setReportError(null);
    setPayoutSuccess(null);
    try {
      const data = await apiFetch(`${endpoints.monthlyReport}?user_id=${userId}&month=${m}&year=${y}`);
      setReportData(data);
    } catch (err: any) {
      setReportError(err.detail || "Failed to load monthly report.");
      setReportData(null);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleOpenReportModal = (user: any) => {
    setSelectedUserForReport(user);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    setReportMonth(currentMonth);
    setReportYear(currentYear);
    fetchMonthlyReport(user._id || user.id, currentMonth, currentYear);
  };

  const handleReportDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value || !selectedUserForReport) return;
    const [y, m] = e.target.value.split("-").map(Number);
    setReportMonth(m);
    setReportYear(y);
    fetchMonthlyReport(selectedUserForReport._id || selectedUserForReport.id, m, y);
  };

  const handleCreatePayout = async () => {
    if (!selectedUserForReport || !reportData) return;
    const amount = reportData.settlement_amount || 0;
    if (amount <= 0) {
      alert("No pending amount to clear for this month.");
      return;
    }
    setPayoutSubmitting(true);
    setPayoutSuccess(null);
    try {
      await apiFetch((endpoints as any).addPayout || "/sales/payout/add", {
        method: "POST",
        body: JSON.stringify({
          user_id: selectedUserForReport._id || selectedUserForReport.id,
          amount: amount,
          month: reportMonth,
          year: reportYear
        })
      });
      setPayoutSuccess("Payout recorded successfully.");
      // Reload report
      fetchMonthlyReport(selectedUserForReport._id || selectedUserForReport.id, reportMonth, reportYear);
    } catch (err: any) {
      alert(err.detail || "Failed to record payout.");
    } finally {
      setPayoutSubmitting(false);
    }
  };

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
      } else if (cleanQuery.length === 10 && /[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}/.test(cleanQuery.toUpperCase())) {
        params.append("pan", cleanQuery.toUpperCase());
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
    const mapped = rawResults.map((u: any) => {
      const policy = getAssociatePolicy(u._id || u.id);
      return {
        ...u,
        level: policy && policy.level !== undefined && policy.level !== null ? policy.level : (u.level || 1)
      };
    });
    if (levelFilter === "all") return mapped;
    return mapped.filter((u: any) => String(u.level) === levelFilter);
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
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Joining Date</th>
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Name</th>
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Referral Code</th>
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Phone</th>
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-center">Level</th>
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-right">
                  Business (Self / Team / Total)
                </th>
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
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
                      <td className="py-5 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenReportModal(user)}
                            className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary-text hover:bg-primary hover:text-black rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                          >
                            View Report
                          </button>
                          <button
                            onClick={() => handleOpenSalesModal(user)}
                            className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                          >
                            Sales Admin
                          </button>
                          <button
                            onClick={() => setSelectedUserForBank(user)}
                            title="View Bank Details"
                            className="p-1.5 bg-muted hover:bg-muted-foreground/20 border border-border text-foreground rounded-lg transition-all cursor-pointer flex items-center justify-center"
                          >
                            <Landmark size={15} />
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              title="Delete User"
                              className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                            >
                              <UserMinus size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Users size={32} className="mx-auto mb-3 opacity-20 text-primary" />
                    <p className="text-muted-foreground text-xs font-semibold">No associates found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Report & Payout Modal */}
      {selectedUserForReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden max-h-[90vh] flex flex-col">
            <button
              onClick={() => setSelectedUserForReport(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/50"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4 border-b border-border pb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Wallet size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">Monthly Report & Payout</h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  For {selectedUserForReport.first_name} {selectedUserForReport.last_name}
                </p>
              </div>
            </div>

            {/* Date selector */}
            <div className="flex items-center gap-3 mb-6 bg-background border border-border p-3 rounded-2xl">
              <Calendar size={16} className="text-primary-text shrink-0" />
              <input
                type="month"
                value={`${reportYear}-${String(reportMonth).padStart(2, "0")}`}
                max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`}
                onChange={handleReportDateChange}
                className="bg-transparent border-none text-xs text-foreground focus:outline-none w-full cursor-pointer font-bold uppercase outline-none"
              />
            </div>

            {/* Modal Body */}
            <div className="flex-grow overflow-y-auto pr-1 space-y-5 font-sans">
              {loadingReport ? (
                <div className="py-16 text-center">
                  <Loader2 className="text-primary animate-spin mx-auto" size={28} />
                  <p className="text-muted-foreground text-xs mt-3 font-semibold">Loading report data...</p>
                </div>
              ) : reportError ? (
                <div className="flex items-center gap-2 text-red-500 text-sm font-semibold bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                  <AlertCircle size={16} /> {reportError}
                </div>
              ) : reportData ? (
                <>
                  {/* Sales/Business Overview section */}
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Business Overview (API Live)</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center bg-background border border-border/80 p-2.5 rounded-xl">
                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Direct Sales</p>
                        <p className="text-sm font-black text-foreground font-mono">₹{Number(reportData.direct_sale || 0).toLocaleString("en-IN")}</p>
                      </div>
                      <div className="text-center bg-background border border-border/80 p-2.5 rounded-xl">
                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">Team Sales</p>
                        <p className="text-sm font-black text-foreground font-mono">₹{Number(reportData.team_sale || 0).toLocaleString("en-IN")}</p>
                      </div>
                      <div className="text-center bg-primary/10 border border-primary/25 p-2.5 rounded-xl">
                        <p className="text-[8px] font-black uppercase tracking-widest text-primary-text mb-1">Total Sales</p>
                        <p className="text-sm font-black text-primary-text font-mono">₹{Number(reportData.lifetime_sale || 0).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background border border-border p-4 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Direct Commission</p>
                      <p className="text-lg font-black text-foreground font-mono">₹{Number(reportData.total_direct_commission || 0).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="bg-background border border-border p-4 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Team Commission</p>
                      <p className="text-lg font-black text-foreground font-mono">₹{Number(reportData.total_indirect_commission || 0).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="bg-background border border-border p-4 rounded-2xl col-span-2 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Rewards</p>
                        <p className="text-lg font-black text-foreground font-mono">₹{Number(reportData.total_rewards || 0).toLocaleString("en-IN")}</p>
                      </div>
                      {reportData.rewards && reportData.rewards.length > 0 && (
                        <div className="text-[10px] text-muted-foreground font-semibold flex flex-col items-end">
                          {reportData.rewards.map((r: any) => (
                            <span key={r.id}>LvL-{r.level}: ₹{Number(r.amount).toLocaleString("en-IN")}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Box */}
                  {(() => {
                    const gross = (reportData.total_commission || 0) + (reportData.total_rewards || 0);
                    const tds = gross * 0.05;
                    const net = gross - tds;
                    const alreadyPaid = reportData.already_paid || 0;
                    return (
                      <>
                        <div className="border border-border rounded-2xl p-4 bg-muted/30 space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            <span>Total Commissions</span>
                            <span className="font-mono text-foreground">₹{Number(reportData.total_commission || 0).toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            <span>Total Rewards</span>
                            <span className="font-mono text-foreground">₹{Number(reportData.total_rewards || 0).toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            <span>Gross Amount</span>
                            <span className="font-mono text-foreground">₹{Number(gross).toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-bold text-red-500 uppercase tracking-wider">
                            <span>TDS (5%)</span>
                            <span className="font-mono text-red-500">-₹{Number(tds).toLocaleString("en-IN")}</span>
                          </div>
                          {alreadyPaid > 0 && (
                            <div className="flex justify-between items-center text-xs font-bold text-green-500 uppercase tracking-wider">
                              <span>Already Settled (Paid)</span>
                              <span className="font-mono text-green-500">-₹{Number(alreadyPaid).toLocaleString("en-IN")}</span>
                            </div>
                          )}
                          <div className="border-t border-dashed border-border/80 my-2" />
                          <div className="flex justify-between items-center bg-primary/5 border border-primary/20 px-3 py-2.5 rounded-xl">
                            <span className="text-xs font-black text-primary-text uppercase tracking-widest">
                              {alreadyPaid > 0 ? "Remaining Pending Payable" : "Net Payable Amount"}
                            </span>
                            <span className="text-base font-black text-primary-text font-mono">
                              ₹{Number(reportData.settled ? alreadyPaid : (reportData.settlement_amount || net)).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>

                        {/* Payout status card */}
                        <div className={`p-4 rounded-2xl border flex items-center justify-between ${reportData.settled
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                          }`}>
                          <div className="flex items-center gap-3">
                            {reportData.settled ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            <div>
                              <p className="text-xs font-black uppercase tracking-wider">Payout Status</p>
                              <p className="text-sm font-bold mt-0.5">
                                {reportData.settled
                                  ? "Settled (Fully Paid)"
                                  : alreadyPaid > 0
                                    ? "Partially Settled (Pending)"
                                    : "Payout Pending"}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono font-black text-sm">
                            ₹{Number(reportData.settled ? 0 : (reportData.settlement_amount || net)).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </>
                    );
                  })()}

                  {payoutSuccess && (
                    <div className="flex items-center gap-2 text-emerald-500 text-sm font-semibold bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                      <CheckCircle2 size={16} /> {payoutSuccess}
                    </div>
                  )}

                  {/* Direct Payout Creation Button */}
                  {!reportData.settled && (reportData.settlement_amount || 0) > 0 && (
                    <button
                      onClick={handleCreatePayout}
                      disabled={payoutSubmitting}
                      className="w-full bg-primary text-black py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {payoutSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" size={15} />
                          Processing Payout...
                        </>
                      ) : (
                        "Direct Create Payout (Pay Now)"
                      )}
                    </button>
                  )}
                </>
              ) : (
                <div className="py-16 text-center text-muted-foreground text-xs font-semibold">
                  No monthly report found for this period.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-border mt-4">
              <button
                onClick={() => setSelectedUserForReport(null)}
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold uppercase tracking-widest hover:bg-muted transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Details Modal */}
      {selectedUserForBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <button
              onClick={() => setSelectedUserForBank(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/50"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6 border-b border-border pb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Landmark size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground uppercase tracking-wider">Bank Details</h3>
                <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                  {selectedUserForBank.first_name || selectedUserForBank.name
                    ? `${selectedUserForBank.first_name || ""} ${selectedUserForBank.last_name || ""}`.trim() || selectedUserForBank.name
                    : "Associate Account"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {selectedUserForBank.bank_account &&
                (selectedUserForBank.bank_account.bank_name ||
                  selectedUserForBank.bank_account.account_number ||
                  selectedUserForBank.bank_account.ifsc_code) ? (
                <div className="space-y-3.5">
                  <div className="bg-muted/30 border border-border rounded-2xl p-4.5 space-y-3 font-mono">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Bank Name</span>
                      <span className="text-sm font-black text-foreground">{selectedUserForBank.bank_account.bank_name || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Account Number</span>
                      <span className="text-sm font-black text-foreground tracking-wider">{selectedUserForBank.bank_account.account_number || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">IFSC Code</span>
                      <span className="text-sm font-black text-primary-text">{selectedUserForBank.bank_account.ifsc_code || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Branch Name</span>
                      <span className="text-sm font-black text-foreground">{selectedUserForBank.bank_account.branch_name || "—"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground text-sm font-semibold flex flex-col items-center gap-2">
                  <Landmark size={32} className="opacity-20 text-primary-text" />
                  <p>No bank details uploaded by this associate yet.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-border mt-6">
              <button
                onClick={() => setSelectedUserForBank(null)}
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold uppercase tracking-widest hover:bg-muted transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Direct Sales Admin Modal */}
      {selectedUserForSales && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-200 relative max-h-[90vh] flex flex-col">
            <button onClick={() => setSelectedUserForSales(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted/50">
              <X size={18} />
            </button>
            <h3 className="text-xl font-black uppercase tracking-tight mb-4">
              Direct Sales - {selectedUserForSales.first_name || selectedUserForSales.name}
            </h3>

            <div className="flex-grow overflow-y-auto">
              {loadingSales ? (
                <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={24} /></div>
              ) : salesError ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-semibold">{salesError}</div>
              ) : directSalesData.length > 0 ? (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="py-3 px-3 uppercase text-[10px] tracking-widest font-black text-muted-foreground">Date</th>
                      <th className="py-3 px-3 uppercase text-[10px] tracking-widest font-black text-muted-foreground">Plot</th>
                      <th className="py-3 px-3 uppercase text-[10px] tracking-widest font-black text-muted-foreground text-right">Total</th>
                      <th className="py-3 px-3 uppercase text-[10px] tracking-widest font-black text-muted-foreground text-right">Paid</th>
                      <th className="py-3 px-3 uppercase text-[10px] tracking-widest font-black text-muted-foreground text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {directSalesData.map((s, i) => (
                      <tr key={i} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-3 text-foreground font-medium">{new Date(s.created_at).toLocaleDateString('en-IN')}</td>
                        <td className="py-3 px-3 font-mono font-bold text-foreground">{s.plot_id}</td>
                        <td className="py-3 px-3 text-right font-mono font-black text-primary-text">₹{s.total_amount?.toLocaleString('en-IN') || 0}</td>
                        <td className="py-3 px-3 text-right font-mono font-black text-emerald-500">₹{s.paid_amount?.toLocaleString('en-IN') || 0}</td>
                        <td className="py-3 px-3">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => { setSelectedSaleForEdit(s); setEditSaleForm(s); }} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"><FileEdit size={16} /></button>
                            <button onClick={() => handleDeleteSale(s)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-2">
                  <Wallet size={32} className="opacity-20 text-primary-text" />
                  <p className="text-sm font-semibold">No direct sales found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Sale Modal */}
      {selectedSaleForEdit && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setSelectedSaleForEdit(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <X size={18} />
            </button>
            <h3 className="text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-2"><FileEdit size={20} className="text-primary" /> Edit Sale</h3>
            <form onSubmit={handleEditSaleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Total Amount</label>
                <input type="number" value={editSaleForm.total_amount || ""} onChange={e => setEditSaleForm({ ...editSaleForm, total_amount: Number(e.target.value) })} className="w-full bg-background border border-border p-2.5 rounded-xl text-sm font-mono focus:border-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Paid Amount</label>
                <input type="number" value={editSaleForm.paid_amount || ""} onChange={e => setEditSaleForm({ ...editSaleForm, paid_amount: Number(e.target.value) })} className="w-full bg-background border border-border p-2.5 rounded-xl text-sm font-mono focus:border-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Plot ID</label>
                <input type="text" value={editSaleForm.plot_id || ""} onChange={e => setEditSaleForm({ ...editSaleForm, plot_id: e.target.value })} className="w-full bg-background border border-border p-2.5 rounded-xl text-sm font-mono focus:border-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Customer Name</label>
                <input type="text" value={editSaleForm.name || (editSaleForm.sale_data && editSaleForm.sale_data.name) || ""} onChange={e => setEditSaleForm({ ...editSaleForm, name: e.target.value })} className="w-full bg-background border border-border p-2.5 rounded-xl text-sm focus:border-primary outline-none transition-colors" />
              </div>
              <div className="pt-2">
                <button disabled={submittingEdit} type="submit" className="w-full bg-primary text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer">
                  {submittingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
