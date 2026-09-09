import type { HelpArticle } from "../types";
import { api } from "./client";

export interface CreateHelpArticlePayload {
  question: string;
  answer: string;
}

export interface UpdateHelpArticlePayload {
  question?: string;
  answer?: string;
  order?: number;
}

export const helpApi = {
  list: () => api.get<HelpArticle[]>("/help"),
  create: (payload: CreateHelpArticlePayload) => api.post<HelpArticle>("/help", payload),
  update: (id: string, payload: UpdateHelpArticlePayload) => api.patch<HelpArticle>(`/help/${id}`, payload),
  remove: (id: string) => api.delete<null>(`/help/${id}`),
};
