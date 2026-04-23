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
  XCircle
} from "lucide-react";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Session check: redirect to dashboard if already logged in ──
  const { status } = useAuth({ redirectIfValid: "/dashboard" });

  // Referral states
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

  // Auto-verify if code is in URL
  useEffect(() => {
    if (formData.referred_by) {
      handleVerifyReferral(formData.referred_by);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "referred_by") {
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

    // Sanitize phone
    let sanitizedPhone = formData.phone.replace(/\D/g, "");
    if (!sanitizedPhone.startsWith("91") && sanitizedPhone.length === 10) {
      sanitizedPhone = "91" + sanitizedPhone;
    }

    try {
      const response = await apiFetch(endpoints.register, {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          phone: sanitizedPhone
        }),
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

  // Show loader while verifying session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-zinc-500 font-medium animate-pulse">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />

      <main className="flex-grow flex items-center justify-center pt-32 pb-20 px-4">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-2xl bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-6 md:p-12 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Join the <span className="gold-text-gradient">Elite Network</span></h1>
            <p className="text-zinc-400">Join Aaradhya Dream city as a verified Associate.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex gap-3 text-red-200 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identity Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input required name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First name"
                    className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary outline-none transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input required name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last name"
                    className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary outline-none transition-colors" />
                </div>
              </div>
            </div>

            {/* Contact Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input required name="phone" value={formData.phone} onChange={handleChange} placeholder="91XXXXXXXXXX"
                    className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary outline-none transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Email <span className="text-zinc-600">(Optional)</span></label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="your@email.com"
                    className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary outline-none transition-colors" />
                </div>
              </div>
            </div>

            {/* Security Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input required name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Min 8 chars"
                    className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary outline-none transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}
                  className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white focus:border-primary outline-none transition-colors appearance-none">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* Verification Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">PAN Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input required name="pan_number" value={formData.pan_number} onChange={handleChange} placeholder="ABCDE1234F" maxLength={10}
                    className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary outline-none transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Aadhar Number</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input required name="adhar_number" value={formData.adhar_number} onChange={handleChange} placeholder="12 digit number" maxLength={12}
                    className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary outline-none transition-colors" />
                </div>
              </div>
            </div>

            {/* Referral Section (Optional) */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Referral Code <span className="text-zinc-600">(Optional)</span></label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    name="referred_by"
                    value={formData.referred_by}
                    onChange={handleChange}
                    placeholder="Enter referral code"
                    className={`w-full bg-black border ${referrerName ? "border-green-500/50" : referralError ? "border-red-500/50" : "border-zinc-800"} rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary outline-none transition-colors`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleVerifyReferral(formData.referred_by)}
                  disabled={!formData.referred_by || verifyingReferral}
                  className="bg-zinc-900 border border-zinc-800 hover:border-primary py-3 px-6 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 h-[50px] sm:h-auto"
                >
                  {verifyingReferral ? <Loader2 className="animate-spin" size={18} /> : "Verify Code"}
                </button>
              </div>

              {/* Feedback messages */}
              {referrerName && (
                <div className="flex items-center gap-2 text-green-400 text-xs ml-1 mt-1 animate-in fade-in">
                  <CheckCircle2 size={14} />
                  Referrer: <span className="font-bold">{referrerName}</span>
                </div>
              )}
              {referralError && (
                <div className="flex items-center gap-2 text-red-400 text-xs ml-1 mt-1 animate-in fade-in">
                  <XCircle size={14} />
                  {referralError}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full gold-gradient py-4 rounded-xl text-black font-bold text-lg hover:scale-[1.02] transition-all shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 mt-4">
              {loading ? (
                <><Loader2 className="animate-spin" />Creating Account...</>
              ) : (
                <>Register as Associate <ArrowRight className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>

            <p className="text-center text-zinc-500 text-sm">
              Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Login here</Link>
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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-zinc-500 font-medium animate-pulse">Loading...</p>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
