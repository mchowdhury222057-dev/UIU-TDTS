import { BookOpen, ChevronDown, LifeBuoy, Pencil, Plus, Signal, Trash2 } from "lucide-react";
import { useState } from "react";
import { ApiClientError } from "../../api/client";
import { helpApi } from "../../api/help";
import { HelpArticleModal } from "../../components/modals/HelpArticleModal";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/States";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useFetch } from "../../hooks/useFetch";
import { canManageHelp } from "../../lib/permissions";
import type { HelpArticle } from "../../types";

export function Help() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data: articles, isLoading, error, refetch } = useFetch(() => helpApi.list(), []);
  const [openId, setOpenId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(null);

  if (!user) return null;
  const canEdit = canManageHelp(user);

  const openCreateModal = () => {
    setEditingArticle(null);
    setModalOpen(true);
  };

  const openEditModal = (article: HelpArticle) => {
    setEditingArticle(article);
    setModalOpen(true);
  };

  const handleDelete = async (article: HelpArticle) => {
    if (!confirm(`Delete "${article.question}"? This cannot be undone.`)) return;
    try {
      await helpApi.remove(article.id);
      showToast("Help article deleted.");
      refetch();
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Failed to delete help article.", "error");
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="font-heading text-xl font-bold text-foreground">Help & Support</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
            <BookOpen size={18} />
          </div>
          <p className="mt-3 font-heading text-sm font-semibold text-foreground">Documentation</p>
          <p className="mt-1 text-xs text-muted-foreground">Guides for every role and feature in UIU TDTS.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
            <LifeBuoy size={18} />
          </div>
          <p className="mt-3 font-heading text-sm font-semibold text-foreground">Contact Support</p>
          <p className="mt-1 text-xs text-muted-foreground">Reach the UIU TDTS team for account or access issues.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
            <Signal size={18} />
          </div>
          <p className="mt-3 font-heading text-sm font-semibold text-foreground">System Status</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> All systems operational
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="font-heading text-sm font-semibold text-foreground">Frequently Asked Questions</h3>
          {canEdit && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95"
            >
              <Plus size={14} /> Add Question
            </button>
          )}
        </div>

        {isLoading ? (
          <LoadingState label="Loading FAQs..." />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : !articles || articles.length === 0 ? (
          <EmptyState
            title="No questions yet"
            description={canEdit ? "Add the first question to help your users." : "Check back soon for answers to common questions."}
          />
        ) : (
          <div className="divide-y divide-border">
            {articles.map((article) => (
              <div key={article.id}>
                <div className="flex w-full items-center justify-between gap-2 py-3">
                  <button
                    onClick={() => setOpenId(openId === article.id ? null : article.id)}
                    className="flex flex-1 items-center justify-between gap-2 text-left text-sm font-medium text-foreground"
                  >
                    {article.question}
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-muted-foreground transition ${openId === article.id ? "rotate-180" : ""}`}
                    />
                  </button>
                  {canEdit && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => openEditModal(article)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(article)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                {openId === article.id && <p className="pb-3 text-sm text-muted-foreground">{article.answer}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <HelpArticleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={refetch}
        article={editingArticle}
      />
    </div>
  );
}
