import { NextRequest } from "next/server";
import { isErrorResponse, requireApiRole } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { sosTriggerSchema } from "@/modules/emergency";
import { triggerSos } from "@/modules/emergency/sos";

export async function POST(request: NextRequest) {
  const guard = await requireApiRole("citizen");
  if (isErrorResponse(guard)) return guard;

  try {
    const parsed = sosTriggerSchema.safeParse(await request.json());

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    return jsonResponse(await triggerSos(guard.id, parsed.data), 201);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Active emergency category not found"
    ) {
      return errorResponse(error.message, 404);
    }

    console.error("Failed to trigger SOS", error);
    return errorResponse("Failed to trigger SOS", 500);
  }
}
