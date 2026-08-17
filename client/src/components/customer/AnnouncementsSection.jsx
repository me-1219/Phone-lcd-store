import { useState, useEffect } from "react";
import { Megaphone, Tag, PackageCheck, Clock } from "lucide-react";
import * as announcementService from "../../services/announcementService";

const TYPE_CONFIG = {
  info: { icon: Megaphone, tone: "bg-brand-50 text-brand-600", badge: "Announcement" },
  promo: { icon: Tag, tone: "bg-amber-100 text-amber-600", badge: "Promo" },
  restock: { icon: PackageCheck, tone: "bg-emerald-50 text-success-500", badge: "Restocked" },
  coming_soon: { icon: Clock, tone: "bg-brand-50 text-brand-600", badge: "Coming Soon" },
};

const AnnouncementsSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    announcementService
      .getActiveAnnouncements()
      .then((res) => setAnnouncements(res.data))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, []);

  // Silent when empty or loading — no point showing a section header for
  // nothing, unlike Categories/Featured which always have real content.
  if (loading || announcements.length === 0) return null;

  return (
    <section className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-semibold text-ink-950">Latest Updates</h2>
        <p className="mt-1 text-sm text-ink-500">New stock, restocks, and what's coming next.</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {announcements.map((a) => {
            const config = TYPE_CONFIG[a.type] || TYPE_CONFIG.info;
            const Icon = config.icon;
            return (
              <div key={a._id} className="rounded-xl border border-border bg-white p-5">
                <div className="flex items-center gap-2">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wide text-ink-500">
                    {config.badge}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-base font-semibold text-ink-950">{a.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{a.message}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AnnouncementsSection;
