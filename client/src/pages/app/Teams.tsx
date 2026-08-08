import { Plus, Trash2, Users2 } from "lucide-react";
import { useState } from "react";
import { ApiClientError } from "../../api/client";
import { teamsApi } from "../../api/teams";
import { CreateTeamModal } from "../../components/modals/CreateTeamModal";
import { AvatarStack } from "../../components/ui/Avatar";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/States";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useFetch } from "../../hooks/useFetch";
import { canCreateTeam, canDeleteTeam } from "../../lib/permissions";
import type { Team } from "../../types";

export function Teams() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data, isLoading, error, refetch } = useFetch(() => teamsApi.list(), []);
  const [createOpen, setCreateOpen] = useState(false);

  if (!user) return null;

  const handleDelete = async (team: Team) => {
    if (!confirm(`Delete "${team.name}"? This cannot be undone.`)) return;
    try {
      await teamsApi.remove(team.id);
      showToast(`${team.name} deleted.`);
      refetch();
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Failed to delete team.", "error");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="font-heading text-xl font-bold text-foreground">Teams</h2>
        {canCreateTeam(user) && (
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
          >
            <Plus size={16} /> New Team
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingState label="Loading teams..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState icon={<Users2 size={28} />} title="No teams found" description="There are no teams connected to you yet." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((team) => {
            const tasks = team.tasks ?? [];
            const completed = tasks.filter((t) => t.status === "COMPLETED").length;
            const donePercent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
            const members = team.members.map((m) => m.user);

            return (
              <div key={team.id} className="flex flex-col rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading text-base font-semibold text-foreground">{team.name}</h3>
                    <p className="text-xs text-muted-foreground">{team.project?.name}</p>
                  </div>
                  {canDeleteTeam(user, team) && (
                    <button
                      onClick={() => handleDelete(team)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  Led by <span className="font-medium text-foreground">{team.leader.name}</span>
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <AvatarStack users={members} />
                  <span className="text-xs text-muted-foreground">{members.length} members</span>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tasks done</span>
                    <span className="font-mono-data">
                      {completed}/{tasks.length} ({donePercent}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${donePercent}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateTeamModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={refetch} />
    </div>
  );
}
