import { Megaphone, Bell } from "lucide-react";

export default function AnnouncementsFeed() {
  // In the future, this will fetch GET /broker/announcements
  const announcements: any[] = []; // Mock empty state for now

  return (
    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm p-6 sm:p-8 relative">
      <div className="absolute top-0 right-0 p-6 opacity-5">
        <Bell size={150} />
      </div>

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
          <Bell className="text-amber-500" /> Announcements
        </h2>
      </div>

      <div className="relative z-10">
        {announcements.length === 0 ? (
          <div className="border border-border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center bg-background/50">
              <Megaphone size={48} className="opacity-20 mb-4 text-amber-500" />
              <p className="font-bold text-lg text-foreground">No new announcements.</p>
              <p className="text-sm mt-2">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Map announcements here in the future */}
          </div>
        )}
      </div>
    </div>
  );
}
