import type { Team } from "../types";
import { api } from "./client";

export interface CreateTeamPayload {
  name: string;
  projectId: string;
  leaderId: string;
  memberIds: string[];
}

export interface UpdateTeamPayload {
  name?: string;
  leaderId?: string;
  memberIds?: string[];
}

export const teamsApi = {
  list: () => api.get<Team[]>("/teams"),
  get: (id: string) => api.get<Team>(`/teams/${id}`),
  create: (payload: CreateTeamPayload) => api.post<Team>("/teams", payload),
  update: (id: string, payload: UpdateTeamPayload) => api.patch<Team>(`/teams/${id}`, payload),
  remove: (id: string) => api.delete<null>(`/teams/${id}`),
};
