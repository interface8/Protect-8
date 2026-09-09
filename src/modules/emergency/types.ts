import type { EmergencyRequestStatus } from "@prisma/client";

export interface EmergencyCategoryDto {
  id: string;
  key: string;
  label: string;
  iconKey: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CreateEmergencyCategoryInput {
  key: string;
  label: string;
  iconKey: string;
  sortOrder?: number;
}

export interface UpdateEmergencyCategoryInput {
  key?: string;
  label?: string;
  iconKey?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface EmergencyRequestDto {
  id: string;
  status: EmergencyRequestStatus;
  triggerSource: "NEED_LAWYER_NOW" | "SOS";
  message: string | null;
  location: string | null;
  assignedToId: string | null;
  category: EmergencyCategoryDto | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyRequestStatusHistoryDto {
  id: string;
  fromStatus: EmergencyRequestStatus | null;
  toStatus: EmergencyRequestStatus;
  actor: {
    id: string;
    name: string;
    role: string;
  } | null;
  actorType: "USER" | "SYSTEM";
  createdAt: Date;
}
