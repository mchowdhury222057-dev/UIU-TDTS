import { CalendarRange, CornerDownLeft, Plus, Trash2 } from "lucide-react";
import { DragEvent, useEffect, useMemo, useState } from "react";
import { ApiClientError } from "../../api/client";
import { projectsApi } from "../../api/projects";
import { sprintsApi } from "../../api/sprints";
import { tasksApi } from "../../api/tasks";
import { CreateSprintModal } from "../../components/modals/CreateSprintModal";
import { CreateTaskModal } from "../../components/modals/CreateTaskModal";
import { TaskDetailModal } from "../../components/modals/TaskDetailModal";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Select } from "../../components/ui/Form";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/States";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useFetch } from "../../hooks/useFetch";
import { formatDate } from "../../lib/format";
import { KANBAN_COLUMNS, PRIORITY_COLORS, SPRINT_STATUS_COLORS } from "../../lib/constants";
import { canCreateSprint, canDeleteSprint, canEditSprint } from "../../lib/permissions";
import type { Project, Sprint, SprintStatus, Task, TaskStatus } from "../../types";

// Stable, module-level singletons — reusing the exact same empty-array
// reference on every render while data is still loading. A fresh `[]`
// literal in the fallback below would be a *new* (but still truthy)
// reference each render, which would re-trigger any effect watching it
// and infinite-loop before the fetch ever resolves.
const EMPTY_PROJECTS: Project[] = [];
const EMPTY_SPRINTS: Sprint[] = [];
const EMPTY_TASKS: Task[] = [];

function useSprintData() {
  return useFetch(
    () => Promise.all([projectsApi.list(), sprintsApi.list(), tasksApi.list()]),
    []
  );
}

function daysLabel(sprint: Sprint): string {
  const now = Date.now();
  const start = new Date(sprint.startDate).getTime();
  const end = new Date(sprint.endDate).getTime();
  const DAY = 24 * 60 * 60 * 1000;
  if (now < start) return `Starts in ${Math.ceil((start - now) / DAY)}d`;
  if (now > end) return `Ended ${Math.ceil((now - end) / DAY)}d ago`;
  return `${Math.ceil((end - now) / DAY)}d left`;
}

