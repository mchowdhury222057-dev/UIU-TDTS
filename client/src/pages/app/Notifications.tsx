import { Bell, CalendarClock, ClipboardCheck, MessageSquare, Paperclip } from "lucide-react";
import { useMemo, useState } from "react";
import { notificationsApi } from "../../api/notifications";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/States";
import { useFetch } from "../../hooks/useFetch";
import { timeAgo } from "../../lib/format";
import type { NotificationType } from "../../types";

const TABS: { key: NotificationType | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "TASK", label: "Task" },
  { key: "DEADLINE", label: "Deadline" },
  { key: "REVIEW", label: "Review" },
  { key: "MENTION", label: "Mention" },
  { key: "UPLOAD", label: "Upload" },
];

const ICONS: Record<NotificationType, typeof Bell> = {
  TASK: ClipboardCheck,
  DEADLINE: CalendarClock,
  REVIEW: ClipboardCheck,
  MENTION: MessageSquare,
  UPLOAD: Paperclip,
};

export function Notifications() {
  const { data, isLoading, error, refetch } = useFetch(() => notificationsApi.list(), []);
  const [tab, setTab] = useState<NotificationType | "ALL">("ALL");

  const filtered = useMemo(() => {
    if (!data) return [];
    return tab === "ALL" ? data : data.filter((n) => n.type === tab);
  }, [data, tab]);

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    refetch();
  };

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id);
    refetch();
  };

  if (isLoading) return <LoadingState label="Loading notifications..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="font-heading text-xl font-bold text-foreground">Notifications</h2>
        <button onClick={markAllRead} className="text-sm font-medium text-primary hover:underline">
          Mark all read
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              tab === t.key ? "border-primary bg-accent text-primary" : "border-border bg-white text-muted-foreground hover:bg-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Bell size={28} />} title="No notifications" description="You're all caught up here." />
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const Icon = ICONS[n.type];
            return (
              <button
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={`flex w-full items-start gap-3 rounded-xl border bg-card p-4 text-left transition hover:shadow-sm ${
                  !n.read ? "border-l-4 border-l-primary border-border" : "border-border"
                }`}
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
