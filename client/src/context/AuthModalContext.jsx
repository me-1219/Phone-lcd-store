import { createContext, useState, useCallback } from "react";

export const AuthModalContext = createContext(null);

export const AuthModalProvider = ({ children }) => {
  const [mode, setMode] = useState(null); // null | "login" | "register" | "forgot-password" | "verify-email" | "reset-password"
  const [payload, setPayload] = useState({}); // carries e.g. { email } between steps

  const openLogin = useCallback((data = {}) => {
    setPayload(data);
    setMode("login");
  }, []);

  const openRegister = useCallback(() => {
    setPayload({});
    setMode("register");
  }, []);

  const openForgotPassword = useCallback(() => {
    setPayload({});
    setMode("forgot-password");
  }, []);

  const openVerifyEmail = useCallback((email) => {
    setPayload({ email });
    setMode("verify-email");
  }, []);

  const openResetPassword = useCallback((email) => {
    setPayload({ email });
    setMode("reset-password");
  }, []);

  const close = useCallback(() => {
    setMode(null);
    setPayload({});
  }, []);

  return (
    <AuthModalContext.Provider
      value={{ mode, payload, openLogin, openRegister, openForgotPassword, openVerifyEmail, openResetPassword, close }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};