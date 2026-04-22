"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MessageSquare, CheckCircle2, ArrowRight, Smartphone, ExternalLink } from "lucide-react";

export default function VerifyPage() {
  const [waLink, setWaLink] = useState("");
  const [token, setToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedWaLink = sessionStorage.getItem("wa_link");
    const storedToken = sessionStorage.getItem("verify_token");

    if (storedWaLink) setWaLink(storedWaLink);
    if (storedToken) setToken(storedToken);

    // If no link, redirect to register
    if (!storedWaLink && !storedToken) {
      router.push("/register");
    }
  }, [router]);

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

          <div className="space-y-4">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#22c35e] py-5 rounded-2xl text-white font-bold text-xl transition-all shadow-xl flex items-center justify-center gap-3 group"
            >
              <MessageSquare size={24} />
              Verify via WhatsApp
              <ExternalLink size={18} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </a>

            <Link href="/login" className="block w-full py-4 rounded-xl text-zinc-500 font-medium hover:text-white transition-colors">
              I've already verified, take me to Login
            </Link>
          </div>

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
