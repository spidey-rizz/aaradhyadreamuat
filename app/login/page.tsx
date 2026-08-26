"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiFetch, endpoints } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { Phone, Lock, LogIn, Loader2, AlertCircle } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const expired = searchParams.get("expired");

  // ── Session check: if already logged in with valid JWT, redirect based on role ──
  const { status } = useAuth({ redirectBasedOnRole: true, redirectIfValid: "/dashboard" });

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  // Pre-fill from query params (e.g. from WhatsApp success link)
  useEffect(() => {
    const phoneParam = searchParams.get("phone");
    const passwordParam = searchParams.get("password");

    if (phoneParam || passwordParam) {
      let cleanPhone = phoneParam || "";
      if (cleanPhone.startsWith("91") && cleanPhone.length === 12) {
        cleanPhone = cleanPhone.slice(2);
      }

      setFormData(prev => ({
        ...prev,
        phone: cleanPhone || prev.phone,
        password: passwordParam || prev.password
      }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Sanitize phone
    const sanitizedPhone = formData.phone.replace(/\D/g, "");
    const phoneToSend = sanitizedPhone.length === 10
      ? "91" + sanitizedPhone
      : sanitizedPhone;

    try {
      const response = await apiFetch(endpoints.login, {
        method: "POST",
        body: JSON.stringify({
          phone: phoneToSend,
          password: formData.password,
        }),
      });

      if (typeof window !== "undefined") {
        document.cookie = `access_token=${response.access_token}; path=/; max-age=86400; SameSite=Lax; Secure`;
      }

      // Fetch user profile immediately after setting the token to get the user's role
      let role = "ASSOCIATE";
      try {
        const profile = await apiFetch(endpoints.me);
        if (profile) {
          if (!profile.role) {
            if (profile.super_admin === true || profile.is_super_admin === true) {
              profile.role = "SUPERADMIN";
            } else if (profile.admin === true || profile.is_admin === true) {
              profile.role = "ADMIN";
            } else {
              profile.role = "ASSOCIATE";
            }
          }
        }
        role = (profile.role || "ASSOCIATE").toUpperCase();
      } catch (profileErr) {
        console.error("Failed to fetch user profile after login:", profileErr);
      }

      // Redirect to dashboard after successful login
      router.replace("/dashboard");
    } catch (err: any) {
      if (err.status === 403 && err.detail?.toLowerCase().includes("suspended")) {
        setError(err.detail);
      } else if (err.status === 403) {
        setError("Account not verified. Please verify via WhatsApp first.");
      } else {
        setError(err.detail || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Show a loading state while verifying existing session
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
        {/* Decorative Background Element */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20 transition-transform hover:rotate-6">
              <LogIn size={32} className="text-black" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Associate <span className="text-primary">Login</span></h1>
            <p className="text-muted-foreground font-medium">Access your dashboard and manage your network.</p>
          </div>

          {expired && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex gap-3 text-amber-600 dark:text-amber-200">
              <AlertCircle className="shrink-0" size={20} />
              <p className="text-sm font-medium">Your session has expired. Please login again.</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex gap-3 text-red-600 dark:text-red-200">
              <AlertCircle className="shrink-0" size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 flex items-center gap-2 text-primary font-bold border-r border-border pr-3">
                  <Phone size={16} />
                  <span className="text-sm">+91</span>
                </div>
                <input
                  required
                  name="phone"
                  type="tel"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, phone: val });
                  }}
                  placeholder="Enter 10 digits"
                  className="w-full bg-background border border-border rounded-xl py-3.5 pl-24 pr-4 text-foreground focus:border-primary outline-none transition-all font-bold placeholder:font-normal placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</label>
                <Link 
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_PHONE_NUMBER || "919335602932"}?text=forgot`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                <input
                  required
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 5 chars"
                  className="w-full bg-background border border-border rounded-xl py-3.5 pl-12 pr-4 text-foreground focus:border-primary outline-none transition-all font-bold placeholder:font-normal placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary py-4 rounded-2xl text-black font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <LogIn size={20} />
                </>
              )}
            </button>

            <div className="text-center pt-4">
              <p className="text-muted-foreground text-xs font-medium">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:underline font-black uppercase tracking-widest ml-1">Join now</Link>
              </p>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
