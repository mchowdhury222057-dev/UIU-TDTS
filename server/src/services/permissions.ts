import { Project, Role, Task, Team, TeamMember, User } from "@prisma/client";

type ProjectWithRelations = Project;
type TeamWithRelations = Team & { project?: Project | null };
type TaskWithRelations = Task & {
  team?: (Team & { members?: TeamMember[] }) | null;
  project?: Project | null;
};

function facultyOwnsTaskProject(user: User, task: TaskWithRelations): boolean {
  return task.project?.supervisorId === user.id || task.project?.createdById === user.id;
}

// ---------- Registration ----------

const PUBLIC_SIGNUP_ROLES: Role[] = [Role.STUDENT, Role.LEADER];

export function canRegisterAsRole(role: Role): boolean {
  return PUBLIC_SIGNUP_ROLES.includes(role);
}

// ---------- Project ----------

export function canCreateProject(user: User): boolean {
  return user.role === Role.SUPER_ADMIN || user.role === Role.FACULTY;
}

export function canEditProject(user: User, project: ProjectWithRelations): boolean {
  if (user.role === Role.SUPER_ADMIN) return true;
  if (user.role === Role.FACULTY) {
    return project.supervisorId === user.id || project.createdById === user.id;
  }
  return false;
}

export function canDeleteProject(user: User, project: ProjectWithRelations): boolean {
  if (user.role === Role.SUPER_ADMIN) return true;
  if (user.role === Role.FACULTY) {
    return project.createdById === user.id;
  }
  return false;
}

export function canAccessProject(
  user: User,
  project: ProjectWithRelations,
  membership: { isTeamMember: boolean; isTeamLeader: boolean; hasTask: boolean }
): boolean {
  switch (user.role) {
    case Role.SUPER_ADMIN:
      return true;
    case Role.FACULTY:
      return project.supervisorId === user.id || project.createdById === user.id;
    case Role.TA:
      return true;
    case Role.LEADER:
      return membership.isTeamLeader || membership.isTeamMember || membership.hasTask;
    case Role.STUDENT:
      return membership.isTeamMember || membership.hasTask;
    default:
      return false;
  }
}

// ---------- Team ----------

export function canCreateTeam(user: User): boolean {
  return user.role === Role.SUPER_ADMIN || user.role === Role.FACULTY;
}

export function canEditTeam(user: User, team: TeamWithRelations): boolean {
  if (user.role === Role.SUPER_ADMIN) return true;
  if (user.role === Role.FACULTY) {
    return (
      team.createdById === user.id ||
      team.project?.supervisorId === user.id ||
      team.project?.createdById === user.id
    );
  }
  return false;
}

export function canDeleteTeam(user: User, team: TeamWithRelations): boolean {
  return canEditTeam(user, team);
}

export function canAccessTeam(
  user: User,
  team: TeamWithRelations,
  membership: { isMember: boolean }
): boolean {
  switch (user.role) {
    case Role.SUPER_ADMIN:
      return true;
    case Role.FACULTY:
      return (
        team.createdById === user.id ||
        team.project?.supervisorId === user.id ||
        team.project?.createdById === user.id
      );
    case Role.TA:
      return true;
    case Role.LEADER:
      return team.leaderId === user.id || membership.isMember;
    case Role.STUDENT:
      return membership.isMember;
    default:
      return false;
  }
}

// ---------- Task ----------

export function canCreateTask(user: User): boolean {
  // Every authenticated role may create tasks; project/team access and
  // assignee authorization are enforced separately in the service layer.
  return Boolean(user);
}

export function canAssignTaskTo(
  user: User,
  targetUserId: string,
  team: TeamWithRelations | null
): boolean {
  if (targetUserId === user.id) return true;
  if (user.role === Role.SUPER_ADMIN || user.role === Role.FACULTY || user.role === Role.TA) {
    return true;
  }
  if (user.role === Role.LEADER) {
    return team?.leaderId === user.id;
  }
  return false;
}

export function canEditTask(user: User, task: TaskWithRelations): boolean {
  if (user.role === Role.SUPER_ADMIN) return true;
  if (user.role === Role.FACULTY) return facultyOwnsTaskProject(user, task);
  if (user.role === Role.TA) return true;
  if (user.role === Role.LEADER) return task.team?.leaderId === user.id;
  if (user.role === Role.STUDENT) return task.assigneeId === user.id;
  return false;
}

export function canDeleteTask(user: User, task: TaskWithRelations): boolean {
  if (user.role === Role.SUPER_ADMIN) return true;
  if (user.role === Role.FACULTY) return facultyOwnsTaskProject(user, task);
  return false;
}

