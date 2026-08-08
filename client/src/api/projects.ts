import type { Priority, Project, ProjectStatus } from "../types";
import { api } from "./client";

export interface CreateProjectPayload {
  name: string;
  courseCode: string;
  description?: string;
  priority: Priority;
  status: ProjectStatus;
  deadline: string;
  supervisorId: string;
}

export type UpdateProjectPayload = Partial<CreateProjectPayload> & { progress?: number };

export const projectsApi = {
  list: () => api.get<Project[]>("/projects"),
  get: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (payload: CreateProjectPayload) => api.post<Project>("/projects", payload),
  update: (id: string, payload: UpdateProjectPayload) => api.patch<Project>(`/projects/${id}`, payload),
  remove: (id: string) => api.delete<null>(`/projects/${id}`),
};
