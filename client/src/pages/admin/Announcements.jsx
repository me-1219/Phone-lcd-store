import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Megaphone } from "lucide-react";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import * as announcementService from "../../services/announcementService";

const TYPES = [
  { value: "info", label: "Info" },
  { value: "promo", label: "Promo" },
  { value: "restock", label: "Restocked" },
  { value: "coming_soon", label: "Coming Soon" },
];

const TYPE_VARIANT = { info: "brand", promo: "amber", restock: "success", coming_soon: "brand" };

const EMPTY_FORM = { title: "", message: "", type: "info", expiresAt: "", priority: 0, isActive: true };

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await announcementService.getAllAnnouncements();
      setAnnouncements(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (a) => {
    setEditingId(a._id);
    setForm({
      title: a.title,
      message: a.message,
      type: a.type,
      expiresAt: a.expiresAt ? a.expiresAt.slice(0, 10) : "",
      priority: a.priority,
      isActive: a.isActive,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.title.trim() || !form.message.trim()) {
      setFormError("Title and message are required.");
      return;
    }

    const payload = {
      ...form,
      priority: Number(form.priority) || 0,
      expiresAt: form.expiresAt || null,
    };

    setSaving(true);
    try {
      if (editingId) {
        await announcementService.updateAnnouncement(editingId, payload);
      } else {
        await announcementService.createAnnouncement(payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not save announcement.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (a) => {
    try {
      await announcementService.updateAnnouncement(a._id, { isActive: !a.isActive });
      setAnnouncements((prev) =>
        prev.map((x) => (x._id === a._id ? { ...x, isActive: !x.isActive } : x))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Could not update announcement.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await announcementService.deleteAnnouncement(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete announcement.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-950">Announcements</h1>
          <p className="mt-1 text-sm text-ink-500">Shown on the homepage — restocks, promos, and updates.</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Add Announcement</Button>
      </div>

      <div className="mt-6">
        {loading ? (
          <Spinner fullPage label="Loading announcements" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={load} />
        ) : announcements.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No announcements yet"
            message="Post updates like restocks or upcoming stock to show on the homepage."
          />
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border bg-white">
            {announcements.map((a) => (
              <div key={a._id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={TYPE_VARIANT[a.type] || "neutral"}>
                      {TYPES.find((t) => t.value === a.type)?.label || a.type}
                    </Badge>
                    {!a.isActive && <Badge variant="neutral">Hidden</Badge>}
                    {a.expiresAt && new Date(a.expiresAt) < new Date() && (
                      <Badge variant="danger">Expired</Badge>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-ink-950">{a.title}</p>
                  <p className="mt-0.5 text-sm text-ink-500">{a.message}</p>
                  {a.expiresAt && (
                    <p className="mt-1 text-xs text-ink-500">
                      Expires {new Date(a.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => handleToggleActive(a)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:bg-muted"
                  >
                    {a.isActive ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => openEdit(a)} className="rounded-lg p-1.5 text-ink-500 hover:bg-muted hover:text-ink-950">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(a._id)} className="rounded-lg p-1.5 text-ink-500 hover:bg-red-50 hover:text-danger-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Announcement" : "Add Announcement"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger-500">{formError}</p>}

          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Samsung A05 LCD — Coming This Week" />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-900">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              placeholder="Short details customers will see on the homepage"
              className="w-full rounded-lg border border-border p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-900">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="h-10 w-full rounded-lg border border-border px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expires on (optional)"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
            <Input
              label="Priority (lower shows first)"
              type="number"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 accent-brand-600"
            />
            Visible on homepage
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editingId ? "Save Changes" : "Create Announcement"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAnnouncements;
