import { Department, Role } from "@prisma/client";
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  title: z.string().max(120).optional(),
  bio: z.string().max(2000).optional(),
  skills: z.array(z.string()).optional(),
  avatarColor: z.string().optional(),
  department: z.nativeEnum(Department).optional(),
});

export const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
