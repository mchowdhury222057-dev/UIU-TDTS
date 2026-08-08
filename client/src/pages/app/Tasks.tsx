import { MessageSquare, Plus, Search, ListChecks } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { tasksApi } from "../../api/tasks";
import { CreateTaskModal } from "../../components/modals/CreateTaskModal";
import { TaskDetailModal } from "../../components/modals/TaskDetailModal";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/States";
import { PRIORITY_COLORS, TASK_STATUS_LABELS } from "../../lib/constants";
import { formatDate, isOverdue } from "../../lib/format";
import { useFetch } from "../../hooks/useFetch";
import type { TaskPriority, TaskStatus } from "../../types";

const PRIORITY_STRIPE: Record<TaskPriority, string> = {
  LOW: "border-l-blue-400",
  MEDIUM: "border-l-amber-400",
  HIGH: "border-l-orange-500",
  URGENT: "border-l-red-500",
};

export function Tasks() {
  const { data, isLoading, error, refetch } = useFetch(() => tasksApi.list(), []);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const tasks = useMemo(() => {
    if (!data) return [];
    return data.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
      const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [data, search, priorityFilter, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="font-heading text-xl font-bold text-foreground">Tasks</h2>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSearchParams(e.target.value ? { q: e.target.value } : {});
            }}
            placeholder="Search tasks..."
            className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "ALL")}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="ALL">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "ALL")}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="ALL">All Statuses</option>
          {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingState label="Loading tasks..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : tasks.length === 0 ? (
        <EmptyState icon={<ListChecks size={28} />} title="No tasks found" description={data?.length ? "Try adjusting your filters." : "No tasks assigned to you yet."} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              className={`flex flex-col rounded-2xl border border-l-4 border-border bg-card p-4 text-left transition hover:shadow-sm ${PRIORITY_STRIPE[task.priority]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading text-sm font-semibold text-foreground">{task.title}</h3>
                <Badge className={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description || "No description"}</p>

              <div className="mt-3 flex items-center gap-2">
                <Badge>{TASK_STATUS_LABELS[task.status]}</Badge>
                {isOverdue(task.dueDate, task.status) && <Badge className="border-red-200 bg-red-50 text-red-700">Overdue</Badge>}
              </div>

              {task.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {task.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${task.progress}%` }} />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  {task.assignee ? <Avatar user={task.assignee} size="sm" /> : <span>Unassigned</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={12} /> {task._count?.comments ?? 0}
                  </span>
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <CreateTaskModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={refetch} />
      <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} onChanged={refetch} />
    </div>
  );
}
