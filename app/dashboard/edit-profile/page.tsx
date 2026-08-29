"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { apiFetch, endpoints } from "@/lib/api";
import { 
  Loader2, 
  ChevronLeft, 
  User, 
  Mail, 
  Phone, 
  CheckCircle2, 
  ShieldAlert, 
  Building2, 
  CreditCard, 
  Hash, 
  Lock 
} from "lucide-react";

export default function EditProfilePage() {
  const { status, profile } = useAuth({ redirectIfInvalid: "/login?expired=true" });
  const router = useRouter();

  // Form states
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    Bank_Name: "",
    Branch_Name: "",
    Account_Number: "",
    IFSC_Code: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load initial values from profile once fetched
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        Bank_Name: profile.Bank_Name || "",
        Branch_Name: profile.Branch_Name || "",
        Account_Number: profile.Account_Number || "",
        IFSC_Code: profile.IFSC_Code || ""
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

  let cleanPhone = profile.phone || "";
  if (cleanPhone.startsWith("91") && cleanPhone.length === 12) {
    cleanPhone = cleanPhone.slice(2);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate inputs
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setMessage({ type: "error", text: "First name and last name are required." });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        user_id: profile._id || profile.id,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim() || null,
        Bank_Name: formData.Bank_Name.trim() || null,
        Branch_Name: formData.Branch_Name.trim() || null,
        Account_Number: formData.Account_Number.trim() || null,
        IFSC_Code: formData.IFSC_Code.trim() || null
      };

      await apiFetch(endpoints.editUser, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setMessage({ type: "success", text: "Profile details updated successfully!" });
      
      // Redirect back to dashboard after a short delay so user can see success message
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);

    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Back Button */}
      <button 
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group text-sm font-semibold uppercase tracking-wider cursor-pointer"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Profile
      </button>

      {/* Profile Form Card */}
      <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
        <div className="flex items-center gap-4 border-b border-border pb-6 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-text shrink-0">
            <User size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Edit <span className="text-primary-text">Profile</span></h1>
            <p className="text-xs text-muted-foreground font-medium mt-1">Update your associate account details and bank credentials for payout processing.</p>
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: Personal Information */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary-text border-l-2 border-primary-text pl-2 mb-4">Personal Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name *</label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-4 text-muted-foreground" />
                  <input
                    required
                    type="text"
                    placeholder="Enter first name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-foreground focus:border-primary outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name *</label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-4 text-muted-foreground" />
                  <input
                    required
                    type="text"
                    placeholder="Enter last name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-foreground focus:border-primary outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-foreground focus:border-primary outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number (Read-only)</label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 flex items-center gap-2 text-muted-foreground/60 font-bold border-r border-border pr-3">
                    <Phone size={16} />
                    <span className="text-sm">+91</span>
                  </div>
                  <input
                    readOnly
                    disabled
                    type="tel"
                    value={cleanPhone}
                    className="w-full bg-muted/30 border border-border/80 rounded-xl py-3 pl-24 pr-4 text-muted-foreground outline-none text-sm font-medium select-none"
                  />
                  <Lock size={14} className="absolute right-4 text-muted-foreground/40" />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-border my-6" />

          {/* SECTION 2: Bank Account Details */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary-text border-l-2 border-primary-text pl-2 mb-4">Bank Account Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Bank Name</label>
                <div className="relative flex items-center">
                  <Building2 size={16} className="absolute left-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="e.g. State Bank of India"
                    value={formData.Bank_Name}
                    onChange={(e) => setFormData({...formData, Bank_Name: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-foreground focus:border-primary outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Branch Name</label>
                <div className="relative flex items-center">
                  <Building2 size={16} className="absolute left-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="e.g. Varanasi Main Branch"
                    value={formData.Branch_Name}
                    onChange={(e) => setFormData({...formData, Branch_Name: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-foreground focus:border-primary outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Account Number</label>
                <div className="relative flex items-center">
                  <CreditCard size={16} className="absolute left-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Enter account number"
                    value={formData.Account_Number}
                    onChange={(e) => setFormData({...formData, Account_Number: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-foreground focus:border-primary outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">IFSC Code</label>
                <div className="relative flex items-center">
                  <Hash size={16} className="absolute left-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="e.g. SBIN0000201"
                    value={formData.IFSC_Code}
                    onChange={(e) => setFormData({...formData, IFSC_Code: e.target.value.toUpperCase()})}
                    className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-foreground focus:border-primary outline-none transition-all text-sm font-medium uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-border my-6" />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:scale-[1.01] active:scale-95 text-black py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            {loading ? "Saving changes..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Security & Password Card */}
      <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-text shrink-0">
            <Lock size={22} />
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-tight text-foreground">Account Security</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Need to update your login password? Keep your account protected.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard/change-password")}
          className="px-6 py-3.5 rounded-xl bg-muted hover:bg-primary hover:text-black border border-border text-xs font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap shadow-sm"
        >
          Change Password
        </button>
      </div>
    </div>
  );
}

