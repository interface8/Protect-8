import { NextRequest } from "next/server";
import {
  updateEmergencyCategorySchema,
} from "@/modules/emergency";
import {
  updateCategory,
} from "@/modules/emergency/service";
import { isErrorResponse, requireApiRole } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { auditService } from "@/modules/audit";

interface RouteContext {
  params: { id: string };
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    const parsed = updateEmergencyCategorySchema.safeParse(
      await request.json(),
    );

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const category = await updateCategory(params.id, parsed.data);
    await auditService.logAuditEvent({ actorId: guard.id, action: "emergency_category.updated", target: `emergency_category:${category.id}`, metadata: { updatedFields: Object.keys(parsed.data) } });
    return jsonResponse(category);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Emergency category not found"
    ) {
      return errorResponse(error.message, 404);
    }

    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return errorResponse("Emergency category key already exists", 409);
    }

    console.error("Failed to update emergency category", error);
    return errorResponse("Failed to update emergency category", 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;
  try {
    const category = await updateCategory(params.id, { isActive: false });
    await auditService.logAuditEvent({ actorId: guard.id, action: "emergency_category.deactivated", target: `emergency_category:${category.id}`, metadata: { key: category.key } });
    return jsonResponse({ message: "Situation deactivated", category });
  } catch (error) {
    if (error instanceof Error && error.message === "Emergency category not found") return errorResponse(error.message, 404);
    return errorResponse("Failed to deactivate situation", 500);
  }
}
