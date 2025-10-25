import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../features/auth/AuthContext";

export function AdminPage() {
  const { user } = useAuth();
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await api.get("/admin/stats");
      return response.data;
    },
  });

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await api.get("/admin/users");
      return response.data.users ?? [];
    },
  });

  const { data: reports } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const response = await api.get("/admin/reports");
      return response.data.reports ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-4 shadow">
        <h2 className="text-lg font-semibold text-slate-800">Site stats</h2>
        <dl className="mt-3 grid grid-cols-2 gap-4 text-sm text-slate-600">
          {stats ? (
            Object.entries(stats).map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs uppercase text-slate-400">{label}</dt>
                <dd className="text-xl font-semibold text-slate-900">{value as number}</dd>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Loading stats...</p>
          )}
        </dl>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow">
        <h2 className="text-lg font-semibold text-slate-800">Users</h2>
        <div className="mt-3 space-y-2 text-sm text-slate-600">
          {users?.map((user: any) => (
            <div key={user._id} className="rounded-xl bg-slate-50 p-3">
              <p className="font-medium text-slate-800">{user.firstName ?? "Neighbour"}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          ))}
          {users?.length === 0 && <p className="text-sm text-slate-500">No users yet.</p>}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow">
        <h2 className="text-lg font-semibold text-slate-800">Open reports</h2>
        <div className="mt-3 space-y-2 text-sm text-slate-600">
          {reports?.map((report: any) => (
            <div key={report._id} className="rounded-xl bg-rose-50 p-3">
              <p className="font-medium text-rose-700">{report.targetType}</p>
              <p className="text-xs text-rose-500">{report.reason}</p>
            </div>
          ))}
          {reports?.length === 0 && <p className="text-sm text-slate-500">All clear!</p>}
        </div>
      </section>
    </div>
  );
}
