"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useRef, useState } from "react";
import { MoveRight, ChevronDown, Sparkles, CheckCircle2 } from "lucide-react";

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

export default function Home() {
  const heroSection = useInView(0.1, true);
  const visionSection = useInView(0.15);
  const section1 = useInView(0.15);
  const section2 = useInView(0.15);
  const section3 = useInView(0.15);
  const statsSection = useInView(0.1);

  useEffect(() => {
    // Increment the global website visits counter dynamically using Abacus API
    fetch("https://abacus.jasoncameron.dev/hit/aaradhyadreamcity/visits")
      .catch(() => console.warn("Failed to increment visits counter (offline)"));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden max-w-[100vw]">
      <Navbar />

      <main className="flex-grow overflow-x-hidden">
        {/* ───────── HERO (ALWAYS DARK/IMPACTFUL) ───────── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              crossOrigin="anonymous"
              suppressHydrationWarning
              className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
            >
              <source src="/landingpagev1.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
          </div>

          <div
            ref={heroSection.ref}
            className={`relative z-10 max-w-6xl mx-auto px-6 text-center transition-all duration-[1.5s] ${
              heroSection.visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
            }`}
          >
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md">
               <Sparkles size={14} className="text-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Premium Estate Network</span>
            </div>
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black text-white mb-8 tracking-tighter leading-[0.9] font-serif">
              Aaradhya<br />
              <span className="text-primary">Dream City</span>
            </h1>
            <p className="text-xl sm:text-2xl font-serif italic text-primary/95 mb-12 max-w-2xl mx-auto leading-relaxed tracking-wide drop-shadow-[0_2px_10px_rgba(212,175,55,0.15)]">
              &ldquo;Happiness Happens Here&hellip;&rdquo;
            </p>
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
            <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
            <ChevronDown size={20} className="text-primary animate-bounce" />
          </div>
        </section>

        {/* ───────── STATS SECTION (MODERN OFFSET GRID) ───────── */}
        <section id="about" ref={statsSection.ref} className="relative py-36 sm:py-48 overflow-hidden bg-background border-t border-border/20 min-h-[85vh] flex items-center">
          {/* Soft Dotted Background Pattern */}
          <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle, var(--foreground) 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px"
          }} />

          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
              
              {/* Left Column: Heading, Description & Features Checklist */}
              <div className={`lg:col-span-6 transition-all duration-1000 ${statsSection.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}>
                <div className="inline-flex items-center gap-2 mb-4 text-xs font-black tracking-[0.2em] text-primary uppercase">
                  <div className="w-8 h-[1px] bg-primary" />
                  About Aaradhya Dream City
                </div>
                
                <h2 className="text-4xl sm:text-6xl font-serif mb-6 leading-[1.1] tracking-tight">
                  Building Dreams,<br />
                  <span className="text-muted-foreground font-light">Securing Futures.</span>
                </h2>
                
                <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-xl font-light">
                  We are Varanasi&apos;s premier real estate developers, committed to offering premium plots and luxury duplex homes. With a focus on sustainable growth and transparent transactions, we ensure every investment you make lays a strong foundation for your future.
                </p>

                {/* Features Checklist with staggered entries */}
                <div className="space-y-4 max-w-md">
                  {[
                    "Trusted and verified development",
                    "100% transparent legal process",
                    "High investment growth potential",
                    "Dedicated support for associates"
                  ].map((feature, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-4 transition-all duration-700 hover:translate-x-1"
                      style={{ 
                        transitionDelay: `${500 + idx * 100}ms`,
                        transform: statsSection.visible ? "translateY(0)" : "translateY(10px)",
                        opacity: statsSection.visible ? 1 : 0
                      }}
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm shadow-primary/5">
                        <CheckCircle2 size={12} strokeWidth={3} />
                      </div>
                      <span className="text-sm font-medium text-foreground/80">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Dynamic Offset Grid */}
              <div className="lg:col-span-6 relative">
                {/* Decorative Dot Matrix behind cards */}
                <div className="absolute -top-10 -right-6 text-primary/20 w-40 h-40 hidden sm:block pointer-events-none">
                  <svg fill="currentColor" viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                      <pattern id="gridDots" width="12" height="12" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.5" />
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#gridDots)" />
                  </svg>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                  
                  {/* Left Column of Grid (Starts slightly higher) */}
                  <div className="space-y-6 sm:mt-0">
                    {/* Card 1 */}
                    <div className={`bg-card border border-border/60 p-8 rounded-3xl shadow-md transition-all duration-700 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30 hover:shadow-primary/5 relative overflow-hidden group ${
                      statsSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                    }`} style={{ transitionDelay: "100ms" }}>
                      {/* Circle Accent */}
                      <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
                      <div className="relative z-10 flex items-center gap-6">
                        <span className="text-4xl sm:text-5xl font-black text-primary tracking-tight font-sans">950+</span>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] leading-snug">Happy<br />Customers</span>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className={`bg-card border border-border/60 p-8 rounded-3xl shadow-md transition-all duration-700 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30 hover:shadow-primary/5 relative overflow-hidden group ${
                      statsSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                    }`} style={{ transitionDelay: "300ms" }}>
                      {/* Circle Accent */}
                      <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
                      <div className="relative z-10 flex items-center gap-6">
                        <span className="text-4xl sm:text-5xl font-black text-primary tracking-tight font-sans">1000+</span>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] leading-snug">Plots<br />Sold</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column of Grid (Shifted downwards on desktop) */}
                  <div className="space-y-6 sm:mt-12">
                    {/* Card 3 */}
                    <div className={`bg-card border border-border/60 p-8 rounded-3xl shadow-md transition-all duration-700 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30 hover:shadow-primary/5 relative overflow-hidden group ${
                      statsSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                    }`} style={{ transitionDelay: "200ms" }}>
                      {/* Circle Accent */}
                      <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
                      <div className="relative z-10 flex items-center gap-6">
                        <span className="text-4xl sm:text-5xl font-black text-primary tracking-tight font-sans">100+</span>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] leading-snug">Acres<br />Developed</span>
                      </div>
                    </div>

                    {/* Card 4 */}
                    <div className={`bg-card border border-border/60 p-8 rounded-3xl shadow-md transition-all duration-700 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30 hover:shadow-primary/5 relative overflow-hidden group ${
                      statsSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                    }`} style={{ transitionDelay: "400ms" }}>
                      {/* Circle Accent */}
                      <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
                      <div className="relative z-10 flex items-center gap-6">
                        <span className="text-3xl sm:text-4xl font-black text-primary tracking-tight font-sans">Varanasi</span>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] leading-snug">Based<br />Company</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ───────── THE VISION (LUXURY MAGAZINE STYLE) ───────── */}
        <section ref={visionSection.ref} className="relative py-32 sm:py-48 overflow-hidden bg-background">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              
              {/* Left Side: Large Serif Heading */}
              <div className={`lg:col-span-7 transition-all duration-1000 ${visionSection.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}>
                 <h2 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-medium leading-tight mb-12 tracking-tight">
                    Beyond <span className="italic">Standard</span> Architecture. <br /> 
                    We build <span className="text-primary italic">Aspirations</span>.
                 </h2>
                 <div className="max-w-md ml-auto">
                    <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed mb-8 font-light">
                       In a world of mass production, we choose the artisanal path. Every project in Aaradhya Dream City is a study in light, space, and the human spirit.
                    </p>
                    <div className="h-px w-20 bg-primary mb-8" />
                 </div>
              </div>

              {/* Right Side: Abstract Image Offset */}
              <div className={`lg:col-span-5 relative transition-all duration-1000 delay-300 ${visionSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}>
                 <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] ring-1 ring-black/5 dark:ring-white/5">
                    <Image src="/house-home.jpg" alt="Visionary Architecture" fill sizes="(max-width: 1024px) 100vw, 530px" className="object-cover" />
                 </div>
                 <div className="absolute -bottom-10 -left-10 bg-primary p-12 rounded-2xl hidden lg:block" />
              </div>
            </div>
          </div>
        </section>

        {/* ───────── THE OFFERINGS ───────── */}
        <div className="space-y-40 sm:space-y-56 pb-48">

            {/* SECTION HEADER */}
            <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
              <h2 className="text-3xl sm:text-5xl font-serif tracking-tight text-foreground/90">
                Your Dream, Our Mission
              </h2>
              <div className="w-16 h-0.5 bg-primary/40 mx-auto mt-6" />
            </div>

            {/* SECTION 1: DUPLEX */}
            <div ref={section1.ref} className="max-w-7xl mx-auto px-6 lg:px-12 mt-12">
              <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                <div className={`relative w-full lg:w-3/5 transition-all duration-1000 ${section1.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20"}`}>
                  <div className="relative aspect-[16/10] rounded-3xl overflow-hidden group shadow-lg">
                     <Image src="/duplex2.jpg" alt="Duplex House" fill sizes="(max-width: 1024px) 100vw, 768px" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  </div>
                </div>

                <div className={`w-full lg:w-2/5 transition-all duration-1000 delay-300 ${section1.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"}`}>
                  <h3 className="text-3xl sm:text-5xl font-serif mb-8 leading-[1.3] tracking-tight">
                    <span className="relative inline-block pb-2 mr-2">
                      Live the Life You
                      <span className={`absolute bottom-0 left-0 h-[2px] bg-primary/40 transition-all duration-1000 ease-out ${section1.visible ? "w-full" : "w-0"}`} />
                    </span>
                    <br className="hidden sm:inline" />
                    <span className="relative inline-block pb-2 mt-2">
                      Always Imagined
                      <span className={`absolute bottom-0 left-0 h-[2px] bg-primary/40 transition-all duration-1000 ease-out delay-300 ${section1.visible ? "w-full" : "w-0"}`} />
                    </span>
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed mb-10 font-light">
                    A duplex is not just a house — it&apos;s a statement. Designed for families who refuse to compromise on space, style, or comfort. At Aaradhya Dream City, our duplex homes are crafted with premium architecture, spacious rooms, private gardens, and modern interiors that make every corner feel like yours. Whether it&apos;s your parents upstairs or your growing family downstairs — our duplexes are built for real Indian families, with love and precision.
                  </p>
                  <Link href="/register" className="group flex items-center gap-4 text-primary font-black text-xs uppercase tracking-[0.2em] hover:text-primary-hover transition-colors">
                    Duplex House
                    <MoveRight size={16} className="text-primary group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* SECTION 2: PLOTS */}
            <div ref={section2.ref} className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24">
                <div className={`relative w-full lg:w-3/5 transition-all duration-1000 ${section2.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"}`}>
                  <div className="relative aspect-[16/10] rounded-3xl overflow-hidden group shadow-lg">
                    <Image src="/land-plot.jpg" alt="Plots" fill sizes="(max-width: 1024px) 100vw, 768px" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  </div>
                </div>

                <div className={`w-full lg:w-2/5 transition-all duration-1000 delay-300 ${section2.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20"}`}>
                  <h3 className="text-3xl sm:text-5xl font-serif mb-8 leading-[1.3] tracking-tight">
                    <span className="relative inline-block pb-2 mr-2">
                      Own the Land.
                      <span className={`absolute bottom-0 left-0 h-[2px] bg-primary/40 transition-all duration-1000 ease-out ${section2.visible ? "w-full" : "w-0"}`} />
                    </span>
                    <br className="hidden sm:inline" />
                    <span className="relative inline-block pb-2 mt-2">
                      Own the Future.
                      <span className={`absolute bottom-0 left-0 h-[2px] bg-primary/40 transition-all duration-1000 ease-out delay-300 ${section2.visible ? "w-full" : "w-0"}`} />
                    </span>
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed mb-10 font-light">
                    There is no better investment than land — and there is no better time than now. Aaradhya Dream City offers prime residential plots in strategically located areas with full legal clearance, wide roads, and all basic amenities in place. Buy a plot today, build tomorrow, or simply hold it and watch your investment multiply. The choice is yours — the land is ours to offer.
                  </p>
                  <Link href="/register" className="group flex items-center gap-4 text-primary font-black text-xs uppercase tracking-[0.2em] hover:text-primary-hover transition-colors">
                    Plotting
                    <MoveRight size={16} className="text-primary group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* SECTION 3: FLATS */}
            <div ref={section3.ref} className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                <div className={`relative w-full lg:w-3/5 transition-all duration-1000 ${section3.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20"}`}>
                  <div className="relative aspect-[16/10] rounded-3xl overflow-hidden group shadow-lg">
                     <Image src="/flats.jpg" alt="Flats" fill sizes="(max-width: 1024px) 100vw, 768px" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  </div>
                </div>

                <div className={`w-full lg:w-2/5 transition-all duration-1000 delay-300 ${section3.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"}`}>
                  <h3 className="text-3xl sm:text-5xl font-serif mb-8 leading-[1.3] tracking-tight">
                    <span className="relative inline-block pb-2 mr-2">
                      Smart Living for
                      <span className={`absolute bottom-0 left-0 h-[2px] bg-primary/40 transition-all duration-1000 ease-out ${section3.visible ? "w-full" : "w-0"}`} />
                    </span>
                    <br className="hidden sm:inline" />
                    <span className="relative inline-block pb-2 mt-2">
                      the Modern Family
                      <span className={`absolute bottom-0 left-0 h-[2px] bg-primary/40 transition-all duration-1000 ease-out delay-300 ${section3.visible ? "w-full" : "w-0"}`} />
                    </span>
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed mb-10 font-light">
                    Life moves fast — your home should keep up. Our thoughtfully designed flats offer the perfect blend of comfort, convenience, and affordability. With modern layouts, quality construction, gated security, and prime locations close to schools, markets, and highways — an Aaradhya flat is the smartest decision for young families, working professionals, and first-time buyers alike.
                  </p>
                  <Link href="/register" className="group flex items-center gap-4 text-primary font-black text-xs uppercase tracking-[0.2em] hover:text-primary-hover transition-colors">
                    Flats
                    <MoveRight size={16} className="text-primary group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
