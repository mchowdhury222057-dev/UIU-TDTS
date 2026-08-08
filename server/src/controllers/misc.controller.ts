import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import * as performanceService from "../services/performance.service";
import * as reportService from "../services/report.service";
import * as auditService from "../services/audit.service";
import { PERMISSION_MATRIX } from "../services/permissions";

export const listPerformance = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const performance = await performanceService.listPerformanceForUser(req.user);
  res.json({ success: true, data: performance });
});

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const data = await reportService.getDashboardStats(req.user);
  res.json({ success: true, data });
});

export const getReports = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const data = await reportService.getReportsData(req.user);
  res.json({ success: true, data });
});

export const listAuditLogs = asyncHandler(async (_req: Request, res: Response) => {
  const logs = await auditService.listAuditLogs();
  res.json({ success: true, data: logs });
});

export const getPermissionMatrix = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: PERMISSION_MATRIX });
});
