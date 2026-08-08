import bcrypt from "bcryptjs";
import { Role, User } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { canDeleteUser, canModifyUserRole } from "./permissions";
import { computeInitials } from "../utils/user";
import { UpdateProfileInput } from "../validators/user.validator";
import { writeAuditLog } from "./audit.service";

export async function listUsers() {
  return prisma.user.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const data: Partial<User> = { ...input };
  if (input.name) {
    data.initials = computeInitials(input.name);
  }
  return prisma.user.update({ where: { id: userId }, data });
}

export async function updatePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    throw ApiError.badRequest("Current password is incorrect");
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

export async function changeUserRole(actor: User, targetId: string, newRole: Role) {
  const target = await getUserById(targetId);

  const check = canModifyUserRole(actor, target);
  if (!check.allowed) {
    throw ApiError.forbidden(check.reason);
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({ where: { id: targetId }, data: { role: newRole } });
    await writeAuditLog(tx, {
      actorId: actor.id,
      action: "ROLE_CHANGE",
      targetType: "User",
      targetId: target.id,
      details: { from: target.role, to: newRole, targetName: target.name },
    });
    return updated;
  });
}

export async function deleteUser(actor: User, targetId: string) {
  const target = await getUserById(targetId);
  const check = canDeleteUser(actor, target);
  if (!check.allowed) {
    throw ApiError.forbidden(check.reason);
  }

  return prisma.$transaction(async (tx) => {
    await tx.user.delete({ where: { id: targetId } });
    await writeAuditLog(tx, {
      actorId: actor.id,
      action: "USER_DELETE",
      targetType: "User",
      targetId: target.id,
      details: { name: target.name, email: target.email },
    });
  });
}
