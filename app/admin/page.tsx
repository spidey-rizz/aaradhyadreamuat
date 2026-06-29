"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/useAuth";
import { Loader2, ShieldAlert } from "lucide-react";
import ProfileSection from "@/components/ProfileSection";
import AnnouncementsFeed from "@/components/AnnouncementsFeed";
import AdminHeader from "@/components/AdminHeader";
import OfficeMembersSection from "@/components/OfficeMembersSection";

export default function AdminPanel() {
  const { status, profile } = useAuth({
    redirectIfInvalid: "/login?expired=true",
    requiredRole: ["ADMIN", "SUPERADMIN"],
  });

  const handleAddOfficeMember = () => {
    console.log("Add office member action triggered.");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading Admin Panel...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <AdminHeader
            title="Admin Panel"
            description="Manage Office Members and oversee network operations."
            Icon={ShieldAlert}
            iconClassName="text-primary"
            iconOpacityClassName="opacity-5"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ProfileSection profile={profile} />
            <AnnouncementsFeed />
          </div>

          <OfficeMembersSection onAddMember={handleAddOfficeMember} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
