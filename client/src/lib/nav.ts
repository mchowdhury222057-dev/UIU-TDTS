import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarRange,
  ClipboardCheck,
  Gauge,
  HelpCircle,
  KanbanSquare,
  LayoutDashboard,
  ListChecks,
  Repeat2,
  Settings,
  Shield,
  User as UserIcon,
  Users,
  FolderKanban,
} from "lucide-react";
import type { Role } from "../types";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

const ALL_NAV: Record<string, NavItem> = {
  dashboard: { label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard },
  projects: { label: "Projects", path: "/app/projects", icon: FolderKanban },
  teams: { label: "Teams", path: "/app/teams", icon: Users },
  tasks: { label: "Tasks", path: "/app/tasks", icon: ListChecks },
  kanban: { label: "Kanban Board", path: "/app/kanban", icon: KanbanSquare },
  sprints: { label: "Sprint Board", path: "/app/sprints", icon: Repeat2 },
  timeline: { label: "Timeline", path: "/app/timeline", icon: CalendarRange },
  performance: { label: "Performance & Ratings", path: "/app/performance", icon: Gauge },
  reviews: { label: "Reviews & Feedback", path: "/app/reviews", icon: ClipboardCheck },
  reports: { label: "Reports & Analytics", path: "/app/reports", icon: BarChart3 },
  roles: { label: "Roles & Permissions", path: "/app/roles", icon: Shield },
  notifications: { label: "Notifications", path: "/app/notifications", icon: BarChart3 },
  settings: { label: "Settings", path: "/app/settings", icon: Settings },
  profile: { label: "Profile", path: "/app/profile", icon: UserIcon },
  help: { label: "Help", path: "/app/help", icon: HelpCircle },
};

export function getNavSections(role: Role): NavSection[] {
  const workspace: NavItem[] = [ALL_NAV.dashboard];

  const manage: NavItem[] = [ALL_NAV.projects, ALL_NAV.teams, ALL_NAV.tasks, ALL_NAV.kanban, ALL_NAV.sprints];
  if (role !== "STUDENT") manage.push(ALL_NAV.timeline);

  const analytics: NavItem[] = [ALL_NAV.performance, ALL_NAV.reviews];
  if (role === "SUPER_ADMIN" || role === "FACULTY" || role === "TA") {
    analytics.push(ALL_NAV.reports);
  }

  const administration: NavItem[] = [];
  if (role === "SUPER_ADMIN") administration.push(ALL_NAV.roles);

  const system: NavItem[] = [ALL_NAV.notifications, ALL_NAV.settings, ALL_NAV.profile, ALL_NAV.help];

  const sections: NavSection[] = [
    { section: "Workspace", items: workspace },
    { section: "Manage", items: manage },
    { section: "Analytics", items: analytics },
  ];
  if (administration.length) sections.push({ section: "Administration", items: administration });
  sections.push({ section: "System", items: system });

  return sections;
}
