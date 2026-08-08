import { NotificationType, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../config/prisma";

type Tx = PrismaClient | Prisma.TransactionClient;

export async function createNotification(
  tx: Tx,
  params: { userId: string; type: NotificationType; title: string; body: string }
) {
  return tx.notification.create({ data: params });
}

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationRead(userId: string, id: string) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) {
    return null;
  }
  return prisma.notification.update({ where: { id }, data: { read: true } });
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
}
