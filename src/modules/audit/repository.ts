import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { CreateAuditLogInput, AuditLogDto } from "./types";

type AuditLogRecord = {
  id: string;
  actorId: string;
  action: string;
  target: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  actor: {
    id: string;
    name: string;
    email: string | null;
  };
};

function toAuditLogDto(log: AuditLogRecord): AuditLogDto {
  return {
    id: log.id,
    actorId: log.actorId,
    action: log.action,
    target: log.target,
    metadata: log.metadata,
    createdAt: log.createdAt,
    actor: log.actor,
  };
}

export async function createAuditLog(
  input: CreateAuditLogInput,
): Promise<AuditLogDto> {
  const log = await prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      target: input.target,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return toAuditLogDto(log as AuditLogRecord);
}