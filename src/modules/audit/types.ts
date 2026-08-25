export interface AuditLogDto {
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
}

export interface CreateAuditLogInput {
  actorId: string;
  action: string;
  target: string;
  metadata?: Record<string, unknown> | null;
}