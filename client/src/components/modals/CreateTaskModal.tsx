import { FormEvent, useEffect, useMemo, useState } from "react";
import { ApiClientError } from "../../api/client";
import { projectsApi } from "../../api/projects";
import { sprintsApi } from "../../api/sprints";
import { tasksApi } from "../../api/tasks";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import type { Project, Sprint, TaskPriority, TaskStatus, User } from "../../types";
import { Field, Input, PrimaryButton, SecondaryButton, Select } from "../ui/Form";
import { Modal } from "../ui/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (title: string) => void;
  defaultProjectId?: string;
  defaultTeamId?: string;
  defaultStatus?: TaskStatus;
  defaultSprintId?: string;
}

export function CreateTaskModal({ isOpen, onClose, onCreated, defaultProjectId, defaultTeamId, defaultStatus, defaultSprintId }: Props) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [projectId, setProjectId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [sprintId, setSprintId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([projectsApi.list(), sprintsApi.list()]).then(([projectList, sprintList]) => {
      setProjects(projectList);
      setSprints(sprintList);
      const initialProjectId = defaultProjectId || projectList[0]?.id || "";
      setProjectId(initialProjectId);
    });
    setTeamId(defaultTeamId || "");
    setSprintId(defaultSprintId || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultProjectId, defaultTeamId, defaultSprintId]);

  const selectedProject = projects.find((p) => p.id === projectId);
  const availableTeams = selectedProject?.teams ?? [];
  const availableSprints = sprints.filter((s) => s.projectId === projectId);

  const assigneeOptions: User[] = useMemo(() => {
    if (!user) return [];
    const team = availableTeams.find((t) => t.id === teamId);
    const pool = team
      ? team.members.map((m) => m.user)
      : availableTeams.flatMap((t) => t.members.map((m) => m.user));
    const unique = new Map(pool.map((u) => [u.id, u]));
    if (!unique.has(user.id)) unique.set(user.id, user);
    return Array.from(unique.values());
  }, [availableTeams, teamId, user]);

  useEffect(() => {
    if (!user) return;
    if (user.role === "STUDENT") {
      setAssigneeId(user.id);
    } else if (!assigneeOptions.find((a) => a.id === assigneeId)) {
      setAssigneeId(assigneeOptions[0]?.id ?? user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assigneeOptions, user]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setDueDate("");
    setTags("");
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !projectId) {
      setError("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const task = await tasksApi.create({
        title,
        description: description || undefined,
        priority,
        status: defaultStatus,
        assigneeId: assigneeId || undefined,
        projectId,
        teamId: teamId || undefined,
        sprintId: sprintId || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      showToast(`${task.title} created!`);
      onCreated(task.title);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to create task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Task" size="lg">
      <form onSubmit={handleSubmit}>
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Field label="Task Title" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Build login page" />
        </Field>
        <Field label="Description">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Project" required>
            <Select value={projectId} onChange={(e) => { setProjectId(e.target.value); setTeamId(""); setSprintId(""); }}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Team">
            <Select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              <option value="">No specific team</option>
              {availableTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Sprint">
          <Select value={sprintId} onChange={(e) => setSprintId(e.target.value)}>
            <option value="">No sprint (backlog)</option>
            {availableSprints.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Priority">
            <Select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </Select>
          </Field>
          <Field label="Assign To">
            <Select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              disabled={user?.role === "STUDENT"}
            >
              {assigneeOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id === user?.id ? `${a.name} (Me)` : a.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Due Date">
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>
          <Field label="Tags">
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="comma, separated, tags" />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <SecondaryButton type="button" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Task"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
