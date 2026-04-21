"use client";

import { useState, Suspense } from "react";
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

  // ── Session check: if already logged in with valid JWT, redirect to dashboard ──
  const { status } = useAuth({ redirectIfValid: "/dashboard" });
  
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Sanitize phone
    const sanitizedPhone = formData.phone.replace(/\D/g, "");
    const phoneToSend = (!sanitizedPhone.startsWith("91") && sanitizedPhone.length === 10) 
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

      localStorage.setItem("access_token", response.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.status === 403) {
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
              <LogIn size={32} className="text-black" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Broker <span className="gold-text-gradient">Login</span></h1>
            <p className="text-zinc-400">Access your dashboard and manage your network.</p>
          </div>

          {expired && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex gap-3 text-amber-200">
              <AlertCircle className="shrink-0" size={20} />
              <p className="text-sm">Your session has expired. Please login again.</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex gap-3 text-red-200">
              <AlertCircle className="shrink-0" size={20} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="91XXXXXXXXXX"
                  className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Password</label>
                <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  required
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient py-4 rounded-xl text-black font-bold text-lg hover:scale-[1.02] transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <LogIn size={20} />
                </>
              )}
            </button>

            <div className="text-center space-y-4">
              <p className="text-zinc-500 text-sm">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">Join now</Link>
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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-zinc-500 font-medium animate-pulse">Loading...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
