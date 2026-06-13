"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { Loader2, ChevronLeft, User, Phone, CheckCircle2, ShieldAlert } from "lucide-react";

export default function EditProfilePage() {
  const { status, profile } = useAuth({ redirectIfInvalid: "/login?expired=true" });
  const router = useRouter();

  // Form states
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load initial values from profile once fetched
  useEffect(() => {
    if (profile) {
      let cleanPhone = profile.phone || "";
      if (cleanPhone.startsWith("91") && cleanPhone.length === 12) {
        cleanPhone = cleanPhone.slice(2);
      }
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: cleanPhone
      });
    }
  }, [profile]);

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading profile settings...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate name inputs
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setMessage({ type: "error", text: "First name and last name are required." });
      setLoading(false);
      return;
    }

    // Validate phone number (should be 10 digits or sanitised)
    let rawPhone = formData.phone.replace(/\D/g, "");
    if (rawPhone.length === 10) {
      rawPhone = "91" + rawPhone;
    } else if (rawPhone.length < 10) {
      setMessage({ type: "error", text: "Please enter a valid 10-digit phone number." });
      setLoading(false);
      return;
    }

    try {
      // Since the backend OpenAPI spec does not support PUT/PATCH /broker/me yet,
      // we save the overrides locally in localStorage so that useAuth merges it.
      // This will instantly reflect the updated name and phone number across the frontend.
      
      // Since backend endpoints do not support profile editing yet, we will display a mock simulation message
      // without storing insecure data overrides in localStorage (resolving client-side profile pollution).
      await new Promise((resolve) => setTimeout(resolve, 800));

      setMessage({ type: "success", text: "Profile details updated successfully! (Simulation only, backend integration pending)" });

    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group text-sm font-semibold uppercase tracking-wider"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Profile
      </button>

      {/* Profile Form Card */}
      <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
        <div className="flex items-center gap-4 border-b border-border pb-6 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <User size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Edit <span className="text-primary">Profile</span></h1>
            <p className="text-xs text-muted-foreground font-medium mt-1">Update your associate account credentials and phone number.</p>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex gap-3 text-sm font-semibold border ${
            message.type === "success" 
              ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-300 animate-in fade-in duration-300" 
              : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-300 animate-in fade-in duration-300"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="shrink-0" size={20} /> : <ShieldAlert className="shrink-0" size={20} />}
            <p>{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name *</label>
              <input
                required
                type="text"
                placeholder="Enter first name"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:border-primary outline-none transition-all text-sm font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name *</label>
              <input
                required
                type="text"
                placeholder="Enter last name"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:border-primary outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number *</label>
            <div className="relative flex items-center">
              <div className="absolute left-4 flex items-center gap-2 text-primary font-bold border-r border-border pr-3">
                <Phone size={16} />
                <span className="text-sm">+91</span>
              </div>
              <input
                required
                type="tel"
                maxLength={10}
                placeholder="10 Digits"
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData({...formData, phone: val});
                }}
                className="w-full bg-background border border-border rounded-xl py-3.5 pl-24 pr-4 text-foreground focus-border-primary outline-none transition-all text-sm font-medium"
              />
            </div>
            <p className="text-[10px] text-muted-foreground ml-1">
              Your registered phone number is used for WhatsApp verification.
            </p>
          </div>

          <div className="h-px bg-border my-6" />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:scale-[1.01] active:scale-95 text-black py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            {loading ? "Saving changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
