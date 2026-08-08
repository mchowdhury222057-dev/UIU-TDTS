import { FormEvent, useEffect, useState } from "react";
import { ApiClientError } from "../../api/client";
import { projectsApi } from "../../api/projects";
import { teamsApi } from "../../api/teams";
import { usersApi } from "../../api/users";
import { useToast } from "../../context/ToastContext";
import type { Project, User } from "../../types";
import { Field, Input, PrimaryButton, SecondaryButton, Select } from "../ui/Form";
import { Modal } from "../ui/Modal";

export function CreateTeamModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (name: string) => void;
}) {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [leaders, setLeaders] = useState<User[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([projectsApi.list(), usersApi.list()]).then(([projectList, users]) => {
      setProjects(projectList);
      if (projectList.length) setProjectId(projectList[0].id);
      const eligibleLeaders = users.filter(
        (u) => u.role === "LEADER" || u.role === "FACULTY" || u.role === "SUPER_ADMIN"
      );
      setLeaders(eligibleLeaders);
      if (eligibleLeaders.length) setLeaderId(eligibleLeaders[0].id);
      setMembers(users.filter((u) => u.role === "STUDENT"));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const toggleMember = (id: string) => {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const reset = () => {
    setName("");
    setMemberIds([]);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !projectId || !leaderId) {
      setError("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const team = await teamsApi.create({ name, projectId, leaderId, memberIds });
      showToast(`${team.name} created!`);
      onCreated(team.name);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to create team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Team" size="lg">
      <form onSubmit={handleSubmit}>
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Field label="Team Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Falcons" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Project" required>
            <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Team Leader" required>
            <Select value={leaderId} onChange={(e) => setLeaderId(e.target.value)}>
              {leaders.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.roleLabel})
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Members">
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
            {members.map((m) => (
              <label key={m.id} className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-muted">
                <input
                  type="checkbox"
                  checked={memberIds.includes(m.id)}
                  onChange={() => toggleMember(m.id)}
                  className="accent-primary"
                />
                {m.name}
              </label>
            ))}
            {members.length === 0 && <p className="px-1.5 py-1 text-sm text-muted-foreground">No members available.</p>}
          </div>
        </Field>
        <div className="mt-6 flex justify-end gap-2">
          <SecondaryButton type="button" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Team"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
