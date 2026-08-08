import type { Department, Role, User } from "../types";
import { api } from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  avatarColor?: string;
  department: Department;
  role: Extract<Role, "STUDENT" | "LEADER">;
  title?: string;
  bio?: string;
}

export const authApi = {
  login: (payload: LoginPayload) => api.post<User>("/auth/login", payload),
  register: (payload: RegisterPayload) => api.post<User>("/auth/register", payload),
  logout: () => api.post<null>("/auth/logout"),
  me: () => api.get<User>("/auth/me"),
};
