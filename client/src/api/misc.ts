import type { AuditLog, DashboardStats, PermissionMatrix, Performance, ReportsData } from "../types";
import { api } from "./client";

export const performanceApi = {
  list: () => api.get<Performance[]>("/performance"),
};

export const dashboardApi = {
  get: () => api.get<DashboardStats>("/dashboard"),
};

export const reportsApi = {
  get: () => api.get<ReportsData>("/reports"),
};

export const auditLogsApi = {
  list: () => api.get<AuditLog[]>("/audit-logs"),
};

export const permissionsApi = {
  matrix: () => api.get<PermissionMatrix>("/permissions/matrix"),
};
