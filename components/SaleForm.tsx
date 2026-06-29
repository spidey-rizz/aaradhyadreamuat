"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/lib/useAuth";
import { apiFetch, endpoints } from "@/lib/api";
import { getAssociatePolicy, addAdminLog } from "@/lib/adminStore";
import {
  Loader2,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  Home,
  X,
  BadgeCheck,
} from "lucide-react";

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

const inputCls =
  "w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:border-primary outline-none transition-all text-sm";
const labelCls =
  "text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5";

export default function SaleForm({ saleType }: { saleType: "NEW" | "SETTLEMENT" }) {
  const { profile } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const phoneDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

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

    if (!/^\d{12}$/.test(form.aadhar)) {
      setMsg({ type: "error", text: "Aadhar 12 digits ka hona chahiye" });
      return;
    }

    const policy = getAssociatePolicy(form.user_id);
    if (policy.limit !== null) {
      const saleAmount = parseFloat(form.total_amount);
      if (saleAmount > policy.limit) {
        setMsg({
          type: "error",
          text: `Limit Exceeded: The associate has an active limit of ₹${policy.limit.toLocaleString()}. This transaction is for ₹${saleAmount.toLocaleString()}.`,
        });
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
      addAdminLog(
        adminName,
        `Submitted ${saleType === "NEW" ? "new booking" : "settlement"} for Plot ${form.plot_id.trim()} (Associate: ${
          form.associate_found?.first_name || "Unknown"
        })`
      );

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
      {msg && (
        <div
          className={`p-4 rounded-2xl flex items-start gap-3 text-sm font-semibold border ${
            msg.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
          )}
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
              <button
                type="button"
                onClick={clearAssociate}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

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
              {form.associate_found.first_name?.[0]}
              {form.associate_found.last_name?.[0]}
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
            <input
              required
              type="text"
              placeholder="e.g. PLOT-42"
              value={form.plot_id}
              onChange={(e) => set("plot_id", e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Payment Method</label>
            <select
              value={form.payment}
              onChange={(e) => set("payment", e.target.value)}
              className={`${inputCls} cursor-pointer`}
            >
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
            <input
              required
              type="number"
              placeholder="Total Price"
              value={form.total_amount}
              onChange={(e) => set("total_amount", e.target.value)}
              className={`${inputCls} font-mono`}
            />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Paid Amount (₹) *</label>
            <input
              required
              type="number"
              placeholder="Paid Price"
              value={form.paid_amount}
              onChange={(e) => set("paid_amount", e.target.value)}
              className={`${inputCls} font-mono`}
            />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Prepaid (₹)</label>
            <input
              type="number"
              placeholder="Prepaid portion"
              value={form.prepaid}
              onChange={(e) => set("prepaid", e.target.value)}
              className={`${inputCls} font-mono`}
            />
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
            <input
              required
              type="text"
              placeholder="Buyer's Full Name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Buyer Phone *</label>
            <div className="relative flex items-center">
              <div className="absolute left-4 flex items-center gap-2 text-primary font-bold border-r border-border pr-3">
                <Phone size={15} />
                <span className="text-sm">+91</span>
              </div>
              <input
                required
                type="tel"
                maxLength={10}
                placeholder="10 Digits"
                value={form.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setForm((f) => ({ ...f, phone: val }));
                }}
                className={`${inputCls} pl-24 pr-4`}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className={labelCls}>Buyer Aadhaar *</label>
            <input
              required
              type="text"
              maxLength={12}
              placeholder="12-digit Aadhaar"
              value={form.aadhar}
              onChange={(e) => set("aadhar", e.target.value.replace(/\D/g, ""))}
              className={inputCls}
            />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Buyer Address *</label>
            <input
              required
              type="text"
              placeholder="Full postal address"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className={inputCls}
            />
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
