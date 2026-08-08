import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import * as taskService from "../services/task.service";
import { createCommentSchema, createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from "../validators/task.validator";

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const tasks = await taskService.listTasksForUser(req.user);
  res.json({ success: true, data: tasks });
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const task = await taskService.getTaskForUser(req.user, req.params.id);
  res.json({ success: true, data: task });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = createTaskSchema.parse(req.body);
  const task = await taskService.createTask(req.user, input);
  res.status(201).json({ success: true, data: task });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = updateTaskSchema.parse(req.body);
  const task = await taskService.updateTask(req.user, req.params.id, input);
  res.json({ success: true, data: task });
});

export const updateTaskStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { status } = updateTaskStatusSchema.parse(req.body);
  const task = await taskService.updateTaskStatus(req.user, req.params.id, status);
  res.json({ success: true, data: task });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await taskService.deleteTask(req.user, req.params.id);
  res.json({ success: true, data: null });
});

export const addComment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { comment } = createCommentSchema.parse(req.body);
  const created = await taskService.addComment(req.user, req.params.id, comment);
  res.status(201).json({ success: true, data: created });
});
