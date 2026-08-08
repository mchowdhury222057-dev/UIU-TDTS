import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import * as teamService from "../services/team.service";
import { createTeamSchema, updateTeamSchema } from "../validators/team.validator";

export const listTeams = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const teams = await teamService.listTeamsForUser(req.user);
  res.json({ success: true, data: teams });
});

export const getTeam = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const team = await teamService.getTeamForUser(req.user, req.params.id);
  res.json({ success: true, data: team });
});

export const createTeam = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = createTeamSchema.parse(req.body);
  const team = await teamService.createTeam(req.user, input);
  res.status(201).json({ success: true, data: team });
});

export const updateTeam = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = updateTeamSchema.parse(req.body);
  const team = await teamService.updateTeam(req.user, req.params.id, input);
  res.json({ success: true, data: team });
});

export const deleteTeam = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await teamService.deleteTeam(req.user, req.params.id);
  res.json({ success: true, data: null });
});
