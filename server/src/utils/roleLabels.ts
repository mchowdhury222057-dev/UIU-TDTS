import { Role } from "@prisma/client";

// Centralized internal-role -> display-label mapping.
// STUDENT must NEVER be shown as "Student" in any user-facing text.
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
