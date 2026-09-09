import type { Sprint, SprintStatus } from "../types";
import { api } from "./client";

export interface CreateSprintPayload {
  name: string;
  goal?: string;
  projectId: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
}

export interface UpdateSprintPayload {
  name?: string;
  goal?: string;
  status?: SprintStatus;
  startDate?: string;
  endDate?: string;
}

export const sprintsApi = {
  list: () => api.get<Sprint[]>("/sprints"),
  get: (id: string) => api.get<Sprint>(`/sprints/${id}`),
  create: (payload: CreateSprintPayload) => api.post<Sprint>("/sprints", payload),
  update: (id: string, payload: UpdateSprintPayload) => api.patch<Sprint>(`/sprints/${id}`, payload),
  remove: (id: string) => api.delete<null>(`/sprints/${id}`),
};
