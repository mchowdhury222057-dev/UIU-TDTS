import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { sanitizeUser } from "../utils/user";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { updatePasswordSchema, updateProfileSchema, updateRoleSchema } from "../validators/user.validator";

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await userService.listUsers();
  res.json({ success: true, data: users.map(sanitizeUser) });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id);
  res.json({ success: true, data: sanitizeUser(user) });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  if (req.params.id !== req.user.id) throw ApiError.forbidden("You can only edit your own profile.");
  const input = updateProfileSchema.parse(req.body);
  const updated = await userService.updateProfile(req.user.id, input);
  res.json({ success: true, data: sanitizeUser(updated) });
});

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { currentPassword, newPassword } = updatePasswordSchema.parse(req.body);
  await userService.updatePassword(req.user.id, currentPassword, newPassword);
  res.json({ success: true, data: null });
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { role } = updateRoleSchema.parse(req.body);
  const updated = await userService.changeUserRole(req.user, req.params.id, role);
  res.json({ success: true, data: sanitizeUser(updated) });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await userService.deleteUser(req.user, req.params.id);
  res.json({ success: true, data: null });
});
