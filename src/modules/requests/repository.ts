import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  CreateRequestRecordInput,
  PaginatedRequestResult,
  RequestDto,
  RequestFilters,
  UpdateRequestInput,
} from "./types";

const requestWithRelations = {
  include: {
    citizen: {
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
    lawyer: {
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  },
} as const;

interface RequestRecord {
  id: string;
  citizenId: string;
  lawyerId: string | null;
  category: string;
  title: string;
  description: string | null;
  status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  assignedAt: Date | null;
  cancelledAt: Date | null;
  citizen: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: {
      id: string;
      name: string;
    };
  };
  lawyer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: {
      id: string;
      name: string;
    };
  } | null;
}

function toRequestDto(request: RequestRecord): RequestDto {
  return {
    id: request.id,
    citizenId: request.citizenId,
    lawyerId: request.lawyerId,
    category: request.category,
    title: request.title,
    description: request.description,
    status: request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    completedAt: request.completedAt,
    assignedAt: request.assignedAt,
    cancelledAt: request.cancelledAt,
    citizen: request.citizen,
    lawyer: request.lawyer,
  };
}

function buildWhere(filters: RequestFilters): Prisma.RequestWhereInput {
  const where: Prisma.RequestWhereInput = {};

  if (filters.citizenId) {
    where.citizenId = filters.citizenId;
  }

  if (filters.lawyerId) {
    where.lawyerId = filters.lawyerId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  return where;
}

export async function findRequestById(id: string): Promise<RequestDto | null> {
  const request = await prisma.request.findUnique({
    where: { id },
    ...requestWithRelations,
  });

  return request ? toRequestDto(request as RequestRecord) : null;
}

export async function findRequestByIdRaw(id: string) {
  return prisma.request.findUnique({
    where: { id },
  });
}

export async function listRequests(
  filters: RequestFilters = {},
): Promise<PaginatedRequestResult> {
  const { page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;
  const where = buildWhere(filters);

  const [data, total] = await Promise.all([
    prisma.request.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      ...requestWithRelations,
    }),
    prisma.request.count({ where }),
  ]);

  return {
    data: data.map((request) => toRequestDto(request as RequestRecord)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createRequest(
  input: CreateRequestRecordInput,
): Promise<RequestDto> {
  const request = await prisma.request.create({
    data: {
      citizenId: input.citizenId,
      lawyerId: input.lawyerId ?? null,
      category: input.category,
      title: input.title,
      description: input.description ?? null,
      status: input.lawyerId ? "ASSIGNED" : "OPEN",
      assignedAt: input.lawyerId ? new Date() : null,
    },
    ...requestWithRelations,
  });

  return toRequestDto(request as RequestRecord);
}

export async function updateRequest(
  id: string,
  input: UpdateRequestInput,
): Promise<RequestDto> {
  const data: Prisma.RequestUpdateInput = {};

  if (input.category !== undefined) data.category = input.category;
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.status !== undefined) data.status = input.status;

  if (input.lawyerId !== undefined) {
    data.lawyer = input.lawyerId
      ? { connect: { id: input.lawyerId } }
      : { disconnect: true };
  }

  if (input.status === "COMPLETED") {
    data.completedAt = new Date();
  }

  if (input.status === "ASSIGNED") {
    data.assignedAt = new Date();
  }

  if (input.status === "CANCELLED") {
    data.cancelledAt = new Date();
  }

  const request = await prisma.request.update({
    where: { id },
    data,
    ...requestWithRelations,
  });

  return toRequestDto(request as RequestRecord);
}

export async function assignLawyerToRequest(
  id: string,
  lawyerId: string,
): Promise<RequestDto> {
  return updateRequest(id, {
    lawyerId,
    status: "ASSIGNED",
  });
}

export async function startRequest(id: string): Promise<RequestDto> {
  return updateRequest(id, {
    status: "IN_PROGRESS",
  });
}

export async function completeRequest(id: string): Promise<RequestDto> {
  return updateRequest(id, {
    status: "COMPLETED",
  });
}

export async function cancelRequest(id: string): Promise<RequestDto> {
  return updateRequest(id, {
    status: "CANCELLED",
  });
}