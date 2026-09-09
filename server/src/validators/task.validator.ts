import { TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(2, "Task title is required"),
  description: z.string().max(5000).optional(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.BACKLOG),
  assigneeId: z.string().optional(),
  projectId: z.string().min(1, "Project is required"),
  teamId: z.string().optional(),
  sprintId: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  progress: z.number().int().min(0).max(100).optional(),
  sprintId: z.string().nullable().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});

export const createCommentSchema = z.object({
  comment: z.string().trim().min(1, "Comment cannot be empty").max(2000),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
