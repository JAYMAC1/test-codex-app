import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../features/auth/AuthContext";

export function WelcomePage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [form, setForm] = useState({ email: "", password: "", firstName: "", postcode: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === "register") {
        await api.post("/auth/register", {
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          postcode: form.postcode,
        });
        setMessage("Please check your inbox (and the server console in dev) for the verification link.");
        setMode("login");
      } else {
        const response = await api.post("/auth/login", {
          email: form.email,
          password: form.password,
        });
        await login(response.data.token);
      }
    } catch (error: any) {
      const description = error?.response?.data?.message ?? "Something went wrong";
      setMessage(description);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col bg-surface px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">ConnectedCommunity</h1>
      <p className="mt-2 text-sm text-slate-600">
        Meet neighbours, organise events, and keep your street in the loop. Register below to get started.
      </p>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex rounded-full bg-slate-100 p-1">
          <button
            onClick={() => setMode("register")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${mode === "register" ? "bg-primary text-white" : "text-slate-500"}`}
          >
            Register
          </button>
          <button
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${mode === "login" ? "bg-primary text-white" : "text-slate-500"}`}
          >
            Log in
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <label className="block text-sm font-medium text-slate-700">
                First name
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  value={form.firstName}
                  onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Postcode
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  value={form.postcode}
                  onChange={(e) => setForm((prev) => ({ ...prev, postcode: e.target.value }))}
                  required
                />
              </label>
            </>
          )}

          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow"
            disabled={loading}
          >
            {loading ? "Please wait..." : mode === "register" ? "Create account" : "Log in"}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-primary-dark">{message}</p>}
      </div>

      <p className="mt-6 text-xs text-slate-400">
        By continuing you agree to follow the community guidelines and be kind to your neighbours.
      </p>
    </div>
  );
}
