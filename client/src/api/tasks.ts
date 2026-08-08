import type { Task, TaskComment, TaskPriority, TaskStatus } from "../types";
import { api } from "./client";

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority: TaskPriority;
  status?: TaskStatus;
  assigneeId?: string;
  projectId: string;
  teamId?: string;
  dueDate?: string;
  tags: string[];
}

export type UpdateTaskPayload = Partial<CreateTaskPayload> & { progress?: number };

export const tasksApi = {
  list: () => api.get<Task[]>("/tasks"),
  get: (id: string) => api.get<Task>(`/tasks/${id}`),
  create: (payload: CreateTaskPayload) => api.post<Task>("/tasks", payload),
  update: (id: string, payload: UpdateTaskPayload) => api.patch<Task>(`/tasks/${id}`, payload),
  updateStatus: (id: string, status: TaskStatus) => api.patch<Task>(`/tasks/${id}/status`, { status }),
  remove: (id: string) => api.delete<null>(`/tasks/${id}`),
  addComment: (id: string, comment: string) => api.post<TaskComment>(`/tasks/${id}/comments`, { comment }),
};
