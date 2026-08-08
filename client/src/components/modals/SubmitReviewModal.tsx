import { FormEvent, useEffect, useState } from "react";
import { ApiClientError } from "../../api/client";
import { reviewsApi } from "../../api/reviews";
import { tasksApi } from "../../api/tasks";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import type { Task } from "../../types";
import { Field, PrimaryButton, SecondaryButton, Select } from "../ui/Form";
import { Modal } from "../ui/Modal";

export function SubmitReviewModal({
  isOpen,
  onClose,
  onSubmitted,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [taskId, setTaskId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    tasksApi.list().then((tasks) => {
      const owned = tasks.filter((t) => t.assigneeId === user.id && t.status !== "CANCELLED");
      setMyTasks(owned);
      setTaskId(owned[0]?.id ?? "");
    });
  }, [isOpen, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !taskId) {
      setError("Please select a task to submit.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await reviewsApi.create({ taskId, submittedById: user.id });
      showToast("Submitted for review!");
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to submit for review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit for Review">
      <form onSubmit={handleSubmit}>
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Field label="Task" required>
          <Select value={taskId} onChange={(e) => setTaskId(e.target.value)}>
            {myTasks.length === 0 ? (
              <option value="">No eligible tasks</option>
            ) : (
              myTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))
            )}
          </Select>
        </Field>
        <div className="mt-6 flex justify-end gap-2">
          <SecondaryButton type="button" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={isSubmitting || !taskId}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
