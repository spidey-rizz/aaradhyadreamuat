"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiFetch, endpoints } from "@/lib/api";
import { Loader2, Users, Phone, X, AlertCircle, Home, RefreshCw } from "lucide-react";
import ReceiptModal from "@/components/ReceiptModal";

const inputCls =
  "w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:border-primary outline-none transition-all text-sm";

export default function BookedPlotList() {
  const now = new Date();
  const [plotFilter, setPlotFilter] = useState("");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [plots, setPlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);
  const [page, setPage] = useState(1);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  // Associate mapping and filter states
  const [associates, setAssociates] = useState<any[]>([]);
  const [associatePhone, setAssociatePhone] = useState("");
  const [associateFound, setAssociateFound] = useState<any>(null);
  const [associateLoading, setAssociateLoading] = useState(false);
  const [associateError, setAssociateError] = useState("");
  const [userId, setUserId] = useState("");
  const phoneDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Receipt Modal States
  const [receiptToView, setReceiptToView] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewReceipt = (plot: any) => {
    const pType = plot.type || plot.sale_data?.type || "NEW";
    const prepaidAmount = pType === "SETTLEMENT" ? Number(plot.prepaid || 0) : 0;
    const remainingVal = prepaidAmount > 0 
      ? Math.max(0, plot.total_amount - (prepaidAmount + plot.paid_amount))
      : (plot.remaining_amount != null ? plot.remaining_amount : plot.total_amount - plot.paid_amount);

    const mPrice = Number(plot.market_price || plot.sale_data?.market_price || 0);
    const dPercent = Number(plot.discount_percent || plot.sale_data?.discount_percent || 0);

    const receiptData = {
      receiptNo: plot._id || plot.id,
      date: plot.created_at || plot.date || plot.createdAt,
      plotNo: plot.plot_id || plot.plotId || plot.plot_number,
      customerName: plot.sale_data?.name || plot.name || plot.buyer_name,
      phone: plot.sale_data?.phone || plot.phone || plot.buyer_phone,
      address: plot.sale_data?.address || plot.address || plot.buyer_address,
      paymentMode: plot.payment || plot.payment_mode || plot.sale_data?.payment || "Cash",
      marketPrice: mPrice > 0 ? mPrice : undefined,
      discountPercent: dPercent > 0 ? dPercent : undefined,
      totalAmount: plot.total_amount,
      paidAmount: plot.paid_amount,
      remainingAmount: remainingVal,
      prepaid: prepaidAmount,
      metadata: typeof plot.sale_metadata === "object" ? plot.sale_metadata : undefined,
    };
    setReceiptToView(receiptData);
    setIsModalOpen(true);
  };

  const fetchAssociatesMap = async () => {
    try {
      const data = await apiFetch(`${endpoints.allUsers}?page=1&page_size=100`);
      setAssociates(data.users || []);
    } catch (err) {
      console.error("Failed to fetch associates map", err);
    }
  };

  const fetchPlots = async (pNum = page) => {
    setLoading(true);
    setError(null);
    setFetched(true);
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

      setPlots(Array.isArray(list) ? list : []);
      setPage(pNum);
    } catch (err: any) {
      setError(err.detail || "Failed to fetch booked plots.");
      setPlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssociatesMap();
    fetchPlots(1);
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

  const filtered = plots.filter((p: any) => {
    // 1. Filter by Plot Number keyword
    if (plotFilter.trim()) {
      const pid = String(p.plot_id || p.plotId || p.plot_number || "").toLowerCase();
      if (!pid.includes(plotFilter.toLowerCase())) return false;
    }

    // 2. Filter by Associate ID if active
    if (userId) {
      const pUid = p.user_id || p.userId || (p.sale_data && (p.sale_data.user_id || p.sale_data.userId));
      if (pUid !== userId) return false;
    }

    // 3. Filter by Month & Year based on created_at or date
    const dateStr =
      p.created_at ||
      p.date ||
      p.createdAt ||
      (p.sale_data && (p.sale_data.created_at || p.sale_data.date || p.sale_data.createdAt));
    if (dateStr) {
      const d = new Date(dateStr);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      if (m !== month || y !== year) return false;
    }

    // 4. Filter by Payment Status
    const total = Number(p.total_amount || p.totalAmount || 0);
    const paid = Number(p.paid_amount || p.paidAmount || 0);
    const pType = p.type || p.sale_data?.type || "NEW";
    const prepaid = pType === "SETTLEMENT" ? Number(p.prepaid || 0) : 0;
    
    const isSettled = (total === paid) || ((prepaid + paid) >= total);
    
    if (paymentStatusFilter === "settled" && !isSettled) return false;
    if (paymentStatusFilter === "pending" && isSettled) return false;

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
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-grow">
          <Home size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter loaded list by Plot Number..."
            value={plotFilter}
            onChange={(e) => setPlotFilter(e.target.value)}
            className={`${inputCls} pl-10`}
          />
          {plotFilter && (
            <button
              type="button"
              onClick={() => setPlotFilter("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <select
          value={paymentStatusFilter}
          onChange={(e) => setPaymentStatusFilter(e.target.value)}
          className={`${inputCls} sm:w-48 cursor-pointer`}
        >
          <option value="all">All Bookings</option>
          <option value="settled">Fully Paid (Settled)</option>
          <option value="pending">Partially Paid (Pending)</option>
        </select>
        <input
          type="month"
          value={monthValue}
          max={`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`}
          onChange={handleMonthChange}
          className={`${inputCls} sm:w-44 cursor-pointer`}
        />
        <button
          onClick={() => fetchPlots(1)}
          disabled={loading}
          className="bg-primary text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
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
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Plot Number</th>
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Buyer Name</th>
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Buyer Phone</th>
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Associate Name</th>
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Associate Phone</th>
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Booked Date</th>
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-right">
                  Pricing (Total / Paid / Remaining)
                </th>
                <th className="py-5 px-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Loader2 className="text-primary animate-spin mx-auto" size={28} />
                    <p className="text-muted-foreground text-xs mt-3 font-medium">Loading plot data...</p>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((plot: any, idx: number) => {
                  const assoc = associates.find((a: any) => (a._id || a.id) === plot.user_id);
                  const assocName = assoc
                    ? `${assoc.first_name} ${assoc.last_name}`.trim()
                    : plot.associate_name || plot.sold_by || plot.user_name || "—";
                  const assocPhone = assoc ? assoc.phone : "—";
                  const pType = plot.type || plot.sale_data?.type || "NEW";
                  const prepaidAmount = pType === "SETTLEMENT" ? Number(plot.prepaid || 0) : 0;
                  const remainingAmount = prepaidAmount > 0 
                    ? Math.max(0, plot.total_amount - (prepaidAmount + plot.paid_amount))
                    : (plot.remaining_amount != null ? plot.remaining_amount : plot.total_amount - plot.paid_amount || 0);
                  return (
                    <tr
                      key={plot._id || plot.id || `${plot.plot_id || "plot"}-${idx}`}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-5 px-6 text-xs font-mono text-muted-foreground">{idx + 1}.</td>
                      <td className="py-5 px-6 text-sm font-black text-foreground font-mono">{plot.plot_id || "—"}</td>
                      <td className="py-5 px-6 text-sm font-semibold text-foreground">
                        {plot.sale_data?.name || plot.name || plot.buyer_name || "—"}
                      </td>
                      <td className="py-5 px-6 text-sm text-muted-foreground font-mono">
                        {plot.sale_data?.phone || plot.phone || plot.buyer_phone || "—"}
                      </td>
                      <td className="py-5 px-6 text-sm text-muted-foreground">{assocName}</td>
                      <td className="py-5 px-6 text-sm text-muted-foreground font-mono">{assocPhone}</td>
                      <td className="py-5 px-6 text-sm text-muted-foreground">
                        {plot.created_at
                          ? new Date(plot.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-black text-primary font-mono">
                            ₹{Number(plot.total_amount || 0).toLocaleString("en-IN")}
                          </span>
                          <span className="text-[9px] text-muted-foreground font-mono mt-0.5">
                            Paid: ₹{Number(plot.paid_amount || 0).toLocaleString("en-IN")}
                            {prepaidAmount > 0 && ` | Prepaid: ₹${prepaidAmount.toLocaleString("en-IN")}`}
                            {` | Rem: ₹${Number(remainingAmount).toLocaleString("en-IN")}`}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <button
                          onClick={() => handleViewReceipt(plot)}
                          className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-primary hover:text-black transition-all cursor-pointer"
                        >
                          Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : fetched && !loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Home size={32} className="mx-auto mb-3 opacity-20 text-primary" />
                    <p className="text-muted-foreground text-xs font-semibold">
                      {plotFilter ? `No plots found matching "${plotFilter}".` : "No booked plots for this period."}
                    </p>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Home size={32} className="mx-auto mb-3 opacity-20 text-primary" />
                    <p className="text-muted-foreground text-xs font-semibold">
                      No bookings found for this period. Modify filters to search.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {plots.length === 100 || page > 1 ? (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
            <button
              type="button"
              disabled={page === 1 || loading}
              onClick={() => fetchPlots(page - 1)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-border rounded-xl hover:bg-muted disabled:opacity-50 transition-colors cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs font-black font-mono">Page {page}</span>
            <button
              type="button"
              disabled={plots.length < 100 || loading}
              onClick={() => fetchPlots(page + 1)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-border rounded-xl hover:bg-muted disabled:opacity-50 transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
      
      <ReceiptModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setReceiptToView(null);
        }}
        data={receiptToView}
      />
    </div>
  );
}
