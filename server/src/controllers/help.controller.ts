import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import * as helpService from "../services/help.service";
import { createHelpArticleSchema, updateHelpArticleSchema } from "../validators/help.validator";

export const listHelpArticles = asyncHandler(async (_req: Request, res: Response) => {
  const articles = await helpService.listHelpArticles();
  res.json({ success: true, data: articles });
});

export const createHelpArticle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = createHelpArticleSchema.parse(req.body);
  const article = await helpService.createHelpArticle(req.user, input);
  res.status(201).json({ success: true, data: article });
});

export const updateHelpArticle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = updateHelpArticleSchema.parse(req.body);
  const article = await helpService.updateHelpArticle(req.user, req.params.id, input);
  res.json({ success: true, data: article });
});

export const deleteHelpArticle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await helpService.deleteHelpArticle(req.user, req.params.id);
  res.json({ success: true, data: null });
});
