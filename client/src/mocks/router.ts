// Frontend-only mock "backend": receives the same (method, path, body)
// shape the real Express API would, and returns/throws the same way, so
// none of the client/src/api/*.ts or page code needs to know demo mode
// exists. Only client.ts branches into this file.

import { ApiClientError } from "../api/client";
import type { DashboardStats, ReportsData, TaskStatus, Team, User } from "../types";
import * as perm from "./permissions";
import {
  getUser,
  hydrateHelpArticle,
  hydrateNotification,
  hydratePerformance,
  hydrateProject,
  hydrateReview,
  hydrateTask,
  listUsers,
  nextId,
  persist,
  store,
} from "./store";
import type { RawProject, RawTask, RawTeam } from "./seedData";

const TASK_STATUSES: TaskStatus[] = ["BACKLOG", "TODO", "STARTED", "IN_PROGRESS", "REVIEW", "TESTING", "COMPLETED", "CANCELLED"];
const DAY_MS = 24 * 60 * 60 * 1000;

function unauthorized(message = "Authentication required"): never {
  throw new ApiClientError(401, message);
}
function forbidden(message = "You do not have permission to perform this action."): never {
  throw new ApiClientError(403, message);
}
function notFound(message = "Resource not found"): never {
  throw new ApiClientError(404, message);
}
function badRequest(message = "Bad request"): never {
  throw new ApiClientError(400, message);
}

function currentUser(): User {
  if (!store.sessionUserId) unauthorized();
  const user = getUser(store.sessionUserId);
  if (!user) unauthorized();
  return user;
}

function currentUserOrNull(): User | null {
  if (!store.sessionUserId) return null;
  return getUser(store.sessionUserId) ?? null;
}

