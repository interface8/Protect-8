import type {
  LawyerAvailabilityStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

const publicLawyerSelect = {
  id: true,
  barEnrollmentNumber: true,
  practiceAreas: true,
  languages: true,
  yearsOfExperience: true,
  verificationStatus: true,
  isMatchable: true,
  availabilityStatus: true,
  lastActivityAt: true,
  availabilityUpdatedAt: true,
  rating: true,
  ratingCount: true,
  consultationFee: true,
  responseTimeSeconds: true,
  user: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  },
} satisfies Prisma.LawyerProfileSelect;

export type PublicLawyerRecord = Prisma.LawyerProfileGetPayload<{
  select: typeof publicLawyerSelect;
}>;

const publicWhere: Prisma.LawyerProfileWhereInput = {
  verificationStatus: "APPROVED",
  isMatchable: true,
};

export async function findPublicLawyerRecords() {
  return prisma.lawyerProfile.findMany({
    where: publicWhere,
    select: publicLawyerSelect,
    orderBy: [
      { responseTimeSeconds: "asc" },
      { rating: "desc" },
    ],
  });
}

export async function findPublicLawyerRecordById(id: string) {
  return prisma.lawyerProfile.findFirst({
    where: {
      ...publicWhere,
      id,
    },
    select: publicLawyerSelect,
  });
}

export async function findLawyerProfileForAvailability(userId: string) {
  return prisma.lawyerProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      verificationStatus: true,
      isMatchable: true,
    },
  });
}

export async function updateLawyerAvailability(
  userId: string,
  availabilityStatus: LawyerAvailabilityStatus,
) {
  const now = new Date();

  return prisma.lawyerProfile.update({
    where: { userId },
    data: {
      availabilityStatus,
      lastActivityAt: now,
      availabilityUpdatedAt: now,
    },
    select: {
      id: true,
      availabilityStatus: true,
      lastActivityAt: true,
      availabilityUpdatedAt: true,
    },
  });
}

export async function markStaleLawyersOffline(cutoff: Date) {
  const now = new Date();

  const result = await prisma.lawyerProfile.updateMany({
    where: {
      availabilityStatus: "AVAILABLE",
      OR: [
        { lastActivityAt: { lt: cutoff } },
        {
          lastActivityAt: null,
          availabilityUpdatedAt: { lt: cutoff },
        },
      ],
    },
    data: {
      availabilityStatus: "OFFLINE",
      availabilityUpdatedAt: now,
    },
  });

  return result.count;
}
