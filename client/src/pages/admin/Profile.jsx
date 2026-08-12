import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Save, KeyRound } from "lucide-react";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { useAuth } from "../../hooks/useAuth";
import { getDisplayName, getInitials } from "../../utils/getDisplayName";
import * as authService from "../../services/authService";

const ROLE_VARIANT = {
  admin: "brand",
  staff: "amber",
  user: "neutral",
};

const AdminProfile = () => {
  const { user, refreshUser } = useAuth();

  const nameField =
    user && Object.prototype.hasOwnProperty.call(user, "username")
      ? "username"
      : "name";

  const [form, setForm] = useState({
    username: "",
    name: "",
    phone: "",
    street: "",
    city: "",
    region: "",
    country: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load user data into the form
  useEffect(() => {
    if (!user) return;
    // Defer state update to avoid synchronous setState inside effect which can
    // trigger cascading renders. Using a timeout schedules the update after
    // the current render completes.
    const t = setTimeout(() => {
      setForm({
        username: user.username || "",
        name: user.name || "",
        phone: user.phone || "",
        street: user.address?.street || "",
        city: user.address?.city || "",
        region: user.address?.region || "",
        country: user.address?.country || "",
      });
    }, 0);

    return () => clearTimeout(t);
  }, [user]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

    // Clear messages when user starts editing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const nameValue = form[nameField]?.trim();

    if (!nameValue) {
      setError(
        `${nameField === "username" ? "Username" : "Name"} is required.`
      );
      return;
    }

    setSaving(true);

    try {
      const profileData = {
        [nameField]: nameValue,
        phone: form.phone.trim(),
        address: {
          street: form.street.trim(),
          city: form.city.trim(),
          region: form.region.trim(),
          country: form.country.trim(),
        },
      };

      await authService.updateMyProfile(profileData);

      await refreshUser?.();

      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Could not update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <h1 className="font-display text-2xl font-semibold text-ink-950">
        My Profile
      </h1>

      <p className="mt-1 text-sm text-ink-500">
        Manage your admin account details.
      </p>

      {/* Identity Summary */}
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
              <Badge variant={ROLE_VARIANT[user.role] || "neutral"}>
                {user.role}
              </Badge>
            )}
          </div>

          <p className="mt-0.5 text-sm text-ink-500">
            {user?.email || "No email"}
          </p>
        </div>
      </div>

      {/* Editable Details */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-xl border border-border bg-white p-5"
      >
        {/* Error */}
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger-500">
            {error}
          </p>
        )}

        {/* Success */}
        {success && (
          <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-success-500">
            {success}
          </p>
        )}

        {/* Account Details */}
        <h2 className="font-display text-sm font-semibold text-ink-950">
          Account Details
        </h2>

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={nameField === "username" ? "Username" : "Full Name"}
            value={form[nameField] || ""}
            onChange={handleChange(nameField)}
          />

          <Input
            label="Phone"
            value={form.phone}
            onChange={handleChange("phone")}
          />

          <Input
            label="Email"
            value={user?.email || ""}
            disabled
            className="sm:col-span-2"
          />
        </div>

        {/* Address */}
        <h2 className="mt-6 font-display text-sm font-semibold text-ink-950">
          Address
        </h2>

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Street"
            value={form.street}
            onChange={handleChange("street")}
            className="sm:col-span-2"
          />

          <Input
            label="City"
            value={form.city}
            onChange={handleChange("city")}
          />

          <Input
            label="Region"
            value={form.region}
            onChange={handleChange("region")}
          />

          <Input
            label="Country"
            value={form.country}
            onChange={handleChange("country")}
            className="sm:col-span-2"
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
          <Link
            to="/forgot-password"
            className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
          >
            <KeyRound className="h-3.5 w-3.5" />
            Change password
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