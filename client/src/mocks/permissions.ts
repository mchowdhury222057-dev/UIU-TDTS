// Mirrors server/src/services/permissions.ts so demo mode's role-scoping
// (who sees which projects/teams/tasks, who can create/approve/etc.)
// matches the real backend's behavior.

import type { PermissionKey, PermissionMatrix, Role, User } from "../types";
import { store } from "./store";
import type { RawPerformance, RawProject, RawTask, RawTeam } from "./seedData";

export function canRegisterAsRole(role: Role): boolean {
  return role === "STUDENT" || role === "LEADER";
}

export function canCreateProject(user: User): boolean {
  return user.role === "SUPER_ADMIN" || user.role === "FACULTY";
}

export function canEditProject(user: User, project: RawProject): boolean {
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role === "FACULTY") return project.supervisorId === user.id || project.createdById === user.id;
  return false;
}

export function canDeleteProject(user: User, project: RawProject): boolean {
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role === "FACULTY") return project.createdById === user.id;
  return false;
}

function isTeamMember(userId: string, teamId: string): boolean {
  return store.teamMembers.some((m) => m.teamId === teamId && m.userId === userId);
}

function userTeamIds(userId: string): string[] {
  return store.teams.filter((t) => t.leaderId === userId || isTeamMember(userId, t.id)).map((t) => t.id);
}

export function projectVisible(user: User, project: RawProject): boolean {
  switch (user.role) {
    case "SUPER_ADMIN":
    case "TA":
      return true;
    case "FACULTY":
      return project.supervisorId === user.id || project.createdById === user.id;
    case "LEADER":
    case "STUDENT": {
      const teamIds = userTeamIds(user.id);
      const hasTeamInProject = store.teams.some((t) => t.projectId === project.id && teamIds.includes(t.id));
      const hasTask = store.tasks.some((t) => t.projectId === project.id && t.assigneeId === user.id);
      return hasTeamInProject || hasTask;
    }
    default:
      return false;
  }
}

export function canCreateTeam(user: User): boolean {
  return user.role === "SUPER_ADMIN" || user.role === "FACULTY";
}

export function canEditTeam(user: User, team: RawTeam): boolean {
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role === "FACULTY") {
    const project = store.projects.find((p) => p.id === team.projectId);
    return team.createdById === user.id || project?.supervisorId === user.id || project?.createdById === user.id;
  }
  return false;
}

export function canDeleteTeam(user: User, team: RawTeam): boolean {
  return canEditTeam(user, team);
}

export function teamVisible(user: User, team: RawTeam): boolean {
  switch (user.role) {
    case "SUPER_ADMIN":
    case "TA":
      return true;
    case "FACULTY": {
      const project = store.projects.find((p) => p.id === team.projectId);
      return team.createdById === user.id || project?.supervisorId === user.id || project?.createdById === user.id;
    }
    case "LEADER":
    case "STUDENT":
      return team.leaderId === user.id || isTeamMember(user.id, team.id);
    default:
      return false;
  }
}

function facultyOwnsTaskProject(user: User, task: RawTask): boolean {
  const project = store.projects.find((p) => p.id === task.projectId);
  return project?.supervisorId === user.id || project?.createdById === user.id;
}

export function canCreateTask(_user: User): boolean {
  return true;
}

export function canAssignTaskTo(user: User, targetUserId: string, team: RawTeam | null): boolean {
  if (targetUserId === user.id) return true;
  if (user.role === "SUPER_ADMIN" || user.role === "FACULTY" || user.role === "TA") return true;
  if (user.role === "LEADER") return team?.leaderId === user.id;
  return false;
}

export function canEditTask(user: User, task: RawTask): boolean {
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role === "FACULTY") return facultyOwnsTaskProject(user, task);
  if (user.role === "TA") return true;
  const team = task.teamId ? store.teams.find((t) => t.id === task.teamId) : undefined;
  if (user.role === "LEADER") return team?.leaderId === user.id;
  if (user.role === "STUDENT") return task.assigneeId === user.id;
  return false;
}

export function canChangeTaskStatus(user: User, task: RawTask): boolean {
  return canEditTask(user, task);
}

export function canDeleteTask(user: User, task: RawTask): boolean {
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role === "FACULTY") return facultyOwnsTaskProject(user, task);
  return false;
}

