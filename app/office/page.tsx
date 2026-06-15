"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/useAuth";
import { Users, Loader2, Plus, Shield } from "lucide-react";
import ProfileSection from "@/components/ProfileSection";
import AnnouncementsFeed from "@/components/AnnouncementsFeed";

export default function OfficePanel() {
  const { status, profile } = useAuth({
    redirectIfInvalid: "/login?expired=true",
    requiredRole: ["OFFICE", "ADMIN", "SUPERADMIN"],
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading Office Panel...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm mb-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
               <Shield size={120} className="text-primary" />
             </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-primary mb-2 relative z-10">Office Panel</h1>
            <p className="text-muted-foreground font-medium relative z-10">Manage Associates and view their details.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ProfileSection profile={profile} />
            <AnnouncementsFeed />
          </div>

          <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm p-6 sm:p-8">
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                    <Users className="text-primary" /> Associates Directory
                 </h2>
                 <button className="bg-primary text-black font-black text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-primary/20">
                     <Plus size={16} /> Add Associate
                 </button>
             </div>
             
             <div className="border border-border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center bg-background/50">
                 <Users size={48} className="opacity-20 mb-4 text-primary" />
                 <p className="font-bold text-lg text-foreground">No associates loaded yet.</p>
                 <p className="text-sm mt-2">API integration pending based on database changes.</p>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
