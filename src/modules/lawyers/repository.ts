import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  LawyerListFilters,
  LawyerProfileDto,
  PaginatedLawyerResult,
  SubmitLawyerOnboardingInput,
} from "./types";

const lawyerWithUser = {
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
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

interface LawyerProfileRecord {
  id: string;
  userId: string;
  barEnrollmentNumber: string;
  practiceLicenseUrl: string;
  idDocumentUrl: string;
  practiceAreas: string[];
  languages: string[];
  yearsOfExperience: number;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  isMatchable: boolean;
  rejectionReason: string | null;
  reviewedById: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: {
      id: string;
      name: string;
    };
  };
}

function toLawyerProfileDto(profile: LawyerProfileRecord): LawyerProfileDto {
  return {
    id: profile.id,
    userId: profile.userId,
    barEnrollmentNumber: profile.barEnrollmentNumber,
    practiceLicenseUrl: profile.practiceLicenseUrl,
    idDocumentUrl: profile.idDocumentUrl,
    practiceAreas: profile.practiceAreas,
    languages: profile.languages,
    yearsOfExperience: profile.yearsOfExperience,
    verificationStatus: profile.verificationStatus,
    isMatchable: profile.isMatchable,
    rejectionReason: profile.rejectionReason,
    reviewedById: profile.reviewedById,
    reviewedAt: profile.reviewedAt,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    user: profile.user,
  };
}

export async function findLawyerProfileByUserId(userId: string) {
  const profile = await prisma.lawyerProfile.findUnique({
    where: { userId },
    ...lawyerWithUser,
  });

  return profile ? toLawyerProfileDto(profile as LawyerProfileRecord) : null;
}

export async function findLawyerProfileById(id: string) {
  const profile = await prisma.lawyerProfile.findUnique({
    where: { id },
    ...lawyerWithUser,
  });

  return profile ? toLawyerProfileDto(profile as LawyerProfileRecord) : null;
}

export async function findLawyerProfileByEnrollmentNumber(
  barEnrollmentNumber: string,
) {
  const profile = await prisma.lawyerProfile.findUnique({
    where: { barEnrollmentNumber },
    ...lawyerWithUser,
  });

  return profile ? toLawyerProfileDto(profile as LawyerProfileRecord) : null;
}

export async function listLawyerProfiles(
  filters: LawyerListFilters = {},
): Promise<PaginatedLawyerResult> {
  const { status = "all", page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.LawyerProfileWhereInput = {};
  if (status !== "all") {
    where.verificationStatus = status;
  }

  const [data, total] = await Promise.all([
    prisma.lawyerProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      ...lawyerWithUser,
    }),
    prisma.lawyerProfile.count({ where }),
  ]);

  return {
    data: data.map((profile) => toLawyerProfileDto(profile as LawyerProfileRecord)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createLawyerProfile(
  userId: string,
  input: SubmitLawyerOnboardingInput,
): Promise<LawyerProfileDto> {
  const profile = await prisma.lawyerProfile.create({
    data: {
      userId,
      barEnrollmentNumber: input.barEnrollmentNumber,
      practiceLicenseUrl: input.practiceLicenseUrl,
      idDocumentUrl: input.idDocumentUrl,
      practiceAreas: input.practiceAreas,
      languages: input.languages,
      yearsOfExperience: input.yearsOfExperience,
      verificationStatus: "PENDING",
      isMatchable: false,
      rejectionReason: null,
      reviewedById: null,
      reviewedAt: null,
    },
    ...lawyerWithUser,
  });

  return toLawyerProfileDto(profile as LawyerProfileRecord);
}

export async function updateLawyerProfile(
  userId: string,
  input: Partial<SubmitLawyerOnboardingInput>,
): Promise<LawyerProfileDto> {
  const data: Prisma.LawyerProfileUpdateInput = {
    verificationStatus: "PENDING",
    isMatchable: false,
    rejectionReason: null,
    reviewedBy: {
      disconnect: true,
    },
    reviewedAt: null,
  };

  if (input.barEnrollmentNumber !== undefined) {
    data.barEnrollmentNumber = input.barEnrollmentNumber;
  }
  if (input.practiceLicenseUrl !== undefined) {
    data.practiceLicenseUrl = input.practiceLicenseUrl;
  }
  if (input.idDocumentUrl !== undefined) {
    data.idDocumentUrl = input.idDocumentUrl;
  }
  if (input.practiceAreas !== undefined) {
    data.practiceAreas = input.practiceAreas;
  }
  if (input.languages !== undefined) {
    data.languages = input.languages;
  }
  if (input.yearsOfExperience !== undefined) {
    data.yearsOfExperience = input.yearsOfExperience;
  }

  const profile = await prisma.lawyerProfile.update({
    where: { userId },
    data,
    ...lawyerWithUser,
  });

  return toLawyerProfileDto(profile as LawyerProfileRecord);
}

export async function approveLawyerProfile(
  id: string,
  reviewerId: string,
): Promise<LawyerProfileDto> {
  const profile = await prisma.lawyerProfile.update({
    where: { id },
        data: {
      verificationStatus: "APPROVED",
      isMatchable: true,
      rejectionReason: null,
      reviewedBy: {
        connect: { id: reviewerId },
      },
      reviewedAt: new Date(),
    },
    ...lawyerWithUser,
  });

  return toLawyerProfileDto(profile as LawyerProfileRecord);
}

export async function rejectLawyerProfile(
  id: string,
  reviewerId: string,
  reason: string,
): Promise<LawyerProfileDto> {
  const profile = await prisma.lawyerProfile.update({
    where: { id },
    data: {
      verificationStatus: "REJECTED",
      isMatchable: false,
      rejectionReason: reason,
      reviewedBy: {
        connect: { id: reviewerId },
      },
      reviewedAt: new Date(),
    },
    ...lawyerWithUser,
  });

  return toLawyerProfileDto(profile as LawyerProfileRecord);
}