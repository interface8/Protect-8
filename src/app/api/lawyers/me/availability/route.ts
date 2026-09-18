import { NextRequest } from "next/server";
import {
  lawyerAvailabilitySchema,
} from "@/modules/lawyers";
import {
  setLawyerAvailability,
} from "@/modules/lawyers/public-service";
import {
  isErrorResponse,
  requireApiRole,
} from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";

export async function PATCH(request: NextRequest) {
  const guard = await requireApiRole("lawyer");

  if (isErrorResponse(guard)) return guard;

  try {
    const parsed = lawyerAvailabilitySchema.safeParse(
      await request.json(),
    );

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const availability = await setLawyerAvailability(
      guard.id,
      parsed.data.availabilityStatus,
    );

    return jsonResponse({
      message: "Availability updated",
      availability,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update availability";

    if (message === "Lawyer profile not found") {
      return errorResponse(message, 404);
    }

    if (
      message ===
      "Only approved and matchable lawyers can update availability"
    ) {
      return errorResponse(message, 403);
    }

    console.error("Failed to update lawyer availability", error);
    return errorResponse(message, 500);
  }
}
