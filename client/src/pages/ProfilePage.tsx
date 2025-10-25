import { FormEvent, useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { api } from "../lib/api";
import { Link } from "react-router-dom";

export function ProfilePage() {
  const { user, logout } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [addressForm, setAddressForm] = useState({ line1: "", line2: "", postcode: "", town: "", streetName: "" });

  if (!user) return null;

  const handleJoinAddress = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await api.post("/addresses/join", addressForm);
      setMessage(response.data.message ?? "Address request submitted.");
    } catch (error: any) {
      setMessage(error?.response?.data?.message ?? "Could not update address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-4 shadow">
        <h2 className="text-lg font-semibold text-slate-800">Your profile</h2>
        <dl className="mt-3 space-y-2 text-sm text-slate-600">
          <div>
            <dt className="font-medium text-slate-500">Name</dt>
            <dd>{user.firstName}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Verification</dt>
            <dd>{user.emailVerifiedAt ? "Verified" : "Pending verification"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Address role</dt>
            <dd>{user.addressRole ?? "Not linked"}</dd>
          </div>
        </dl>
        <button onClick={logout} className="mt-4 rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
          Log out
        </button>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow">
        <h3 className="text-lg font-semibold text-slate-800">Join or create your address</h3>
        <form className="mt-3 space-y-3" onSubmit={handleJoinAddress}>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            placeholder="Address line 1"
            value={addressForm.line1}
            onChange={(e) => setAddressForm((prev) => ({ ...prev, line1: e.target.value }))}
            required
          />
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            placeholder="Address line 2 (optional)"
            value={addressForm.line2}
            onChange={(e) => setAddressForm((prev) => ({ ...prev, line2: e.target.value }))}
          />
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            placeholder="Street name"
            value={addressForm.streetName}
            onChange={(e) => setAddressForm((prev) => ({ ...prev, streetName: e.target.value }))}
            required
          />
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            placeholder="Town"
            value={addressForm.town}
            onChange={(e) => setAddressForm((prev) => ({ ...prev, town: e.target.value }))}
            required
          />
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            placeholder="Postcode"
            value={addressForm.postcode}
            onChange={(e) => setAddressForm((prev) => ({ ...prev, postcode: e.target.value }))}
            required
          />
          <button className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white" disabled={loading}>
            {loading ? "Submitting..." : "Send request"}
          </button>
        </form>
        {message && <p className="mt-3 text-sm text-primary-dark">{message}</p>}
      </section>

      {user.addressRole === "OWNER" && (
        <section className="rounded-2xl bg-white p-4 shadow">
          <h3 className="text-lg font-semibold text-slate-800">Owner tools</h3>
          <p className="mt-2 text-sm text-slate-600">
            Approve neighbours from the admin console until a richer owner dashboard arrives.
          </p>
        </section>
      )}

      {user.isAdmin && (
        <Link to="/admin" className="block rounded-2xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white shadow">
          Go to admin console
        </Link>
      )}
    </div>
  );
}
