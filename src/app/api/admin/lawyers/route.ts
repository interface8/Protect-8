import { NextRequest } from "next/server";
import { lawyerService, lawyerListFiltersSchema } from "@/modules/lawyers";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

export async function GET(request: NextRequest) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    const { searchParams } = new URL(request.url);

    const statusRaw = searchParams.get("status");
    const status = statusRaw ? statusRaw.toUpperCase() : undefined;

    const parsed = lawyerListFiltersSchema.safeParse({
      status: status ?? "all",
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const result = await lawyerService.listPendingLawyers(parsed.data);
    return jsonResponse(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch lawyers";
    return errorResponse(message, 500);
  }
}