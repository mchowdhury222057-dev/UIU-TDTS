import { ChevronsLeft, ChevronsRight, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { roleLabel } from "../../lib/roleLabels";
import { getNavSections } from "../../lib/nav";
import { Avatar } from "../ui/Avatar";
import clsx from "clsx";

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const sections = getNavSections(user.role);

  const content = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary font-heading text-sm font-bold text-white">
          T
        </div>
        {!collapsed && <span className="font-heading text-sm font-bold text-foreground">UIU TDTS</span>}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
        {sections.map((section) => (
          <div key={section.section}>
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.section}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-accent text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  <item.icon size={18} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className={clsx("flex items-center gap-2", collapsed && "justify-center")}>
          <Avatar user={user} size="sm" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{roleLabel(user.role)}</p>
            </div>
          )}
          <button
            onClick={logout}
            title="Log out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-red-600"
          >
            <LogOut size={16} />
          </button>
        </div>
        <button
          onClick={onToggle}
          className="mt-2 hidden w-full items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-xs text-muted-foreground hover:bg-muted md:flex"
        >
          {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={clsx(
          "sticky top-0 hidden h-screen shrink-0 border-r border-border transition-all duration-200 md:block",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 h-full w-64 shadow-xl">{content}</aside>
        </div>
      )}
    </>
  );
}
