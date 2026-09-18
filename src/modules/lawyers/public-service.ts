import type { LawyerAvailabilityStatus } from "@prisma/client";
import {
  findLawyerProfileForAvailability,
  findPublicLawyerRecordById,
  findPublicLawyerRecords,
  markStaleLawyersOffline,
  updateLawyerAvailability,
  type PublicLawyerRecord,
} from "./public-repository";
import type {
  AvailableLawyerResult,
  PublicLawyer,
  PublicLawyerDetail,
  PublicLawyerFilter,
  PublicLawyerListInput,
  PublicLawyerListResult,
} from "./public-types";

const DEFAULT_TIMEOUT_MINUTES = 15;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function getTimeoutMinutes() {
  const configured = Number(
    process.env.LAWYER_AVAILABILITY_TIMEOUT_MINUTES,
  );

  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_TIMEOUT_MINUTES;
}

function matchesPracticeFilter(
  practiceAreas: string[],
  filter: Exclude<PublicLawyerFilter, "available">,
) {
  const aliases: Record<
    Exclude<PublicLawyerFilter, "available">,
    string[]
  > = {
    criminal: ["criminal"],
    property: ["property", "real estate"],
    employment: ["employment", "labor", "labour"],
    family: ["family"],
    civil: ["civil"],
  };

  return practiceAreas.some((area) => {
    const normalizedArea = normalize(area);
    return aliases[filter].some((alias) =>
      normalizedArea.includes(alias),
    );
  });
}

function formatResponseTime(seconds: number) {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `< ${minutes} min`;
}

function toPublicLawyer(record: PublicLawyerRecord): PublicLawyer {
  return {
    id: record.id,
    name: record.user.name,
    verified: record.verificationStatus === "APPROVED",
    avatar: record.user.avatarUrl,
    availabilityStatus: record.availabilityStatus,
    practiceArea: record.practiceAreas[0] ?? "General Practice",
    specialtyTags: record.practiceAreas,
    rating: Number(record.rating),
    ratingCount: record.ratingCount,
    consultationFee: Number(record.consultationFee),
    responseTimeEstimate: formatResponseTime(
      record.responseTimeSeconds,
    ),
  };
}

function toPublicLawyerDetail(
  record: PublicLawyerRecord,
): PublicLawyerDetail {
  return {
    ...toPublicLawyer(record),
    yearsOfExperience: record.yearsOfExperience,
    barMembership: record.barEnrollmentNumber,
    languages: record.languages,
  };
}

function filterRecords(
  records: PublicLawyerRecord[],
  input: PublicLawyerListInput,
) {
  const search = input.search ? normalize(input.search) : "";

  return records.filter((record) => {
    const matchesSearch =
      !search ||
      normalize(record.user.name).includes(search) ||
      record.practiceAreas.some((area) =>
        normalize(area).includes(search),
      );

    if (!matchesSearch) return false;
    if (!input.filter) return true;

    if (input.filter === "available") {
      return record.availabilityStatus === "AVAILABLE";
    }

    return matchesPracticeFilter(
      record.practiceAreas,
      input.filter,
    );
  });
}

export async function listPublicLawyers(
  input: PublicLawyerListInput,
): Promise<PublicLawyerListResult> {
  const records = await findPublicLawyerRecords();
  const availableNowCount = records.filter(
    (record) => record.availabilityStatus === "AVAILABLE",
  ).length;
  const filtered = filterRecords(records, input);
  const start = (input.page - 1) * input.limit;

  return {
    data: filtered
      .slice(start, start + input.limit)
      .map(toPublicLawyer),
    pagination: {
      page: input.page,
      limit: input.limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / input.limit),
    },
    availableNowCount,
  };
}

export async function listAvailableLawyers(
  limit: number,
): Promise<AvailableLawyerResult> {
  const records = await findPublicLawyerRecords();
  const available = records
    .filter((record) => record.availabilityStatus === "AVAILABLE")
    .sort((a, b) => a.responseTimeSeconds - b.responseTimeSeconds);

  return {
    data: available.slice(0, limit).map(toPublicLawyer),
    count: available.length,
  };
}

export async function getPublicLawyer(id: string) {
  const record = await findPublicLawyerRecordById(id);
  return record ? toPublicLawyerDetail(record) : null;
}

export async function setLawyerAvailability(
  userId: string,
  availabilityStatus: LawyerAvailabilityStatus,
) {
  const profile = await findLawyerProfileForAvailability(userId);

  if (!profile) {
    throw new Error("Lawyer profile not found");
  }

  if (
    profile.verificationStatus !== "APPROVED" ||
    !profile.isMatchable
  ) {
    throw new Error(
      "Only approved and matchable lawyers can update availability",
    );
  }

  return updateLawyerAvailability(userId, availabilityStatus);
}

export async function expireInactiveLawyers() {
  const cutoff = new Date(
    Date.now() - getTimeoutMinutes() * 60 * 1000,
  );

  return markStaleLawyersOffline(cutoff);
}
