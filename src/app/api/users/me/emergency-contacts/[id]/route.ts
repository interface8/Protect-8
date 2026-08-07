import { NextRequest } from "next/server";
import { userService } from "@/modules/users";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { errorResponse } from "@/lib/http";

interface RouteParams {
  params: { id: string };
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const guard = await requireApiRole(["citizen", "lawyer"]);
  if (isErrorResponse(guard)) return guard;

  try {
    await userService.removeEmergencyContact(guard.id, params.id);
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Emergency contact not found") {
      return errorResponse("Emergency contact not found", 404);
    }

    const message = error instanceof Error ? error.message : "Failed to delete emergency contact";
    return errorResponse(message, 500);
  }
}