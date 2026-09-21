import { NextRequest } from "next/server";
import {
  createEmergencyRequestSchema,
} from "@/modules/emergency";
import {
  createEmergencyRequest,
} from "@/modules/emergency/service";
import { isErrorResponse, requireApiRole } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";

export async function POST(request: NextRequest) {
  const guard = await requireApiRole("citizen");
  if (isErrorResponse(guard)) return guard;

  try {
    const parsed = createEmergencyRequestSchema.safeParse(
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

    const emergencyRequest = await createEmergencyRequest(
      guard.id,
      parsed.data,
    );

    return jsonResponse(emergencyRequest, 201);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Active emergency category not found"
    ) {
      return errorResponse(error.message, 404);
    }

    console.error("Failed to create emergency request", error);
    return errorResponse("Failed to create emergency request", 500);
  }
}
