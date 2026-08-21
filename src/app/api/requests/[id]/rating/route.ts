import { NextRequest } from "next/server";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import {
  ratingService,
  submitRequestRatingSchema,
} from "@/modules/ratings";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  const guard = await requireApiRole(["citizen", "lawyer"]);
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = submitRequestRatingSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const rating = await ratingService.submitRating(id, guard, parsed.data);
    return jsonResponse(rating, 201);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "Request not found") {
        return errorResponse("Request not found", 404);
      }

      if (error.message === "Only completed requests can be rated") {
        return errorResponse("Only completed requests can be rated", 400);
      }

      if (error.message === "Rating already submitted") {
        return errorResponse("Rating already submitted", 409);
      }

      if (error.message === "You can only rate your own requests") {
        return errorResponse("Forbidden", 403);
      }

      if (error.message === "Request has no assigned lawyer") {
        return errorResponse("Request has no assigned lawyer", 400);
      }

      if (error.message === "Lawyer profile not found") {
        return errorResponse("Lawyer profile not found", 404);
      }

      if (error.message === "Only citizens and lawyers can submit ratings") {
        return errorResponse("Forbidden", 403);
      }
    }

    const message =
      error instanceof Error ? error.message : "Failed to submit rating";
    return errorResponse(message, 500);
  }
}