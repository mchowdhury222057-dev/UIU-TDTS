import { Plus } from "lucide-react";
import { DragEvent, useEffect, useMemo, useState } from "react";
import { ApiClientError } from "../../api/client";
import { tasksApi } from "../../api/tasks";
import { CreateTaskModal } from "../../components/modals/CreateTaskModal";
import { TaskDetailModal } from "../../components/modals/TaskDetailModal";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { ErrorState, LoadingState } from "../../components/ui/States";
import { useToast } from "../../context/ToastContext";
import { useFetch } from "../../hooks/useFetch";
import { KANBAN_COLUMNS, PRIORITY_COLORS } from "../../lib/constants";
import { formatDate } from "../../lib/format";
import type { Task, TaskStatus } from "../../types";

export function Kanban() {
  const { data, isLoading, error, refetch } = useFetch(() => tasksApi.list(), []);
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>("BACKLOG");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (data) setTasks(data);
  }, [data]);

  const columns = useMemo(() => {
    const map = new Map<TaskStatus, Task[]>();
    KANBAN_COLUMNS.forEach((c) => map.set(c.status, []));
    tasks.forEach((t) => map.get(t.status)?.push(t));
    return map;
  }, [tasks]);

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

  if (isLoading) return <LoadingState label="Loading kanban board..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-foreground">Kanban Board</h2>
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
                      setCreateStatus(col.status);
                      setCreateOpen(true);
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
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <CreateTaskModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refetch}
        defaultStatus={createStatus}
      />
      <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} onChanged={refetch} />
    </div>
  );
}
