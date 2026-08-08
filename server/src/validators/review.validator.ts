import { ReviewStatus } from "@prisma/client";
import { z } from "zod";

export const createReviewSchema = z.object({
  taskId: z.string().min(1, "Task is required"),
  submittedById: z.string().min(1, "Submitter is required"),
});

export const updateReviewSchema = z.object({
  status: z.nativeEnum(ReviewStatus),
  rating: z.number().int().min(1).max(5).optional(),
  feedback: z.string().max(3000).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
