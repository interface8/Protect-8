import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  CreateEmergencyContactInput,
  CreateUserInput,
  EmergencyContactDto,
  PaginatedResult,
  UpdateUserInput,
  UserDto,
  UserFilters,
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
  avatarUrl: string | null;
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

interface EmergencyContactRecord {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  createdAt: Date;
  updatedAt: Date;
}

function toUserDto(user: UserWithRole): UserDto {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    role: user.role,
    authProvider: user.authProvider,
    providerId: user.providerId,
  };
}

function toEmergencyContactDto(
  contact: EmergencyContactRecord,
): EmergencyContactDto {
  return {
    id: contact.id,
    name: contact.name,
    phone: contact.phone,
    relationship: contact.relationship,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
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
      avatarUrl: input.avatarUrl ?? null,
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
  if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;
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

export async function listEmergencyContacts(
  userId: string,
): Promise<EmergencyContactDto[]> {
  const contacts = await prisma.emergencyContact.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return contacts.map(toEmergencyContactDto);
}

export async function findEmergencyContactById(
  contactId: string,
  userId: string,
): Promise<EmergencyContactDto | null> {
  const contact = await prisma.emergencyContact.findFirst({
    where: {
      id: contactId,
      userId,
    },
  });

  return contact ? toEmergencyContactDto(contact) : null;
}

export async function createEmergencyContact(
  userId: string,
  input: CreateEmergencyContactInput,
): Promise<EmergencyContactDto> {
  const contact = await prisma.emergencyContact.create({
    data: {
      userId,
      name: input.name,
      phone: input.phone,
      relationship: input.relationship,
    },
  });

  return toEmergencyContactDto(contact);
}

export async function deleteEmergencyContact(
  contactId: string,
  userId: string,
): Promise<void> {
  await prisma.emergencyContact.deleteMany({
    where: {
      id: contactId,
      userId,
    },
  });
}