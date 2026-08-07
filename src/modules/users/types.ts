export interface UserDto {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: {
    id: string;
    name: string;
  };
  authProvider: string | null;
  providerId: string | null;
}

export interface EmergencyContactDto {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmergencyContactInput {
  name: string;
  phone: string;
  relationship: string;
}

export interface CreateUserInput {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  roleId: string;
  isActive?: boolean;
  avatarUrl?: string | null;
  authProvider?: string | null;
  providerId?: string | null;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  roleId?: string;
  isActive?: boolean;
  avatarUrl?: string | null;
  authProvider?: string | null;
  providerId?: string | null;
}

export interface UserFilters {
  search?: string;
  isActive?: boolean;
  roleId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}