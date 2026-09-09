import { Prisma, User } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { canCreateSprint, canDeleteSprint, canEditSprint } from "./permissions";
import { projectVisibilityWhere } from "./project.service";
import { CreateSprintInput, UpdateSprintInput } from "../validators/sprint.validator";
import { writeAuditLog } from "./audit.service";

const sprintInclude = {
  project: true,
  createdBy: true,
  tasks: {
    include: {
      assignee: true,
      createdBy: true,
      project: true,
      team: { include: { members: true } },
      _count: { select: { comments: true } },
    },
  },
} satisfies Prisma.SprintInclude;

export function sprintVisibilityWhere(user: User): Prisma.SprintWhereInput {
  return { project: projectVisibilityWhere(user) };
}

export async function listSprintsForUser(user: User) {
  return prisma.sprint.findMany({
    where: sprintVisibilityWhere(user),
    include: sprintInclude,
    orderBy: { startDate: "desc" },
  });
}

export async function getSprintForUser(user: User, id: string) {
  const sprint = await prisma.sprint.findFirst({
    where: { id, ...sprintVisibilityWhere(user) },
    include: sprintInclude,
  });
  if (!sprint) throw ApiError.notFound("Sprint not found");
  return sprint;
}

export async function createSprint(user: User, input: CreateSprintInput) {
  if (!canCreateSprint(user)) throw ApiError.forbidden();

  const project = await prisma.project.findUnique({ where: { id: input.projectId } });
  if (!project) throw ApiError.badRequest("Selected project does not exist.");

  return prisma.$transaction(async (tx) => {
    const sprint = await tx.sprint.create({
      data: {
        name: input.name,
        goal: input.goal,
        projectId: input.projectId,
        status: input.status,
        startDate: input.startDate,
        endDate: input.endDate,
        createdById: user.id,
      },
      include: sprintInclude,
    });
    await writeAuditLog(tx, {
      actorId: user.id,
      action: "SPRINT_CREATE",
      targetType: "Sprint",
      targetId: sprint.id,
      details: { name: sprint.name, projectId: sprint.projectId },
    });
    return sprint;
  });
}

export async function updateSprint(user: User, id: string, input: UpdateSprintInput) {
  const sprint = await prisma.sprint.findUnique({ where: { id }, include: { project: true } });
  if (!sprint) throw ApiError.notFound("Sprint not found");
  if (!canEditSprint(user, sprint)) throw ApiError.forbidden();

  return prisma.sprint.update({
    where: { id },
    data: {
      name: input.name,
      goal: input.goal,
      status: input.status,
      startDate: input.startDate,
      endDate: input.endDate,
    },
    include: sprintInclude,
  });
}

export async function deleteSprint(user: User, id: string) {
  const sprint = await prisma.sprint.findUnique({ where: { id }, include: { project: true } });
  if (!sprint) throw ApiError.notFound("Sprint not found");
  if (!canDeleteSprint(user, sprint)) throw ApiError.forbidden();

  return prisma.$transaction(async (tx) => {
    await tx.sprint.delete({ where: { id } });
    await writeAuditLog(tx, {
      actorId: user.id,
      action: "SPRINT_DELETE",
      targetType: "Sprint",
      targetId: id,
      details: { name: sprint.name },
    });
  });
}
