import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().trim().min(2, "Team name is required"),
  projectId: z.string().min(1, "Project is required"),
  leaderId: z.string().min(1, "Team leader is required"),
  memberIds: z.array(z.string()).default([]),
});

export const updateTeamSchema = z.object({
  name: z.string().trim().min(2).optional(),
  leaderId: z.string().min(1).optional(),
  memberIds: z.array(z.string()).optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
