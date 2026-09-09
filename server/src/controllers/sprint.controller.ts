import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import * as sprintService from "../services/sprint.service";
import { createSprintSchema, updateSprintSchema } from "../validators/sprint.validator";

export const listSprints = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const sprints = await sprintService.listSprintsForUser(req.user);
  res.json({ success: true, data: sprints });
});

export const getSprint = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const sprint = await sprintService.getSprintForUser(req.user, req.params.id);
  res.json({ success: true, data: sprint });
});

export const createSprint = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = createSprintSchema.parse(req.body);
  const sprint = await sprintService.createSprint(req.user, input);
  res.status(201).json({ success: true, data: sprint });
});

export const updateSprint = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = updateSprintSchema.parse(req.body);
  const sprint = await sprintService.updateSprint(req.user, req.params.id, input);
  res.json({ success: true, data: sprint });
});

export const deleteSprint = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await sprintService.deleteSprint(req.user, req.params.id);
  res.json({ success: true, data: null });
});
