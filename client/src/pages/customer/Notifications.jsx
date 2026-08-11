import { useState, useEffect } from "react";
import { Package, AlertTriangle, Tag, Info, CheckCheck } from "lucide-react";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import * as notificationService from "../../services/notificationService";

const TYPE_ICON = { order_status: Package, low_stock: AlertTriangle, price_drop: Tag, general: Info };
const TYPE_TONE = {
  order_status: "bg-brand-50 text-brand-600",
  low_stock: "bg-red-50 text-danger-500",
  price_drop: "bg-amber-100 text-amber-600",
  general: "bg-muted text-ink-500",
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getMyNotifications();
      setNotifications(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleClick = async (n) => {
    if (n.status === "unread") {
      await notificationService.markAsRead(n._id);
      setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, status: "read" } : x)));
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
  };

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  if (loading) return <Spinner fullPage label="Loading notifications" />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink-950">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      <div className="mt-6">
        {notifications.length === 0 ? (
          <EmptyState title="No notifications yet" message="Order updates and alerts will show up here." />
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border bg-white">
            {notifications.map((n) => {
              const Icon = TYPE_ICON[n.type] || Info;
              return (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`flex w-full items-start gap-3 px-4 py-4 text-left hover:bg-muted ${
                    n.status === "unread" ? "bg-brand-50/40" : ""
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TYPE_TONE[n.type] || TYPE_TONE.general}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm leading-relaxed text-ink-900">{n.message}</span>
                    <span className="mt-1 block text-xs text-ink-500">
                      {new Date(n.createdAt).toLocaleString("en-US", {
                        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                      })}
                    </span>
                  </span>
                  {n.status === "unread" && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;