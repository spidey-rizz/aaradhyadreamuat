"use client";


import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Users,
  Smartphone,
  ShieldCheck,
  Gem,
  Globe,
  TrendingUp,
  Award,
  Building2,
  ChevronDown,
  Star,
  Zap,
  Target,
  Wallet,
} from "lucide-react";

/* ─── Intersection Observer hook for scroll reveals ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useInView(0.3);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ─── Feature Data ─── */
const features = [
  {
    icon: <BarChart3 size={28} />,
    title: "Live Commission Tracking",
    desc: "Real-time dashboard showing every lead, conversion, and commission earned across your network.",
    accent: "from-amber-500/20 to-yellow-600/5",
  },
  {
    icon: <Users size={28} />,
    title: "Multi-Level Referrals",
    desc: "Build a recursive referral tree and earn commissions from every level of your downward network.",
    accent: "from-orange-500/20 to-amber-600/5",
  },
  {
    icon: <Smartphone size={28} />,
    title: "WhatsApp Verification",
    desc: "Instant, frictionless onboarding through WhatsApp — no complex forms or waiting periods.",
    accent: "from-green-500/20 to-emerald-600/5",
  },
  {
    icon: <ShieldCheck size={28} />,
    title: "KYC Verified Network",
    desc: "Every broker is identity-verified, ensuring trust and professionalism across all transactions.",
    accent: "from-blue-500/20 to-cyan-600/5",
  },
  {
    icon: <Globe size={28} />,
    title: "Premium Listings Access",
    desc: "Browse exclusive properties across Dream City and beyond from your centralized broker portal.",
    accent: "from-purple-500/20 to-violet-600/5",
  },
  {
    icon: <Target size={28} />,
    title: "Growth & Training",
    desc: "Expert-led workshops, conversion tools, and marketing resources to accelerate your success.",
    accent: "from-rose-500/20 to-pink-600/5",
  },
];

/* ─── Stats ─── */
const stats = [
  { label: "Active Brokers", value: 2500, suffix: "+", icon: <Users size={20} /> },
  { label: "Successful Referrals", value: 10000, suffix: "+", icon: <TrendingUp size={20} /> },
  { label: "Properties Listed", value: 450, suffix: "+", icon: <Building2 size={20} /> },
  { label: "Commission Paid", value: 25, suffix: "Cr+", prefix: "₹", icon: <Wallet size={20} /> },
];

/* ─── Process Steps ─── */
const steps = [
  { num: "01", title: "Register", desc: "Create your broker account in under 2 minutes with basic details." },
  { num: "02", title: "Get Verified", desc: "Complete KYC via WhatsApp for instant identity verification." },
  { num: "03", title: "Build Network", desc: "Share your unique referral code and grow your broker tree." },
  { num: "04", title: "Earn Commissions", desc: "Track and withdraw your earnings through the live dashboard." },
];

/* ═══════════════════════════════════════════════════════ */
/*                     MAIN COMPONENT                    */
/* ═══════════════════════════════════════════════════════ */

