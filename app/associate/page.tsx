"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  Award,
  Zap,
  Star,
  MapPin,
  ChevronRight,
  Check
} from "lucide-react";

// ─── SMOOTH SCROLL ───
function useSmoothScroll() {
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  return scrollTo;
}

// ─── SCROLL REVEAL ───
function useScrollReveal(delay = 0) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return { ref, isVisible };
}

// ─── ANIMATED COUNTER ───
function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2500;
          const steps = 80;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// ─── MARQUEE ───
function Marquee({ children, speed = 35 }: { children: React.ReactNode; speed?: number }) {
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <div className="inline-flex animate-marquee" style={{ animationDuration: `${speed}s` }}>
        {children}
        {children}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───
export default function AssociatePage() {
  const scrollTo = useSmoothScroll();

  const hero = useScrollReveal(0);
  const stats = useScrollReveal(100);
  const benefits = useScrollReveal(0);
  const b1 = useScrollReveal(100);
  const b2 = useScrollReveal(200);
  const b3 = useScrollReveal(300);
  const tech = useScrollReveal(0);
  const families = useScrollReveal(0);
  const cta = useScrollReveal(0);
  const trust = useScrollReveal(0);

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Rajesh Sharma",
      role: "Senior Associate, Varanasi",
      quote: "Earning ₹1.2 Crore in commissions within 8 months has been life-changing. The royalty structure guarantees long-term stability for my family.",
    },
    {
      name: "Priya Patel",
      role: "Elite Partner, Prayagraj",
      quote: "Deals that used to take weeks now close within days. The smart analytics and lead matching tools are incredibly powerful.",
    },
    {
      name: "Amit Verma",
      role: "Diamond Associate, Jaunpur",
      quote: "Started with zero real estate experience. Today, I lead a team of 15 successful associates. The backend training is unmatched.",
    },
  ];

  const cities = ["Varanasi", "Prayagraj", "Ghazipur", "Mirzapur", "Jaunpur", "Bhadohi", "Chandauli", "Azamgarh"];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
      <Navbar />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slowZoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes drawLine {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
        .font-serif-display {
          font-family: 'Times New Roman', 'Georgia', serif;
        }
        .text-gold {
          color: var(--primary);
        }
        .bg-gold {
          background-color: var(--primary);
        }
        .border-gold {
          border-color: var(--primary);
        }
        .hover\\:bg-gold:hover {
          background-color: var(--primary-hover);
        }
      `}} />

      <main>
        {/* ═══════════════════════════════════════
            HERO SECTION — Cinematic, Full Bleed
            ═══════════════════════════════════════ */}
        <section className="relative w-full min-h-[100dvh] flex items-end pb-20 md:pb-32 overflow-hidden">
          {/* Full-bleed background */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/broker img.png"
              alt="Premium Associate Program"
              fill
              className="object-cover object-top animate-[slowZoom_30s_ease-in-out_infinite]"
              priority
              quality={95}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/60 to-transparent" />
          </div>

          <div
            ref={hero.ref}
            className={`relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full pt-28 md:pt-36 transition-all duration-1000 ease-out ${hero.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
          >
            {/* Overline */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-12 bg-primary" />
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
                Aaradhya Dream City — Elite Partner Program
              </span>
            </div>

            {/* Headline — Editorial Style */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-black uppercase tracking-tight text-white mb-8 leading-[0.95] max-w-4xl">
              More Than A Broker.
              <span className="block text-primary mt-2">An Associate.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-xl mb-12 leading-relaxed font-medium">
              Limitless earning potential with industry-leading commissions, performance bonuses, and lifetime royalties.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <Link
                href="/register"
                className="group px-10 py-5 bg-primary text-black rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-hover transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 shadow-2xl shadow-primary/20"
              >
                Register Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={() => scrollTo("how-it-works")}
                className="px-10 py-5 text-white/70 font-bold text-xs uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center gap-2"
              >
                How It Works
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap items-center gap-6 mt-16 text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2">
                <Check className="w-3 h-3 text-primary" /> Zero Registration Fee
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-3 h-3 text-primary" /> 2-Min Application
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-3 h-3 text-primary" /> 4.9/5 Rating
              </span>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            MARQUEE — Cities
            ═══════════════════════════════════════ */}
        <div className="bg-[#1a1a1a] py-5 border-y border-white/5">
          <Marquee speed={50}>
            <div className="flex items-center gap-16 px-8">
              {cities.map((city) => (
                <div key={city} className="flex items-center gap-3 text-white/20">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs font-bold uppercase tracking-[0.3em]">{city}</span>
                </div>
              ))}
            </div>
          </Marquee>
        </div>

        {/* ═══════════════════════════════════════
            STATS — Minimal, Editorial Numbers
            ═══════════════════════════════════════ */}
        <section ref={stats.ref} className={`max-w-6xl mx-auto px-6 py-24 transition-all duration-1000 ${stats.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            {[
              { value: 10, suffix: "Cr+", label: "Bonus Distributed", sub: "Last 12 Months", prefix: "₹" },
              { value: 250, suffix: "+", label: "Active Associates", sub: "Varanasi Region", prefix: "" },
              { value: 500, suffix: "+", label: "Properties Sold", sub: "And Counting", prefix: "" },
            ].map((stat, i) => (
              <div key={i} className="text-center md:text-left group">
                <div className="text-6xl md:text-7xl font-black tracking-tighter text-foreground mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                </div>
                <div className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-foreground/30 font-medium uppercase tracking-wider">
                  {stat.sub}
                </div>
                <div className="h-px w-0 group-hover:w-full bg-primary transition-all duration-700 mt-4 mx-auto md:mx-0" />
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════
            HOW IT WORKS — Clean Steps, NO Boxes
            ═══════════════════════════════════════ */}
        <section id="how-it-works" className="bg-secondary py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-20">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary mb-4 block">The Process</span>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                Simple Onboarding
              </h2>
            </div>

            <div className="space-y-0">
              {[
                { num: "01", title: "Join Network", desc: "Fill a simple 2-minute online form. Instantly activate your associate account." },
                { num: "02", title: "Expert Training", desc: "Access professional workshops, digital sales assets, and expert marketing mentorship." },
                { num: "03", title: "Leverage Inventory", desc: "Showcase premium plots, duplexes, and flats in Varanasi's fastest-growing township." },
                { num: "04", title: "Earn & Scale", desc: "Receive weekly payouts, milestone bonuses, and lifetime royalties from your network." },
              ].map((step, i) => (
                <div key={i} className="group flex items-start gap-8 py-10 border-t border-border first:border-t-0">
                  <span className="text-5xl md:text-6xl font-black text-foreground/5 leading-none shrink-0 w-20 text-right">
                    {step.num}
                  </span>
                  <div className="pt-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-2 group-hover:text-primary transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed max-w-md">
                      {step.desc}
                    </p>
                  </div>
                  <div className="ml-auto hidden md:flex items-center gap-2 text-foreground/20 group-hover:text-primary transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            BENEFITS — Editorial Layout, NO Boxes
            ═══════════════════════════════════════ */}
        <section ref={benefits.ref} className={`max-w-7xl mx-auto px-6 lg:px-12 py-32 transition-all duration-1000 ${benefits.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          <div className="text-center mb-24">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary mb-4 block">Why Choose Us</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight">
              The Associate <span className="text-primary">Advantage</span>
            </h2>
          </div>

          <div className="space-y-32">
            {/* Benefit 1 — Left aligned */}
            <div ref={b1.ref} className={`flex flex-col lg:flex-row items-center gap-16 transition-all duration-1000 ${b1.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
              <div className="w-full lg:w-1/2">
                <div className="text-[120px] md:text-[180px] font-black text-foreground/[0.03] leading-none -mb-16 select-none">
                  01
                </div>
                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6">
                  Unmatched Cuts
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
                  Enjoy the highest direct commission on every successful closing. Your hard work directly translates to massive earnings without middleman deductions.
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-primary">5%</span>
                  <span className="text-sm font-bold uppercase tracking-wider text-foreground/40">Commission Rate</span>
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
                  <Image
                    src="/broker img.png"
                    alt="Commission Structure"
                    fill
                    className="object-cover grayscale-0 md:grayscale md:hover:grayscale-0 transition-all duration-700"
                  />
                </div>
              </div>
            </div>

            {/* Benefit 2 — Right aligned */}
            <div ref={b2.ref} className={`flex flex-col lg:flex-row-reverse items-center gap-16 transition-all duration-1000 ${b2.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
              <div className="w-full lg:w-1/2">
                <div className="text-[120px] md:text-[180px] font-black text-foreground/[0.03] leading-none -mb-16 select-none text-right">
                  02
                </div>
                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 text-right">
                  Performance Bonuses
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-md ml-auto text-right">
                  Hit your milestones and get rewarded. We offer spectacular performance-based bonuses ranging from cash prizes to luxury trips and vehicles.
                </p>
                <div className="flex items-baseline gap-2 justify-end">
                  <span className="text-5xl font-black text-primary">₹50L+</span>
                  <span className="text-sm font-bold uppercase tracking-wider text-foreground/40">Annual Bonuses</span>
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
                  <Image
                    src="/Performance Bonus.jpg"
                    alt="Performance Rewards"
                    fill
                    className="object-cover grayscale-0 md:grayscale md:hover:grayscale-0 transition-all duration-700"
                  />
                </div>
              </div>
            </div>

            {/* Benefit 3 — Left aligned */}
            <div ref={b3.ref} className={`flex flex-col lg:flex-row items-center gap-16 transition-all duration-1000 ${b3.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
              <div className="w-full lg:w-1/2">
                <div className="text-[120px] md:text-[180px] font-black text-foreground/[0.03] leading-none -mb-16 select-none">
                  03
                </div>
                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6">
                  Lifetime Royalty
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
                  Build your own network of associates under you and earn a continuous royalty stream from their sales. Secure passive income for life.
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-primary">2%</span>
                  <span className="text-sm font-bold uppercase tracking-wider text-foreground/40">Royalty Rate</span>
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
                  <Image
                    src="/Hand holding house key.jpg"
                    alt="Lifetime Royalty"
                    fill
                    className="object-cover grayscale-0 md:grayscale md:hover:grayscale-0 transition-all duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            TOOLS SECTION — Clean, No AI Mention
            ═══════════════════════════════════════ */}
        <section ref={tech.ref} className="bg-[#1a1a1a] text-white py-32 transition-all duration-1000">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col lg:flex-row items-center gap-20">
              {/* Video */}
              <div className="w-full lg:w-1/2">
                <div className="relative rounded-3xl overflow-hidden aspect-video">
                  <video
                    src="/Ai finding house v.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/60 to-transparent" />
                </div>
              </div>

              {/* Content */}
              <div className="w-full lg:w-1/2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px w-8 bg-primary" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
                    Smart Tools
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-8 leading-[1.1]">
                  Selling Made<br />
                  <span className="text-primary">Effortless</span>
                </h2>

                <p className="text-lg text-white/40 leading-relaxed mb-10">
                  As an Aaradhya Dream City Associate, you get access to cutting-edge tools designed to match the right properties with the right buyers — significantly increasing your conversion rates.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    "Smart Lead Generation",
                    "Digital Marketing Support",
                    "Automated Site Visits",
                    "Real-time Dashboard",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 group">
                      <div className="w-2 h-2 rounded-full bg-primary group-hover:scale-150 transition-transform" />
                      <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FAMILIES — Warm, Emotional
            ═══════════════════════════════════════ */}
        <section ref={families.ref} className={`max-w-7xl mx-auto px-6 lg:px-12 py-32 transition-all duration-1000 ${families.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          <div className="flex flex-col-reverse lg:flex-row items-center gap-20">
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-primary" />
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
                  Our Mission
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-[1.1]">
                Building Dreams,<br />
                <span className="text-foreground/30">Securing Futures</span>
              </h2>

              <p className="text-lg text-muted-foreground leading-relaxed">
                Real estate isn't just about selling properties; it's about helping families find their safe haven. Every time you hand over a key, you're not just making a sale — you're changing a life.
              </p>

              <blockquote className="border-l-2 border-primary pl-6 py-2">
                <p className="text-lg font-bold text-foreground/80 italic">
                  "And while you build their dreams, our unmatched royalty and bonus structure ensures your own family's future is rock solid."
                </p>
              </blockquote>
            </div>

            <div className="w-full lg:w-1/2 relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
                <Image
                  src="/indian fam.png"
                  alt="Happy Family"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Floating accent */}
              <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full overflow-hidden border-[10px] border-background shadow-2xl hidden md:block">
                <Image
                  src="/Hand holding house key.jpg"
                  alt="Keys"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            TESTIMONIALS — Minimal Carousel
            ═══════════════════════════════════════ */}
        <section ref={trust.ref} className={`bg-secondary py-24 transition-all duration-1000 ${trust.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary mb-8 block">Success Stories</span>

            <div className="relative min-h-[200px]">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${i === activeTestimonial ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                    }`}
                >
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-primary fill-primary" />
                    ))}
                  </div>
                  <p className="text-2xl md:text-3xl font-serif-display text-foreground/80 leading-relaxed mb-8 max-w-2xl">
                    "{t.quote}"
                  </p>
                  <div>
                    <div className="font-bold text-foreground">{t.name}</div>
                    <div className="text-sm text-muted-foreground font-medium">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-3 mt-12">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === activeTestimonial ? "w-8 bg-primary" : "w-1.5 bg-foreground/10 hover:bg-foreground/30"
                    }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            CTA — Bold, Clean
            ═══════════════════════════════════════ */}
        <section ref={cta.ref} className={`max-w-5xl mx-auto px-6 py-32 transition-all duration-1000 ${cta.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          <div className="bg-primary rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
            {/* Subtle pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-black rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-black mb-6 leading-[0.95]">
                Ready To Change<br />Your Life?
              </h2>

              <p className="text-black/60 font-medium text-lg max-w-xl mx-auto mb-10">
                Stop being just a broker. Become an Associate today and step into the most rewarding real estate network.
              </p>

              <Link
                href="/register"
                className="inline-flex items-center gap-3 px-12 py-5 bg-black text-primary rounded-full font-black text-sm uppercase tracking-[0.15em] hover:bg-neutral-900 transition-all hover:scale-105 active:scale-95 shadow-2xl"
              >
                Join Now
                <ArrowRight className="w-5 h-5" />
              </Link>

              <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-black/40 text-xs font-bold uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <Check className="w-3 h-3" /> Zero Onboarding Fees
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-3 h-3" /> 2-Minute Quick Setup
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-3 h-3" /> Immediate Commission Approval
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}