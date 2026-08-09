import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Lock, Hash } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import * as authService from "../../services/authService";

// ASSUMPTION: reset-password expects { email, code, newPassword }.
// Confirm against the actual authController and adjust field names
// (e.g. it may expect "token" instead of "code", or "password" instead
// of "newPassword").
const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: location.state?.email || "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required.";
    if (!form.code.trim()) next.code = "Reset code is required.";
    if (!form.newPassword) next.newPassword = "New password is required.";
    else if (form.newPassword.length < 6) next.newPassword = "Must be at least 6 characters.";
    if (form.confirmPassword !== form.newPassword) next.confirmPassword = "Passwords don't match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await authService.resetPassword({
        email: form.email,
        code: form.code,
        newPassword: form.newPassword,
      });
      navigate("/login", { state: { passwordReset: true } });
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not reset password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-border bg-white p-6 sm:p-8">
        <h1 className="font-display text-xl font-semibold text-ink-950">Reset your password</h1>
        <p className="mt-1 text-sm text-ink-500">
          Enter the code sent to your email and choose a new password.
        </p>

        {formError && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger-500">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />
          <Input
            label="Reset code"
            icon={Hash}
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            error={errors.code}
          />
          <Input
            label="New password"
            type="password"
            icon={Lock}
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            error={errors.newPassword}
            autoComplete="new-password"
          />
          <Input
            label="Confirm new password"
            type="password"
            icon={Lock}
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <Button type="submit" fullWidth loading={submitting}>
            Reset Password
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;