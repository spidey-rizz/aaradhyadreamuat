"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/useAuth";
import { Loader2, ChevronLeft, Wallet, Construction } from "lucide-react";

export default function PayoutsPage() {
  const { status, profile } = useAuth({ redirectIfInvalid: "/login?expired=true" });
  const router = useRouter();

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading payouts...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-card border border-border rounded-full flex items-center justify-center mb-8 shadow-sm">
              <Wallet size={48} className="text-primary/50" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight mb-4">Payouts & <span className="text-primary">Income</span></h1>
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-sm mb-8">
              <Construction size={18} />
              Under Development
            </div>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              We are currently integrating the financial module to provide you with detailed income reports, wallet balances, and payout history.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
