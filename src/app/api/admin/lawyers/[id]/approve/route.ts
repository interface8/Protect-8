import { NextRequest } from "next/server";
import { lawyerService } from "@/modules/lawyers";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(_request: NextRequest, { params }: RouteParams) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    const profile = await lawyerService.approveLawyer(params.id, guard.id);

    return jsonResponse({
      message: "Lawyer approved successfully",
      profile,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to approve lawyer";

    if (message === "Lawyer profile not found") {
      return errorResponse("Lawyer profile not found", 404);
    }

    return errorResponse(message, 500);
  }
}