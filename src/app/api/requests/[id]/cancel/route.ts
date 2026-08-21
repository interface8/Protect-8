import { NextRequest } from "next/server";
import { requestService } from "@/modules/requests";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: Params) {
  const guard = await requireApiRole(["citizen", "admin"]);
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  try {
    const current = await requestService.getRequestById(id);

    if (guard.role !== "admin" && current.citizenId !== guard.id) {
      return errorResponse("Forbidden", 403);
    }

    const updated = await requestService.cancelRequest(id);
    return jsonResponse(updated);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Request not found") {
      return errorResponse("Request not found", 404);
    }

    const message =
      error instanceof Error ? error.message : "Failed to cancel request";
    return errorResponse(message, 500);
  }
}