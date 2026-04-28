"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiFetch, endpoints } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import {
  User,
  Phone,
  Lock,
  CreditCard,
  Mail,
  Shield,
  ArrowRight,
  Loader2,
  AlertCircle,
  UserPlus,
  CheckCircle2,
  XCircle,
  CircleUser
} from "lucide-react";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { status } = useAuth({ redirectIfValid: "/dashboard" });

  const [verifyingReferral, setVerifyingReferral] = useState(false);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [referralError, setReferralError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    first_name: "",
    last_name: "",
    gender: "Male",
    pan_number: "",
    adhar_number: "",
    email: "",
    referred_by: searchParams.get("ref") || "",
  });

  useEffect(() => {
    if (formData.referred_by) {
      handleVerifyReferral(formData.referred_by);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
        const val = value.replace(/\D/g, "").slice(0, 10);
        setFormData({ ...formData, [name]: val });
    } else {
        setFormData({ ...formData, [name]: value });
    }
    
    if (name === "referred_by") {
      setReferrerName(null);
      setReferralError(null);
    }
  };

  const handleVerifyReferral = async (code: string) => {
    if (!code) return;
    setVerifyingReferral(true);
    setReferralError(null);
    setReferrerName(null);

    try {
      const res = await apiFetch(`/broker/check-referral?code=${code.trim()}`);
      if (res.valid) {
        setReferrerName(res.name);
      } else {
        setReferralError("Invalid referral code");
      }
    } catch (err) {
      setReferralError("Could not verify code");
    } finally {
      setVerifyingReferral(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Ensure phone starts with 91
    let sanitizedPhone = formData.phone.replace(/\D/g, "");
    if (sanitizedPhone.length === 10) {
      sanitizedPhone = "91" + sanitizedPhone;
    }

    const payload = {
      ...formData,
      phone: sanitizedPhone,
      email: formData.email.trim() || null,
      referred_by: formData.referred_by.trim() || null,
    };

    try {
      const response = await apiFetch(endpoints.register, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      sessionStorage.setItem("verify_token", response.verify_token);
      sessionStorage.setItem("wa_link", response.wa_link);

      router.push("/verify");
    } catch (err: any) {
      setError(err.detail || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-grow flex items-center justify-center pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-2xl bg-card border border-border rounded-[2.5rem] p-6 md:p-12 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">Join the <span className="text-primary">Elite Network</span></h1>
            <p className="text-muted-foreground font-medium">Register as a verified Associate at Aaradhya Dream City.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex gap-3 text-red-600 dark:text-red-200 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Identity Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <input required name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Enter first name"
                    className="w-full bg-background border border-border rounded-xl py-3.5 pl-12 pr-4 text-foreground focus:border-primary outline-none transition-all font-bold placeholder:font-normal placeholder:text-muted-foreground/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <input required name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Enter last name"
                    className="w-full bg-background border border-border rounded-xl py-3.5 pl-12 pr-4 text-foreground focus:border-primary outline-none transition-all font-bold placeholder:font-normal placeholder:text-muted-foreground/50" />
                </div>
              </div>
            </div>

            {/* Contact Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                <div className="relative flex items-center">
                    <div className="absolute left-4 flex items-center gap-2 text-primary font-bold border-r border-border pr-3">
                        <Phone size={16} />
                        <span className="text-sm">+91</span>
                    </div>
                    <input required name="phone" value={formData.phone} onChange={handleChange} placeholder="10 Digits" maxLength={10}
                        className="w-full bg-background border border-border rounded-xl py-3.5 pl-24 pr-4 text-foreground focus:border-primary outline-none transition-all font-bold placeholder:font-normal placeholder:text-muted-foreground/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email <span className="text-muted-foreground opacity-60">(Optional)</span></label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="your@email.com"
                    className="w-full bg-background border border-border rounded-xl py-3.5 pl-12 pr-4 text-foreground focus:border-primary outline-none transition-all font-bold placeholder:font-normal placeholder:text-muted-foreground/50" />
                </div>
              </div>
            </div>

            {/* Security Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <input required name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Minimum 5 characters"
                    className="w-full bg-background border border-border rounded-xl py-3.5 pl-12 pr-4 text-foreground focus:border-primary outline-none transition-all font-bold placeholder:font-normal placeholder:text-muted-foreground/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Gender</label>
                <div className="relative">
                    <CircleUser className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                    <select name="gender" value={formData.gender} onChange={handleChange}
                        className="w-full bg-background border border-border rounded-xl py-3.5 pl-12 pr-4 text-foreground focus:border-primary outline-none transition-all font-bold appearance-none">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
              </div>
            </div>

            {/* Verification Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">PAN Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <input required name="pan_number" value={formData.pan_number} onChange={handleChange} placeholder="ABCDE1234F" maxLength={10}
                    className="w-full bg-background border border-border rounded-xl py-3.5 pl-12 pr-4 text-foreground font-mono focus:border-primary outline-none transition-all font-bold placeholder:font-normal placeholder:text-muted-foreground/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Aadhar Number</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <input required name="adhar_number" value={formData.adhar_number} onChange={handleChange} placeholder="12 Digit Number" maxLength={12}
                    className="w-full bg-background border border-border rounded-xl py-3.5 pl-12 pr-4 text-foreground font-mono focus:border-primary outline-none transition-all font-bold placeholder:font-normal placeholder:text-muted-foreground/50" />
                </div>
              </div>
            </div>

            {/* Referral Section */}
            <div className="space-y-3 pt-4 border-t border-border/50">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Referral Code <span className="text-muted-foreground opacity-60">(Optional)</span></label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <input
                    name="referred_by"
                    value={formData.referred_by}
                    onChange={handleChange}
                    placeholder="Enter code (e.g. ADC_XXXXXX)"
                    className={`w-full bg-background border ${referrerName ? "border-green-500" : referralError ? "border-red-500" : "border-border"} rounded-xl py-3.5 pl-12 pr-4 text-foreground focus:border-primary outline-none transition-all font-bold placeholder:font-normal placeholder:text-muted-foreground/50`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleVerifyReferral(formData.referred_by)}
                  disabled={!formData.referred_by || verifyingReferral}
                  className="bg-card border border-border hover:border-primary py-3.5 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground transition-all disabled:opacity-50 shadow-sm active:scale-95"
                >
                  {verifyingReferral ? <Loader2 className="animate-spin" size={18} /> : "Verify Code"}
                </button>
              </div>

              {referrerName && (
                <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-2 animate-in fade-in slide-in-from-left-2">
                  <CheckCircle2 size={14} />
                  Referrer Found: <span className="text-foreground">{referrerName}</span>
                </div>
              )}
              {referralError && (
                <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-2 animate-in fade-in slide-in-from-left-2">
                  <XCircle size={14} />
                  {referralError}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary py-5 rounded-[1.5rem] text-black font-black text-sm uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-50 mt-8">
              {loading ? (
                <><Loader2 className="animate-spin" size={20} />Creating Account...</>
              ) : (
                <>Complete Registration <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} /></>
              )}
            </button>

            <p className="text-center text-muted-foreground text-xs font-medium">
              Already have an account? <Link href="/login" className="text-primary hover:underline font-black uppercase tracking-widest ml-1">Login here</Link>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading...</p>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
