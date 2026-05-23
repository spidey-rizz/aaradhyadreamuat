import { useState } from "react";
import { Megaphone, Send, Plus, X } from "lucide-react";

export default function AnnouncementsManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState("ALL");

  const handlePost = () => {
    // API Call to POST /broker/announcements
    alert(`Announcement posted to ${targetRole}!`);
    setIsCreating(false);
    setTitle("");
    setContent("");
    setTargetRole("ALL");
  };

  return (
    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm p-6 sm:p-8 relative">
      <div className="absolute top-0 right-0 p-6 opacity-5">
        <Megaphone size={150} />
      </div>

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
          <Megaphone className="text-amber-500" /> Announcements
        </h2>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-amber-500 text-black font-black text-[10px] sm:text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Plus size={14} /> New Post
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="relative z-10 space-y-4 border border-border rounded-2xl p-6 bg-background/50">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Target Audience</label>
            <div className="flex gap-3">
              {['ALL', 'ADMIN', 'OFFICE'].map(role => (
                <button
                  key={role}
                  onClick={() => setTargetRole(role)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${targetRole === role ? 'bg-amber-500 text-black' : 'bg-background border border-border text-muted-foreground hover:bg-muted'}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Title</label>
            <input 
              type="text" 
              placeholder="E.g., System Update Tomorrow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Message</label>
            <textarea 
              rows={4}
              placeholder="Write the announcement details here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              onClick={() => setIsCreating(false)}
              className="bg-background border border-border text-foreground font-black text-[10px] sm:text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-muted transition-colors flex items-center gap-2"
            >
              <X size={16} /> Cancel
            </button>
            <button 
              onClick={handlePost}
              disabled={!title || !content}
              className="bg-amber-500 text-black font-black text-[10px] sm:text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send size={16} /> Publish Post
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center bg-background/50 relative z-10">
            <Megaphone size={48} className="opacity-20 mb-4 text-amber-500" />
            <p className="font-bold text-lg text-foreground">No recent announcements.</p>
            <p className="text-sm mt-2">Click "New Post" to broadcast a message to your staff.</p>
        </div>
      )}
    </div>
  );
}
