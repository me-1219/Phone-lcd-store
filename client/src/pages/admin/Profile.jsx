import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Save, KeyRound } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { useAuth } from "../../hooks/useAuth";
import { getDisplayName, getInitials } from "../../utils/getDisplayName";
import * as authService from "../../services/authService";

const ROLE_VARIANT = { admin: "brand", staff: "amber", user: "neutral" };

const AdminProfile = () => {
  const { user, refreshUser } = useAuth();

  // Backend record uses "username" (confirmed from your DB), not "name" —
  // detect which field actually exists on the loaded user and edit that
  // one, instead of guessing and silently sending the wrong key.
  const nameField = user && "username" in user ? "username" : "name";

  const [form, setForm] = useState({
    [nameField]: "",
    phone: "",
    street: "",
    city: "",
    region: "",
    country: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({
      [nameField]: user[nameField] || "",
      phone: user.phone || "",
      street: user.address?.street || "",
      city: user.address?.city || "",
      region: user.address?.region || "",
      country: user.address?.country || "",
    });
  }, [user, nameField]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form[nameField]?.trim()) {
      setError(`${nameField === "username" ? "Username" : "Name"} is required.`);
      return;
    }

    setSaving(true);
    try {
      await authService.updateMyProfile({
        [nameField]: form[nameField],
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          region: form.region,
          country: form.country,
        },
      });
      await refreshUser?.();
      setSuccess("Profile updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink-950">My Profile</h1>
      <p className="mt-1 text-sm text-ink-500">Manage your admin account details.</p>

      {/* Identity summary */}
      <div className="mt-6 flex items-center gap-4 rounded-xl border border-border bg-white p-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-lg font-semibold text-white">
          {getInitials(user)}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-display text-base font-semibold text-ink-950">
              {getDisplayName(user)}
            </p>
            {user?.role && (
              <Badge variant={ROLE_VARIANT[user.role] || "neutral"}>{user.role}</Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm text-ink-500">{user?.email}</p>
        </div>
      </div>

      {/* Editable details */}
      <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-border bg-white p-5">
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger-500">{error}</p>
        )}
        {success && (
          <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-success-500">{success}</p>
        )}

        <h2 className="font-display text-sm font-semibold text-ink-950">Account Details</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={nameField === "username" ? "Username" : "Full name"}
            value={form[nameField]}
            onChange={(e) => setForm({ ...form, [nameField]: e.target.value })}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input label="Email" value={user?.email || ""} disabled className="sm:col-span-2" />
        </div>

        <h2 className="mt-6 font-display text-sm font-semibold text-ink-950">Address</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Street"
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            className="sm:col-span-2"
          />
          <Input
            label="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <Input
            label="Region"
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
          />
          <Input
            label="Country"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className="sm:col-span-2"
          />
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
          <Link
            to="/forgot-password"
            className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
          >
            <KeyRound className="h-3.5 w-3.5" /> Change password
          </Link>
          <Button type="submit" icon={Save} loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminProfile;