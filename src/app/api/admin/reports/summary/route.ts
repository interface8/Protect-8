import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { reportService } from "@/modules/reports";

export async function GET() {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    const summary = await reportService.getReportSummary();

    if (!summary) {
      return errorResponse("Report summary not available yet", 404);
    }

    return jsonResponse(summary);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch report summary";
    return errorResponse(message, 500);
  }
}