"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { apiFetch, endpoints } from "@/lib/api";
import { getAssociatePolicy, addAdminLog } from "@/lib/adminStore";
import {
  Loader2,
  Shield,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Search,
  Users,
  BookOpen,
  FileText,
  User,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Layers,
  Home,
  X,
  RefreshCw,
  BadgeCheck,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────
type Tab = "booking" | "settlement" | "associates" | "plots";

const EMPTY_FORM = {
  associate_phone: "",
  associate_found: null as any,
  associate_loading: false,
  associate_error: "",
  user_id: "",
  plot_id: "",
  total_amount: "",
  paid_amount: "",
  prepaid: "",
  name: "",
  aadhar: "",
  phone: "",
  address: "",
  payment: "cash",
};

// ─── Shared Input Style ──────────────────────────────────────────────────────
const inputCls =
  "w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:border-primary outline-none transition-all text-sm";
const labelCls =
  "text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5";

// ─── Sale Form (shared by Booking & Settlement) ──────────────────────────────
function SaleForm({ saleType }: { saleType: "NEW" | "SETTLEMENT" }) {
  const { profile } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const phoneDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Auto-lookup associate by phone as user types
  const handleAssociatePhone = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 10);
    setForm((f) => ({
      ...f,
      associate_phone: cleaned,
      associate_found: null,
      associate_error: "",
      user_id: "",
    }));
    if (phoneDebounce.current) clearTimeout(phoneDebounce.current);
    if (cleaned.length === 10) {
      setForm((f) => ({ ...f, associate_loading: true }));
      phoneDebounce.current = setTimeout(async () => {
        try {
          const phoneToSend = "91" + cleaned;
          const data = await apiFetch(`${endpoints.userLookup}?phone=${phoneToSend}`);
          const user = Array.isArray(data) ? data[0] : data;
          if (user && (user._id || user.id)) {
            setForm((f) => ({
              ...f,
              associate_found: user,
              associate_loading: false,
              associate_error: "",
              user_id: user._id || user.id,
            }));
          } else {
            setForm((f) => ({
              ...f,
              associate_found: null,
              associate_loading: false,
              associate_error: "No associate found with this phone number.",
              user_id: "",
            }));
          }
        } catch (err: any) {
          setForm((f) => ({
            ...f,
            associate_found: null,
            associate_loading: false,
            associate_error: err.detail || "Associate not found.",
            user_id: "",
          }));
        }
      }, 600);
    } else {
      setForm((f) => ({ ...f, associate_loading: false }));
    }
  };

  const clearAssociate = () => {
    setForm((f) => ({
      ...f,
      associate_phone: "",
      associate_found: null,
      associate_error: "",
      associate_loading: false,
      user_id: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.user_id) {
      setMsg({ type: "error", text: "Please enter a valid associate phone to auto-fetch User ID." });
      return;
    }

    // Validate Aadhar contains exactly 12 digits
    if (!/^\d{12}$/.test(form.aadhar)) {
      setMsg({ type: "error", text: "Aadhar 12 digits ka hona chahiye" });
      return;
    }

    const policy = getAssociatePolicy(form.user_id);
    if (policy.limit !== null) {
      const saleAmount = parseFloat(form.total_amount);
      if (saleAmount > policy.limit) {
        setMsg({ type: "error", text: `Limit Exceeded: The associate has an active limit of ₹${policy.limit.toLocaleString()}. This transaction is for ₹${saleAmount.toLocaleString()}.` });
        return;
      }
    }

    setLoading(true);
    setMsg(null);
    let sanitizedBuyerPhone = form.phone.replace(/\D/g, "");
    if (sanitizedBuyerPhone.length === 10) {
      sanitizedBuyerPhone = "91" + sanitizedBuyerPhone;
    }

    try {
      await apiFetch(endpoints.addSale, {
        method: "POST",
        body: JSON.stringify({
          user_id: form.user_id,
          plot_id: form.plot_id.trim(),
          total_amount: parseFloat(form.total_amount),
          paid_amount: parseFloat(form.paid_amount),
          name: form.name.trim(),
          aadhar: String(form.aadhar).trim(),
          phone: sanitizedBuyerPhone,
          address: form.address.trim(),
          payment: form.payment,
          type: saleType,
          prepaid: parseInt(form.prepaid || "0") || 0,
        }),
      });
      
      const adminName = profile ? `${profile.first_name} ${profile.last_name}` : "Admin";
      addAdminLog(adminName, `Submitted ${saleType === "NEW" ? "new booking" : "settlement"} for Plot ${form.plot_id.trim()} (Associate: ${form.associate_found?.first_name || "Unknown"})`);
      
      setMsg({ type: "success", text: `${saleType === "NEW" ? "New Booking" : "Settlement"} submitted successfully!` });
      setForm(EMPTY_FORM);
    } catch (err: any) {
      setMsg({ type: "error", text: err.detail || "Failed to submit. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Status Message */}
      {msg && (
        <div
          className={`p-4 rounded-2xl flex items-start gap-3 text-sm font-semibold border ${
            msg.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
          }`}
        >
          {msg.type === "success" ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
          <p>{msg.text}</p>
        </div>
      )}

      {/* STEP 1: Associate Lookup */}
      <div className="bg-muted/30 border border-border rounded-2xl p-5 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-3 flex items-center gap-2">
          <BadgeCheck size={14} /> Step 1 — Identify Associate
        </p>
        <div className="space-y-2">
          <label className={labelCls}>Associate Phone Number *</label>
          <div className="relative flex items-center">
            <div className="absolute left-4 flex items-center gap-2 text-primary font-bold border-r border-border pr-3">
              <Phone size={15} />
              <span className="text-sm">+91</span>
            </div>
            <input
              type="tel"
              maxLength={10}
              placeholder="10 Digits"
              value={form.associate_phone}
              onChange={(e) => handleAssociatePhone(e.target.value)}
              className={`${inputCls} pl-24 pr-10`}
            />
            {form.associate_phone && (
              <button type="button" onClick={clearAssociate} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Lookup result */}
        {form.associate_loading && (
          <div className="flex items-center gap-2 text-xs text-primary font-semibold">
            <Loader2 size={14} className="animate-spin" /> Looking up associate...
          </div>
        )}
        {form.associate_error && (
          <p className="text-xs text-red-500 font-semibold flex items-center gap-1.5">
            <AlertCircle size={13} /> {form.associate_error}
          </p>
        )}
        {form.associate_found && (
          <div className="flex items-center gap-4 bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black shrink-0">
              {form.associate_found.first_name?.[0]}{form.associate_found.last_name?.[0]}
            </div>
            <div className="flex-grow">
              <p className="font-black text-foreground text-sm">
                {form.associate_found.first_name} {form.associate_found.last_name}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{form.associate_found.phone}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">User ID</span>
              <code className="text-[10px] font-mono text-foreground">{form.user_id}</code>
            </div>
            <CheckCircle2 size={18} className="text-green-500 shrink-0" />
          </div>
        )}
      </div>

      {/* STEP 2: Plot & Amounts */}
      <div className="bg-muted/30 border border-border rounded-2xl p-5 space-y-5">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-1 flex items-center gap-2">
          <Home size={14} /> Step 2 — Plot & Payment Details
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className={labelCls}>Plot ID *</label>
            <input required type="text" placeholder="e.g. PLOT-42" value={form.plot_id}
              onChange={(e) => set("plot_id", e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Payment Method</label>
            <select value={form.payment} onChange={(e) => set("payment", e.target.value)}
              className={`${inputCls} cursor-pointer`}>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="upi">UPI</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1">
            <label className={labelCls}>Total Amount (₹) *</label>
            <input required type="number" placeholder="Total Price" value={form.total_amount}
              onChange={(e) => set("total_amount", e.target.value)} className={`${inputCls} font-mono`} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Paid Amount (₹) *</label>
            <input required type="number" placeholder="Paid Price" value={form.paid_amount}
              onChange={(e) => set("paid_amount", e.target.value)} className={`${inputCls} font-mono`} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Prepaid (₹)</label>
            <input type="number" placeholder="Prepaid portion" value={form.prepaid}
              onChange={(e) => set("prepaid", e.target.value)} className={`${inputCls} font-mono`} />
          </div>
        </div>
      </div>

      {/* STEP 3: Buyer Details */}
      <div className="bg-muted/30 border border-border rounded-2xl p-5 space-y-5">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-1 flex items-center gap-2">
          <User size={14} /> Step 3 — Buyer Details
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className={labelCls}>Buyer Full Name *</label>
            <input required type="text" placeholder="Buyer's Full Name" value={form.name}
              onChange={(e) => set("name", e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Buyer Phone *</label>
            <div className="relative flex items-center">
              <div className="absolute left-4 flex items-center gap-2 text-primary font-bold border-r border-border pr-3">
                <Phone size={15} />
                <span className="text-sm">+91</span>
              </div>
              <input required type="tel" maxLength={10} placeholder="10 Digits" value={form.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setForm((f) => ({ ...f, phone: val }));
                }}
                className={`${inputCls} pl-24 pr-4`} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className={labelCls}>Buyer Aadhaar *</label>
            <input required type="text" maxLength={12} placeholder="12-digit Aadhaar" value={form.aadhar}
              onChange={(e) => set("aadhar", e.target.value.replace(/\D/g, ""))} className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Buyer Address *</label>
            <input required type="text" placeholder="Full postal address" value={form.address}
              onChange={(e) => set("address", e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !form.user_id}
        className="w-full bg-primary hover:scale-[1.01] active:scale-95 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : <PlusCircle size={18} />}
        {loading
          ? "Submitting..."
          : saleType === "NEW"
          ? "Submit New Booking"
          : "Submit Settlement"}
      </button>
    </form>
  );
}

// ─── Associate List Tab ───────────────────────────────────────────────────────
function AssociateList() {
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
            <button type="button" onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
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
                <th className="py-5 px-6 text-[10px] text-primary font-black uppercase tracking-[0.2em] text-right">Business (Self / Team / Total)</th>
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
                  const totalBusiness = user.lifetime_sale || (selfBusiness + teamBusiness);
                  return (
                    <tr key={user._id || idx} className="hover:bg-muted/30 transition-colors group">
                      <td className="py-5 px-6 text-sm text-muted-foreground">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shrink-0 group-hover:scale-110 transition-transform">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </div>
                          <span className="font-bold text-foreground text-sm">
                            {user.first_name || user.name ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.name : "—"}
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
                          <span className="text-sm font-black text-primary font-mono">₹{Number(totalBusiness).toLocaleString("en-IN")}</span>
                          <span className="text-[9px] text-muted-foreground font-mono mt-0.5">
                            Self: ₹{Number(selfBusiness).toLocaleString("en-IN")} | Team: ₹{Number(teamBusiness).toLocaleString("en-IN")}
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

// ─── Booked Plot List Tab ─────────────────────────────────────────────────────
function BookedPlotList() {
  const now = new Date();
  const [plotFilter, setPlotFilter] = useState("");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [plots, setPlots] = useState<any[]>([]);
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
    const dateStr = p.created_at || p.date || p.createdAt || (p.sale_data && (p.sale_data.created_at || p.sale_data.date || p.sale_data.createdAt));
    if (dateStr) {
      const d = new Date(dateStr);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      if (m !== month || y !== year) return false;
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
              <button type="button" onClick={clearAssociate} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
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
                {associateFound.first_name?.[0]}{associateFound.last_name?.[0]}
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
        {/* Plot filter */}
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
            <button type="button" onClick={() => setPlotFilter("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={15} />
            </button>
          )}
        </div>
        {/* Month picker */}
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
                <th className="py-5 px-6 text-[10px] text-primary font-black uppercase tracking-[0.2em] w-16">No.</th>
                <th className="py-5 px-6 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Plot Number</th>
                <th className="py-5 px-6 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Buyer Name</th>
                <th className="py-5 px-6 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Buyer Phone</th>
                <th className="py-5 px-6 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Associate Name</th>
                <th className="py-5 px-6 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Associate Phone</th>
                <th className="py-5 px-6 text-[10px] text-primary font-black uppercase tracking-[0.2em]">Booked Date</th>
                <th className="py-5 px-6 text-[10px] text-primary font-black uppercase tracking-[0.2em] text-right">Pricing (Total / Paid / Remaining)</th>
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
                  const assoc = associates.find(
                    (a: any) => (a._id || a.id) === plot.user_id
                  );
                  const assocName = assoc
                    ? `${assoc.first_name} ${assoc.last_name}`.trim()
                    : (plot.associate_name || plot.sold_by || plot.user_name || "—");
                  const assocPhone = assoc ? assoc.phone : "—";
                  const remainingAmount = plot.remaining_amount != null 
                    ? plot.remaining_amount 
                    : (plot.total_amount - plot.paid_amount || 0);
                  return (
                    <tr key={plot._id || plot.id || `${plot.plot_id || 'plot'}-${idx}`} className="hover:bg-muted/30 transition-colors">
                      <td className="py-5 px-6 text-xs font-mono text-muted-foreground">{idx + 1}.</td>
                      <td className="py-5 px-6 text-sm font-black text-foreground font-mono">{plot.plot_id || "—"}</td>
                      <td className="py-5 px-6 text-sm font-semibold text-foreground">
                        {plot.sale_data?.name || plot.name || plot.buyer_name || "—"}
                      </td>
                      <td className="py-5 px-6 text-sm text-muted-foreground font-mono">
                        {plot.sale_data?.phone || plot.phone || plot.buyer_phone || "—"}
                      </td>
                      <td className="py-5 px-6 text-sm text-muted-foreground">
                        {assocName}
                      </td>
                      <td className="py-5 px-6 text-sm text-muted-foreground font-mono">
                        {assocPhone}
                      </td>
                      <td className="py-5 px-6 text-sm text-muted-foreground">
                        {plot.created_at
                          ? new Date(plot.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-black text-primary font-mono">₹{Number(plot.total_amount || 0).toLocaleString("en-IN")}</span>
                          <span className="text-[9px] text-muted-foreground font-mono mt-0.5">
                            Paid: ₹{Number(plot.paid_amount || 0).toLocaleString("en-IN")} | Rem: ₹{Number(remainingAmount).toLocaleString("en-IN")}
                          </span>
                        </div>
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
                    <p className="text-muted-foreground text-xs font-semibold">No bookings found for this period. Modify filters to search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
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
    </div>
  );
}

// ─── Tab Config ───────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "booking",     label: "New Booking",    icon: PlusCircle, desc: "Register a new plot booking" },
  { id: "settlement",  label: "Settlement",     icon: FileText,   desc: "Record a payment settlement" },
  { id: "associates",  label: "Associate List", icon: Users,      desc: "Browse & filter associates" },
  { id: "plots",       label: "Booked Plots",   icon: BookOpen,   desc: "View all booked plot records" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPanelPage() {
  const { status, profile } = useAuth({ redirectIfInvalid: "/login?expired=true" });
  const [activeTab, setActiveTab] = useState<Tab>("booking");
  const router = useRouter();

  // Role guard — only admin or super_admin can access this page
  const userRole = profile?.role?.toUpperCase();
  const isAuthorized =
    userRole === "ADMIN" ||
    userRole === "SUPERADMIN" ||
    profile?.is_admin === true ||
    profile?.is_super_admin === true;

  useEffect(() => {
    if (status === "authenticated" && !isAuthorized) {
      router.replace("/dashboard");
    }
  }, [status, isAuthorized, router]);

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading Admin Panel...</p>
      </div>
    );
  }

  // Block render while redirecting
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            Admin <span className="text-primary">Panel</span>
          </h1>
          <p className="text-muted-foreground font-medium mt-1 text-sm">
            Welcome, {profile.first_name} {profile.last_name} — Sales & Associate Management
          </p>
        </div>
        <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <Shield size={15} />
          {profile.role === "super_admin" ? "Super Admin" : "Admin"} Mode
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-start gap-2 px-4 py-4 rounded-2xl border text-left transition-all cursor-pointer group ${
                isActive
                  ? "bg-primary text-black border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                  : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Icon size={20} className={isActive ? "text-black" : "text-primary group-hover:scale-110 transition-transform"} />
              <div>
                <p className={`text-xs font-black uppercase tracking-wider ${isActive ? "text-black" : ""}`}>{tab.label}</p>
                <p className={`text-[9px] font-medium mt-0.5 ${isActive ? "text-black/70" : "text-muted-foreground/60"}`}>{tab.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-7 pb-5 border-b border-border">
          {(() => {
            const t = TABS.find((t) => t.id === activeTab)!;
            const Icon = t.icon;
            return (
              <>
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Icon size={17} />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight">{t.label}</h2>
                  <p className="text-[11px] text-muted-foreground font-medium">{t.desc}</p>
                </div>
              </>
            );
          })()}
        </div>

        {activeTab === "booking"    && <SaleForm saleType="NEW" />}
        {activeTab === "settlement" && <SaleForm saleType="SETTLEMENT" />}
        {activeTab === "associates" && <AssociateList />}
        {activeTab === "plots"      && <BookedPlotList />}
      </div>
    </div>
  );
}
