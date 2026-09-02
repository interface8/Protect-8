import { NextRequest } from "next/server";
import { assignRequestSchema, requestService } from "@/modules/requests";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  const guard = await requireApiRole(["admin"]);
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = assignRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const updated = await requestService.assignLawyer(id, parsed.data.lawyerId);
    return jsonResponse(updated);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Request not found") {
      return errorResponse("Request not found", 404);
    }

    const message =
      error instanceof Error ? error.message : "Failed to assign lawyer";
    return errorResponse(message, 500);
  }
}