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
  sprint: true,
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

async function assertSprintAccessible(sprintId: string | undefined, projectId: string) {
  if (!sprintId) return;
  const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
  if (!sprint || sprint.projectId !== projectId) {
    throw ApiError.badRequest("Selected sprint does not belong to the selected project.");
  }
}

export async function createTask(user: User, input: CreateTaskInput) {
  if (!canCreateTask(user)) throw ApiError.forbidden();

  const { team } = await assertProjectAndTeamAccessible(input.projectId, input.teamId);
  await assertSprintAccessible(input.sprintId, input.projectId);

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
        sprintId: input.sprintId,
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

  if (input.sprintId !== undefined) {
    await assertSprintAccessible(input.sprintId || undefined, task.projectId);
  }

  // Keep progress and status from disagreeing with each other: reaching 100%
  // (e.g. an assignee dragging their own progress slider to done) marks the
  // task Completed on its own, and pulling it back below 100% un-completes
  // it, without anyone having to separately flip the status dropdown too.
  let status = input.status;
  if (input.progress !== undefined) {
    const currentStatus = status ?? task.status;
    if (input.progress >= 100 && currentStatus !== TaskStatus.CANCELLED) {
      status = TaskStatus.COMPLETED;
    } else if (input.progress < 100 && currentStatus === TaskStatus.COMPLETED) {
      status = TaskStatus.IN_PROGRESS;
    }
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.task.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        priority: input.priority,
        status,
        assigneeId: input.assigneeId,
        sprintId: input.sprintId,
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

    // Let the task's creator (typically the supervising Faculty/Admin) know
    // work finished on its own, instead of them having to check in on it.
    if (updated.status === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED && updated.createdById !== user.id) {
      await createNotification(tx, {
        userId: updated.createdById,
        type: "TASK",
        title: "Task completed",
        body: `${user.name} marked "${updated.title}" as complete.`,
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

  return prisma.$transaction(async (tx) => {
    const updated = await tx.task.update({
      where: { id },
      data: { status, progress },
      include: taskInclude,
    });

    if (status === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED && task.createdById !== user.id) {
      await createNotification(tx, {
        userId: task.createdById,
        type: "TASK",
        title: "Task completed",
        body: `${user.name} marked "${updated.title}" as complete.`,
      });
    }

    return updated;
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
