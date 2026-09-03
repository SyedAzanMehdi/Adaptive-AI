import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";

interface AuditEntry {
  _id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  meta: Record<string, unknown>;
  createdAt: string;
}

export default function AuditLogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["audit-log"],
    queryFn: async () => (await api.get<{ entries: AuditEntry[] }>("/admin/audit-log")).data.entries,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-black dark:text-white">Security & Audit Log</h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">Privileged admin actions, role modifications, and plan overrides, newest first.</p>
      </div>

      {isLoading ? (
        <p className="text-neutral-600 dark:text-neutral-400 text-xs">Loading audit entries...</p>
      ) : (data ?? []).length === 0 ? (
        <div className="card text-center p-6 text-neutral-600 dark:text-neutral-400 text-xs">No audit events recorded yet.</div>
      ) : (
        <div className="card !p-0 overflow-x-auto border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-white/80 dark:bg-neutral-950/80 text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 font-mono text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Action Event</th>
                <th className="px-4 py-3.5">Target Resource</th>
                <th className="px-4 py-3.5">Metadata Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60 font-mono">
              {(data ?? []).map((e) => (
                <tr key={e._id} className="hover:bg-neutral-100/40 dark:hover:bg-neutral-900/40 transition-colors text-neutral-700 dark:text-neutral-300">
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-[11px]">
                    {new Date(e.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-300">{e.action}</td>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                    <span className="text-neutral-600 dark:text-neutral-400">{e.targetType}</span>
                    {e.targetId ? `:${e.targetId.slice(0, 8)}` : ""}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 text-[11px]">
                    {Object.keys(e.meta ?? {}).length ? JSON.stringify(e.meta) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
