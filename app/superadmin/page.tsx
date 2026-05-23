"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/useAuth";
import { Users, Loader2, Plus, ShieldCheck } from "lucide-react";
import ProfileSection from "@/components/ProfileSection";
import AnnouncementsManager from "@/components/AnnouncementsManager";

export default function SuperAdminPanel() {
  const { status, profile } = useAuth({
    redirectIfInvalid: "/login?expired=true",
    requiredRole: "SUPERADMIN",
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading Super Admin Panel...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-card border border-amber-500/30 rounded-3xl p-8 shadow-sm mb-6 relative overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(212,175,55,0.05) 0%, transparent 100%)" }}>
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <ShieldCheck size={120} className="text-amber-500" />
             </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-amber-500 mb-2 relative z-10">Super Admin Panel</h1>
            <p className="text-muted-foreground font-medium relative z-10">Absolute system control. Manage Admins and Office Members.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ProfileSection profile={profile} />
            <AnnouncementsManager />
          </div>

          <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm p-6 sm:p-8">
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                    <Users className="text-amber-500" /> Administrative Staff
                 </h2>
                 <div className="flex gap-3">
                     <button className="bg-amber-500 text-black font-black text-[10px] sm:text-xs uppercase tracking-widest px-4 sm:px-5 py-2.5 rounded-xl hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-amber-500/20">
                         <Plus size={16} /> Add Admin
                     </button>
                     <button className="bg-background border border-border text-foreground font-black text-[10px] sm:text-xs uppercase tracking-widest px-4 sm:px-5 py-2.5 rounded-xl hover:bg-muted transition-colors flex items-center gap-2">
                         <Plus size={16} /> Add Office
                     </button>
                 </div>
             </div>
             
             <div className="border border-border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center bg-background/50">
                 <Users size={48} className="opacity-20 mb-4 text-amber-500" />
                 <p className="font-bold text-lg text-foreground">No staff members loaded yet.</p>
                 <p className="text-sm mt-2">API integration pending based on database changes.</p>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
