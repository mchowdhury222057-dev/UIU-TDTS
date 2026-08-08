import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import * as projectService from "../services/project.service";
import { createProjectSchema, updateProjectSchema } from "../validators/project.validator";

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const projects = await projectService.listProjectsForUser(req.user);
  res.json({ success: true, data: projects });
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const project = await projectService.getProjectForUser(req.user, req.params.id);
  res.json({ success: true, data: project });
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = createProjectSchema.parse(req.body);
  const project = await projectService.createProject(req.user, input);
  res.status(201).json({ success: true, data: project });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = updateProjectSchema.parse(req.body);
  const project = await projectService.updateProject(req.user, req.params.id, input);
  res.json({ success: true, data: project });
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await projectService.deleteProject(req.user, req.params.id);
  res.json({ success: true, data: null });
});
