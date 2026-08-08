import { Prisma, Role, TaskStatus, User } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import {
  canAssignTaskTo,
  canChangeTaskStatus,
  canCreateTask,
  canDeleteTask,
  canEditTask,
} from "./permissions";
import { CreateTaskInput, UpdateTaskInput } from "../validators/task.validator";
import { writeAuditLog } from "./audit.service";
import { createNotification } from "./notification.service";

const taskInclude = {
  assignee: true,
  createdBy: true,
  project: true,
  team: { include: { members: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.TaskInclude;

export function taskVisibilityWhere(user: User): Prisma.TaskWhereInput {
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
          { team: { leaderId: user.id } },
          { team: { members: { some: { userId: user.id } } } },
          { assigneeId: user.id },
        ],
      };
    case Role.STUDENT:
      return {
        OR: [{ assigneeId: user.id }, { team: { members: { some: { userId: user.id } } } }],
      };
    default:
      return { id: "__none__" };
  }
}

export async function listTasksForUser(user: User) {
  return prisma.task.findMany({
    where: taskVisibilityWhere(user),
    include: taskInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getTaskForUser(user: User, id: string) {
  const task = await prisma.task.findFirst({
    where: { id, ...taskVisibilityWhere(user) },
    include: { ...taskInclude, comments: { include: { user: true }, orderBy: { createdAt: "asc" } }, attachments: true, reviews: true },
  });
  if (!task) throw ApiError.notFound("Task not found");
  return task;
}

async function assertProjectAndTeamAccessible(projectId: string, teamId: string | undefined) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw ApiError.badRequest("Selected project does not exist.");

  if (teamId) {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.projectId !== projectId) {
      throw ApiError.badRequest("Selected team does not belong to the selected project.");
    }
    return { project, team };
  }
  return { project, team: null };
}

export async function createTask(user: User, input: CreateTaskInput) {
  if (!canCreateTask(user)) throw ApiError.forbidden();

  const { team } = await assertProjectAndTeamAccessible(input.projectId, input.teamId);

  const assigneeId = input.assigneeId || user.id;
  if (!canAssignTaskTo(user, assigneeId, team)) {
    throw ApiError.forbidden("You are not allowed to assign tasks to this user.");
  }

  return prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        title: input.title,
        description: input.description,
        priority: input.priority,
        status: input.status,
        assigneeId,
        projectId: input.projectId,
        teamId: input.teamId,
        dueDate: input.dueDate,
        tags: input.tags,
        createdById: user.id,
      },
      include: taskInclude,
    });

    if (assigneeId !== user.id) {
      await createNotification(tx, {
        userId: assigneeId,
        type: "TASK",
        title: "New task assigned",
        body: `You have been assigned to "${task.title}".`,
      });
    }

    await writeAuditLog(tx, {
      actorId: user.id,
      action: "TASK_CREATE",
      targetType: "Task",
      targetId: task.id,
      details: { title: task.title },
    });

    return task;
  });
}

export async function updateTask(user: User, id: string, input: UpdateTaskInput) {
  const task = await prisma.task.findUnique({ where: { id }, include: { team: true, project: true } });
  if (!task) throw ApiError.notFound("Task not found");
  if (!canEditTask(user, task)) throw ApiError.forbidden();

  if (input.assigneeId && input.assigneeId !== task.assigneeId) {
    if (!canAssignTaskTo(user, input.assigneeId, task.team)) {
      throw ApiError.forbidden("You are not allowed to assign tasks to this user.");
    }
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.task.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        priority: input.priority,
        status: input.status,
        assigneeId: input.assigneeId,
        dueDate: input.dueDate,
        progress: input.progress,
        tags: input.tags,
      },
      include: taskInclude,
    });

    if (input.assigneeId && input.assigneeId !== task.assigneeId) {
      await createNotification(tx, {
        userId: input.assigneeId,
        type: "TASK",
        title: "New task assigned",
        body: `You have been assigned to "${updated.title}".`,
      });
    }

    return updated;
  });
}

export async function updateTaskStatus(user: User, id: string, status: TaskStatus) {
  const task = await prisma.task.findUnique({ where: { id }, include: { team: true, project: true } });
  if (!task) throw ApiError.notFound("Task not found");
  if (!canChangeTaskStatus(user, task)) throw ApiError.forbidden();

  const progress =
    status === TaskStatus.COMPLETED ? 100 : status === TaskStatus.BACKLOG ? 0 : task.progress;

  return prisma.task.update({
    where: { id },
    data: { status, progress },
    include: taskInclude,
  });
}

export async function deleteTask(user: User, id: string) {
  const task = await prisma.task.findUnique({ where: { id }, include: { project: true } });
  if (!task) throw ApiError.notFound("Task not found");
  if (!canDeleteTask(user, task)) throw ApiError.forbidden();

  return prisma.$transaction(async (tx) => {
    await tx.task.delete({ where: { id } });
    await writeAuditLog(tx, {
      actorId: user.id,
      action: "TASK_DELETE",
      targetType: "Task",
      targetId: id,
      details: { title: task.title },
    });
  });
}

export async function addComment(user: User, taskId: string, comment: string) {
  const task = await prisma.task.findFirst({ where: { id: taskId, ...taskVisibilityWhere(user) } });
  if (!task) throw ApiError.notFound("Task not found");

  return prisma.taskComment.create({
    data: { taskId, userId: user.id, comment },
    include: { user: true },
  });
}
