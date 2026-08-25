import * as auditRepo from "./repository";
import type { CreateAuditLogInput, AuditLogDto } from "./types";

export async function logAuditEvent(
  input: CreateAuditLogInput,
): Promise<AuditLogDto> {
  return auditRepo.createAuditLog(input);
}