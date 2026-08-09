import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      region: "",
      country: "",
    },
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const validate = () => {
    const next = {};
    if (!form.username.trim()) next.username = "Username is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 6) next.password = "Password must be at least 6 characters.";
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords don't match.";
    if (!form.address.street.trim()) next.address = "Street is required.";
    if (!form.address.city.trim()) next.address = "City is required.";
    if (!form.address.region.trim()) next.address = "Region is required.";
    if (!form.address.country.trim()) next.address = "Country is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = { ...form };
      delete payload.confirmPassword;
      await register(payload);

      // ASSUMPTION: backend requires email verification before full access
      // (per your README's /api/auth/verify-email endpoint). If your
      // register controller doesn't require this, just navigate("/") instead.
      navigate("/verify-email", { state: { email: form.email } });
    } catch (err) {
      console.error("Registration error", err.response || err);
      setFormError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.message ||
          JSON.stringify(err.response?.data) ||
          "Registration failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-border bg-white p-6 sm:p-8">
        <h1 className="font-display text-xl font-semibold text-ink-950">Create an account</h1>
        <p className="mt-1 text-sm text-ink-500">Join Misgie LCD to start ordering parts.</p>

        {formError && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger-500">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            label="Username"
            icon={User}
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            error={errors.username}
            autoComplete="username"
          />
          <Input
            label="Email"
            type="email"
            icon={Mail}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Phone"
            icon={Phone}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            autoComplete="tel"
          />
          <Input
            label="Street"
            value={form.address.street}
            onChange={(e) =>
              setForm({
                ...form,
                address: { ...form.address, street: e.target.value },
              })
            }
            autoComplete="street-address"
          />
          <Input
            label="City"
            value={form.address.city}
            onChange={(e) =>
              setForm({
                ...form,
                address: { ...form.address, city: e.target.value },
              })
            }
            autoComplete="address-level2"
          />
          <Input
            label="Region"
            value={form.address.region}
            onChange={(e) =>
              setForm({
                ...form,
                address: { ...form.address, region: e.target.value },
              })
            }
            autoComplete="address-level1"
          />
          <Input
            label="Country"
            value={form.address.country}
            onChange={(e) =>
              setForm({
                ...form,
                address: { ...form.address, country: e.target.value },
              })
            }
            autoComplete="country-name"
          />
          <Input
            label="Password"
            type="password"
            icon={Lock}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            autoComplete="new-password"
          />
          <Input
            label="Confirm password"
            type="password"
            icon={Lock}
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <Button type="submit" fullWidth loading={submitting}>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;