"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Phone, ArrowRight, Sparkles } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] translate-y-1/3 -translate-x-1/3"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 mb-4 text-xs font-black tracking-[0.2em] text-primary uppercase">
              <Sparkles size={14} />
              <span>Plot Selling</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif tracking-tight mb-4">
              Live <span className="text-primary italic">Projects</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Explore our premium plotted developments. Discover your perfect piece of legacy.
            </p>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Project Card */}
            <div className="group relative bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-primary/10 flex flex-col h-full animate-fade-in-up delay-200">
              
              {/* Card Clickable Area (Redirects to /contact) */}
              <Link href="/contact" className="block relative h-64 sm:h-72 overflow-hidden">
                <div className="absolute top-4 left-4 z-20 bg-green-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  Live Now
                </div>
                
                <Image 
                  src="/land-plot.jpg" 
                  alt="Aaradhya Dream City Plot" 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
              </Link>

              <div className="p-6 sm:p-8 flex flex-col flex-grow relative z-20">
                <Link href="/contact" className="block mb-4">
                  <h3 className="text-2xl font-serif font-bold mb-3 group-hover:text-primary transition-colors">
                    Aaradhya Dream City
                  </h3>
                  <div className="flex items-start gap-3 text-muted-foreground text-sm">
                    <MapPin className="text-primary shrink-0 mt-0.5" size={18} />
                    <span className="leading-relaxed">
                      Dasepur Harhua, in front of Sai City, Varanasi Airport Road
                    </span>
                  </div>
                </Link>

                <div className="mt-auto pt-6 flex items-center justify-between gap-4 border-t border-border/50">
                  <Link 
                    href="/contact"
                    className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary-hover flex items-center gap-2 transition-colors"
                  >
                    View Details <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {/* Call Button (Opens Phone Dialer) */}
                  <a 
                    href="tel:+919335602932" 
                    className="shrink-0 bg-primary/10 text-primary border border-primary/20 p-3.5 rounded-xl hover:bg-primary hover:text-black hover:scale-105 active:scale-95 transition-all shadow-md"
                    title="Call Now"
                  >
                    <Phone size={20} />
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
