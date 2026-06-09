"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useRef, useState } from "react";
import { MoveRight, MapPin, Home as HomeIcon, LayoutGrid, ChevronDown, Sparkles } from "lucide-react";

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
            <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed font-light italic">
              Crafting legacy, one brick at a time.
            </p>
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
            <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
            <ChevronDown size={20} className="text-primary animate-bounce" />
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

        {/* ───────── THE OFFERINGS (ASYMMETRIC LUXURY) ───────── */}
        <div className="space-y-40 sm:space-y-64 pb-48">

            {/* SECTION 1: DUPLEX */}
            <div ref={section1.ref} className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                <div className={`relative w-full lg:w-3/5 transition-all duration-1000 ${section1.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20"}`}>
                  <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden group shadow-2xl">
                     <Image src="/house-home.jpg" alt="Duplex House" fill sizes="(max-width: 1024px) 100vw, 768px" className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                  </div>
                  {/* Floating Detail */}
                  <div className="absolute top-1/2 -translate-y-1/2 -right-12 hidden lg:block">
                     <div className="bg-background border border-border p-8 rounded-2xl shadow-xl backdrop-blur-md">
                        <div className="text-primary font-serif italic text-4xl mb-1 italic">150+</div>
                        <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">Bespoke Homes</div>
                     </div>
                  </div>
                </div>

                <div className={`w-full lg:w-2/5 transition-all duration-1000 delay-300 ${section1.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"}`}>
                  <div className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-8">
                    <HomeIcon size={14} />
                    The Duplex Collection
                  </div>
                  <h3 className="text-4xl sm:text-6xl font-serif mb-8 leading-[1.1] tracking-tight">
                    Living as an <span className="italic text-primary">Art Form</span>.
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-10 font-light">
                    Where every corridor tells a story. Our duplexes combine grand volumes with intimate spaces, 
                    designed for those who appreciate the finer details of existence.
                  </p>
                  <Link href="/register" className="group flex items-center gap-6 text-foreground font-black text-xs uppercase tracking-[0.3em] hover:text-primary transition-colors">
                    View Catalogue 
                    <MoveRight size={20} className="text-primary group-hover:translate-x-3 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* SECTION 2: PLOTS (CLEAN MINIMALISM) */}
            <div ref={section2.ref} className="bg-secondary/50 py-32 sm:py-48">
              <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-32">
                  <div className={`relative w-full lg:w-1/2 transition-all duration-1000 ${section2.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                    <div className="relative aspect-square rounded-full overflow-hidden border-8 border-background shadow-2xl">
                      <Image src="/land-plot.jpg" alt="Plots" fill sizes="(max-width: 1024px) 100vw, 640px" className="object-cover transition-transform duration-1000 hover:scale-105" />
                    </div>
                  </div>

                  <div className={`w-full lg:w-1/2 transition-all duration-1000 delay-300 ${section2.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20"}`}>
                    <div className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-8">
                      <MapPin size={14} />
                      Land Ownership
                    </div>
                    <h3 className="text-4xl sm:text-6xl font-serif mb-8 leading-[1.1] tracking-tight">
                      The Ground <br /><span className="italic">of Your</span> <span className="text-primary italic">Legacy</span>.
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-10 font-light max-w-md">
                      Land is the only thing they aren&apos;t making more of. Secure your family&apos;s future with prime residential plots in our most sought-after locations.
                    </p>
                    <Link href="/register" className="inline-block border-b-2 border-primary pb-2 font-black text-xs uppercase tracking-[0.4em] hover:text-primary transition-all">
                      Check Availability
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: FLATS (MODERN MOSAIC) */}
            <div ref={section3.ref} className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div className={`grid grid-cols-2 gap-4 transition-all duration-1000 ${section3.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}>
                   <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mt-12 shadow-xl ring-1 ring-black/5">
                      <Image src="/flats.jpg" alt="Flat Detail" fill sizes="(max-width: 1024px) 50vw, 320px" className="object-cover" />
                   </div>
                   <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                      <Image src="/logo.jpg" alt="Flat View" fill sizes="(max-width: 1024px) 50vw, 320px" className="object-cover" />
                   </div>
                </div>

                <div className={`transition-all duration-1000 delay-300 ${section3.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"}`}>
                  <div className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-8">
                    <LayoutGrid size={14} />
                    High-Rise Living
                  </div>
                  <h3 className="text-4xl sm:text-6xl font-serif mb-8 leading-[1.1] tracking-tight">
                    Smart Spaces. <br /><span className="text-primary italic">Smarter</span> Living.
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-10 font-light">
                    Designed for the modern pace. Our flats offer seamless functionality without compromising on the aesthetic grace that defines an Aaradhya home.
                  </p>
                  <div className="p-8 border border-border rounded-2xl bg-secondary/30 backdrop-blur-sm">
                     <p className="text-sm font-medium italic text-foreground mb-4">&ldquo;The most comfortable living experience I&apos;ve had in the city.&rdquo;</p>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-px bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Satisfied Resident</span>
                     </div>
                  </div>
                </div>
              </div>
            </div>

        </div>

        {/* ───────── STATS (PREMIUM STRIP) ───────── */}
        <section ref={statsSection.ref} className={`bg-foreground text-background py-24 transition-all duration-1000 ${statsSection.visible ? "opacity-100" : "opacity-0"}`}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 sm:gap-24 text-center">
              {[
                { val: "₹100Cr+", label: "Portfolio" },
                { val: "2500+", label: "Associates" },
                { val: "15+", label: "Live Sites" },
                { val: "100%", label: "Legal Clear" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="text-4xl sm:text-6xl font-serif mb-4 italic text-primary">{stat.val}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