export function SprintBoard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data, isLoading, error, refetch } = useSprintData();

  const [projectId, setProjectId] = useState("");
  const [sprintId, setSprintId] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [createSprintOpen, setCreateSprintOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createTaskStatus, setCreateTaskStatus] = useState<TaskStatus>("BACKLOG");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const projects = data?.[0] ?? EMPTY_PROJECTS;
  const sprints = data?.[1] ?? EMPTY_SPRINTS;
  const allTasks = data?.[2] ?? EMPTY_TASKS;

  useEffect(() => {
    if (allTasks) setTasks(allTasks);
  }, [allTasks]);

  useEffect(() => {
    if (!projects || projects.length === 0) return;
    if (!projectId || !projects.find((p) => p.id === projectId)) {
      setProjectId(projects[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  const projectSprints = useMemo(
    () =>
      (sprints ?? [])
        .filter((s) => s.projectId === projectId)
        .sort((a, b) => {
          if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
          if (b.status === "ACTIVE" && a.status !== "ACTIVE") return 1;
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        }),
    [sprints, projectId]
  );

  useEffect(() => {
    if (projectSprints.length === 0) {
      setSprintId("");
      return;
    }
    if (!sprintId || !projectSprints.find((s) => s.id === sprintId)) {
      setSprintId(projectSprints[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectSprints]);

  const selectedSprint = projectSprints.find((s) => s.id === sprintId) ?? null;

  const sprintTasks = useMemo(
    () => (selectedSprint ? tasks.filter((t) => t.sprintId === selectedSprint.id) : []),
    [tasks, selectedSprint]
  );

  const unplannedTasks = useMemo(
    () => tasks.filter((t) => t.projectId === projectId && !t.sprintId),
    [tasks, projectId]
  );

  const columns = useMemo(() => {
    const map = new Map<TaskStatus, Task[]>();
    KANBAN_COLUMNS.forEach((c) => map.set(c.status, []));
    sprintTasks.forEach((t) => map.get(t.status)?.push(t));
    return map;
  }, [sprintTasks]);

  const sprintProgress = useMemo(() => {
    if (sprintTasks.length === 0) return 0;
    const completed = sprintTasks.filter((t) => t.status === "COMPLETED").length;
    return Math.round((completed / sprintTasks.length) * 100);
  }, [sprintTasks]);

  const handleDrop = async (status: TaskStatus, e: DragEvent) => {
    e.preventDefault();
    setDragOverStatus(null);
    const taskId = e.dataTransfer.getData("text/plain") || draggingId;
    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === status) return;

    const previous = tasks;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    try {
      await tasksApi.updateStatus(taskId, status);
    } catch (err) {
      setTasks(previous);
      showToast(err instanceof ApiClientError ? err.message : "Failed to move task.", "error");
    }
  };

  const addToSprint = async (task: Task) => {
    if (!selectedSprint) return;
    const previous = tasks;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, sprintId: selectedSprint.id } : t)));
    try {
      await tasksApi.update(task.id, { sprintId: selectedSprint.id });
      showToast(`Added "${task.title}" to ${selectedSprint.name}.`);
    } catch (err) {
      setTasks(previous);
      showToast(err instanceof ApiClientError ? err.message : "Failed to add task to sprint.", "error");
    }
  };

  const removeFromSprint = async (task: Task) => {
    const previous = tasks;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, sprintId: null } : t)));
    try {
      await tasksApi.update(task.id, { sprintId: null });
    } catch (err) {
      setTasks(previous);
      showToast(err instanceof ApiClientError ? err.message : "Failed to move task back to backlog.", "error");
    }
  };

  const handleSprintStatusChange = async (status: SprintStatus) => {
    if (!selectedSprint) return;
    try {
      await sprintsApi.update(selectedSprint.id, { status });
      refetch();
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Failed to update sprint.", "error");
    }
  };

  const handleDeleteSprint = async () => {
    if (!selectedSprint) return;
    if (!confirm(`Delete "${selectedSprint.name}"? Tasks in it will move back to the backlog.`)) return;
    try {
      await sprintsApi.remove(selectedSprint.id);
      showToast(`${selectedSprint.name} deleted.`);
      setSprintId("");
      refetch();
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Failed to delete sprint.", "error");
    }
  };

  if (!user) return null;
  if (isLoading) return <LoadingState label="Loading sprint board..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="font-heading text-xl font-bold text-foreground">Sprint Board</h2>
        {canCreateSprint(user) && (
          <button
            onClick={() => setCreateSprintOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
          >
            <Plus size={16} /> New Sprint
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="sm:max-w-xs">
          {(projects ?? []).map((p: Project) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        {projectSprints.length > 0 && (
          <Select value={sprintId} onChange={(e) => setSprintId(e.target.value)} className="sm:max-w-xs">
            {projectSprints.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        )}
      </div>

      {!selectedSprint ? (
        <EmptyState
          icon={<CalendarRange size={28} />}
          title="No sprints yet"
          description={canCreateSprint(user) ? "Create a sprint to start planning work for this project." : "This project has no sprints yet."}
        />
      ) : (
        <>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-base font-semibold text-foreground">{selectedSprint.name}</h3>
                  <Badge className={SPRINT_STATUS_COLORS[selectedSprint.status]}>{selectedSprint.status}</Badge>
                </div>
                {selectedSprint.goal && <p className="mt-1 max-w-xl text-sm text-muted-foreground">{selectedSprint.goal}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(selectedSprint.startDate)} – {formatDate(selectedSprint.endDate)} · {daysLabel(selectedSprint)}
                </p>
              </div>
              {canEditSprint(user, selectedSprint) && (
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedSprint.status}
                    onChange={(e) => handleSprintStatusChange(e.target.value as SprintStatus)}
                    className="w-auto"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                  </Select>
                  {canDeleteSprint(user, selectedSprint) && (
                    <button
                      onClick={handleDeleteSprint}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                      title="Delete sprint"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Sprint progress</span>
                <span className="font-mono-data">
                  {sprintTasks.filter((t) => t.status === "COMPLETED").length}/{sprintTasks.length} tasks ({sprintProgress}%)
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${sprintProgress}%` }} />
              </div>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4">
            {KANBAN_COLUMNS.map((col) => {
              const colTasks = columns.get(col.status) ?? [];
              return (
                <div
                  key={col.status}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverStatus(col.status);
                  }}
                  onDragLeave={() => setDragOverStatus((s) => (s === col.status ? null : s))}
                  onDrop={(e) => handleDrop(col.status, e)}
                  className={`flex w-72 shrink-0 flex-col rounded-2xl border bg-muted/40 p-3 transition ${
                    dragOverStatus === col.status ? "border-primary bg-accent/50" : "border-border"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between px-1">
                    <p className="text-sm font-semibold text-foreground">{col.label}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {colTasks.length}
                      </span>
                      <button
                        onClick={() => {
                          setCreateTaskStatus(col.status);
                          setCreateTaskOpen(true);
                        }}
                        className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-white"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="flex min-h-[60px] flex-col gap-2">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => {
                          setDraggingId(task.id);
                          e.dataTransfer.setData("text/plain", task.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => setDraggingId(null)}
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`cursor-grab rounded-xl border border-border bg-white p-3 text-left shadow-sm transition active:cursor-grabbing ${
                          draggingId === task.id ? "opacity-40" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">{task.title}</p>
                          <Badge className={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                          {task.assignee ? <Avatar user={task.assignee} size="sm" /> : <span>Unassigned</span>}
                          <span>{formatDate(task.dueDate)}</span>
                        </div>
                        {canCreateSprint(user) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromSprint(task);
                            }}
                            title="Move back to backlog"
                            className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                          >
                            <CornerDownLeft size={11} /> Move to backlog
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {canCreateSprint(user) && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-4">
              <p className="mb-2 text-sm font-semibold text-foreground">
                Unplanned backlog <span className="font-normal text-muted-foreground">({unplannedTasks.length})</span>
              </p>
              {unplannedTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Every task in this project is already in a sprint.</p>
              ) : (
                <div className="space-y-1.5">
                  {unplannedTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 hover:bg-muted">
                      <button onClick={() => setSelectedTaskId(task.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                        <Badge className={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
                        <span className="truncate text-sm text-foreground">{task.title}</span>
                      </button>
                      {task.assignee && <Avatar user={task.assignee} size="sm" />}
                      <button
                        onClick={() => addToSprint(task)}
                        className="shrink-0 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-white"
                      >
                        Add to Sprint
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <CreateSprintModal
        isOpen={createSprintOpen}
        onClose={() => setCreateSprintOpen(false)}
        onCreated={(sprint) => {
          refetch();
          setProjectId(sprint.projectId);
          setSprintId(sprint.id);
        }}
        defaultProjectId={projectId}
      />
      <CreateTaskModal
        isOpen={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        onCreated={refetch}
        defaultProjectId={projectId}
        defaultSprintId={selectedSprint?.id}
        defaultStatus={createTaskStatus}
      />
      <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} onChanged={refetch} />
    </div>
  );
}
