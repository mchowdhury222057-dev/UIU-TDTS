import { CheckCircle2, ClipboardCheck, Plus, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";
import { ApiClientError } from "../../api/client";
import { reviewsApi } from "../../api/reviews";
import { SubmitReviewModal } from "../../components/modals/SubmitReviewModal";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/States";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useFetch } from "../../hooks/useFetch";
import { formatDate } from "../../lib/format";
import { canApproveTask, canReviewTask } from "../../lib/permissions";
import type { ReviewStatus } from "../../types";

const STATUS_STYLES: Record<ReviewStatus, string> = {
  PENDING_REVIEW: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CHANGES_REQUESTED: "border-orange-200 bg-orange-50 text-orange-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
};

export function Reviews() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data, isLoading, error, refetch } = useFetch(() => reviewsApi.list(), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selected = data?.find((r) => r.id === selectedId) ?? data?.[0] ?? null;

  if (!user) return null;
  if (isLoading) return <LoadingState label="Loading submissions..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const handleDecision = async (status: ReviewStatus) => {
    if (!selected) return;
    setIsSaving(true);
    try {
      await reviewsApi.update(selected.id, { status, rating, feedback: feedback || undefined });
      showToast(`Marked as ${status.replace("_", " ").toLowerCase()}.`);
      refetch();
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Failed to update review.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const canAct = canReviewTask(user);
  const canDecide = canApproveTask(user);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="font-heading text-xl font-bold text-foreground">Reviews & Feedback</h2>
        <button
          onClick={() => setSubmitOpen(true)}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
        >
          <Plus size={16} /> Submit for Review
        </button>
      </div>

      {!data || data.length === 0 ? (
        <EmptyState icon={<ClipboardCheck size={28} />} title="No submissions yet" description="Submissions you can access will appear here." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="space-y-2 lg:col-span-2">
            {data.map((review) => (
              <button
                key={review.id}
                onClick={() => {
                  setSelectedId(review.id);
                  setFeedback(review.feedback || "");
                  setRating(review.rating || 5);
                }}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                  selected?.id === review.id ? "border-primary bg-secondary" : "border-border bg-card hover:bg-muted"
                }`}
              >
                <Avatar user={review.submittedBy} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{review.task.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{review.submittedBy.name}</p>
                </div>
                <Badge className={STATUS_STYLES[review.status]}>{review.status.replace("_", " ")}</Badge>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
            {selected && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading text-base font-semibold text-foreground">{selected.task.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submitted by {selected.submittedBy.name} · {formatDate(selected.createdAt)}
                    </p>
                  </div>
                  <Badge className={STATUS_STYLES[selected.status]}>{selected.status.replace("_", " ")}</Badge>
                </div>

                <p className="mt-4 text-sm text-foreground">{selected.task.description || "No description provided."}</p>

                {canAct ? (
                  <div className="mt-5 space-y-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => setRating(n)}
                            className={`h-8 w-8 rounded-lg text-sm font-semibold ${
                              n <= rating ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Feedback</label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Leave feedback for the submitter..."
                        className="min-h-[80px] w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    {canDecide ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          disabled={isSaving}
                          onClick={() => handleDecision("APPROVED")}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          <CheckCircle2 size={15} /> Approve
                        </button>
                        <button
                          disabled={isSaving}
                          onClick={() => handleDecision("CHANGES_REQUESTED")}
                          className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
                        >
                          <RotateCcw size={15} /> Request Changes
                        </button>
                        <button
                          disabled={isSaving}
                          onClick={() => handleDecision("REJECTED")}
                          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          <XCircle size={15} /> Reject
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={isSaving}
                        onClick={() => handleDecision("CHANGES_REQUESTED")}
                        className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
                      >
                        <RotateCcw size={15} /> Request Changes
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mt-5 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
                    {selected.feedback ? (
                      <>
                        <p className="font-medium text-foreground">Reviewer feedback</p>
                        <p className="mt-1">{selected.feedback}</p>
                        {selected.rating && <p className="mt-1">Rating: {selected.rating}/5</p>}
                      </>
                    ) : (
                      "Awaiting review — you'll see feedback here once it's reviewed."
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <SubmitReviewModal isOpen={submitOpen} onClose={() => setSubmitOpen(false)} onSubmitted={refetch} />
    </div>
  );
}
