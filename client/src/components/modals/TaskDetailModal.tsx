import { CheckCircle2, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { ApiClientError } from "../../api/client";
import { tasksApi } from "../../api/tasks";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { KANBAN_COLUMNS, PRIORITY_COLORS, TASK_STATUS_LABELS } from "../../lib/constants";
import { formatDate, timeAgo } from "../../lib/format";
import { canChangeTaskStatus } from "../../lib/permissions";
import type { Task } from "../../types";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { PrimaryButton, Select, TextArea } from "../ui/Form";
import { Modal } from "../ui/Modal";

export function TaskDetailModal({
  taskId,
  onClose,
  onChanged,
}: {
  taskId: string | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const load = async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      const result = await tasksApi.get(taskId);
      setTask(result);
      setProgressValue(result.progress);
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Failed to load task.", "error");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    setComment("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  if (!taskId) return null;

  const editable = Boolean(user && task && canChangeTaskStatus(user, task));

  const applyTaskUpdate = (updated: Task) => {
    setTask((prev) => (prev ? { ...prev, status: updated.status, progress: updated.progress } : prev));
    setProgressValue(updated.progress);
    onChanged();
  };

  const handleStatusChange = async (status: Task["status"]) => {
    try {
      const updated = await tasksApi.updateStatus(taskId, status);
      applyTaskUpdate(updated);
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Failed to update status.", "error");
    }
  };

  const commitProgress = async (value: number) => {
    if (!task || value === task.progress) return;
    try {
      const updated = await tasksApi.update(taskId, { progress: value });
      applyTaskUpdate(updated);
    } catch (err) {
      setProgressValue(task.progress);
      showToast(err instanceof ApiClientError ? err.message : "Failed to update progress.", "error");
    }
  };

  const handleComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmittingComment(true);
    try {
      await tasksApi.addComment(taskId, comment);
      setComment("");
      await load();
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Failed to add comment.", "error");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    try {
      await tasksApi.remove(task.id);
      showToast(`${task.title} deleted.`);
      onChanged();
      onClose();
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Failed to delete task.", "error");
    }
  };

  return (
    <Modal isOpen={Boolean(taskId)} onClose={onClose} title={isLoading || !task ? "Task" : task.title} size="lg">
      {isLoading || !task ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading task...</p>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
            {editable ? (
              <Select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value as Task["status"])}
                className="w-auto"
              >
                {KANBAN_COLUMNS.map((c) => (
                  <option key={c.status} value={c.status}>
                    {c.label}
                  </option>
                ))}
              </Select>
            ) : (
              <Badge>{TASK_STATUS_LABELS[task.status]}</Badge>
            )}
            {task.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
            <div className="ml-auto">
              {(user?.id === task.createdById || user?.role === "SUPER_ADMIN") && (
                <button
                  onClick={handleDelete}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                  title="Delete task"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-foreground">{task.description || "No description provided."}</p>

          <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/60 p-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Assignee</p>
              <div className="mt-1 flex items-center gap-1.5">
                {task.assignee ? (
                  <>
                    <Avatar user={task.assignee} size="sm" />
                    <span className="text-foreground">{task.assignee.name}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Due Date</p>
              <p className="mt-1 font-mono-data text-foreground">{formatDate(task.dueDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Project</p>
              <p className="mt-1 text-foreground">{task.project.name}</p>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress {editable && <span className="text-foreground/60">— update it yourself as you go</span>}</span>
              <span className="font-mono-data">{progressValue}%</span>
            </div>
            {editable ? (
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={progressValue}
                  onChange={(e) => setProgressValue(Number(e.target.value))}
                  onMouseUp={() => commitProgress(progressValue)}
                  onTouchEnd={() => commitProgress(progressValue)}
                  onKeyUp={() => commitProgress(progressValue)}
                  className="h-1.5 flex-1 cursor-pointer accent-primary"
                />
                {task.status !== "COMPLETED" && task.status !== "CANCELLED" && (
                  <button
                    onClick={() => commitProgress(100)}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    <CheckCircle2 size={13} /> Mark Complete
                  </button>
                )}
              </div>
            ) : (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${task.progress}%` }} />
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">Comments ({task.comments?.length ?? 0})</p>
            <div className="max-h-48 space-y-3 overflow-y-auto">
              {task.comments?.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar user={c.user} size="sm" />
                  <div className="min-w-0 flex-1 rounded-lg bg-muted/60 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{c.user.name}</p>
                      <p className="text-[11px] text-muted-foreground">{timeAgo(c.createdAt)}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-foreground">{c.comment}</p>
                  </div>
                </div>
              ))}
              {(!task.comments || task.comments.length === 0) && (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              )}
            </div>
            <form onSubmit={handleComment} className="mt-3 flex gap-2">
              <TextArea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="min-h-[44px] flex-1"
              />
              <PrimaryButton type="submit" disabled={isSubmittingComment || !comment.trim()}>
                Post
              </PrimaryButton>
            </form>
          </div>
        </div>
      )}
    </Modal>
  );
}
