import { LayoutGrid, List, Plus, Search, Trash2, Pencil, FolderKanban } from "lucide-react";
import { useMemo, useState } from "react";
import { ApiClientError } from "../../api/client";
import { projectsApi } from "../../api/projects";
import { CreateProjectModal } from "../../components/modals/CreateProjectModal";
import { EditProjectModal } from "../../components/modals/EditProjectModal";
import { AvatarStack } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/States";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useFetch } from "../../hooks/useFetch";
import { PRIORITY_COLORS, STATUS_COLORS } from "../../lib/constants";
import { formatDate } from "../../lib/format";
import { canCreateProject, canDeleteProject, canEditProject } from "../../lib/permissions";
import type { Project, ProjectStatus } from "../../types";

export function Projects() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data, isLoading, error, refetch } = useFetch(() => projectsApi.list(), []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">("ALL");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const projects = useMemo(() => {
    if (!data) return [];
    return data.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) || p.courseCode.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

  if (!user) return null;

  const handleDelete = async (project: Project) => {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    try {
      await projectsApi.remove(project.id);
      showToast(`${project.name} deleted.`);
      refetch();
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Failed to delete project.", "error");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="font-heading text-xl font-bold text-foreground">Projects</h2>
        {canCreateProject(user) && (
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
          >
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "ALL")}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="ALL">All Statuses</option>
          <option value="PLANNING">Planning</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <div className="flex rounded-lg border border-border bg-white p-0.5">
          <button
            onClick={() => setView("grid")}
            className={`rounded-md p-1.5 ${view === "grid" ? "bg-accent text-primary" : "text-muted-foreground"}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded-md p-1.5 ${view === "list" ? "bg-accent text-primary" : "text-muted-foreground"}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState label="Loading projects..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={28} />}
          title="No projects found"
          description={data?.length ? "Try adjusting your filters." : "There are no projects connected to you yet."}
        />
      ) : (
        <div className={view === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
          {projects.map((project) => {
            const members = project.teams.flatMap((t) => t.members.map((m) => m.user));
            return (
              <div key={project.id} className="flex flex-col rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge className="border-border bg-muted text-muted-foreground">{project.courseCode}</Badge>
                    <Badge className={PRIORITY_COLORS[project.priority]}>{project.priority}</Badge>
                  </div>
                  <div className="flex gap-1">
                    {canEditProject(user, project) && (
                      <button
                        onClick={() => setEditingProject(project)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    {canDeleteProject(user, project) && (
                      <button
                        onClick={() => handleDelete(project)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="mt-3 font-heading text-base font-semibold text-foreground">{project.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description || "No description provided."}</p>

                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-mono-data">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {members.length > 0 ? <AvatarStack users={members} /> : <span className="text-xs text-muted-foreground">No members yet</span>}
                  <Badge className={STATUS_COLORS[project.status]}>{project.status.replace("_", " ")}</Badge>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                  <span>Supervisor: {project.supervisor.name}</span>
                  <span>Due {formatDate(project.deadline)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateProjectModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={refetch} />
      <EditProjectModal project={editingProject} onClose={() => setEditingProject(null)} onUpdated={refetch} />
    </div>
  );
}
