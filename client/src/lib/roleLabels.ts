import type { Role } from "../types";

// Centralized internal-role -> display-label mapping.
// STUDENT must NEVER be rendered as "Student" anywhere in the UI.
export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  FACULTY: "Faculty",
  TA: "Teaching Assistant",
  LEADER: "Team Leader",
  STUDENT: "Member",
};

export function roleLabel(role: Role): string {
  return ROLE_LABELS[role];
}

export const ALL_ROLES: Role[] = ["SUPER_ADMIN", "FACULTY", "TA", "LEADER", "STUDENT"];
export const PUBLIC_SIGNUP_ROLES: Role[] = ["STUDENT", "LEADER"];
