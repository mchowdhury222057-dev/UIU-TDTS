import { Bell, ClipboardCheck, MessageSquare, Paperclip, CalendarClock } from "lucide-react";
import { createPortal } from "react-dom";
import { notificationsApi } from "../../api/notifications";
import { timeAgo } from "../../lib/format";
import type { Notification, NotificationType } from "../../types";
import { EmptyState } from "../ui/States";

// Matches the Topbar's h-16 height. The panel is anchored below it rather
// than covering it, per the drawer's expected desktop/mobile layout.
const TOPBAR_HEIGHT = "4rem";

// Panel width: never wider than 380px, and on narrow viewports shrinks to
// leave a consistent 24px gutter so it can never overflow the viewport.
const PANEL_WIDTH = "min(380px, calc(100vw - 24px))";

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

  // Portalled to document.body — rendering this in place (inside <header>,
  // which uses backdrop-blur) would trap `position: fixed` inside the
  // header's box instead of the viewport, since backdrop-filter creates a
  // new containing block (same as transform/filter/will-change). Modal.tsx
  // already sidesteps this the same way.
  return createPortal(
    <>
      <div
        className="fixed inset-x-0 bottom-0 z-40 bg-black/30"
        style={{ top: TOPBAR_HEIGHT }}
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 right-0 z-50 flex flex-col overflow-hidden bg-white shadow-xl"
        style={{ top: TOPBAR_HEIGHT, width: PANEL_WIDTH }}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3.5">
          <h3 className="truncate font-heading text-sm font-semibold text-foreground">Notifications</h3>
          <button
            onClick={markAllRead}
            className="shrink-0 text-xs font-medium text-primary hover:underline"
          >
            Mark all read
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
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
    </>,
    document.body
  );
}
