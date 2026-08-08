import type { Notification } from "../types";
import { api } from "./client";

export const notificationsApi = {
  list: () => api.get<Notification[]>("/notifications"),
  markRead: (id: string) => api.patch<Notification>(`/notifications/${id}/read`),
  markAllRead: () => api.patch<null>("/notifications/read-all"),
};
