import { FormEvent, useEffect, useState } from "react";
import { ApiClientError } from "../../api/client";
import { projectsApi } from "../../api/projects";
import { sprintsApi } from "../../api/sprints";
import { useToast } from "../../context/ToastContext";
import type { Project, Sprint, SprintStatus } from "../../types";
import { Field, Input, PrimaryButton, SecondaryButton, Select, TextArea } from "../ui/Form";
import { Modal } from "../ui/Modal";

export function CreateSprintModal({
  isOpen,
  onClose,
  onCreated,
  defaultProjectId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (sprint: Sprint) => void;
  defaultProjectId?: string;
}) {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState<SprintStatus>("PLANNING");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    projectsApi.list().then((list) => {
      setProjects(list);
      setProjectId(defaultProjectId || list[0]?.id || "");
    });
    const today = new Date();
    const twoWeeksOut = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    setStartDate(today.toISOString().slice(0, 10));
    setEndDate(twoWeeksOut.toISOString().slice(0, 10));
    setStatus("PLANNING");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultProjectId]);

  const reset = () => {
    setName("");
    setGoal("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !projectId || !startDate || !endDate) {
      setError("Please fill in all required fields.");
      return;
    }
    if (endDate < startDate) {
      setError("End date must be on or after the start date.");
      return;
    }
    setIsSubmitting(true);
    try {
      const sprint = await sprintsApi.create({
        name,
        goal: goal || undefined,
        projectId,
        status,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      showToast(`${sprint.name} created!`);
      onCreated(sprint);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to create sprint.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Sprint" size="lg">
      <form onSubmit={handleSubmit}>
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Field label="Sprint Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sprint 3: Polish & QA" />
        </Field>
        <Field label="Project" required>
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Goal">
          <TextArea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="What should this sprint accomplish?" className="min-h-[70px]" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date" required>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>
          <Field label="End Date" required>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </Field>
        </div>
        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value as SprintStatus)}>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
          </Select>
        </Field>
        <div className="mt-6 flex justify-end gap-2">
          <SecondaryButton type="button" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Sprint"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
