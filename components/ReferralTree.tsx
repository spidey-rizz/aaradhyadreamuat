"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Users, Phone, Hash } from "lucide-react";

interface ReferralMember {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
  referral_code: string;
  verified: boolean;
  subtree_count: number;
  direct_referrals: ReferralMember[];
}

interface ReferralNodeProps {
  member: ReferralMember;
  level: number;
}

const ReferralNode = ({ member, level }: ReferralNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = member.direct_referrals && member.direct_referrals.length > 0;

  return (
    <div className="mb-2">
      <div 
        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
          isExpanded ? "bg-muted/60 border-primary/30" : "bg-card border-border hover:border-primary/20 shadow-sm"
        }`}
        style={{ marginLeft: `${level * 20}px` }}
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => hasChildren && setIsExpanded(!isExpanded)}
            className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
              hasChildren ? "text-primary-text hover:bg-primary/20" : "text-muted-foreground/50 cursor-default"
            }`}
          >
            {hasChildren ? (isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />) : <ChevronRight size={14} className="opacity-20" />}
          </button>
          
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${member.verified ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" : "bg-muted text-muted-foreground border border-border"}`}>
              {member.first_name?.[0] || ""}{member.last_name?.[0] || ""}
            </div>
            <div>
              <div className="text-foreground font-semibold">{member.first_name} {member.last_name}</div>
              <div className="text-muted-foreground text-xs flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1"><Phone size={12} /> {member.phone}</span>
                <span className="flex items-center gap-1 font-mono uppercase"><Hash size={12} /> {member.referral_code}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 pr-2">
          <div className="text-right">
            <div className="text-primary-text font-bold text-lg leading-none">{member.subtree_count}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Network</div>
          </div>
          <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${member.verified ? "bg-green-500/10 text-green-600 dark:text-green-500 border border-green-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20"}`}>
            {member.verified ? "Verified" : "Pending"}
          </div>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
          {member.direct_referrals.map((child) => (
            <ReferralNode key={child._id} member={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ReferralTree({ tree }: { tree: ReferralMember[] }) {
  if (!tree || tree.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-3xl border border-border border-dashed">
        <Users size={48} className="text-muted-foreground/45 mx-auto mb-4" />
        <h4 className="text-foreground/80 font-medium">Your network is currently empty.</h4>
        <p className="text-muted-foreground text-sm mt-2">Share your referral code to start building your team!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tree.map((member) => (
        <ReferralNode key={member._id} member={member} level={0} />
      ))}
    </div>
  );
}
