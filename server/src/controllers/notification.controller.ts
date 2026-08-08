import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import * as notificationService from "../services/notification.service";

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const notifications = await notificationService.listNotifications(req.user.id);
  res.json({ success: true, data: notifications });
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const updated = await notificationService.markNotificationRead(req.user.id, req.params.id);
  if (!updated) throw ApiError.notFound("Notification not found");
  res.json({ success: true, data: updated });
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await notificationService.markAllNotificationsRead(req.user.id);
  res.json({ success: true, data: null });
});
