import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { Bell, Package, AlertTriangle, Tag, Info, CheckCheck } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import * as notificationService from "../../services/notificationService";

const TYPE_ICON = {
  order_status: Package,
  low_stock: AlertTriangle,
  price_drop: Tag,
  general: Info,
};

const TYPE_TONE = {
  order_status: "bg-brand-50 text-brand-600",
  low_stock: "bg-red-50 text-danger-500",
  price_drop: "bg-amber-100 text-amber-600",
  general: "bg-muted text-ink-500",
};

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

// Shared bell used in both the customer Navbar and the admin header —
// admins get low_stock alerts here too, customers get order_status/price_drop.
const NotificationBell = ({ dark = false, notificationsPath = "/notifications" }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await notificationService.getMyNotifications();
      setNotifications(res.data);
      setUnreadCount(res.unreadCount);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    load();
    // Poll every 60s so the badge updates without a full page reload.
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = async (notification) => {
    if (notification.status === "unread") {
      await notificationService.markAsRead(notification._id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, status: "read" } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
    setUnreadCount(0);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className={`relative rounded-lg p-2.5 ${
          dark ? "text-ink-300 hover:bg-white/5 hover:text-white" : "text-ink-700 hover:bg-muted hover:text-ink-950"
        }`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-lg border border-border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-sm font-medium text-ink-950">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-sm text-ink-500">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ink-500">You're all caught up.</p>
            ) : (
              notifications.slice(0, 8).map((n) => {
                const Icon = TYPE_ICON[n.type] || Info;
                return (
                  <button
                    key={n._id}
                    onClick={() => handleItemClick(n)}
                    className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-muted ${
                      n.status === "unread" ? "bg-brand-50/40" : ""
                    }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TYPE_TONE[n.type] || TYPE_TONE.general}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm leading-snug text-ink-900">{n.message}</span>
                      <span className="mt-0.5 block text-xs text-ink-500">{timeAgo(n.createdAt)}</span>
                    </span>
                    {n.status === "unread" && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          <Link
            to={notificationsPath}
            onClick={() => setOpen(false)}
            className="block border-t border-border px-4 py-2.5 text-center text-sm font-medium text-brand-600 hover:bg-muted"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;