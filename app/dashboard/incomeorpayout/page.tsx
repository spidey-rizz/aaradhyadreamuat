"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { 
  Loader2, 
  ChevronLeft, 
  Wallet, 
  TrendingUp, 
  Users, 
  FileText,
  DollarSign,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2
} from "lucide-react";


export default function PayoutsPage() {
  const { status, profile } = useAuth({ redirectIfInvalid: "/login?expired=true" });
  const router = useRouter();

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading payouts...</p>
      </div>
    );
  }

  // Real data from profile
  const referralList: any[] = profile?.referral_list || [];
  const selfDepositVal = profile?.total_sales || 0;
  const teamDepositVal = referralList.reduce((acc: number, m: any) => acc + (m.total_sales || 0), 0);
  const totalDepositVal = selfDepositVal + teamDepositVal;


  const navCards = [
    {
      title: "Self Deposit Amount",
      description: "Detailed list of your self deposits and date-wise audit logs.",
      href: "/dashboard/incomeorpayout/self-deposit",
      icon: DollarSign,
      color: "text-emerald-500 bg-emerald-500/10"
    },
    {
      title: "Team + Self Deposit",
      description: "Downline team contributions compared to your self deposits.",
      href: "/dashboard/incomeorpayout/team-deposit",
      icon: Users,
      color: "text-blue-500 bg-blue-500/10"
    },
    {
      title: "Payout Detail",
      description: "Log of payouts, status clearances, and reference transaction IDs.",
      href: "/dashboard/incomeorpayout/payout-detail",
      icon: FileText,
      color: "text-primary bg-primary/10"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button 
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group text-sm font-semibold uppercase tracking-wider"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Profile
      </button>

      {/* Header Row */}
      <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Wallet size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
            Payouts & <span className="text-primary">Income Dashboard</span>
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">Monitor deposit structures, downlines, and payment releases.</p>
        </div>
      </div>

      {/* Quick Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Deposits */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-primary/20 transition-all group flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Deposits</p>
            <p className="text-2xl font-black text-foreground font-mono">₹{totalDepositVal.toLocaleString('en-IN')}</p>
            <div className="flex gap-2 text-[9px] text-muted-foreground font-medium mt-1">
              <span>Self: ₹{selfDepositVal.toLocaleString('en-IN')}</span>
              <span>•</span>
              <span>Team: ₹{teamDepositVal.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <ArrowUpRight size={20} />
          </div>
        </div>

        {/* Self Sales */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-emerald-500/20 transition-all group flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Self Business</p>
            <p className="text-2xl font-black text-emerald-500 font-mono">₹{selfDepositVal.toLocaleString('en-IN')}</p>
            <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 uppercase tracking-widest">
              <CheckCircle2 size={10} /> Your Sales
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Team Sales */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-amber-500/20 transition-all group flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Team Business</p>
            <p className="text-2xl font-black text-amber-500 font-mono">₹{teamDepositVal.toLocaleString('en-IN')}</p>
            <span className="inline-flex items-center gap-1 text-[9px] text-amber-600 dark:text-amber-400 font-bold mt-1 uppercase tracking-widest">
              <TrendingUp size={10} /> Network Sales
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <TrendingUp size={20} />
          </div>
        </div>

      </div>


      {/* Navigation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {navCards.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.title}
              onClick={() => router.push(card.href)}
              className="bg-card border border-border rounded-[2.5rem] p-6 hover:border-primary/40 cursor-pointer shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-56"
            >
              <div>
                <div className={`p-3 rounded-2xl w-fit ${card.color} mb-6 group-hover:scale-105 transition-transform`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-foreground mb-2">{card.title}</h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">{card.description}</p>
              </div>
              <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-primary gap-1 group-hover:gap-2 transition-all mt-4">
                <span>Open View</span>
                <ChevronRight size={12} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
