import { Prisma, Role, User } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { canCreateTeam, canDeleteTeam, canEditTeam } from "./permissions";
import { CreateTeamInput, UpdateTeamInput } from "../validators/team.validator";
import { writeAuditLog } from "./audit.service";

const teamInclude = {
  project: true,
  leader: true,
  createdBy: true,
  members: { include: { user: true } },
  tasks: true,
} satisfies Prisma.TeamInclude;

export function teamVisibilityWhere(user: User): Prisma.TeamWhereInput {
  switch (user.role) {
    case Role.SUPER_ADMIN:
    case Role.TA:
      return {};
    case Role.FACULTY:
      return {
        OR: [
          { createdById: user.id },
          { project: { supervisorId: user.id } },
          { project: { createdById: user.id } },
        ],
      };
    case Role.LEADER:
    case Role.STUDENT:
      return {
        OR: [{ leaderId: user.id }, { members: { some: { userId: user.id } } }],
      };
    default:
      return { id: "__none__" };
  }
}

export async function listTeamsForUser(user: User) {
  return prisma.team.findMany({
    where: teamVisibilityWhere(user),
    include: teamInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getTeamForUser(user: User, id: string) {
  const team = await prisma.team.findFirst({
    where: { id, ...teamVisibilityWhere(user) },
    include: teamInclude,
  });
  if (!team) throw ApiError.notFound("Team not found");
  return team;
}

async function assertValidLeaderAndMembers(leaderId: string, memberIds: string[]) {
  const leader = await prisma.user.findUnique({ where: { id: leaderId } });
  if (!leader || !(leader.role === Role.LEADER || leader.role === Role.SUPER_ADMIN || leader.role === Role.FACULTY)) {
    throw ApiError.badRequest("Team leader must be a Team Leader, Faculty, or Super Admin user.");
  }
  if (memberIds.length > 0) {
    const members = await prisma.user.findMany({ where: { id: { in: memberIds } } });
    if (members.length !== memberIds.length) {
      throw ApiError.badRequest("One or more selected members do not exist.");
    }
  }
}

export async function createTeam(user: User, input: CreateTeamInput) {
  if (!canCreateTeam(user)) {
    throw ApiError.forbidden();
  }

  const project = await prisma.project.findUnique({ where: { id: input.projectId } });
  if (!project) throw ApiError.badRequest("Selected project does not exist.");

  await assertValidLeaderAndMembers(input.leaderId, input.memberIds);

  return prisma.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        name: input.name,
        projectId: input.projectId,
        leaderId: input.leaderId,
        createdById: user.id,
        members: {
          create: input.memberIds.map((userId) => ({ userId })),
        },
      },
      include: teamInclude,
    });
    await writeAuditLog(tx, {
      actorId: user.id,
      action: "TEAM_CREATE",
      targetType: "Team",
      targetId: team.id,
      details: { name: team.name, projectId: team.projectId },
    });
    return team;
  });
}

export async function updateTeam(user: User, id: string, input: UpdateTeamInput) {
  const team = await prisma.team.findUnique({ where: { id }, include: { project: true } });
  if (!team) throw ApiError.notFound("Team not found");
  if (!canEditTeam(user, team)) {
    throw ApiError.forbidden();
  }

  if (input.leaderId) {
    await assertValidLeaderAndMembers(input.leaderId, input.memberIds ?? []);
  }

  return prisma.$transaction(async (tx) => {
    if (input.memberIds) {
      await tx.teamMember.deleteMany({ where: { teamId: id } });
      await tx.teamMember.createMany({
        data: input.memberIds.map((userId) => ({ teamId: id, userId })),
      });
    }
    return tx.team.update({
      where: { id },
      data: {
        name: input.name,
        leaderId: input.leaderId,
      },
      include: teamInclude,
    });
  });
}

export async function deleteTeam(user: User, id: string) {
  const team = await prisma.team.findUnique({ where: { id }, include: { project: true } });
  if (!team) throw ApiError.notFound("Team not found");
  if (!canDeleteTeam(user, team)) {
    throw ApiError.forbidden();
  }

  return prisma.$transaction(async (tx) => {
    await tx.team.delete({ where: { id } });
    await writeAuditLog(tx, {
      actorId: user.id,
      action: "TEAM_DELETE",
      targetType: "Team",
      targetId: id,
      details: { name: team.name },
    });
  });
}
