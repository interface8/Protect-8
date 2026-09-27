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

const SITUATION_PRACTICE_ALIASES: Record<string, string[]> = {
  "traffic-stop": ["traffic", "criminal"],
  "police-arrest": ["criminal", "police", "arrest"],
  "efcc-issue": ["efcc", "financial crime", "criminal"],
  "land-dispute": ["land", "property", "real estate"],
  "domestic-violence": ["domestic violence", "family"],
  "security-agency": ["security agency", "criminal", "civil"],
  "employment-matter": ["employment", "labor", "labour"],
  fraud: ["fraud", "financial crime", "criminal"],
  cybercrime: ["cybercrime", "cyber", "criminal"],
  immigration: ["immigration"],
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function getTimeoutMinutes() {
  const configured = Number(process.env.LAWYER_AVAILABILITY_TIMEOUT_MINUTES);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_TIMEOUT_MINUTES;
}

function matchesPracticeFilter(
  practiceAreas: string[],
  filter: Exclude<PublicLawyerFilter, "available">
) {
  const aliases: Record<Exclude<PublicLawyerFilter, "available">, string[]> = {
    criminal: ["criminal"],
    property: ["property", "real estate"],
    employment: ["employment", "labor", "labour"],
    family: ["family"],
    civil: ["civil"],
  };

  return practiceAreas.some((area) => {
    const normalizedArea = normalize(area);
    return aliases[filter].some((alias) => normalizedArea.includes(alias));
  });
}

function formatResponseTime(seconds: number) {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `< ${minutes} min`;
}

function toLocationLabel(city: string | null, state: string | null): string | null {
  if (city && state) return `${city}, ${state}`;
  return city ?? state ?? null;
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
    responseTimeEstimate: formatResponseTime(record.responseTimeSeconds),
    location: toLocationLabel(record.city, record.state),
  };
}

function toPublicLawyerDetail(record: PublicLawyerRecord): PublicLawyerDetail {
  return {
    ...toPublicLawyer(record),
    yearsOfExperience: record.yearsOfExperience,
    barMembership: record.barEnrollmentNumber,
    languages: record.languages,
  };
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function sortByDistanceIfAvailable(
  records: PublicLawyerRecord[],
  userLat?: number,
  userLng?: number
): PublicLawyerRecord[] {
  if (userLat == null || userLng == null) return records;

  return [...records].sort((a, b) => {
    const aHas = a.latitude != null && a.longitude != null;
    const bHas = b.latitude != null && b.longitude != null;
    if (!aHas && !bHas) return 0;
    if (!aHas) return 1;
    if (!bHas) return -1;
    return (
      distanceKm(userLat, userLng, a.latitude!, a.longitude!) -
      distanceKm(userLat, userLng, b.latitude!, b.longitude!)
    );
  });
}

function filterRecords(records: PublicLawyerRecord[], input: PublicLawyerListInput) {
  const search = input.search ? normalize(input.search) : "";

  return records.filter((record) => {
    const matchesSearch =
      !search ||
      normalize(record.user.name).includes(search) ||
      record.practiceAreas.some((area) => normalize(area).includes(search));

    if (!matchesSearch) return false;
    if (!input.filter) return true;
    if (input.filter === "available") return record.availabilityStatus === "AVAILABLE";
    return matchesPracticeFilter(record.practiceAreas, input.filter);
  });
}

export async function listPublicLawyers(
  input: PublicLawyerListInput
): Promise<PublicLawyerListResult> {
  const records = await findPublicLawyerRecords();
  const sorted = sortByDistanceIfAvailable(records, input.userLatitude, input.userLongitude);
  const availableNowCount = sorted.filter((r) => r.availabilityStatus === "AVAILABLE").length;
  const filtered = filterRecords(sorted, input);
  const start = (input.page - 1) * input.limit;

  return {
    data: filtered.slice(start, start + input.limit).map(toPublicLawyer),
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
  userLatitude?: number,
  userLongitude?: number,
  categoryKey?: string,
): Promise<AvailableLawyerResult> {
  const records = await findPublicLawyerRecords();
  const aliases = categoryKey && categoryKey !== "other"
    ? SITUATION_PRACTICE_ALIASES[normalize(categoryKey)]
    : undefined;
  const available = records.filter((record) => {
    if (record.availabilityStatus !== "AVAILABLE") return false;
    if (!aliases) return true;
    return record.practiceAreas.some((area) => {
      const normalizedArea = normalize(area);
      return aliases.some((alias) => normalizedArea.includes(alias));
    });
  });

  const sorted =
    userLatitude != null && userLongitude != null
      ? sortByDistanceIfAvailable(available, userLatitude, userLongitude)
      : [...available].sort((a, b) => a.responseTimeSeconds - b.responseTimeSeconds);

  return {
    data: sorted.slice(0, limit).map(toPublicLawyer),
    count: sorted.length,
  };
}

export async function getPublicLawyer(id: string) {
  const record = await findPublicLawyerRecordById(id);
  return record ? toPublicLawyerDetail(record) : null;
}

export async function setLawyerAvailability(
  userId: string,
  availabilityStatus: LawyerAvailabilityStatus
) {
  const profile = await findLawyerProfileForAvailability(userId);
  if (!profile) throw new Error("Lawyer profile not found");
  if (profile.verificationStatus !== "APPROVED" || !profile.isMatchable) {
    throw new Error("Only approved and matchable lawyers can update availability");
  }
  return updateLawyerAvailability(userId, availabilityStatus);
}

export async function expireInactiveLawyers() {
  const cutoff = new Date(Date.now() - getTimeoutMinutes() * 60 * 1000);
  return markStaleLawyersOffline(cutoff);
}
