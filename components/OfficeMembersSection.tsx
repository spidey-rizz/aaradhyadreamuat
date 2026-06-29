import React from "react";
import { Users, Plus } from "lucide-react";

interface OfficeMembersSectionProps {
  onAddMember?: () => void;
}

export default function OfficeMembersSection({ onAddMember }: OfficeMembersSectionProps) {
  return (
    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
          <Users className="text-primary" /> Office Members
        </h2>
        <button
          onClick={onAddMember}
          className="bg-primary text-black font-black text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={16} /> Add Office Member
        </button>
      </div>

      <div className="border border-border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center bg-background/50">
        <Users size={48} className="opacity-20 mb-4 text-primary" />
        <p className="font-bold text-lg text-foreground">No office members loaded yet.</p>
        <p className="text-sm mt-2">API integration pending based on database changes.</p>
      </div>
    </div>
  );
}
