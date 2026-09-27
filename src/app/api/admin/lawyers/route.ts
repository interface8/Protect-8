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
    const status = statusRaw
      ? statusRaw.toLowerCase() === "all"
        ? "all"
        : statusRaw.toUpperCase()
      : undefined;

    // Do not pass absent query parameters as null: z.coerce.number() turns
    // null into 0, which fails the positive page/limit validation.
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const parsed = lawyerListFiltersSchema.safeParse({
      status: status ?? "all",
      ...(page !== null ? { page } : {}),
      ...(limit !== null ? { limit } : {}),
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
