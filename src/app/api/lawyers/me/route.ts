import { lawyerService } from "@/modules/lawyers";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

export async function GET() {
  const guard = await requireApiRole("lawyer");
  if (isErrorResponse(guard)) return guard;

  try {
    const profile = await lawyerService.getMyLawyerProfile(guard.id);
    return jsonResponse(profile);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch lawyer profile";

    if (message === "Lawyer profile not found") {
      return errorResponse("Lawyer profile not found", 404);
    }

    return errorResponse(message, 500);
  }
}