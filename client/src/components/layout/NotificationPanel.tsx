import { Bell, ClipboardCheck, MessageSquare, Paperclip, CalendarClock } from "lucide-react";
import { notificationsApi } from "../../api/notifications";
import { timeAgo } from "../../lib/format";
import type { Notification, NotificationType } from "../../types";
import { EmptyState } from "../ui/States";

const ICONS: Record<NotificationType, typeof Bell> = {
  TASK: ClipboardCheck,
  DEADLINE: CalendarClock,
  REVIEW: ClipboardCheck,
  MENTION: MessageSquare,
  UPLOAD: Paperclip,
};

export function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onRefetch,
}: {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onRefetch: () => void;
}) {
  if (!isOpen) return null;

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id);
    onRefetch();
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    onRefetch();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative flex h-full w-80 flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <h3 className="font-heading text-sm font-semibold text-foreground">Notifications</h3>
          <button onClick={markAllRead} className="text-xs font-medium text-primary hover:underline">
            Mark all read
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4">
              <EmptyState title="You're all caught up" description="No notifications yet." icon={<Bell size={28} />} />
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = ICONS[n.type];
              return (
                <button
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  className={`flex w-full gap-3 border-b border-border px-4 py-3 text-left hover:bg-muted ${
                    !n.read ? "border-l-2 border-l-primary bg-secondary" : ""
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-foreground">{n.title}</p>
                      {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
