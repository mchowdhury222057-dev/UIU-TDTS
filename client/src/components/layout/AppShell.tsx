import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  teams: "Teams",
  tasks: "Tasks",
  kanban: "Kanban Board",
  sprints: "Sprint Board",
  timeline: "Timeline",
  performance: "Performance & Ratings",
  reviews: "Reviews & Feedback",
  reports: "Reports & Analytics",
  roles: "Roles & Permissions",
  notifications: "Notifications",
  settings: "Settings",
  profile: "Profile",
  help: "Help",
};

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const segment = location.pathname.split("/")[2] ?? "dashboard";
  const title = PAGE_TITLES[segment] ?? "UIU TDTS";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar title={title} onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
