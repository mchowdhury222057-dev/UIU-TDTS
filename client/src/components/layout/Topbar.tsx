import { Bell, Menu, Search } from "lucide-react";
import { KeyboardEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../hooks/useNotifications";
import { SEMESTER } from "../../lib/constants";
import { Avatar } from "../ui/Avatar";
import { CreateMenu } from "./CreateMenu";
import { NotificationPanel } from "./NotificationPanel";

export function Topbar({ title, onOpenMobileSidebar }: { title: string; onOpenMobileSidebar: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, refetch } = useNotifications();
  const [panelOpen, setPanelOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/app/tasks?q=${encodeURIComponent(search.trim())}`);
    }
  };

  if (!user) return null;

  const isDemoMode = import.meta.env.VITE_MOCK_MODE === "true";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-white/80 px-4 backdrop-blur md:px-6">
      <button
        onClick={onOpenMobileSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted md:hidden"
      >
        <Menu size={18} />
      </button>

      <h1 className="font-heading text-base font-semibold text-foreground md:text-lg">{title}</h1>

      <div className="relative ml-2 hidden max-w-xs flex-1 md:block">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search tasks..."
          className="w-full rounded-lg border border-border bg-muted/60 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {isDemoMode && (
          <span
            title="Running on local mock data — no backend or database connected"
            className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 sm:inline-block"
          >
            Demo Mode
          </span>
        )}
        <span className="hidden rounded-full bg-accent px-3 py-1 font-mono-data text-xs font-medium text-primary sm:inline-block">
          {SEMESTER}
        </span>

        <button
          onClick={() => setPanelOpen(true)}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <CreateMenu />

        <div className="hidden sm:block">
          <Avatar user={user} size="sm" />
        </div>
      </div>

      <NotificationPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        notifications={notifications}
        onRefetch={refetch}
      />
    </header>
  );
}