export function canChangeTaskStatus(user: User, task: TaskWithRelations): boolean {
  if (user.role === Role.SUPER_ADMIN) return true;
  if (user.role === Role.FACULTY) return facultyOwnsTaskProject(user, task);
  if (user.role === Role.TA) return true;
  if (user.role === Role.LEADER) return task.team?.leaderId === user.id;
  if (user.role === Role.STUDENT) return task.assigneeId === user.id;
  return false;
}

export function canAccessTask(
  user: User,
  task: TaskWithRelations,
  membership: { isTeamMember: boolean; isTeamLeader: boolean }
): boolean {
  switch (user.role) {
    case Role.SUPER_ADMIN:
      return true;
    case Role.FACULTY:
      return facultyOwnsTaskProject(user, task);
    case Role.TA:
      return true;
    case Role.LEADER:
      return membership.isTeamLeader || membership.isTeamMember || task.assigneeId === user.id;
    case Role.STUDENT:
      return task.assigneeId === user.id || membership.isTeamMember;
    default:
      return false;
  }
}

// ---------- Reviews ----------

export function canReviewTask(user: User): boolean {
  return user.role === Role.SUPER_ADMIN || user.role === Role.FACULTY || user.role === Role.TA;
}

export function canApproveTask(user: User): boolean {
  return canReviewTask(user);
}

// ---------- Reports ----------

export function canExportReports(user: User): boolean {
  return user.role === Role.SUPER_ADMIN || user.role === Role.FACULTY || user.role === Role.TA;
}

export function canViewGlobalAnalytics(user: User): boolean {
  return user.role === Role.SUPER_ADMIN || user.role === Role.FACULTY || user.role === Role.TA;
}

// ---------- Users / Roles / Permissions ----------

export function canManageUsers(user: User): boolean {
  return user.role === Role.SUPER_ADMIN;
}

export function canManageRoles(user: User): boolean {
  return user.role === Role.SUPER_ADMIN;
}

export function canManagePermissions(user: User): boolean {
  return user.role === Role.SUPER_ADMIN;
}

export function canManageHelp(user: User): boolean {
  return user.role === Role.SUPER_ADMIN;
}

export function canModifyUserRole(actor: User, target: User): { allowed: boolean; reason?: string } {
  if (actor.role !== Role.SUPER_ADMIN) {
    return { allowed: false, reason: "You do not have permission to perform this action." };
  }
  if (target.id === actor.id) {
    return { allowed: false, reason: "You cannot change your own role." };
  }
  if (target.role === Role.SUPER_ADMIN) {
    return { allowed: false, reason: "Super Admin accounts are protected and cannot be modified." };
  }
  return { allowed: true };
}

export function canDeleteUser(actor: User, target: User): { allowed: boolean; reason?: string } {
  if (actor.role !== Role.SUPER_ADMIN) {
    return { allowed: false, reason: "You do not have permission to perform this action." };
  }
  if (target.id === actor.id) {
    return { allowed: false, reason: "You cannot delete your own account." };
  }
  if (target.role === Role.SUPER_ADMIN) {
    return { allowed: false, reason: "Super Admin accounts are protected and cannot be deleted." };
  }
  return { allowed: true };
}

// ---------- Create dropdown (top bar) ----------

export function getCreateOptions(user: User): Array<"project" | "task" | "team"> {
  switch (user.role) {
    case Role.SUPER_ADMIN:
    case Role.FACULTY:
      return ["project", "task", "team"];
    case Role.TA:
    case Role.LEADER:
    case Role.STUDENT:
      return ["task"];
    default:
      return [];
  }
}

// ---------- Permission matrix (for the Roles & Permissions page) ----------

export type PermissionKey =
  | "create"
  | "edit"
  | "delete"
  | "assign"
  | "review"
  | "approve"
  | "export"
  | "manageUsers"
  | "manageRoles"
  | "manageReports";

export const PERMISSION_MATRIX: Record<Role, Record<PermissionKey, boolean>> = {
  SUPER_ADMIN: {
    create: true,
    edit: true,
    delete: true,
    assign: true,
    review: true,
    approve: true,
    export: true,
    manageUsers: true,
    manageRoles: true,
    manageReports: true,
  },
  FACULTY: {
    create: true,
    edit: true,
    delete: true,
    assign: true,
    review: true,
    approve: true,
    export: true,
    manageUsers: false,
    manageRoles: false,
    manageReports: true,
  },
  TA: {
    create: true,
    edit: false,
    delete: false,
    assign: true,
    review: true,
    approve: true,
    export: true,
    manageUsers: false,
    manageRoles: false,
    manageReports: false,
  },
  LEADER: {
    create: true,
    edit: false,
    delete: false,
    assign: true,
    review: false,
    approve: false,
    export: false,
    manageUsers: false,
    manageRoles: false,
    manageReports: false,
  },
  STUDENT: {
    create: true,
    edit: false,
    delete: false,
    assign: false,
    review: false,
    approve: false,
    export: false,
    manageUsers: false,
    manageRoles: false,
    manageReports: false,
  },
};
