import { prisma } from "@/lib/prisma";
import { createActionLog } from "./repository";

const DEFAULT_RADIUS_KM = 50;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function getRadiusKm() {
  const configured = Number(process.env.LAWYER_MATCH_RADIUS_KM);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_RADIUS_KM;
}

function calculateDistanceKm(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const radians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLatitude = radians(latitudeB - latitudeA);
  const deltaLongitude = radians(longitudeB - longitudeA);
  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(radians(latitudeA)) *
      Math.cos(radians(latitudeB)) *
      Math.sin(deltaLongitude / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function matchesPracticeArea(areas: string[], key: string, label: string) {
  const terms = [key, label, key.replaceAll("-", " ")]
    .map(normalize)
    .filter(Boolean);

  return areas.some((area) => {
    const normalized = normalize(area);
    return terms.some(
      (term) => normalized.includes(term) || term.includes(normalized),
    );
  });
}

function matchesLanguage(languages: string[], requested: string | null) {
  if (!requested) return true;
  const normalized = normalize(requested);
  return languages.some((language) => normalize(language) === normalized);
}

export async function triggerEmergencyMatching(requestId: string) {
  const request = await prisma.emergencyRequest.findUnique({
    where: { id: requestId },
    include: {
      emergencyCategory: {
        select: { key: true, label: true },
      },
    },
  });

  if (!request || request.status !== "REQUESTED") return null;

  const lawyers = await prisma.lawyerProfile.findMany({
    where: {
      verificationStatus: "APPROVED",
      isMatchable: true,
      availabilityStatus: "AVAILABLE",
      user: { isActive: true },
    },
    select: {
      id: true,
      practiceAreas: true,
      languages: true,
      latitude: true,
      longitude: true,
      responseTimeSeconds: true,
      rating: true,
      user: { select: { id: true, name: true } },
    },
  });

  const hasRequestLocation =
    request.locationConsent &&
    request.latitude !== null &&
    request.longitude !== null;

  const candidates = lawyers.map((lawyer) => {
    const hasLawyerLocation =
      lawyer.latitude !== null && lawyer.longitude !== null;
    const distance =
      hasRequestLocation && hasLawyerLocation
        ? calculateDistanceKm(
            request.latitude!,
            request.longitude!,
            lawyer.latitude!,
            lawyer.longitude!,
          )
        : Number.POSITIVE_INFINITY;
    const specialtyMatch = request.emergencyCategory
      ? matchesPracticeArea(
          lawyer.practiceAreas,
          request.emergencyCategory.key,
          request.emergencyCategory.label,
        )
      : false;
    const languageMatch = matchesLanguage(
      lawyer.languages,
      request.preferredLanguage,
    );
    const withinRadius = distance <= getRadiusKm();

    let tier = 3;
    if (hasRequestLocation) {
      if (withinRadius && specialtyMatch && languageMatch) tier = 0;
      else if (withinRadius && specialtyMatch) tier = 1;
      else if (withinRadius) tier = 2;
    } else if (specialtyMatch && languageMatch) {
      tier = 0;
    } else if (specialtyMatch) {
      tier = 1;
    } else {
      tier = 2;
    }

    return { lawyer, tier, distance };
  });

  candidates.sort(
    (a, b) =>
      a.tier - b.tier ||
      a.distance - b.distance ||
      a.lawyer.responseTimeSeconds - b.lawyer.responseTimeSeconds ||
      Number(b.lawyer.rating) - Number(a.lawyer.rating),
  );

  const selected = candidates[0];

  if (!selected) {
    await createActionLog({
      requestId,
      actionType: "MATCHING",
      status: "FAILED",
      errorMessage: "No available approved lawyer found",
    });
    return null;
  }

  const assigned = await prisma.$transaction(async (tx) => {
    const result = await tx.emergencyRequest.updateMany({
      where: {
        id: requestId,
        status: "REQUESTED",
        assignedToId: null,
      },
      data: {
        assignedToId: selected.lawyer.user.id,
        status: "MATCHED",
      },
    });

    if (result.count !== 1) return false;

    await tx.emergencyRequestStatusHistory.create({
      data: {
        requestId,
        fromStatus: "REQUESTED",
        toStatus: "MATCHED",
        actorId: null,
        actorType: "SYSTEM",
      },
    });

    await tx.emergencyActionLog.create({
      data: {
        requestId,
        actionType: "MATCHING",
        status: "SUCCEEDED",
        metadata: {
          lawyerId: selected.lawyer.user.id,
          lawyerProfileId: selected.lawyer.id,
          distanceKm: Number.isFinite(selected.distance)
            ? selected.distance
            : null,
          fallback: selected.tier > 0,
        },
      },
    });

    return true;
  });

  return assigned ? selected.lawyer : null;
}
