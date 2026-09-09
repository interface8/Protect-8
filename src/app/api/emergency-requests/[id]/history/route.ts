import { isErrorResponse, requireApiRole } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import {
  getRequestHistory,
} from "@/modules/emergency/service";

interface RouteContext {
  params: { id: string };
}

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  const guard = await requireApiRole([
    "citizen",
    "lawyer",
    "admin",
  ]);
  if (isErrorResponse(guard)) return guard;

  try {
    return jsonResponse(
      await getRequestHistory(params.id, guard),
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch request history";

    if (message === "Emergency request not found") {
      return errorResponse(message, 404);
    }

    if (message.includes("not allowed")) {
      return errorResponse(message, 403);
    }

    console.error("Failed to fetch emergency request history", error);
    return errorResponse(message, 500);
  }
}
