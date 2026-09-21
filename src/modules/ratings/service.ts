import { requestService } from "@/modules/requests";
import type { SessionUser } from "@/lib/auth";
import * as ratingRepo from "./repository";
import type {
  RatingRaterType,
  SubmitRequestRatingInput,
  RequestRatingDto,
} from "./types";

export async function submitRating(
  requestId: string,
  actor: Pick<SessionUser, "id" | "role">,
  input: { rating: number; comment?: string | null },
): Promise<RequestRatingDto> {
  const request = await requestService.getRequestById(requestId);

  if (request.status !== "COMPLETED") {
    throw new Error("Only completed requests can be rated");
  }

  let raterType: RatingRaterType;
  let targetUserId: string;
  let updateLawyerAggregate = false;

  if (actor.role === "citizen") {
    if (request.citizenId !== actor.id) {
      throw new Error("You can only rate your own requests");
    }

    if (!request.lawyerId) {
      throw new Error("Request has no assigned lawyer");
    }

    raterType = "CITIZEN";
    targetUserId = request.lawyerId;
    updateLawyerAggregate = true;
  } else if (actor.role === "lawyer") {
    if (request.lawyerId !== actor.id) {
      throw new Error("You can only rate your own requests");
    }

    raterType = "LAWYER";
    targetUserId = request.citizenId;
  } else {
    throw new Error("Only citizens and lawyers can submit ratings");
  }

  const existing = await ratingRepo.findRatingByRequestAndRater(
    requestId,
    actor.id,
    raterType,
  );

  if (existing) {
    throw new Error("Rating already submitted");
  }

  const payload: SubmitRequestRatingInput = {
    requestId,
    raterUserId: actor.id,
    raterType,
    targetUserId,
    rating: input.rating,
    comment: input.comment ?? null,
  };

  return ratingRepo.submitRequestRating(payload, updateLawyerAggregate);
}