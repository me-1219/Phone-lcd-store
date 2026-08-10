import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const redirectTo = location.state?.from?.pathname || "/";

  const validate = () => {
    const next = {};
    if (!form.identifier.trim()) next.identifier = "Email is required.";
    if (!form.password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await login(form);

      // Admins always land on the dashboard — ignore any customer-page
      // redirect target that ProtectedRoute might have set (e.g. an admin
      // who got bounced from a customer-only route before logging in).
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Invalid email/username or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-border bg-white p-6 sm:p-8">
        <h1 className="font-display text-xl font-semibold text-ink-950">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-500">Log in to your Misgie LCD account.</p>

        {formError && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger-500">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            label="User name or email"
            type="identifier"
            icon={Mail}
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            error={errors.identifier}
            autoComplete="identifier"
          />
          <Input
            label="Password"
            type="password"
            icon={Lock}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            autoComplete="current-password"
          />

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" fullWidth loading={submitting}>
            Log In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;