export function taskVisible(user: User, task: RawTask): boolean {
  switch (user.role) {
    case "SUPER_ADMIN":
    case "TA":
      return true;
    case "FACULTY":
      return facultyOwnsTaskProject(user, task);
    case "LEADER": {
      const team = task.teamId ? store.teams.find((t) => t.id === task.teamId) : undefined;
      return team?.leaderId === user.id || (task.teamId ? isTeamMember(user.id, task.teamId) : false) || task.assigneeId === user.id;
    }
    case "STUDENT":
      return task.assigneeId === user.id || (task.teamId ? isTeamMember(user.id, task.teamId) : false);
    default:
      return false;
  }
}

export function performanceVisible(user: User, perf: RawPerformance): boolean {
  switch (user.role) {
    case "SUPER_ADMIN":
    case "TA":
      return true;
    case "FACULTY": {
      const project = store.projects.find((p) => p.id === perf.projectId);
      return project?.supervisorId === user.id || project?.createdById === user.id;
    }
    case "LEADER":
      return perf.userId === user.id || store.teams.some((t) => t.projectId === perf.projectId && t.leaderId === user.id);
    case "STUDENT":
      return perf.userId === user.id;
    default:
      return false;
  }
}

export function reviewVisible(user: User, review: { taskId: string; submittedById: string }): boolean {
  const task = store.tasks.find((t) => t.id === review.taskId);
  if (!task) return false;
  switch (user.role) {
    case "SUPER_ADMIN":
    case "TA":
      return true;
    case "FACULTY":
      return facultyOwnsTaskProject(user, task);
    case "LEADER": {
      const team = task.teamId ? store.teams.find((t) => t.id === task.teamId) : undefined;
      return team?.leaderId === user.id;
    }
    case "STUDENT":
      return review.submittedById === user.id;
    default:
      return false;
  }
}

export function canReviewTask(user: User): boolean {
  return user.role === "SUPER_ADMIN" || user.role === "FACULTY" || user.role === "TA";
}

export function canApproveTask(user: User): boolean {
  return canReviewTask(user);
}

export function canExportReports(user: User): boolean {
  return user.role === "SUPER_ADMIN" || user.role === "FACULTY" || user.role === "TA";
}

export function canManageUsers(user: User): boolean {
  return user.role === "SUPER_ADMIN";
}

export function canManageRoles(user: User): boolean {
  return user.role === "SUPER_ADMIN";
}

export function canModifyUserRole(actor: User, target: User): { allowed: boolean; reason?: string } {
  if (actor.role !== "SUPER_ADMIN") return { allowed: false, reason: "You do not have permission to perform this action." };
  if (target.id === actor.id) return { allowed: false, reason: "You cannot change your own role." };
  if (target.role === "SUPER_ADMIN") return { allowed: false, reason: "Super Admin accounts are protected and cannot be modified." };
  return { allowed: true };
}

export function canDeleteUser(actor: User, target: User): { allowed: boolean; reason?: string } {
  if (actor.role !== "SUPER_ADMIN") return { allowed: false, reason: "You do not have permission to perform this action." };
  if (target.id === actor.id) return { allowed: false, reason: "You cannot delete your own account." };
  if (target.role === "SUPER_ADMIN") return { allowed: false, reason: "Super Admin accounts are protected and cannot be deleted." };
  return { allowed: true };
}

export const PERMISSION_MATRIX: PermissionMatrix = {
  SUPER_ADMIN: { create: true, edit: true, delete: true, assign: true, review: true, approve: true, export: true, manageUsers: true, manageRoles: true, manageReports: true },
  FACULTY: { create: true, edit: true, delete: true, assign: true, review: true, approve: true, export: true, manageUsers: false, manageRoles: false, manageReports: true },
  TA: { create: true, edit: false, delete: false, assign: true, review: true, approve: true, export: true, manageUsers: false, manageRoles: false, manageReports: false },
  LEADER: { create: true, edit: false, delete: false, assign: true, review: false, approve: false, export: false, manageUsers: false, manageRoles: false, manageReports: false },
  STUDENT: { create: true, edit: false, delete: false, assign: false, review: false, approve: false, export: false, manageUsers: false, manageRoles: false, manageReports: false },
};

export type { PermissionKey };