// Matches a request path like "/tasks/t-1/status" against a pattern like
// "/tasks/:id/status", returning the captured params or null on mismatch.
function match(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];
    if (p.startsWith(":")) {
      params[p.slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (p !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#8B5CF6", "#EF4444", "#EC4899", "#14B8A6", "#6366F1"];

export async function mockRequest<T>(method: string, path: string, body: unknown): Promise<T> {
  // simulate real network latency so loading states are visible in the demo
  await new Promise((r) => setTimeout(r, 180));

  const p = path.split("?")[0];
  const b = (body ?? {}) as Record<string, any>;
  let params: Record<string, string> | null;

  // ---------- AUTH ----------
  if (method === "POST" && p === "/auth/login") {
    const raw = store.users.find((u) => u.email.toLowerCase() === String(b.email || "").toLowerCase());
    if (!raw || raw.password !== b.password) unauthorized("Invalid email or password");
    store.sessionUserId = raw.id;
    persist();
    return getUser(raw.id) as T;
  }

  if (method === "POST" && p === "/auth/register") {
    if (!perm.canRegisterAsRole(b.role)) forbidden("You cannot register with this role.");
    const email = String(b.email || "").toLowerCase();
    if (store.users.some((u) => u.email.toLowerCase() === email)) {
      throw new ApiClientError(409, "An account with this email already exists.");
    }
    const id = nextId("u");
    store.users.push({
      id,
      email,
      password: b.password,
      name: b.name,
      initials: computeInitials(b.name),
      avatarColor: b.avatarColor || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      role: b.role,
      department: b.department ?? null,
      title: b.title ?? null,
      bio: b.bio ?? null,
      skills: [],
      semester: "Summer 2026",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    store.sessionUserId = id;
    persist();
    return getUser(id) as T;
  }

  if (method === "POST" && p === "/auth/logout") {
    store.sessionUserId = null;
    persist();
    return null as T;
  }

  if (method === "GET" && p === "/auth/me") {
    const user = currentUserOrNull();
    if (!user) unauthorized();
    return user as T;
  }

  // Everything below requires auth, matching the real API's requireAuth() on all other routers.
  const user = currentUser();

  // ---------- USERS ----------
  if (method === "GET" && p === "/users") {
    if (!(user.role === "SUPER_ADMIN" || user.role === "FACULTY" || user.role === "TA")) forbidden();
    return listUsers() as T;
  }
  if ((params = method === "GET" ? match("/users/:id", p) : null)) {
    const target = getUser(params.id);
    if (!target) notFound("User not found");
    return target as T;
  }
  if ((params = method === "PATCH" ? match("/users/:id/password", p) : null)) {
    const raw = store.users.find((u) => u.id === params!.id);
    if (!raw) notFound("User not found");
    if (raw.id !== user.id) forbidden();
    if (raw.password !== b.currentPassword) badRequest("Current password is incorrect");
    raw.password = b.newPassword;
    raw.updatedAt = new Date().toISOString();
    persist();
    return null as T;
  }
  if ((params = method === "PATCH" ? match("/users/:id/role", p) : null)) {
    const targetRaw = store.users.find((u) => u.id === params!.id);
    if (!targetRaw) notFound("User not found");
    const target = getUser(targetRaw.id)!;
    const check = perm.canModifyUserRole(user, target);
    if (!check.allowed) forbidden(check.reason);
    targetRaw.role = b.role;
    targetRaw.updatedAt = new Date().toISOString();
    store.auditLogs.unshift({
      id: nextId("al"),
      actorId: user.id,
      action: "ROLE_CHANGE",
      targetType: "User",
      targetId: target.id,
      details: JSON.stringify({ from: target.role, to: b.role, targetName: target.name }),
      createdAt: new Date().toISOString(),
    });
    persist();
    return getUser(targetRaw.id) as T;
  }
  if ((params = method === "PATCH" ? match("/users/:id", p) : null)) {
    const raw = store.users.find((u) => u.id === params!.id);
    if (!raw) notFound("User not found");
    if (raw.id !== user.id) forbidden("You can only edit your own profile.");
    if (b.name) {
      raw.name = b.name;
      raw.initials = computeInitials(b.name);
    }
    if (b.title !== undefined) raw.title = b.title;
    if (b.bio !== undefined) raw.bio = b.bio;
    if (b.skills !== undefined) raw.skills = b.skills;
    if (b.avatarColor !== undefined) raw.avatarColor = b.avatarColor;
    if (b.department !== undefined) raw.department = b.department;
    raw.updatedAt = new Date().toISOString();
    persist();
    return getUser(raw.id) as T;
  }
  if ((params = method === "DELETE" ? match("/users/:id", p) : null)) {
    const targetRaw = store.users.find((u) => u.id === params!.id);
    if (!targetRaw) notFound("User not found");
    const target = getUser(targetRaw.id)!;
    const check = perm.canDeleteUser(user, target);
    if (!check.allowed) forbidden(check.reason);
    store.users = store.users.filter((u) => u.id !== target.id);
    persist();
    return null as T;
  }

  // ---------- PROJECTS ----------
  if (method === "GET" && p === "/projects") {
    return store.projects.filter((proj) => perm.projectVisible(user, proj)).map(hydrateProject) as T;
  }
  if (method === "POST" && p === "/projects") {
    if (!perm.canCreateProject(user)) forbidden();
    const supervisor = getUser(b.supervisorId);
    if (!supervisor || !(supervisor.role === "FACULTY" || supervisor.role === "SUPER_ADMIN")) {
      badRequest("Supervisor must be a Faculty or Super Admin user.");
    }
    const id = nextId("p");
    const raw: RawProject = {
      id,
      name: b.name,
      courseCode: b.courseCode,
      description: b.description ?? "",
      priority: b.priority,
      status: b.status,
      progress: 0,
      deadline: b.deadline,
      supervisorId: b.supervisorId,
      createdById: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.projects.push(raw);
    store.auditLogs.unshift({ id: nextId("al"), actorId: user.id, action: "PROJECT_CREATE", targetType: "Project", targetId: id, details: JSON.stringify({ name: raw.name }), createdAt: new Date().toISOString() });
    persist();
    return hydrateProject(raw) as T;
  }
  if ((params = method === "GET" ? match("/projects/:id", p) : null)) {
    const raw = store.projects.find((x) => x.id === params!.id);
    if (!raw || !perm.projectVisible(user, raw)) notFound("Project not found");
    return hydrateProject(raw) as T;
  }
  if ((params = method === "PATCH" ? match("/projects/:id", p) : null)) {
    const raw = store.projects.find((x) => x.id === params!.id);
    if (!raw) notFound("Project not found");
    if (!perm.canEditProject(user, raw)) forbidden();
    Object.assign(raw, {
      ...(b.name !== undefined && { name: b.name }),
      ...(b.courseCode !== undefined && { courseCode: b.courseCode }),
      ...(b.description !== undefined && { description: b.description }),
      ...(b.priority !== undefined && { priority: b.priority }),
      ...(b.status !== undefined && { status: b.status }),
      ...(b.progress !== undefined && { progress: b.progress }),
      ...(b.deadline !== undefined && { deadline: b.deadline }),
      ...(b.supervisorId !== undefined && { supervisorId: b.supervisorId }),
      updatedAt: new Date().toISOString(),
    });
    persist();
    return hydrateProject(raw) as T;
  }
  if ((params = method === "DELETE" ? match("/projects/:id", p) : null)) {
    const raw = store.projects.find((x) => x.id === params!.id);
    if (!raw) notFound("Project not found");
    if (!perm.canDeleteProject(user, raw)) forbidden();
    const teamIds = store.teams.filter((t) => t.projectId === raw.id).map((t) => t.id);
    store.teams = store.teams.filter((t) => t.projectId !== raw.id);
    store.teamMembers = store.teamMembers.filter((m) => !teamIds.includes(m.teamId));
    store.tasks = store.tasks.filter((t) => t.projectId !== raw.id);
    store.projects = store.projects.filter((x) => x.id !== raw.id);
    store.auditLogs.unshift({ id: nextId("al"), actorId: user.id, action: "PROJECT_DELETE", targetType: "Project", targetId: raw.id, details: JSON.stringify({ name: raw.name }), createdAt: new Date().toISOString() });
    persist();
    return null as T;
  }

  // ---------- TEAMS ----------
  if (method === "GET" && p === "/teams") {
    return store.teams
      .filter((t) => perm.teamVisible(user, t))
      .map((t) => ({ ...hydrateTeamFull(t) })) as T;
  }
  if (method === "POST" && p === "/teams") {
    if (!perm.canCreateTeam(user)) forbidden();
    const project = store.projects.find((x) => x.id === b.projectId);
    if (!project) badRequest("Selected project does not exist.");
    const leader = getUser(b.leaderId);
    if (!leader || !(leader.role === "LEADER" || leader.role === "SUPER_ADMIN" || leader.role === "FACULTY")) {
      badRequest("Team leader must be a Team Leader, Faculty, or Super Admin user.");
    }
    const id = nextId("team");
    store.teams.push({ id, name: b.name, projectId: b.projectId, leaderId: b.leaderId, createdById: user.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    (b.memberIds ?? []).forEach((userId: string) => {
      store.teamMembers.push({ id: nextId("tm"), teamId: id, userId, joinedAt: new Date().toISOString() });
    });
    store.auditLogs.unshift({ id: nextId("al"), actorId: user.id, action: "TEAM_CREATE", targetType: "Team", targetId: id, details: JSON.stringify({ name: b.name, projectId: b.projectId }), createdAt: new Date().toISOString() });
    persist();
    return hydrateTeamFull(store.teams.find((t) => t.id === id)!) as T;
  }
  if ((params = method === "GET" ? match("/teams/:id", p) : null)) {
    const raw = store.teams.find((x) => x.id === params!.id);
    if (!raw || !perm.teamVisible(user, raw)) notFound("Team not found");
    return hydrateTeamFull(raw) as T;
  }
  if ((params = method === "PATCH" ? match("/teams/:id", p) : null)) {
    const raw = store.teams.find((x) => x.id === params!.id);
    if (!raw) notFound("Team not found");
    if (!perm.canEditTeam(user, raw)) forbidden();
    if (b.name !== undefined) raw.name = b.name;
    if (b.leaderId !== undefined) raw.leaderId = b.leaderId;
    if (b.memberIds !== undefined) {
      store.teamMembers = store.teamMembers.filter((m) => m.teamId !== raw.id);
      (b.memberIds as string[]).forEach((userId) => {
        store.teamMembers.push({ id: nextId("tm"), teamId: raw.id, userId, joinedAt: new Date().toISOString() });
      });
    }
    raw.updatedAt = new Date().toISOString();
    persist();
    return hydrateTeamFull(raw) as T;
  }
  if ((params = method === "DELETE" ? match("/teams/:id", p) : null)) {
    const raw = store.teams.find((x) => x.id === params!.id);
    if (!raw) notFound("Team not found");
    if (!perm.canDeleteTeam(user, raw)) forbidden();
    store.teamMembers = store.teamMembers.filter((m) => m.teamId !== raw.id);
    store.tasks.forEach((t) => {
      if (t.teamId === raw.id) t.teamId = null;
    });
    store.teams = store.teams.filter((x) => x.id !== raw.id);
    store.auditLogs.unshift({ id: nextId("al"), actorId: user.id, action: "TEAM_DELETE", targetType: "Team", targetId: raw.id, details: JSON.stringify({ name: raw.name }), createdAt: new Date().toISOString() });
    persist();
    return null as T;
  }

  // ---------- TASKS ----------
  if (method === "GET" && p === "/tasks") {
    return store.tasks.filter((t) => perm.taskVisible(user, t)).map((t) => hydrateTask(t)) as T;
  }
  if (method === "POST" && p === "/tasks") {
    if (!perm.canCreateTask(user)) forbidden();
    const project = store.projects.find((x) => x.id === b.projectId);
    if (!project) badRequest("Selected project does not exist.");
    let team: RawTeam | undefined;
    if (b.teamId) {
      team = store.teams.find((x) => x.id === b.teamId);
      if (!team || team.projectId !== b.projectId) badRequest("Selected team does not belong to the selected project.");
    }
    const assigneeId = b.assigneeId || user.id;
    if (!perm.canAssignTaskTo(user, assigneeId, team ?? null)) forbidden("You are not allowed to assign tasks to this user.");
    const id = nextId("t");
    const raw: RawTask = {
      id,
      title: b.title,
      description: b.description ?? "",
      priority: b.priority,
      status: b.status ?? "BACKLOG",
      assigneeId,
      projectId: b.projectId,
      teamId: b.teamId ?? null,
      dueDate: b.dueDate ?? null,
      progress: 0,
      tags: b.tags ?? [],
      createdById: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.tasks.push(raw);
    if (assigneeId !== user.id) {
      store.notifications.unshift({ id: nextId("n"), userId: assigneeId, type: "TASK", title: "New task assigned", body: `You have been assigned to "${raw.title}".`, read: false, createdAt: new Date().toISOString() });
    }
    store.auditLogs.unshift({ id: nextId("al"), actorId: user.id, action: "TASK_CREATE", targetType: "Task", targetId: id, details: JSON.stringify({ title: raw.title }), createdAt: new Date().toISOString() });
    persist();
    return hydrateTask(raw) as T;
  }
  if ((params = method === "GET" ? match("/tasks/:id", p) : null)) {
    const raw = store.tasks.find((x) => x.id === params!.id);
    if (!raw || !perm.taskVisible(user, raw)) notFound("Task not found");
    return hydrateTask(raw, { withComments: true, withReviews: true }) as T;
  }
  if ((params = method === "PATCH" ? match("/tasks/:id/status", p) : null)) {
    const raw = store.tasks.find((x) => x.id === params!.id);
    if (!raw) notFound("Task not found");
    if (!perm.canChangeTaskStatus(user, raw)) forbidden();
    const previousStatus = raw.status;
    raw.status = b.status;
    raw.progress = b.status === "COMPLETED" ? 100 : b.status === "BACKLOG" ? 0 : raw.progress;
    raw.updatedAt = new Date().toISOString();
    if (raw.status === "COMPLETED" && previousStatus !== "COMPLETED" && raw.createdById !== user.id) {
      store.notifications.unshift({ id: nextId("n"), userId: raw.createdById, type: "TASK", title: "Task completed", body: `${user.name} marked "${raw.title}" as complete.`, read: false, createdAt: new Date().toISOString() });
    }
    persist();
    return hydrateTask(raw) as T;
  }
  if ((params = method === "PATCH" ? match("/tasks/:id", p) : null)) {
    const raw = store.tasks.find((x) => x.id === params!.id);
    if (!raw) notFound("Task not found");
    if (!perm.canEditTask(user, raw)) forbidden();
    if (b.assigneeId !== undefined && b.assigneeId !== raw.assigneeId) {
      const team = raw.teamId ? store.teams.find((x) => x.id === raw.teamId) : undefined;
      if (!perm.canAssignTaskTo(user, b.assigneeId, team ?? null)) forbidden("You are not allowed to assign tasks to this user.");
      if (b.assigneeId) {
        store.notifications.unshift({ id: nextId("n"), userId: b.assigneeId, type: "TASK", title: "New task assigned", body: `You have been assigned to "${raw.title}".`, read: false, createdAt: new Date().toISOString() });
      }
    }
    // Keep progress and status in sync, same as the real backend: hitting
    // 100% completes the task on its own, dropping below un-completes it.
    const previousStatus = raw.status;
    let status = b.status !== undefined ? b.status : undefined;
    if (b.progress !== undefined) {
      const currentStatus = status ?? raw.status;
      if (b.progress >= 100 && currentStatus !== "CANCELLED") {
        status = "COMPLETED";
      } else if (b.progress < 100 && currentStatus === "COMPLETED") {
        status = "IN_PROGRESS";
      }
    }
    Object.assign(raw, {
      ...(b.title !== undefined && { title: b.title }),
      ...(b.description !== undefined && { description: b.description }),
      ...(b.priority !== undefined && { priority: b.priority }),
      ...(status !== undefined && { status }),
      ...(b.assigneeId !== undefined && { assigneeId: b.assigneeId }),
      ...(b.dueDate !== undefined && { dueDate: b.dueDate }),
      ...(b.progress !== undefined && { progress: b.progress }),
      ...(b.tags !== undefined && { tags: b.tags }),
      updatedAt: new Date().toISOString(),
    });
    if (raw.status === "COMPLETED" && previousStatus !== "COMPLETED" && raw.createdById !== user.id) {
      store.notifications.unshift({ id: nextId("n"), userId: raw.createdById, type: "TASK", title: "Task completed", body: `${user.name} marked "${raw.title}" as complete.`, read: false, createdAt: new Date().toISOString() });
    }
    persist();
    return hydrateTask(raw) as T;
  }
  if ((params = method === "DELETE" ? match("/tasks/:id", p) : null)) {
    const raw = store.tasks.find((x) => x.id === params!.id);
    if (!raw) notFound("Task not found");
    if (!perm.canDeleteTask(user, raw)) forbidden();
    store.comments = store.comments.filter((c) => c.taskId !== raw.id);
    store.reviews = store.reviews.filter((r) => r.taskId !== raw.id);
    store.tasks = store.tasks.filter((x) => x.id !== raw.id);
    store.auditLogs.unshift({ id: nextId("al"), actorId: user.id, action: "TASK_DELETE", targetType: "Task", targetId: raw.id, details: JSON.stringify({ title: raw.title }), createdAt: new Date().toISOString() });
    persist();
    return null as T;
  }
  if ((params = method === "POST" ? match("/tasks/:id/comments", p) : null)) {
    const raw = store.tasks.find((x) => x.id === params!.id);
    if (!raw || !perm.taskVisible(user, raw)) notFound("Task not found");
    const comment = { id: nextId("c"), taskId: raw.id, userId: user.id, comment: b.comment, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    store.comments.push(comment);
    persist();
    return { ...comment, user } as T;
  }

  // ---------- REVIEWS ----------
  if (method === "GET" && p === "/reviews") {
    return store.reviews.filter((r) => perm.reviewVisible(user, r)).map(hydrateReview) as T;
  }
  if (method === "POST" && p === "/reviews") {
    const task = store.tasks.find((x) => x.id === b.taskId);
    if (!task) badRequest("Selected task does not exist.");
    if (user.role === "STUDENT" && b.submittedById !== user.id) forbidden("You can only submit your own work for review.");
    const project = store.projects.find((x) => x.id === task.projectId)!;
    const raw = { id: nextId("rv"), taskId: b.taskId, reviewerId: project.supervisorId, submittedById: b.submittedById, status: "PENDING_REVIEW" as const, rating: null, feedback: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    store.reviews.push(raw);
    store.notifications.unshift({ id: nextId("n"), userId: project.supervisorId, type: "REVIEW", title: "New submission for review", body: `${getUser(b.submittedById)?.name} submitted "${task.title}" for review.`, read: false, createdAt: new Date().toISOString() });
    persist();
    return hydrateReview(raw) as T;
  }
  if ((params = method === "PATCH" ? match("/reviews/:id", p) : null)) {
    const raw = store.reviews.find((x) => x.id === params!.id);
    if (!raw) notFound("Review not found");
    const isApproval = b.status === "APPROVED" || b.status === "REJECTED";
    if (!(isApproval ? perm.canApproveTask(user) : perm.canReviewTask(user))) forbidden();
    raw.status = b.status;
    raw.rating = b.rating ?? raw.rating;
    raw.feedback = b.feedback ?? raw.feedback;
    raw.updatedAt = new Date().toISOString();
    const task = store.tasks.find((x) => x.id === raw.taskId)!;
    store.notifications.unshift({ id: nextId("n"), userId: raw.submittedById, type: "REVIEW", title: "Your submission was reviewed", body: `"${task.title}" was marked as ${String(b.status).replace("_", " ").toLowerCase()}.`, read: false, createdAt: new Date().toISOString() });
    persist();
    return hydrateReview(raw) as T;
  }

  // ---------- NOTIFICATIONS ----------
  if (method === "GET" && p === "/notifications") {
    return store.notifications
      .filter((n) => n.userId === user.id)
      .sort((a, b2) => b2.createdAt.localeCompare(a.createdAt))
      .map(hydrateNotification) as T;
  }
  if (method === "PATCH" && p === "/notifications/read-all") {
    store.notifications.forEach((n) => {
      if (n.userId === user.id) n.read = true;
    });
    persist();
    return null as T;
  }
  if ((params = method === "PATCH" ? match("/notifications/:id/read", p) : null)) {
    const raw = store.notifications.find((x) => x.id === params!.id);
    if (!raw || raw.userId !== user.id) notFound("Notification not found");
    raw.read = true;
    persist();
    return hydrateNotification(raw) as T;
  }

  // ---------- PERFORMANCE ----------
  if (method === "GET" && p === "/performance") {
    return store.performance.filter((perf) => perm.performanceVisible(user, perf)).map(hydratePerformance) as T;
  }

  // ---------- DASHBOARD ----------
  if (method === "GET" && p === "/dashboard") {
    return buildDashboardStats(user) as T;
  }

  // ---------- REPORTS ----------
  if (method === "GET" && p === "/reports") {
    return buildReportsData(user) as T;
  }

  // ---------- AUDIT LOGS ----------
  if (method === "GET" && p === "/audit-logs") {
    if (user.role !== "SUPER_ADMIN") forbidden();
    return store.auditLogs
      .slice()
      .sort((a, b2) => b2.createdAt.localeCompare(a.createdAt))
      .slice(0, 200)
      .map((log) => ({ ...log, actor: log.actorId ? getUser(log.actorId) ?? null : null })) as T;
  }

  // ---------- PERMISSIONS MATRIX ----------
  if (method === "GET" && p === "/permissions/matrix") {
    if (user.role !== "SUPER_ADMIN") forbidden();
    return perm.PERMISSION_MATRIX as unknown as T;
  }

  // ---------- HELP ARTICLES ----------
  if (method === "GET" && p === "/help") {
    return store.helpArticles
      .slice()
      .sort((a, b2) => a.order - b2.order || a.createdAt.localeCompare(b2.createdAt))
      .map(hydrateHelpArticle) as T;
  }
  if (method === "POST" && p === "/help") {
    if (!perm.canManageHelp(user)) forbidden();
    const maxOrder = store.helpArticles.reduce((max, a) => Math.max(max, a.order), -1);
    const raw = {
      id: nextId("help"),
      question: b.question,
      answer: b.answer,
      order: maxOrder + 1,
      createdById: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.helpArticles.push(raw);
    store.auditLogs.unshift({ id: nextId("al"), actorId: user.id, action: "HELP_ARTICLE_CREATE", targetType: "HelpArticle", targetId: raw.id, details: JSON.stringify({ question: raw.question }), createdAt: new Date().toISOString() });
    persist();
    return hydrateHelpArticle(raw) as T;
  }
  if ((params = method === "PATCH" ? match("/help/:id", p) : null)) {
    if (!perm.canManageHelp(user)) forbidden();
    const raw = store.helpArticles.find((x) => x.id === params!.id);
    if (!raw) notFound("Help article not found");
    if (b.question !== undefined) raw.question = b.question;
    if (b.answer !== undefined) raw.answer = b.answer;
    if (b.order !== undefined) raw.order = b.order;
    raw.updatedAt = new Date().toISOString();
    store.auditLogs.unshift({ id: nextId("al"), actorId: user.id, action: "HELP_ARTICLE_UPDATE", targetType: "HelpArticle", targetId: raw.id, details: JSON.stringify({ question: raw.question }), createdAt: new Date().toISOString() });
    persist();
    return hydrateHelpArticle(raw) as T;
  }
  if ((params = method === "DELETE" ? match("/help/:id", p) : null)) {
    if (!perm.canManageHelp(user)) forbidden();
    const raw = store.helpArticles.find((x) => x.id === params!.id);
    if (!raw) notFound("Help article not found");
    store.helpArticles = store.helpArticles.filter((x) => x.id !== raw.id);
    store.auditLogs.unshift({ id: nextId("al"), actorId: user.id, action: "HELP_ARTICLE_DELETE", targetType: "HelpArticle", targetId: raw.id, details: JSON.stringify({ question: raw.question }), createdAt: new Date().toISOString() });
    persist();
    return null as T;
  }

  throw new ApiClientError(404, "Route not found");
}

function hydrateTeamFull(raw: RawTeam): Team {
  return {
    ...raw,
    leader: getUser(raw.leaderId)!,
    createdBy: getUser(raw.createdById),
    members: store.teamMembers.filter((m) => m.teamId === raw.id).map((m) => ({ ...m, user: getUser(m.userId)! })),
    project: hydrateProject(store.projects.find((p) => p.id === raw.projectId)!),
    tasks: store.tasks.filter((t) => t.teamId === raw.id).map((t) => hydrateTask(t)),
  };
}

function buildDashboardStats(user: User): DashboardStats {
  const projects = store.projects.filter((p) => perm.projectVisible(user, p));
  const teams = store.teams.filter((t) => perm.teamVisible(user, t));
  const tasks = store.tasks.filter((t) => perm.taskVisible(user, t));
  const performanceRecords = store.performance.filter((perf) => perm.performanceVisible(user, perf));

  const now = Date.now();
  const completed = tasks.filter((t) => t.status === "COMPLETED");
  const pending = tasks.filter((t) => t.status !== "COMPLETED" && t.status !== "CANCELLED");
  const late = pending.filter((t) => t.dueDate && new Date(t.dueDate).getTime() < now);

  const upcomingDeadlines = tasks
    .filter((t) => t.dueDate && new Date(t.dueDate).getTime() >= now)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 6)
    .map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate! }));

  const avgRating = performanceRecords.length ? performanceRecords.reduce((s, p) => s + p.rating, 0) / performanceRecords.length : 0;

  const taskCompletionTrend = Array.from({ length: 6 }).map((_, idx) => {
    const weeksAgo = 5 - idx;
    const start = now - (weeksAgo + 1) * 7 * DAY_MS;
    const end = now - weeksAgo * 7 * DAY_MS;
    const count = completed.filter((t) => new Date(t.updatedAt).getTime() >= start && new Date(t.updatedAt).getTime() < end).length;
    return { week: `W${idx + 1}`, completed: count };
  });

  const taskDistribution = TASK_STATUSES.map((status) => ({ status, count: tasks.filter((t) => t.status === status).length }));

  const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayIdx = (new Date().getDay() + 6) % 7;
  const weekStart = now - todayIdx * DAY_MS;
  const weeklyProductivity = weekDayLabels.map((label, idx) => {
    const dayStart = weekStart + idx * DAY_MS;
    const dayEnd = dayStart + DAY_MS;
    const count = completed.filter((t) => new Date(t.updatedAt).getTime() >= dayStart && new Date(t.updatedAt).getTime() < dayEnd).length;
    return { day: label, tasks: count };
  });

  return {
    stats: {
      projects: projects.length,
      teams: teams.length,
      tasks: tasks.length,
      completed: completed.length,
      pending: pending.length,
      late: late.length,
      deadlines: upcomingDeadlines.length,
      rating: Number(avgRating.toFixed(1)),
    },
    upcomingDeadlines,
    taskCompletionTrend,
    taskDistribution,
    weeklyProductivity,
  };
}

function buildReportsData(user: User): ReportsData {
  const teams = store.teams.filter((t) => perm.teamVisible(user, t));
  const tasks = store.tasks.filter((t) => perm.taskVisible(user, t));
  const now = Date.now();

  const teamEfficiency = teams.map((team) => {
    const teamTasks = store.tasks.filter((t) => t.teamId === team.id);
    const completedCount = teamTasks.filter((t) => t.status === "COMPLETED").length;
    const efficiency = teamTasks.length ? Math.round((completedCount / teamTasks.length) * 100) : 0;
    return { team: team.name, efficiency, completed: completedCount, total: teamTasks.length };
  });

  const completionTrend = Array.from({ length: 6 }).map((_, idx) => {
    const weeksAgo = 5 - idx;
    const start = now - (weeksAgo + 1) * 7 * DAY_MS;
    const end = now - weeksAgo * 7 * DAY_MS;
    const completed = tasks.filter((t) => t.status === "COMPLETED" && new Date(t.updatedAt).getTime() >= start && new Date(t.updatedAt).getTime() < end).length;
    return { week: `W${idx + 1}`, completed };
  });

  const taskDistribution = TASK_STATUSES.map((status) => ({ status, count: tasks.filter((t) => t.status === status).length }));

  const lateSubmissions = tasks.filter((t) => t.dueDate && new Date(t.dueDate).getTime() < now && t.status !== "COMPLETED" && t.status !== "CANCELLED").length;

  return { teamEfficiency, completionTrend, taskDistribution, lateSubmissions };
}
