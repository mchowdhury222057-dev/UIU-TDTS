import { User } from "@prisma/client";
import { roleLabel } from "./roleLabels";

const AVATAR_COLORS = [
  "#F59E0B",
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#EF4444",
  "#EC4899",
  "#14B8A6",
  "#6366F1",
];

export function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// Strips sensitive fields (passwordHash) and adds the display-safe role label.
export function sanitizeUser(user: User) {
  const { passwordHash, ...safe } = user;
  return {
    ...safe,
    roleLabel: roleLabel(user.role),
  };
}

export type SafeUser = ReturnType<typeof sanitizeUser>;
