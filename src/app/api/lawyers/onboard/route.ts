import { NextRequest } from "next/server";
import { lawyerService, submitLawyerOnboardingSchema } from "@/modules/lawyers";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

export async function POST(request: NextRequest) {
  const guard = await requireApiRole("lawyer");
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = submitLawyerOnboardingSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const profile = await lawyerService.submitOnboarding(guard.id, parsed.data);

    return jsonResponse(
      {
        message: "Lawyer onboarding submitted",
        profile,
      },
      201,
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to submit onboarding";

    if (message === "User not found") {
      return errorResponse("User not found", 404);
    }

    if (message === "Lawyer profile not found") {
      return errorResponse("Lawyer profile not found", 404);
    }

    if (message === "Bar enrollment number already in use") {
      return errorResponse("Bar enrollment number already in use", 409);
    }

    return errorResponse(message, 500);
  }
}