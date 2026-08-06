export interface UserDto {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
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

export interface CreateUserInput {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  roleId: string;
  isActive?: boolean;
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
