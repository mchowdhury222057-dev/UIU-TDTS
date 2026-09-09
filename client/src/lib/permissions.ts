import type { Project, Team, User } from "../types";

// Frontend mirror of server/src/services/permissions.ts, used ONLY to decide
// what to render (hide buttons/pages a user can't use). The backend is the
// actual authority — every mutating request is re-checked there regardless
// of what this file decides to show.

export function isSuperAdmin(user: User) {
  return user.role === "SUPER_ADMIN";
}

export function canCreateProject(user: User) {
  return user.role === "SUPER_ADMIN" || user.role === "FACULTY";
}

export function canEditProject(user: User, project: Project) {
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role === "FACULTY") return project.supervisorId === user.id || project.createdById === user.id;
  return false;
}

export function canDeleteProject(user: User, project: Project) {
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role === "FACULTY") return project.createdById === user.id;
  return false;
}

export function canCreateTeam(user: User) {
  return user.role === "SUPER_ADMIN" || user.role === "FACULTY";
}

export function canEditTeam(user: User, team: Team) {
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role === "FACULTY") {
    return (
      team.createdById === user.id ||
      team.project?.supervisorId === user.id ||
      team.project?.createdById === user.id
    );
  }
  return false;
}

export function canDeleteTeam(user: User, team: Team) {
  return canEditTeam(user, team);
}

export function canReviewTask(user: User) {
  return user.role === "SUPER_ADMIN" || user.role === "FACULTY" || user.role === "TA";
}

export function canApproveTask(user: User) {
  return canReviewTask(user);
}

export function canExportReports(user: User) {
  return user.role === "SUPER_ADMIN" || user.role === "FACULTY" || user.role === "TA";
}

export function canViewGlobalAnalytics(user: User) {
  return user.role === "SUPER_ADMIN" || user.role === "FACULTY" || user.role === "TA";
}

export function canManageUsers(user: User) {
  return user.role === "SUPER_ADMIN";
}

export function canManageRoles(user: User) {
  return user.role === "SUPER_ADMIN";
}

export function canManageHelp(user: User) {
  return user.role === "SUPER_ADMIN";
}

export function getCreateOptions(user: User): Array<"project" | "task" | "team"> {
  switch (user.role) {
    case "SUPER_ADMIN":
    case "FACULTY":
      return ["project", "task", "team"];
    default:
      return ["task"];
  }
}
