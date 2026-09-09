import { SprintStatus } from "@prisma/client";
import { z } from "zod";

export const createSprintSchema = z
  .object({
    name: z.string().trim().min(2, "Sprint name is required"),
    goal: z.string().max(1000).optional(),
    projectId: z.string().min(1, "Project is required"),
    status: z.nativeEnum(SprintStatus).default(SprintStatus.PLANNING),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export const updateSprintSchema = z.object({
  name: z.string().trim().min(2).optional(),
  goal: z.string().max(1000).optional(),
  status: z.nativeEnum(SprintStatus).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type CreateSprintInput = z.infer<typeof createSprintSchema>;
export type UpdateSprintInput = z.infer<typeof updateSprintSchema>;
