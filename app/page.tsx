"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

/* ─── Intersection Observer hook for scroll reveals ─── */
function useInView(threshold = 0.15, initialVisible = false) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(initialVisible);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ═══════════════════════════════════════════════════════ */
/*                     MAIN COMPONENT                    */
/* ═══════════════════════════════════════════════════════ */

export default function Home() {
  const heroSection   = useInView(0.1, true);
  const missionSection = useInView(0.2);
  const offerHeader   = useInView(0.15);
  const offer1        = useInView(0.1);
  const offer2        = useInView(0.1);
  const offer3        = useInView(0.1);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />

      <main className="flex-grow">

        {/* ───────── HERO ───────── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
            <div className="absolute inset-0 grid-pattern opacity-30" />
          </div>

          {/* Content */}
          <div
            ref={heroSection.ref}
            className={`relative z-10 max-w-6xl mx-auto px-6 text-center ${heroSection.visible ? "animate-fade-in-up" : ""}`}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight leading-[1.05]">
              Aaradhya
              <br />
              <span className="text-primary">Dream City</span>
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

        
        {/* ═══════════ What We Offer ═══════════ */}
        <section className="relative py-28 bg-black border-t border-zinc-900/60 overflow-hidden">
          {/* subtle ambient glows */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 left-1/3 w-[500px] h-[500px] bg-primary/4 rounded-full blur-[160px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/4 rounded-full blur-[140px]" />
          </div>

          <div className="max-w-7xl mx-auto px-6">

            {/* ── Section header ── */}
            <div
              ref={offerHeader.ref}
              className={`text-center mb-24 transition-all duration-700 ${
                offerHeader.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 px-5 py-1.5 rounded-full border border-primary/25 mb-6">
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.25em]">What We Offer</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-white tracking-tight leading-[1.1]">
                Your Dream,{" "}
                <span className="text-primary">Our Mission</span>
              </h2>
              <p className="mt-5 text-zinc-500 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                Three carefully crafted offerings — one unwavering commitment to excellence.
              </p>
            </div>

            {/* ══ ROW 1 — Duplex House  (image LEFT, text RIGHT) ══ */}
            <div
              ref={offer1.ref}
              className={`group grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center mb-32 transition-all duration-1000 ${
                offer1.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-14"
              }`}
            >
              {/* Image */}
              <div className={`relative transition-all duration-1000 ${offer1.visible ? "animate-slide-in-left" : "opacity-0"}`}>
                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/5">
                  <Image
                    src="/house-home.jpg"
                    alt="Duplex House at Aaradhya Dream City"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    sizes="(max-width:1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-6 -left-6 bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-2xl shadow-2xl z-20">
                  <p className="text-primary font-black text-xl leading-none">150+</p>
                  <p className="text-white font-black text-[11px] uppercase tracking-widest mt-1">Duplex House</p>
                </div>
              </div>

              {/* Text */}
              <div className={`flex flex-col transition-all duration-1000 delay-200 ${offer1.visible ? "animate-slide-in-right" : "opacity-0"}`}>
                <h3 className="text-4xl md:text-5xl font-black leading-[1.1] tracking-tight mb-8">
                  <span className="text-white">Live the Life</span><br />
                  <span className="text-primary">You Always Imagined</span>
                </h3>
                <p className="text-zinc-400 text-base md:text-[17px] leading-relaxed mb-6">
                  A duplex is not just a house — it&apos;s a statement. Designed for families who refuse to compromise on space,
                  style, or comfort. At <span className="text-white font-semibold">Aaradhya Dream City</span>, our duplex homes
                  are crafted with premium architecture, spacious rooms, private gardens, and modern interiors that make every
                  corner feel like yours. Whether it&apos;s your parents upstairs or your growing family downstairs — our duplexes
                  are built for real Indian families, with love and precision.
                </p>
                <p className="text-zinc-500 text-base md:text-[17px] leading-relaxed mb-10">
                  Your dream home is already designed.{" "}
                  <span className="text-primary font-bold italic">It&apos;s waiting for you.</span>
                </p>
                <Link href="/contact" className="inline-flex items-center gap-3 text-white font-bold group/link self-start">
                  <span className="border-b-2 border-primary pb-1 group-hover/link:text-primary transition-colors">Enquire Now</span>
                  <ArrowRight size={18} className="text-primary group-hover/link:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>

            {/* ══ ROW 2 — Plotting  (text LEFT, image RIGHT) ══ */}
            <div
              ref={offer2.ref}
              className={`group grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center mb-32 transition-all duration-1000 ${
                offer2.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-14"
              }`}
            >
              {/* Text */}
              <div className={`flex flex-col order-2 lg:order-1 transition-all duration-1000 ${offer2.visible ? "animate-slide-in-left" : "opacity-0"}`}>
                <h3 className="text-4xl md:text-5xl font-black leading-[1.1] tracking-tight mb-8">
                  <span className="text-white">Own the Land.</span><br />
                  <span className="text-primary">Own the Future.</span>
                </h3>
                <p className="text-zinc-400 text-base md:text-[17px] leading-relaxed mb-6">
                  There is no better investment than land — and there is no better time than now.{" "}
                  <span className="text-white font-semibold">Aaradhya Dream City</span> offers prime residential plots in
                  strategically located areas with full legal clearance, wide roads, and all basic amenities in place. Buy a
                  plot today, build tomorrow, or simply hold it and watch your investment multiply. The choice is yours — the
                  land is ours to offer.
                </p>
                <p className="text-zinc-500 text-base md:text-[17px] leading-relaxed mb-10">
                  Plant your roots where the city is growing.{" "}
                  <span className="text-primary font-bold italic">The future belongs here.</span>
                </p>
                <Link href="/contact" className="inline-flex items-center gap-3 text-white font-bold group/link self-start">
                  <span className="border-b-2 border-primary pb-1 group-hover/link:text-primary transition-colors">Enquire Now</span>
                  <ArrowRight size={18} className="text-primary group-hover/link:translate-x-2 transition-transform" />
                </Link>
              </div>

              {/* Image */}
              <div className={`relative order-1 lg:order-2 transition-all duration-1000 delay-200 ${offer2.visible ? "animate-slide-in-right" : "opacity-0"}`}>
                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/5">
                  <Image
                    src="/land-plot.jpg"
                    alt="Residential Plot at Aaradhya Dream City"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    sizes="(max-width:1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-2xl shadow-2xl z-20">
                  <p className="text-primary font-black text-xl leading-none">600+</p>
                  <p className="text-white font-black text-[11px] uppercase tracking-widest mt-1">Plotting</p>
                </div>
              </div>
            </div>

            {/* ══ ROW 3 — Flat  (image LEFT, text RIGHT) ══ */}
            <div
              ref={offer3.ref}
              className={`group grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center transition-all duration-1000 ${
                offer3.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-14"
              }`}
            >
              {/* Image */}
              <div className={`relative transition-all duration-1000 ${offer3.visible ? "animate-slide-in-left" : "opacity-0"}`}>
                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/5">
                  <Image
                    src="/flats.jpg"
                    alt="Modern Flat at Aaradhya Dream City"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    sizes="(max-width:1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-2xl shadow-2xl z-20">
                  <p className="text-primary font-black text-xl leading-none">1000+</p>
                  <p className="text-white font-black text-[11px] uppercase tracking-widest mt-1">Happy Families</p>
                </div>
              </div>

              {/* Text */}
              <div className={`flex flex-col transition-all duration-1000 delay-200 ${offer3.visible ? "animate-slide-in-right" : "opacity-0"}`}>
                <h3 className="text-4xl md:text-5xl font-black leading-[1.1] tracking-tight mb-8">
                  <span className="text-white">Smart Living for</span><br />
                  <span className="text-primary">the Modern Family</span>
                </h3>
                <p className="text-zinc-400 text-base md:text-[17px] leading-relaxed mb-6">
                  Life moves fast — your home should keep up. Our thoughtfully designed flats offer the perfect blend of comfort,
                  convenience, and affordability. With modern layouts, quality construction, gated security, and prime locations
                  close to schools, markets, and highways — an <span className="text-white font-semibold">Aaradhya flat</span> is
                  the smartest decision for young families, working professionals, and first-time buyers alike.
                </p>
                <p className="text-zinc-500 text-base md:text-[17px] leading-relaxed mb-10">
                  Everything you need.{" "}
                  <span className="text-primary font-bold italic">Nothing you don&apos;t.</span>
                </p>
                <Link href="/contact" className="inline-flex items-center gap-3 text-white font-bold group/link self-start">
                  <span className="border-b-2 border-primary pb-1 group-hover/link:text-primary transition-colors">Enquire Now</span>
                  <ArrowRight size={18} className="text-primary group-hover/link:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
