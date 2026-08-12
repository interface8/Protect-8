import { NextRequest } from "next/server";
import { lawyerService, rejectLawyerSchema } from "@/modules/lawyers";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = rejectLawyerSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const profile = await lawyerService.rejectLawyer(
      params.id,
      guard.id,
      parsed.data.reason,
    );

    return jsonResponse({
      message: "Lawyer rejected successfully",
      profile,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to reject lawyer";

    if (message === "Lawyer profile not found") {
      return errorResponse("Lawyer profile not found", 404);
    }

    return errorResponse(message, 500);
  }
}