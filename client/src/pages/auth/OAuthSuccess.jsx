import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Spinner from "../../components/common/Spinner";
import { useAuth } from "../../hooks/useAuth";

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError("Google sign-in failed. Please try again.");
      return;
    }

    loginWithToken(token)
      .then((user) => {
        navigate(user.role === "admin" ? "/admin" : "/", { replace: true });
      })
      .catch(() => {
        setError("Could not complete sign-in. Please try again.");
      });
  }, [searchParams, loginWithToken, navigate]);

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-danger-500">{error}</p>
        <button onClick={() => navigate("/login")} className="text-sm font-medium text-brand-600 hover:underline">
          Back to login
        </button>
      </div>
    );
  }

  return <Spinner fullPage label="Signing you in" />;
};

export default OAuthSuccess;
