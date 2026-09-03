import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Crown } from "lucide-react";
import api, { apiErrorMessage } from "../../lib/api";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  plan: "free" | "premium";
  status: "active" | "suspended";
  profile: { levelTier: string; learningStyle: string };
  createdAt: string;
}

export default function Users() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await api.get<{ users: AdminUser[] }>("/admin/users")).data.users,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const create = useMutation({
    mutationFn: () => api.post("/admin/users", form),
    onSuccess: () => {
      invalidate();
      setShowCreate(false);
      setForm({ name: "", email: "", password: "", role: "student" });
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const patch = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.patch(`/admin/users/${id}`, body),
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-black dark:text-white">User Management</h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">View, suspend, update roles, or grant Adaptive+ Premium permissions.</p>
        </div>
        <button className="btn-primary text-xs" onClick={() => { setShowCreate((v) => !v); setError(""); }}>
          {showCreate ? "Cancel" : "+ Provision New User"}
        </button>
      </div>

      {showCreate && (
        <div className="card border-black/30 dark:border-white/30">
          <h2 className="font-bold text-black dark:text-white text-sm mb-3">Provision User Account</h2>
          {error && <div className="bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300 rounded-xl p-3 mb-3 text-xs">{error}</div>}
          <div className="grid md:grid-cols-4 gap-3">
            <input className="input" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="input" placeholder="Password (min 8)" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="student">student</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <button className="btn-amber text-xs font-bold mt-4" disabled={create.isPending} onClick={() => create.mutate()}>
            {create.isPending ? "Provisioning..." : "Create Account"}
          </button>
        </div>
      )}

      <div className="card !p-0 overflow-x-auto border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-white/80 dark:bg-neutral-950/80 text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 font-mono text-[11px] uppercase tracking-wider">
              <th className="px-4 py-3.5">Name</th>
              <th className="px-4 py-3.5">Email</th>
              <th className="px-4 py-3.5">Role</th>
              <th className="px-4 py-3.5">Plan</th>
              <th className="px-4 py-3.5">Level</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
            {(users ?? []).map((u) => (
              <tr key={u.id} className="hover:bg-neutral-100/40 dark:hover:bg-neutral-900/40 transition-colors">
                <td className="px-4 py-3 font-semibold text-neutral-800 dark:text-neutral-200">{u.name}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 border ${
                    u.role === "admin" ? "bg-black/5 dark:bg-white/5 border-black/30 dark:border-white/30 text-neutral-800 dark:text-neutral-200" : "bg-black/5 dark:bg-white/10 border-black/30 dark:border-white/30 text-neutral-700 dark:text-neutral-300"
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 border inline-flex items-center gap-1 ${
                    u.plan === "premium" ? "bg-black/10 dark:bg-white/10 border-black/40 dark:border-white/40 text-neutral-800 dark:text-neutral-200 shadow-lg" : "bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                  }`}>
                    {u.plan === "premium" ? (
                      <>
                        <Crown size={11} strokeWidth={2.6} />
                        Adaptive+
                      </>
                    ) : (
                      "Free"
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 capitalize">{u.profile.levelTier}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 border ${
                    u.status === "active" ? "bg-black/5 dark:bg-white/5 border-black/30 dark:border-white/30 text-neutral-700 dark:text-neutral-300" : "bg-black/5 dark:bg-white/5 border-black/30 dark:border-white/30 text-neutral-600 dark:text-neutral-400"
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 space-x-2 whitespace-nowrap font-medium">
                  <button
                    className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                    onClick={() => patch.mutate({ id: u.id, body: { status: u.status === "active" ? "suspended" : "active" } })}
                  >
                    {u.status === "active" ? "Suspend" : "Activate"}
                  </button>
                  <button
                    className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                    onClick={() => patch.mutate({ id: u.id, body: { role: u.role === "admin" ? "student" : "admin" } })}
                  >
                    {u.role === "admin" ? "Demote" : "Promote"}
                  </button>
                  <button
                    className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors inline-flex items-center gap-1"
                    onClick={() => patch.mutate({ id: u.id, body: { plan: u.plan === "premium" ? "free" : "premium" } })}
                  >
                    <Crown size={12} strokeWidth={2.4} />
                    {u.plan === "premium" ? "Revoke" : "Grant"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
