import { FormEvent, useEffect, useState } from "react";
import { projectsApi } from "../../api/projects";
import { ApiClientError } from "../../api/client";
import { usersApi } from "../../api/users";
import { useToast } from "../../context/ToastContext";
import type { Priority, ProjectStatus, User } from "../../types";
import { Field, Input, PrimaryButton, SecondaryButton, Select, TextArea } from "../ui/Form";
import { Modal } from "../ui/Modal";

export function CreateProjectModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (name: string) => void;
}) {
  const { showToast } = useToast();
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [status, setStatus] = useState<ProjectStatus>("PLANNING");
  const [deadline, setDeadline] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    usersApi.list().then((users) => {
      const eligible = users.filter((u) => u.role === "FACULTY" || u.role === "SUPER_ADMIN");
      setSupervisors(eligible);
      if (eligible.length && !supervisorId) setSupervisorId(eligible[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const reset = () => {
    setName("");
    setCourseCode("");
    setDescription("");
    setPriority("MEDIUM");
    setStatus("PLANNING");
    setDeadline("");
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !courseCode.trim() || !deadline || !supervisorId) {
      setError("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const project = await projectsApi.create({
        name,
        courseCode,
        description: description || undefined,
        priority,
        status,
        deadline: new Date(deadline).toISOString(),
        supervisorId,
      });
      showToast(`${project.name} created!`);
      onCreated(project.name);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to create project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Project" size="lg">
      <form onSubmit={handleSubmit}>
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Field label="Project Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. AI-Powered Attendance System" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Course Code" required>
            <Input value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="e.g. CSE327" />
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
          <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Briefly describe the project scope..." />
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
        <Field label="Supervisor" required>
          <Select value={supervisorId} onChange={(e) => setSupervisorId(e.target.value)}>
            {supervisors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.roleLabel})
              </option>
            ))}
          </Select>
        </Field>
        <div className="mt-6 flex justify-end gap-2">
          <SecondaryButton type="button" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Project"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
