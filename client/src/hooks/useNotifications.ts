import { useMemo } from "react";
import { notificationsApi } from "../api/notifications";
import { useFetch } from "./useFetch";

export function useNotifications() {
  const { data, isLoading, error, refetch } = useFetch(() => notificationsApi.list(), []);
  const notifications = data ?? [];
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  return { notifications, unreadCount, isLoading, error, refetch };
}
