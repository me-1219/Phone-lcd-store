import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, KeyRound } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import * as authService from "../../services/authService";

// ASSUMPTION: forgot-password expects { email } and sends a reset code
// via email/SMS per your requirements doc. Confirm against the actual
// authController.
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setSubmitting(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send reset code.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-border bg-white p-6 sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
          <KeyRound className="h-6 w-6 text-brand-600" />
        </div>

        <h1 className="mt-4 text-center font-display text-xl font-semibold text-ink-950">
          Forgot your password?
        </h1>
        <p className="mt-1 text-center text-sm text-ink-500">
          Enter your email and we'll send you a reset code.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger-500">
            {error}
          </div>
        )}

        {sent ? (
          <div className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-center text-sm text-success-500">
            A reset code has been sent to <span className="font-medium">{email}</span>.
            <Link to="/reset-password" state={{ email }} className="mt-2 block font-medium underline">
              Enter reset code
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <Button type="submit" fullWidth loading={submitting}>
              Send Reset Code
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink-500">
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;