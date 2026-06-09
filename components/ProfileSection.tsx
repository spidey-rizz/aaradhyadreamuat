import { useState } from "react";
import { User, Edit2, Key, Check, X, ShieldAlert, Copy } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";

export default function ProfileSection({ profile }: { profile: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    // In the future, this will call the PUT /broker/me endpoint
    alert("Profile update API will be integrated here.");
    setIsEditing(false);
  };

  const handleCopy = async () => {
    const code = profile?.referral_code || "";
    if (code) {
      const success = await copyToClipboard(code);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm p-6 sm:p-8 relative">
      <div className="absolute top-0 right-0 p-6 opacity-5">
        <User size={150} />
      </div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
          <User className="text-amber-500" /> My Profile
        </h2>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-background border border-border text-foreground font-black text-[10px] sm:text-xs uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-muted transition-colors flex items-center gap-2"
          >
            <Edit2 size={14} /> Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Full Name</label>
          {isEditing ? (
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-amber-500 transition-colors"
            />
          ) : (
            <div className="text-lg font-bold">{profile?.name || "N/A"}</div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            Referral Code <ShieldAlert size={12} className="text-amber-500" />
          </label>
          <div className="flex items-center gap-3">
            <div className="bg-background border border-border rounded-xl px-4 py-3 text-foreground font-mono font-bold tracking-widest flex-grow">
              {profile?.referral_code || "N/A"}
            </div>
            <button 
              onClick={handleCopy}
              className="bg-muted p-3 rounded-xl hover:bg-amber-500/20 hover:text-amber-500 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              title="Copy Referral Code"
            >
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">* Referral code cannot be changed.</p>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end gap-3 mt-6 border-t border-border pt-6">
          <button 
            onClick={() => {
              setIsEditing(false);
              setName(profile?.name || "");
            }}
            className="bg-background border border-border text-foreground font-black text-[10px] sm:text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-muted transition-colors flex items-center gap-2"
          >
            <X size={16} /> Cancel
          </button>
          <button 
            onClick={handleSave}
            className="bg-amber-500 text-black font-black text-[10px] sm:text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Check size={16} /> Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
