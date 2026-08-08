import { Priority, ProjectStatus } from "@prisma/client";
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Project name is required"),
  courseCode: z.string().trim().min(1, "Course code is required"),
  description: z.string().max(5000).optional(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.PLANNING),
  deadline: z.coerce.date(),
  supervisorId: z.string().min(1, "Supervisor is required"),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  progress: z.number().int().min(0).max(100).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