export default function Home() {
  const heroSection = useInView(0.1);
  const statsSection = useInView(0.15);
  const featuresSection = useInView(0.1);
  const processSection = useInView(0.1);
  const ctaSection = useInView(0.15);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />

      <main className="flex-grow">
        {/* ───────── HERO ───────── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* ── Video Background ── */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover brightness-[0.45]"
            >
              <source src="/landingpagev1.mp4" type="video/mp4" />
            </video>
            {/* Dark gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
            <div className="absolute inset-0 grid-pattern opacity-30" />
          </div>


          {/* Content */}
          <div
            ref={heroSection.ref}
            className={`relative z-10 max-w-6xl mx-auto px-6 text-center ${heroSection.visible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            {/* Badge */}
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight leading-[1.05]">
              Aaradhya
              <br />
              <span className="text-primary">
                Dream City
              </span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Discover Plots, Homes, and Commercial Spaces Designed for Your Aspirations.
            </p>


          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-bold">Explore</span>
            <ChevronDown size={16} className="text-primary/60 animate-bounce" />
          </div>
        </section>

        {/* ───────── STATS ───────── */}
        <section className="relative py-24 bg-black overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div
            ref={statsSection.ref}
            className={`relative z-10 max-w-7xl mx-auto px-6 ${statsSection.visible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className={`text-center group p-6 rounded-2xl border border-zinc-900 hover:border-primary/30 transition-all duration-500 bg-zinc-950/50 ${statsSection.visible ? "animate-fade-in-up" : "opacity-0"}`}
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary group-hover:scale-110 transition-transform duration-500">
                    {stat.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-white mb-2 tabular-nums">
                    {stat.prefix || ""}
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── FEATURES ───────── */}
        <section id="features" className="relative py-32 bg-[#030303] overflow-hidden">

          <div ref={featuresSection.ref} className="relative z-10 max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <div className={`text-center mb-20 ${featuresSection.visible ? "animate-fade-in-up" : "opacity-0"}`}>
              <div className="inline-flex items-center gap-2 bg-primary/[0.08] px-4 py-1.5 rounded-full border border-primary/20 mb-6">
                <Gem size={14} className="text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Why Partner With Us</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
                The Premium Broker{" "}
                <span className="text-primary">Advantage</span>
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
                World-class technology, transparent earnings, and an exclusive network
                — everything you need to thrive in modern real estate.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className={`group relative p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 hover:border-primary/40 transition-all duration-500 overflow-hidden ${featuresSection.visible ? "animate-fade-in-up" : "opacity-0"}`}
                  style={{ animationDelay: `${idx * 100 + 200}ms` }}
                >
                  {/* Gradient highlight on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-primary group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:scale-110 transition-all duration-500">
                      {feature.icon}
                    </div>
                    <h4 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h4>
                    <p className="text-zinc-400 leading-relaxed text-[15px]">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── HOW IT WORKS ───────── */}
        <section className="relative py-32 bg-black overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-50" />

          <div ref={processSection.ref} className="relative z-10 max-w-6xl mx-auto px-6">
            <div className={`text-center mb-20 ${processSection.visible ? "animate-fade-in-up" : "opacity-0"}`}>
              <div className="inline-flex items-center gap-2 bg-primary/[0.08] px-4 py-1.5 rounded-full border border-primary/20 mb-6">
                <Zap size={14} className="text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Simple Process</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
                Start Earning in{" "}
                <span className="text-primary">4 Steps</span>
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto text-lg">
                From registration to your first commission — it&apos;s faster than you think.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`relative group ${processSection.visible ? "animate-fade-in-up" : "opacity-0"}`}
                  style={{ animationDelay: `${idx * 150 + 200}ms` }}
                >
                  {/* Connector line */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-primary/40 to-primary/10 z-0" />
                  )}

                  <div className="relative z-10 p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 hover:border-primary/40 transition-all duration-500 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 text-black font-black text-xl group-hover:scale-110 transition-transform duration-500">
                      {step.num}
                    </div>
                    <h4 className="text-lg font-bold text-white mb-3">{step.title}</h4>
                    <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── CTA ───────── */}
        <section className="relative py-32 bg-[#030303] overflow-hidden">


          <div
            ref={ctaSection.ref}
            className={`relative z-10 max-w-5xl mx-auto px-6 ${ctaSection.visible ? "animate-scale-in" : "opacity-0"}`}
          >
            <div className="relative rounded-[3rem] overflow-hidden">
              {/* Background */}
              <div className="absolute inset-0 bg-primary" />
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 grid-pattern opacity-10" />
              {/* Noise overlay */}
              <div className="absolute inset-0 bg-black/[0.03]" />

              <div className="relative z-10 p-12 md:p-20 text-center">
                <div className="inline-flex items-center gap-2 bg-black/10 px-4 py-1.5 rounded-full mb-8">
                  <Award size={16} className="text-black/70" />
                  <span className="text-sm font-bold text-black/70 uppercase tracking-widest">Limited Slots</span>
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black mb-6 leading-tight tracking-tight">
                  Ready to Build Your
                  <br />
                  Dream Career?
                </h2>
                <p className="text-black/70 text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
                  Take the first step towards a lucrative real estate career.
                  Registration takes less than 2 minutes.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/register"
                    id="cta-register-btn"
                    className="group bg-black text-white px-12 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl inline-flex items-center gap-3"
                  >
                    Start Your Journey
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </Link>
                  <Link
                    href="/login"
                    id="cta-login-btn"
                    className="px-10 py-4.5 rounded-full border-2 border-black/20 text-black/80 font-bold text-lg hover:bg-black/10 transition-all duration-300"
                  >
                    Already a Broker?
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
