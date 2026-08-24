"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MessageSquare, CheckCircle2, ArrowRight, Smartphone, ExternalLink } from "lucide-react";

function VerifyContent() {
  const [waLink, setWaLink] = useState("");
  const [token, setToken] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlToken = searchParams.get("token");
    const urlWa = searchParams.get("wa");

    if (urlWa) setWaLink(urlWa);
    if (urlToken) setToken(urlToken);

    if (!urlWa && !urlToken) {
      router.push("/register");
    }
  }, [router, searchParams]);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />

      <main className="flex-grow flex items-center justify-center pt-32 pb-20 px-4">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-xl bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-xl text-center">
          <div className="w-20 h-20 gold-gradient rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-glow">
            <CheckCircle2 size={40} className="text-black" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Registration <span className="gold-text-gradient">Successful!</span></h1>
          <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
            Your Associate account has been created. To activate your account and start earning, please verify your phone number via WhatsApp.
          </p>

          <div className="bg-black/50 border border-zinc-800 rounded-2xl p-6 mb-10 text-left">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                <span className="text-primary font-bold">1</span>
              </div>
              <p className="text-zinc-300">Tap the button below to open WhatsApp on your phone or desktop.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                <span className="text-primary font-bold">2</span>
              </div>
              <p className="text-zinc-300 italic">Hit 'Send' on the pre-filled message containing your verification token: <b className="text-white font-mono">{token}</b></p>
            </div>
          </div>

          <a 
            href={waLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 gold-gradient text-black font-black py-4 rounded-2xl text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_-10px_rgba(255,215,0,0.5)]"
          >
            <MessageSquare size={24} />
            Verify on WhatsApp
          </a>

          <p className="mt-8 text-sm text-zinc-500 font-medium">
            Having trouble? <Link href="/login" className="text-primary hover:underline hover:text-white transition-colors">Go to Login</Link>
          </p>

          <div className="mt-12 pt-8 border-t border-zinc-800 flex items-center justify-center gap-4 text-zinc-500 text-sm">
            <Smartphone size={16} />
            Compatible with WhatsApp Mobile & Web
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-primary">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
