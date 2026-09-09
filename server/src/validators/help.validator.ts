import { z } from "zod";

export const createHelpArticleSchema = z.object({
  question: z.string().trim().min(1, "Question is required").max(300),
  answer: z.string().trim().min(1, "Answer is required").max(3000),
});

export const updateHelpArticleSchema = z.object({
  question: z.string().trim().min(1, "Question is required").max(300).optional(),
  answer: z.string().trim().min(1, "Answer is required").max(3000).optional(),
  order: z.number().int().optional(),
});

export type CreateHelpArticleInput = z.infer<typeof createHelpArticleSchema>;
export type UpdateHelpArticleInput = z.infer<typeof updateHelpArticleSchema>;
