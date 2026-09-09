import { FormEvent, useEffect, useState } from "react";
import { ApiClientError } from "../../api/client";
import { helpApi } from "../../api/help";
import { useToast } from "../../context/ToastContext";
import type { HelpArticle } from "../../types";
import { Field, PrimaryButton, SecondaryButton, TextArea } from "../ui/Form";
import { Modal } from "../ui/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  // Pass an existing article to edit it; omit to create a new one.
  article?: HelpArticle | null;
}

export function HelpArticleModal({ isOpen, onClose, onSaved, article }: Props) {
  const { showToast } = useToast();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(article);

  useEffect(() => {
    if (!isOpen) return;
    setQuestion(article?.question ?? "");
    setAnswer(article?.answer ?? "");
    setError(null);
  }, [isOpen, article]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!question.trim() || !answer.trim()) {
      setError("Please fill in both the question and the answer.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEditing && article) {
        await helpApi.update(article.id, { question, answer });
        showToast("Help article updated!");
      } else {
        await helpApi.create({ question, answer });
        showToast("Help article added!");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to save help article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Question" : "Add Question"}>
      <form onSubmit={handleSubmit}>
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Field label="Question" required>
          <TextArea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. How do I reset my password?"
            className="min-h-[50px]"
          />
        </Field>
        <Field label="Answer" required>
          <TextArea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write a clear, concise answer..."
          />
        </Field>
        <div className="mt-6 flex justify-end gap-2">
          <SecondaryButton type="button" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Question"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
