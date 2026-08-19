import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { Mail, Lock, User, Phone, Hash, MailCheck, KeyRound } from "lucide-react";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import { useAuth } from "../../hooks/useAuth";
import { useAuthModal } from "../../hooks/useAuthModal";
import * as authService from "../../services/authService";
import { GOOGLE_AUTH_URL } from "../../utils/constants";

const EMPTY_LOGIN = { identifier: "", password: "" };
const EMPTY_REGISTER = { username: "", email: "", phone: "", password: "", confirmPassword: "" };

const MODE_TITLE = {
  login: "Log In",
  register: "Create Account",
  "forgot-password": "Forgot Password",
  "verify-email": "Verify Your Email",
  "reset-password": "Reset Password",
};

const AuthModal = () => {
  const { mode, payload, openLogin, openRegister, openForgotPassword, openVerifyEmail, openResetPassword, close } =
    useAuthModal();
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN);
  const [registerForm, setRegisterForm] = useState(EMPTY_REGISTER);
  const [forgotEmail, setForgotEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [resetForm, setResetForm] = useState({ code: "", newPassword: "", confirmPassword: "" });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  // Pre-fill identifier when a step hands off to login/reset with one already known.
  useEffect(() => {
    if (mode === "login" && payload.email) {
      setLoginForm((f) => ({ ...f, identifier: payload.email }));
    }
  }, [mode, payload.email]);

  const resetLocalState = () => {
    setErrors({});
    setFormError("");
    setInfoMessage("");
  };

  const resetAndClose = () => {
    setLoginForm(EMPTY_LOGIN);
    setRegisterForm(EMPTY_REGISTER);
    setForgotEmail("");
    setVerifyCode("");
    setResetForm({ code: "", newPassword: "", confirmPassword: "" });
    resetLocalState();
    close();
  };

  // ===== Login =====
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    resetLocalState();

    const next = {};
    if (!loginForm.identifier.trim()) next.identifier = "Username or email is required.";
    if (!loginForm.password) next.password = "Password is required.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const user = await login({
        identifier: loginForm.identifier.trim(),
        password: loginForm.password,
      });
      resetAndClose();
      if (user.role === "admin") navigate("/admin", { replace: true });
    } catch (err) {
      setFormError(err.response?.data?.message || "Invalid username/email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Register =====
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    resetLocalState();

    const next = {};
    if (!registerForm.username.trim()) next.username = "Username is required.";
    if (!registerForm.email.trim()) next.email = "Email is required.";
    if (!registerForm.password) next.password = "Password is required.";
    else if (registerForm.password.length < 6) next.password = "Must be at least 6 characters.";
    if (registerForm.confirmPassword !== registerForm.password) next.confirmPassword = "Passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const { confirmPassword, ...payloadToSend } = registerForm;
      await register(payloadToSend);
      // ASSUMPTION carried from earlier: backend requires email verification.
      // Change this to resetAndClose() if your register controller doesn't.
      openVerifyEmail(registerForm.email);
    } catch (err) {
      setFormError(err.response?.data?.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Forgot password (step 1: request code) =====
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    resetLocalState();

    if (!forgotEmail.trim()) {
      setErrors({ email: "Email is required." });
      return;
    }

    setSubmitting(true);
    try {
      await authService.forgotPassword({ email: forgotEmail.trim() });
      openResetPassword(forgotEmail.trim());
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not send reset code.");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Verify email =====
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    resetLocalState();

    if (!verifyCode.trim()) {
      setFormError("Enter the verification code sent to your email.");
      return;
    }

    setSubmitting(true);
    try {
      await authService.verifyEmail({ email: payload.email, code: verifyCode.trim() });
      // Register already logged the user in and stored their token — no
      // further redirect needed, just close and let them keep browsing.
      resetAndClose();
    } catch (err) {
      setFormError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    resetLocalState();
    setResending(true);
    try {
      await authService.resendVerification({ email: payload.email });
      setInfoMessage("A new code has been sent to your email.");
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not resend code.");
    } finally {
      setResending(false);
    }
  };

  // ===== Reset password (step 2: enter code + new password) =====
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    resetLocalState();

    const next = {};
    if (!resetForm.code.trim()) next.code = "Reset code is required.";
    if (!resetForm.newPassword) next.newPassword = "New password is required.";
    else if (resetForm.newPassword.length < 6) next.newPassword = "Must be at least 6 characters.";
    if (resetForm.confirmPassword !== resetForm.newPassword) next.confirmPassword = "Passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await authService.resetPassword({
        email: payload.email,
        code: resetForm.code.trim(),
        newPassword: resetForm.newPassword,
      });
      setResetForm({ code: "", newPassword: "", confirmPassword: "" });
      // resetPassword doesn't log the user in — hand off to login,
      // pre-filled, with a note confirming what just happened.
      openLogin({ email: payload.email });
      setInfoMessage("Password reset — log in with your new password.");
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not reset password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={mode !== null} onClose={resetAndClose} title={MODE_TITLE[mode] || ""}>
      {formError && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger-500">{formError}</p>
      )}
      {infoMessage && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-success-500">{infoMessage}</p>
      )}

      {/* ===== Login ===== */}
      {mode === "login" && (
        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
          <Input
            label="Username or email"
            type="text"
            icon={Mail}
            value={loginForm.identifier}
            onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
            error={errors.identifier}
            autoComplete="username"
          />
          <Input
            label="Password"
            type="password"
            icon={Lock}
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            error={errors.password}
            autoComplete="current-password"
          />

          <button
            type="button"
            onClick={() => {
              resetLocalState();
              openForgotPassword();
            }}
            className="self-end text-sm font-medium text-brand-600 hover:underline"
          >
            Forgot password?
          </button>

          <Button type="submit" fullWidth loading={submitting}>
            Log In
          </Button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-ink-500">or</span>
            </div>
          </div>

          <a
            href={GOOGLE_AUTH_URL}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium text-ink-900 hover:bg-muted"
          >
            <FaGoogle className="h-4 w-4 text-[#cdf442]" />
            Continue with Google
          </a>

          <p className="text-center text-sm text-ink-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => {
                resetLocalState();
                openRegister();
              }}
              className="font-medium text-brand-600 hover:underline"
            >
              Sign up
            </button>
          </p>
        </form>
      )}

      {/* ===== Register ===== */}
      {mode === "register" && (
        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
          <Input
            label="Username"
            icon={User}
            value={registerForm.username}
            onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
            error={errors.username}
            autoComplete="username"
          />
          <Input
            label="Email"
            type="email"
            icon={Mail}
            value={registerForm.email}
            onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Phone (optional)"
            icon={Phone}
            value={registerForm.phone}
            onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
            autoComplete="tel"
          />
          <Input
            label="Password"
            type="password"
            icon={Lock}
            value={registerForm.password}
            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
            error={errors.password}
            autoComplete="new-password"
          />
          <Input
            label="Confirm password"
            type="password"
            icon={Lock}
            value={registerForm.confirmPassword}
            onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <Button type="submit" fullWidth loading={submitting}>
            Create Account
          </Button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-ink-500">or</span>
            </div>
          </div>

          <a
            href={GOOGLE_AUTH_URL}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium text-ink-900 hover:bg-muted"
          >
            <FaGoogle className="h-4 w-4 text-[#4285F4]" />
            Continue with Google
          </a>

          <p className="text-center text-sm text-ink-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                resetLocalState();
                openLogin();
              }}
              className="font-medium text-brand-600 hover:underline"
            >
              Log in
            </button>
          </p>
        </form>
      )}

      {/* ===== Forgot password ===== */}
      {mode === "forgot-password" && (
        <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg bg-brand-50 p-3">
            <KeyRound className="h-5 w-5 shrink-0 text-brand-600" />
            <p className="text-sm text-ink-700">
              Enter your email and we'll send you a reset code.
            </p>
          </div>

          <Input
            label="Email"
            type="email"
            icon={Mail}
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
          />

          <Button type="submit" fullWidth loading={submitting}>
            Send Reset Code
          </Button>

          <button
            type="button"
            onClick={() => {
              resetLocalState();
              openLogin();
            }}
            className="text-center text-sm font-medium text-brand-600 hover:underline"
          >
            Back to login
          </button>
        </form>
      )}

      {/* ===== Verify email ===== */}
      {mode === "verify-email" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg bg-brand-50 p-3">
            <MailCheck className="h-5 w-5 shrink-0 text-brand-600" />
            <p className="text-sm text-ink-700">
              {payload.email
                ? <>We sent a verification code to <span className="font-medium text-ink-900">{payload.email}</span>.</>
                : "Enter the verification code sent to your email."}
            </p>
          </div>

          <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4">
            <Input
              label="Verification code"
              icon={Hash}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              placeholder="Enter code"
            />

            <Button type="submit" fullWidth loading={submitting}>
              Verify Email
            </Button>
          </form>

          <button
            onClick={handleResendCode}
            disabled={resending}
            className="text-center text-sm font-medium text-brand-600 hover:underline disabled:opacity-50"
          >
            {resending ? "Resending..." : "Didn't get a code? Resend"}
          </button>
        </div>
      )}

      {/* ===== Reset password ===== */}
      {mode === "reset-password" && (
        <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-ink-500">
            Enter the code sent to <span className="font-medium text-ink-900">{payload.email}</span> and choose a new password.
          </p>

          <Input
            label="Reset code"
            icon={Hash}
            value={resetForm.code}
            onChange={(e) => setResetForm({ ...resetForm, code: e.target.value })}
            error={errors.code}
          />
          <Input
            label="New password"
            type="password"
            icon={Lock}
            value={resetForm.newPassword}
            onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
            error={errors.newPassword}
            autoComplete="new-password"
          />
          <Input
            label="Confirm new password"
            type="password"
            icon={Lock}
            value={resetForm.confirmPassword}
            onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <Button type="submit" fullWidth loading={submitting}>
            Reset Password
          </Button>

          <button
            type="button"
            onClick={() => {
              resetLocalState();
              openLogin();
            }}
            className="text-center text-sm font-medium text-brand-600 hover:underline"
          >
            Back to login
          </button>
        </form>
      )}
    </Modal>
  );
};

export default AuthModal;

