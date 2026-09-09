import type {
  EmergencyRequestStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CreateEmergencyCategoryInput,
  EmergencyCategoryDto,
  EmergencyRequestDto,
  EmergencyRequestStatusHistoryDto,
  UpdateEmergencyCategoryInput,
} from "./types";

const categorySelect = {
  id: true,
  key: true,
  label: true,
  iconKey: true,
  isActive: true,
  sortOrder: true,
} satisfies Prisma.EmergencyCategorySelect;

const requestInclude = {
  emergencyCategory: { select: categorySelect },
} as const;

function toCategoryDto(category: EmergencyCategoryDto) {
  return category;
}

function toRequestDto(
  request: Prisma.EmergencyRequestGetPayload<{
    include: typeof requestInclude;
  }>,
): EmergencyRequestDto {
  return {
    id: request.id,
    status: request.status,
    triggerSource: request.triggerSource,
    message: request.message,
    location: request.location,
    assignedToId: request.assignedToId,
    category: request.emergencyCategory
      ? toCategoryDto(request.emergencyCategory)
      : null,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

export async function listActiveCategories() {
  const categories = await prisma.emergencyCategory.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    select: categorySelect,
  });

  return categories.map(toCategoryDto);
}

export async function createCategory(
  input: CreateEmergencyCategoryInput,
) {
  return prisma.emergencyCategory.create({
    data: {
      id: input.key,
      ...input,
    },
    select: categorySelect,
  });
}

export async function updateCategory(
  id: string,
  input: UpdateEmergencyCategoryInput,
) {
  return prisma.emergencyCategory.update({
    where: { id },
    data: input,
    select: categorySelect,
  });
}

export async function findCategoryById(id: string) {
  return prisma.emergencyCategory.findUnique({
    where: { id },
    select: categorySelect,
  });
}

export async function createRequest(
  userId: string,
  input: {
    categoryId: string;
    message?: string | null;
    location?: string | null;
    preferredLanguage?: string | null;
    locationConsent?: boolean;
    latitude?: number | null;
    longitude?: number | null;
    triggerSource?: "NEED_LAWYER_NOW" | "SOS";
    sosTriggeredAt?: Date | null;
  },
) {
  return prisma.$transaction(async (tx) => {
    const category = await tx.emergencyCategory.findFirst({
      where: { id: input.categoryId, isActive: true },
      select: categorySelect,
    });

    if (!category) {
      throw new Error("Active emergency category not found");
    }

    const request = await tx.emergencyRequest.create({
      data: {
        userId,
        category: category.label,
        categoryId: category.id,
        message: input.message ?? null,
        location: input.location ?? null,
        preferredLanguage: input.preferredLanguage ?? null,
        locationConsent: input.locationConsent === true,
        latitude: input.locationConsent === true ? input.latitude ?? null : null,
        longitude: input.locationConsent === true ? input.longitude ?? null : null,
        triggerSource: input.triggerSource ?? "NEED_LAWYER_NOW",
        sosTriggeredAt: input.sosTriggeredAt ?? null,
        status: "REQUESTED",
      },
      include: requestInclude,
    });

    await tx.emergencyRequestStatusHistory.create({
      data: {
        requestId: request.id,
        fromStatus: null,
        toStatus: "REQUESTED",
        actorId: userId,
        actorType: "USER",
      },
    });

    return toRequestDto(request);
  });
}

export async function findRequestForActor(id: string) {
  return prisma.emergencyRequest.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      assignedToId: true,
      status: true,
    },
  });
}

export async function findRequestById(id: string) {
  const request = await prisma.emergencyRequest.findUnique({
    where: { id },
    include: requestInclude,
  });

  return request ? toRequestDto(request) : null;
}

export async function transitionRequestStatus(
  id: string,
  fromStatus: EmergencyRequestStatus,
  toStatus: EmergencyRequestStatus,
  actorId: string,
) {
  return prisma.$transaction(async (tx) => {
    const now = new Date();
    const data: Prisma.EmergencyRequestUpdateInput = {
      status: toStatus,
    };

    if (toStatus === "ACCEPTED" || toStatus === "REJECTED") {
      data.respondedAt = now;
    }

    if (toStatus === "COMPLETED" || toStatus === "CANCELLED") {
      data.resolvedAt = now;
    }

    const updated = await tx.emergencyRequest.updateMany({
      where: { id, status: fromStatus },
      data,
    });

    if (updated.count !== 1) {
      throw new Error("Request status changed; please retry");
    }

    await tx.emergencyRequestStatusHistory.create({
      data: {
        requestId: id,
        fromStatus,
        toStatus,
        actorId,
        actorType: "USER",
      },
    });

    const request = await tx.emergencyRequest.findUniqueOrThrow({
      where: { id },
      include: requestInclude,
    });

    return toRequestDto(request);
  });
}

export async function listRequestHistory(
  requestId: string,
): Promise<EmergencyRequestStatusHistoryDto[]> {
  const history = await prisma.emergencyRequestStatusHistory.findMany({
    where: { requestId },
    orderBy: { createdAt: "asc" },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          role: { select: { name: true } },
        },
      },
    },
  });

  return history.map((item) => ({
    id: item.id,
    fromStatus: item.fromStatus,
    toStatus: item.toStatus,
    actorType: item.actorType,
    actor: item.actor
      ? {
          id: item.actor.id,
          name: item.actor.name,
          role: item.actor.role.name,
        }
      : null,
    createdAt: item.createdAt,
  }));
}

export async function createActionLog(input: {
  requestId: string;
  actionType:
    | "MATCHING"
    | "LAWYER_NOTIFICATION"
    | "GPS_CAPTURE"
    | "EMERGENCY_DETAILS_PACKAGED"
    | "CONTACT_NOTIFICATION"
    | "LOCATION_CONSENT";
  status: "SUCCEEDED" | "FAILED" | "SKIPPED";
  errorMessage?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.emergencyActionLog.create({
    data: {
      requestId: input.requestId,
      actionType: input.actionType,
      status: input.status,
      errorMessage: input.errorMessage ?? null,
      metadata: input.metadata,
    },
  });
}
