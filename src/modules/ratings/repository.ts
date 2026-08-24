import { prisma } from "@/lib/prisma";
import type { RequestRatingDto, SubmitRequestRatingInput } from "./types";

interface RatingRecord {
  id: string;
  requestId: string;
  raterUserId: string;
  raterType: "CITIZEN" | "LAWYER";
  targetUserId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function toRatingDto(record: RatingRecord): RequestRatingDto {
  return {
    id: record.id,
    requestId: record.requestId,
    raterUserId: record.raterUserId,
    raterType: record.raterType,
    targetUserId: record.targetUserId,
    rating: record.rating,
    comment: record.comment,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function findRatingByRequestAndRater(
  requestId: string,
  raterUserId: string,
  raterType: "CITIZEN" | "LAWYER",
): Promise<RequestRatingDto | null> {
  const rating = await prisma.requestRating.findFirst({
    where: {
      requestId,
      raterUserId,
      raterType,
    },
  });

  return rating ? toRatingDto(rating as RatingRecord) : null;
}

export async function submitRequestRating(
  input: SubmitRequestRatingInput,
  updateLawyerAggregate: boolean,
): Promise<RequestRatingDto> {
  const created = await prisma.$transaction(async (tx) => {
    const rating = await tx.requestRating.create({
      data: {
        requestId: input.requestId,
        raterUserId: input.raterUserId,
        raterType: input.raterType,
        targetUserId: input.targetUserId,
        rating: input.rating,
        comment: input.comment ?? null,
      },
    });

    if (updateLawyerAggregate) {
      const profile = await tx.lawyerProfile.findUnique({
        where: {
          userId: input.targetUserId,
        },
      });

      if (!profile) {
        throw new Error("Lawyer profile not found");
      }

      const nextCount = profile.ratingCount + 1;
      const nextTotal = profile.rating * profile.ratingCount + input.rating;
      const nextAverage = nextTotal / nextCount;

      await tx.lawyerProfile.update({
        where: {
          userId: input.targetUserId,
        },
        data: {
          rating: nextAverage,
          ratingCount: nextCount,
        },
      });
    }

    return rating;
  });

  return toRatingDto(created as RatingRecord);
}