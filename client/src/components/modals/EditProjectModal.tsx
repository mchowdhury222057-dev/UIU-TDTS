import { FormEvent, useEffect, useState } from "react";
import { projectsApi } from "../../api/projects";
import { ApiClientError } from "../../api/client";
import { usersApi } from "../../api/users";
import { useToast } from "../../context/ToastContext";
import type { Priority, Project, ProjectStatus, User } from "../../types";
import { Field, Input, PrimaryButton, SecondaryButton, Select, TextArea } from "../ui/Form";
import { Modal } from "../ui/Modal";

export function EditProjectModal({
  project,
  onClose,
  onUpdated,
}: {
  project: Project | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { showToast } = useToast();
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [status, setStatus] = useState<ProjectStatus>("PLANNING");
  const [progress, setProgress] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!project) return;
    setName(project.name);
    setCourseCode(project.courseCode);
    setDescription(project.description || "");
    setPriority(project.priority);
    setStatus(project.status);
    setProgress(project.progress);
    setDeadline(project.deadline.slice(0, 10));
    setSupervisorId(project.supervisorId);
    setError(null);
    usersApi.list().then((users) => {
      setSupervisors(users.filter((u) => u.role === "FACULTY" || u.role === "SUPER_ADMIN"));
    });
  }, [project]);

  if (!project) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !courseCode.trim() || !deadline || !supervisorId) {
      setError("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      await projectsApi.update(project.id, {
        name,
        courseCode,
        description: description || undefined,
        priority,
        status,
        progress,
        deadline: new Date(deadline).toISOString(),
        supervisorId,
      });
      showToast(`${name} updated!`);
      onUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to update project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={Boolean(project)} onClose={onClose} title="Edit Project" size="lg">
      <form onSubmit={handleSubmit}>
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Field label="Project Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Course Code" required>
            <Input value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
          </Field>
          <Field label="Priority">
            <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>
          </Field>
        </div>
        <Field label="Description">
          <TextArea value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Deadline" required>
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
              <option value="PLANNING">Planning</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Progress (%)">
            <Input type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
          </Field>
          <Field label="Supervisor" required>
            <Select value={supervisorId} onChange={(e) => setSupervisorId(e.target.value)}>
              {supervisors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.roleLabel})
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <SecondaryButton type="button" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
