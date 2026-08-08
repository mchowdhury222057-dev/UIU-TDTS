import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { ApiClientError } from "../../api/client";
import { permissionsApi } from "../../api/misc";
import { usersApi } from "../../api/users";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { ErrorState, LoadingState } from "../../components/ui/States";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useFetch } from "../../hooks/useFetch";
import { ALL_ROLES, roleLabel } from "../../lib/roleLabels";
import type { PermissionKey, Role } from "../../types";

const PERMISSION_ROWS: { key: PermissionKey; label: string }[] = [
  { key: "create", label: "Create" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
  { key: "assign", label: "Assign" },
  { key: "review", label: "Review" },
  { key: "approve", label: "Approve" },
  { key: "export", label: "Export" },
  { key: "manageUsers", label: "Manage Users" },
  { key: "manageRoles", label: "Manage Roles" },
  { key: "manageReports", label: "Manage Reports" },
];

export function Roles() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const { data: users, isLoading, error, refetch } = useFetch(() => usersApi.list(), []);
  const { data: matrix } = useFetch(() => permissionsApi.matrix(), []);
  const [savingId, setSavingId] = useState<string | null>(null);

  if (!currentUser) return null;
  if (isLoading) return <LoadingState label="Loading users..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const handleRoleChange = async (userId: string, role: Role) => {
    setSavingId(userId);
    try {
      await usersApi.updateRole(userId, role);
      showToast("Role updated.");
      refetch();
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Failed to update role.", "error");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheck size={20} className="text-primary" />
        <h2 className="font-heading text-xl font-bold text-foreground">Roles & Permissions</h2>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <p className="border-b border-border px-4 py-3 font-heading text-sm font-semibold text-foreground">User Role Assignment</p>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">User</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Department</th>
              <th className="px-4 py-2.5 font-medium">Current Role</th>
              <th className="px-4 py-2.5 font-medium">Title</th>
              <th className="px-4 py-2.5 font-medium">Change Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users?.map((u) => {
              const isSelf = u.id === currentUser.id;
              const isProtectedAdmin = u.role === "SUPER_ADMIN" && !isSelf;
              const locked = isSelf || u.role === "SUPER_ADMIN";
              return (
                <tr key={u.id}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar user={u} size="sm" />
                      <span className="font-medium text-foreground">{u.name}</span>
                      {isSelf && <Badge className="border-blue-200 bg-blue-50 text-blue-700">You</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{u.department || "—"}</td>
                  <td className="px-4 py-2.5">
                    <Badge className="border-border bg-muted text-muted-foreground">{roleLabel(u.role)}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{u.title || "—"}</td>
                  <td className="px-4 py-2.5">
                    {locked ? (
                      <span className="text-xs text-muted-foreground">{isProtectedAdmin ? "Protected" : "Locked"}</span>
                    ) : (
                      <select
                        value={u.role}
                        disabled={savingId === u.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        {ALL_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {roleLabel(r)}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {matrix && (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <p className="border-b border-border px-4 py-3 font-heading text-sm font-semibold text-foreground">Permission Matrix</p>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Permission</th>
                {ALL_ROLES.map((r) => (
                  <th key={r} className="px-4 py-2.5 text-center font-medium">
                    {roleLabel(r)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PERMISSION_ROWS.map((row) => (
                <tr key={row.key}>
                  <td className="px-4 py-2.5 font-medium text-foreground">{row.label}</td>
                  {ALL_ROLES.map((r) => (
                    <td key={r} className="px-4 py-2.5 text-center">
                      {matrix[r][row.key] ? (
                        <span className="text-emerald-600">✓</span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
