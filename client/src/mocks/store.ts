// In-memory "database" for demo mode. Seeded once from seedData.ts, then
// mutated in place by router.ts and persisted to sessionStorage so a
// refresh mid-demo doesn't lose anything created during the session.

import type { HelpArticle, Notification, Performance, Project, Review, Task, Team, TeamMember, User } from "../types";
import {
  RawAuditLog,
  RawComment,
  RawHelpArticle,
  RawNotification,
  RawPerformance,
  RawProject,
  RawReview,
  RawTask,
  RawTeam,
  RawTeamMember,
  RawUser,
  rawAuditLogs,
  rawComments,
  rawHelpArticles,
  rawNotifications,
  rawPerformance,
  rawProjects,
  rawReviews,
  rawTasks,
  rawTeamMembers,
  rawTeams,
  rawUsers,
} from "./seedData";

interface Store {
  users: RawUser[];
  projects: RawProject[];
  teams: RawTeam[];
  teamMembers: RawTeamMember[];
  tasks: RawTask[];
  comments: RawComment[];
  reviews: RawReview[];
  performance: RawPerformance[];
  notifications: RawNotification[];
  auditLogs: RawAuditLog[];
  helpArticles: RawHelpArticle[];
  sessionUserId: string | null;
}

// Bump this whenever the Store shape changes so a stale sessionStorage
// entry from a previous demo mode version doesn't get loaded with a
// mismatched shape.
const STORAGE_KEY = "uiu_tdts_demo_store_v2";

function freshStore(): Store {
  return {
    users: structuredClone(rawUsers),
    projects: structuredClone(rawProjects),
    teams: structuredClone(rawTeams),
    teamMembers: structuredClone(rawTeamMembers),
    tasks: structuredClone(rawTasks),
    comments: structuredClone(rawComments),
    reviews: structuredClone(rawReviews),
    performance: structuredClone(rawPerformance),
    notifications: structuredClone(rawNotifications),
    auditLogs: structuredClone(rawAuditLogs),
    helpArticles: structuredClone(rawHelpArticles),
    sessionUserId: null,
  };
}

function load(): Store {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch {
    // corrupted/unavailable sessionStorage: fall back to a fresh store
  }
  return freshStore();
}

export const store: Store = load();

export function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // sessionStorage unavailable (e.g. private mode) — demo still works,
    // it just won't survive a refresh.
  }
}

export function resetDemoData() {
  Object.assign(store, freshStore());
  persist();
}

let idCounter = 1;
export function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${idCounter++}`;
}

// ---------- Hydration (joins raw rows into the nested API shapes) ----------

function toSafeUser(raw: RawUser): User {
  const { password, ...safe } = raw;
  return { ...safe, roleLabel: ROLE_LABELS[raw.role] };
}

const ROLE_LABELS: Record<User["role"], string> = {
  SUPER_ADMIN: "Super Admin",
  FACULTY: "Faculty",
  TA: "Teaching Assistant",
  LEADER: "Team Leader",
  STUDENT: "Member",
};

export function getUser(id: string): User | undefined {
  const raw = store.users.find((u) => u.id === id);
  return raw ? toSafeUser(raw) : undefined;
}

export function listUsers(): User[] {
  return store.users.map(toSafeUser);
}

function hydrateTeamMember(tm: RawTeamMember): TeamMember {
  return { ...tm, user: getUser(tm.userId)! };
}

function hydrateTeam(raw: RawTeam, opts: { withProject?: boolean; withTasks?: boolean } = {}): Team {
  const team: Team = {
    ...raw,
    leader: getUser(raw.leaderId)!,
    createdBy: getUser(raw.createdById),
    members: store.teamMembers.filter((m) => m.teamId === raw.id).map(hydrateTeamMember),
  };
  if (opts.withProject) {
    const project = store.projects.find((p) => p.id === raw.projectId);
    if (project) team.project = hydrateProject(project);
  }
  if (opts.withTasks) {
    team.tasks = store.tasks.filter((t) => t.teamId === raw.id).map((t) => hydrateTask(t));
  }
  return team;
}

export function hydrateProject(raw: RawProject): Project {
  return {
    ...raw,
    supervisor: getUser(raw.supervisorId)!,
    createdBy: getUser(raw.createdById)!,
    teams: store.teams.filter((t) => t.projectId === raw.id).map((t) => hydrateTeam(t)),
    _count: { tasks: store.tasks.filter((t) => t.projectId === raw.id).length },
  };
}

export function hydrateTask(
  raw: RawTask,
  opts: { withComments?: boolean; withReviews?: boolean } = {}
): Task {
  const projectRaw = store.projects.find((p) => p.id === raw.projectId)!;
  const teamRaw = raw.teamId ? store.teams.find((t) => t.id === raw.teamId) : undefined;

  const task: Task = {
    ...raw,
    assignee: raw.assigneeId ? getUser(raw.assigneeId) ?? null : null,
    createdBy: getUser(raw.createdById)!,
    project: hydrateProject(projectRaw),
    team: teamRaw ? { ...hydrateTeam(teamRaw), members: store.teamMembers.filter((m) => m.teamId === teamRaw.id).map(hydrateTeamMember) } : null,
    _count: { comments: store.comments.filter((c) => c.taskId === raw.id).length },
  };

  if (opts.withComments) {
    task.comments = store.comments
      .filter((c) => c.taskId === raw.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((c) => ({ ...c, user: getUser(c.userId)! }));
  }
  if (opts.withReviews) {
    task.reviews = store.reviews.filter((r) => r.taskId === raw.id).map((r) => hydrateReview(r));
  }
  return task;
}

export function hydrateReview(raw: RawReview): Review {
  return {
    ...raw,
    task: hydrateTask(store.tasks.find((t) => t.id === raw.taskId)!),
    reviewer: getUser(raw.reviewerId)!,
    submittedBy: getUser(raw.submittedById)!,
  };
}

export function hydratePerformance(raw: RawPerformance): Performance {
  return {
    ...raw,
    user: getUser(raw.userId)!,
    project: hydrateProject(store.projects.find((p) => p.id === raw.projectId)!),
  };
}

export function hydrateNotification(raw: RawNotification): Notification {
  return { ...raw };
}

export function hydrateHelpArticle(raw: RawHelpArticle): HelpArticle {
  return { ...raw, createdBy: getUser(raw.createdById)! };
}
