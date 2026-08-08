import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../config/prisma";

type Tx = PrismaClient | Prisma.TransactionClient;

interface AuditEntry {
  actorId: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  details?: Record<string, unknown> | null;
}

export async function writeAuditLog(tx: Tx, entry: AuditEntry) {
  return tx.auditLog.create({
    data: {
      actorId: entry.actorId,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId ?? null,
      details: entry.details ? JSON.stringify(entry.details) : null,
    },
  });
}

export async function listAuditLogs() {
  return prisma.auditLog.findMany({
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}
