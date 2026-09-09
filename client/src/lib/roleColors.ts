import type { Role } from "../types";

// Per-role color coding so the role of a demo account (or anywhere else a
// role badge appears) is distinguishable at a glance, not just by its text
// label. Deliberately avoids the brand amber/orange so role badges never
// get mistaken for a primary action.
interface RoleColor {
  /** Solid, white-text fill — for avatar chips and badges on colored/dark backgrounds. */
  solid: string;
  /** Soft tinted pill — for badges on light backgrounds. */
  soft: string;
}

export const ROLE_COLORS: Record<Role, RoleColor> = {
  SUPER_ADMIN: { solid: "bg-rose-500", soft: "bg-rose-50 text-rose-700 border border-rose-200" },
  FACULTY: { solid: "bg-blue-500", soft: "bg-blue-50 text-blue-700 border border-blue-200" },
  TA: { solid: "bg-teal-500", soft: "bg-teal-50 text-teal-700 border border-teal-200" },
  LEADER: { solid: "bg-violet-500", soft: "bg-violet-50 text-violet-700 border border-violet-200" },
  STUDENT: { solid: "bg-emerald-500", soft: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
};
