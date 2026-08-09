import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import * as authService from "../../services/authService";

// ASSUMPTION: verify-email expects { email, code } and resend-verification
// expects { email }. Confirm these field names against your actual
// authController — adjust the payload keys below if they differ.
const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Enter the verification code sent to your email.");
      return;
    }

    setSubmitting(true);
    try {
      await authService.verifyEmail({ email, code: code.trim() });
      navigate("/login", { state: { verified: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResendMessage("");
    setResending(true);
    try {
      await authService.resendVerification({ email });
      setResendMessage("A new code has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-border bg-white p-6 text-center sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
          <MailCheck className="h-6 w-6 text-brand-600" />
        </div>

        <h1 className="mt-4 font-display text-xl font-semibold text-ink-950">
          Verify your email
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {email
            ? <>We sent a verification code to <span className="font-medium text-ink-900">{email}</span>.</>
            : "Enter the verification code sent to your email."}
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger-500">
            {error}
          </div>
        )}
        {resendMessage && (
          <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-success-500">
            {resendMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 text-left">
          <Input
            label="Verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code"
          />

          <Button type="submit" fullWidth loading={submitting}>
            Verify Email
          </Button>
        </form>

        <button
          onClick={handleResend}
          disabled={resending}
          className="mt-4 text-sm font-medium text-brand-600 hover:underline disabled:opacity-50"
        >
          {resending ? "Resending..." : "Didn't get a code? Resend"}
        </button>

        <p className="mt-6 text-sm text-ink-500">
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;