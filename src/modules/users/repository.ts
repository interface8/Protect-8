import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserDto,
  UserFilters,
  PaginatedResult,
} from "./types";

const userWithRole = {
  include: {
    role: {
      select: { id: true, name: true },
    },
  },
} as const;

interface UserWithRole {
  id: string;
  email: string | null;
  phone: string | null;
  password?: string | null;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  authProvider: string | null;
  providerId: string | null;
  role: {
    id: string;
    name: string;
  };
}

function toUserDto(user: UserWithRole): UserDto {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    role: user.role,
    authProvider: user.authProvider,
    providerId: user.providerId,
  };
}

export async function findUsers(
  filters: UserFilters = {},
): Promise<PaginatedResult<UserDto>> {
  const { search, isActive, roleId, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (roleId) {
    where.roleId = roleId;
  }

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      ...userWithRole,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: data.map((user) => toUserDto(user as UserWithRole)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function findUserById(id: string): Promise<UserDto | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    ...userWithRole,
  });

  return user ? toUserDto(user as UserWithRole) : null;
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      role: {
        select: { id: true, name: true },
      },
    },
  }) as Promise<UserWithRole | null>;
}

export async function findUserByPhone(phone: string) {
  return prisma.user.findUnique({
    where: { phone },
    include: {
      role: {
        select: { id: true, name: true },
      },
    },
  }) as Promise<UserWithRole | null>;
}

export async function findUserByIdentifier(identifier: string) {
  return prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
    },
    include: {
      role: {
        select: { id: true, name: true },
      },
    },
  }) as Promise<UserWithRole | null>;
}

export async function findRoleById(id: string) {
  return prisma.role.findUnique({
    where: { id },
  });
}

export async function contactExists(
  input: { email?: string; phone?: string },
  excludeId?: string,
): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        input.email ? { email: input.email } : undefined,
        input.phone ? { phone: input.phone } : undefined,
      ].filter(Boolean) as Prisma.UserWhereInput[],
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });

  return !!user;
}

export async function createUser(input: CreateUserInput): Promise<UserDto> {
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      password: input.password,
      roleId: input.roleId,
      isActive: input.isActive ?? true,
      authProvider: input.authProvider ?? null,
      providerId: input.providerId ?? null,
    },
    ...userWithRole,
  });

  return toUserDto(user as UserWithRole);
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<UserDto> {
  const data: Prisma.UserUpdateInput = {};

  if (input.name !== undefined) data.name = input.name;
  if (input.email !== undefined) data.email = input.email;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.password !== undefined) data.password = input.password;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.authProvider !== undefined) data.authProvider = input.authProvider;
  if (input.providerId !== undefined) data.providerId = input.providerId;

  if (input.roleId) {
    data.role = {
      connect: { id: input.roleId },
    };
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    ...userWithRole,
  });

  return toUserDto(user as UserWithRole);
}

export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({ where: { id } });
}
