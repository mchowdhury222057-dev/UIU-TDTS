import { Prisma, Role, User } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { canCreateProject, canDeleteProject, canEditProject } from "./permissions";
import { CreateProjectInput, UpdateProjectInput } from "../validators/project.validator";
import { writeAuditLog } from "./audit.service";

const projectInclude = {
  supervisor: true,
  createdBy: true,
  teams: {
    include: {
      leader: true,
      members: { include: { user: true } },
    },
  },
  _count: { select: { tasks: true } },
} satisfies Prisma.ProjectInclude;

export function projectVisibilityWhere(user: User): Prisma.ProjectWhereInput {
  switch (user.role) {
    case Role.SUPER_ADMIN:
    case Role.TA:
      return {};
    case Role.FACULTY:
      return { OR: [{ supervisorId: user.id }, { createdById: user.id }] };
    case Role.LEADER:
    case Role.STUDENT:
      return {
        OR: [
          { teams: { some: { leaderId: user.id } } },
          { teams: { some: { members: { some: { userId: user.id } } } } },
          { tasks: { some: { assigneeId: user.id } } },
        ],
      };
    default:
      return { id: "__none__" };
  }
}

export async function listProjectsForUser(user: User) {
  return prisma.project.findMany({
    where: projectVisibilityWhere(user),
    include: projectInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectForUser(user: User, id: string) {
  const project = await prisma.project.findFirst({
    where: { id, ...projectVisibilityWhere(user) },
    include: projectInclude,
  });
  if (!project) throw ApiError.notFound("Project not found");
  return project;
}

export async function createProject(user: User, input: CreateProjectInput) {
  if (!canCreateProject(user)) {
    throw ApiError.forbidden();
  }

  const supervisor = await prisma.user.findUnique({ where: { id: input.supervisorId } });
  if (!supervisor || !(supervisor.role === Role.FACULTY || supervisor.role === Role.SUPER_ADMIN)) {
    throw ApiError.badRequest("Supervisor must be a Faculty or Super Admin user.");
  }

  return prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        name: input.name,
        courseCode: input.courseCode,
        description: input.description,
        priority: input.priority,
        status: input.status,
        deadline: input.deadline,
        supervisorId: input.supervisorId,
        createdById: user.id,
      },
      include: projectInclude,
    });
    await writeAuditLog(tx, {
      actorId: user.id,
      action: "PROJECT_CREATE",
      targetType: "Project",
      targetId: project.id,
      details: { name: project.name },
    });
    return project;
  });
}

export async function updateProject(user: User, id: string, input: UpdateProjectInput) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw ApiError.notFound("Project not found");
  if (!canEditProject(user, project)) {
    throw ApiError.forbidden();
  }

  if (input.supervisorId) {
    const supervisor = await prisma.user.findUnique({ where: { id: input.supervisorId } });
    if (!supervisor || !(supervisor.role === Role.FACULTY || supervisor.role === Role.SUPER_ADMIN)) {
      throw ApiError.badRequest("Supervisor must be a Faculty or Super Admin user.");
    }
  }

  return prisma.project.update({
    where: { id },
    data: input,
    include: projectInclude,
  });
}

export async function deleteProject(user: User, id: string) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw ApiError.notFound("Project not found");
  if (!canDeleteProject(user, project)) {
    throw ApiError.forbidden();
  }

  return prisma.$transaction(async (tx) => {
    await tx.project.delete({ where: { id } });
    await writeAuditLog(tx, {
      actorId: user.id,
      action: "PROJECT_DELETE",
      targetType: "Project",
      targetId: id,
      details: { name: project.name },
    });
  });
}
