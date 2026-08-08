import { Prisma, Role, User } from "@prisma/client";
import { prisma } from "../config/prisma";

const performanceInclude = {
  user: true,
  project: true,
} satisfies Prisma.PerformanceInclude;

export function performanceVisibilityWhere(user: User): Prisma.PerformanceWhereInput {
  switch (user.role) {
    case Role.SUPER_ADMIN:
    case Role.TA:
      return {};
    case Role.FACULTY:
      return {
        project: { OR: [{ supervisorId: user.id }, { createdById: user.id }] },
      };
    case Role.LEADER:
      return {
        OR: [
          { userId: user.id },
          { project: { teams: { some: { leaderId: user.id } } } },
        ],
      };
    case Role.STUDENT:
      return { userId: user.id };
    default:
      return { id: "__none__" };
  }
}

export async function listPerformanceForUser(user: User) {
  return prisma.performance.findMany({
    where: performanceVisibilityWhere(user),
    include: performanceInclude,
    orderBy: { score: "desc" },
  });
}
