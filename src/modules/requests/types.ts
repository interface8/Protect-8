export type RequestStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface RequestParticipantDto {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: {
    id: string;
    name: string;
  };
}

export interface RequestDto {
  id: string;
  citizenId: string;
  lawyerId: string | null;
  category: string;
  title: string;
  description: string | null;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  assignedAt: Date | null;
  cancelledAt: Date | null;
  citizen: RequestParticipantDto;
  lawyer: RequestParticipantDto | null;
}

export interface RequestListItemDto extends RequestDto {
  hasRated: boolean;
}

export interface CreateRequestInput {
  citizenId: string;
  lawyerProfileId?: string;
  category: string;
  title: string;
  description?: string | null;
}

export interface CreateRequestRecordInput {
  citizenId: string;
  lawyerId?: string;
  category: string;
  title: string;
  description?: string | null;
}

export interface UpdateRequestInput {
  category?: string;
  title?: string;
  description?: string | null;
  lawyerId?: string | null;
  status?: RequestStatus;
}

export interface RequestFilters {
  citizenId?: string;
  lawyerId?: string;
  status?: RequestStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedRequestResult {
  data: RequestListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}