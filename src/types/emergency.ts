export type EmergencyRequestStatus =
  | "REQUESTED"
  | "MATCHED"
  | "ACCEPTED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface EmergencyCategoryDto {
  id: string;
  key: string;
  label: string;
  iconKey: string;
  isActive: boolean;
  sortOrder: number;
}

export interface EmergencyRequestDto {
  id: string;
  status: EmergencyRequestStatus;
  triggerSource: "NEED_LAWYER_NOW" | "SOS";
  message: string | null;
  location: string | null;
  assignedToId: string | null;
  category: EmergencyCategoryDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyStatusHistoryEntry {
  id: string;
  fromStatus: EmergencyRequestStatus | null;
  toStatus: EmergencyRequestStatus;
  actorType: "USER" | "SYSTEM";
  actor: { id: string; name: string; role: string } | null;
  createdAt: string;
}