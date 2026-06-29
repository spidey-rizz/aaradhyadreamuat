"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Shield,
  PlusCircle,
  FileText,
  Users,
  BookOpen,
} from "lucide-react";
import SaleForm from "@/components/SaleForm";
import AssociateList from "@/components/AssociateList";
import BookedPlotList from "@/components/BookedPlotList";

type Tab = "booking" | "settlement" | "associates" | "plots";

const TABS: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "booking",     label: "New Booking",    icon: PlusCircle, desc: "Register a new plot booking" },
  { id: "settlement",  label: "Settlement",     icon: FileText,   desc: "Record a payment settlement" },
  { id: "associates",  label: "Associate List", icon: Users,      desc: "Browse & filter associates" },
  { id: "plots",       label: "Booked Plots",   icon: BookOpen,   desc: "View all booked plot records" },
];

export default function AdminPanelPage() {
  const { status, profile } = useAuth({ redirectIfInvalid: "/login?expired=true" });
  const [activeTab, setActiveTab] = useState<Tab>("booking");
  const router = useRouter();

  // Role guard — only admin or super_admin can access this page
  const userRole = profile?.role?.toUpperCase();
  const isAuthorized =
    userRole === "ADMIN" ||
    userRole === "SUPERADMIN" ||
    profile?.is_admin === true ||
    profile?.is_super_admin === true;

  useEffect(() => {
    if (status === "authenticated" && !isAuthorized) {
      router.replace("/dashboard");
    }
  }, [status, isAuthorized, router]);

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading Admin Panel...</p>
      </div>
    );
  }

  // Block render while redirecting
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            Admin <span className="text-primary">Panel</span>
          </h1>
          <p className="text-muted-foreground font-medium mt-1 text-sm">
            Welcome, {profile.first_name} {profile.last_name} — Sales & Associate Management
          </p>
        </div>
        <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <Shield size={15} />
          {profile.role === "super_admin" ? "Super Admin" : "Admin"} Mode
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-start gap-2 px-4 py-4 rounded-2xl border text-left transition-all cursor-pointer group ${
                isActive
                  ? "bg-primary text-black border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                  : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Icon size={20} className={isActive ? "text-black" : "text-primary group-hover:scale-110 transition-transform"} />
              <div>
                <p className={`text-xs font-black uppercase tracking-wider ${isActive ? "text-black" : ""}`}>{tab.label}</p>
                <p className={`text-[9px] font-medium mt-0.5 ${isActive ? "text-black/70" : "text-muted-foreground/60"}`}>{tab.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-7 pb-5 border-b border-border">
          {(() => {
            const t = TABS.find((t) => t.id === activeTab)!;
            const Icon = t.icon;
            return (
              <>
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Icon size={17} />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight">{t.label}</h2>
                  <p className="text-[11px] text-muted-foreground font-medium">{t.desc}</p>
                </div>
              </>
            );
          })()}
        </div>

        {activeTab === "booking"    && <SaleForm saleType="NEW" />}
        {activeTab === "settlement" && <SaleForm saleType="SETTLEMENT" />}
        {activeTab === "associates" && <AssociateList />}
        {activeTab === "plots"      && <BookedPlotList />}
      </div>
    </div>
  );
}
