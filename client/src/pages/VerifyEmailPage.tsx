import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../lib/api";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setMessage("Missing verification token.");
      return;
    }
    api
      .get(`/auth/verify?token=${token}`)
      .then(() => setMessage("Email verified! You can now log in."))
      .catch(() => setMessage("Verification failed. Please request a new link."));
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-800">Email verification</h1>
      <p className="mt-4 text-sm text-slate-600">{message}</p>
      <Link to="/welcome" className="mt-6 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
        Back to welcome
      </Link>
    </div>
  );
}
