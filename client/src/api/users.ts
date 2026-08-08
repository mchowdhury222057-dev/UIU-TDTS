import type { Department, Role, User } from "../types";
import { api } from "./client";

export interface UpdateProfilePayload {
  name?: string;
  title?: string;
  bio?: string;
  skills?: string[];
  avatarColor?: string;
  department?: Department;
}

export const usersApi = {
  list: () => api.get<User[]>("/users"),
  get: (id: string) => api.get<User>(`/users/${id}`),
  updateProfile: (id: string, payload: UpdateProfilePayload) => api.patch<User>(`/users/${id}`, payload),
  updatePassword: (id: string, currentPassword: string, newPassword: string) =>
    api.patch<null>(`/users/${id}/password`, { currentPassword, newPassword }),
  updateRole: (id: string, role: Role) => api.patch<User>(`/users/${id}/role`, { role }),
  remove: (id: string) => api.delete<null>(`/users/${id}`),
};
