import { NextRequest } from "next/server";
import {
  emergencyRequestStatusSchema,
} from "@/modules/emergency";
import {
  transitionEmergencyRequest,
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
  const guard = await requireApiRole([
    "citizen",
    "lawyer",
    "admin",
  ]);
  if (isErrorResponse(guard)) return guard;

  try {
    const parsed = emergencyRequestStatusSchema.safeParse(
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

    const updated = await transitionEmergencyRequest(
      params.id,
      guard,
      parsed.data.status,
    );
    if (guard.role === "admin") {
      await auditService.logAuditEvent({
        actorId: guard.id,
        action: "emergency_request.status_updated",
        target: `emergency_request:${params.id}`,
        metadata: { status: parsed.data.status },
      });
    }

    return jsonResponse(updated);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update emergency request status";

    if (message === "Emergency request not found") {
      return errorResponse(message, 404);
    }

    if (
      message.includes("not allowed") ||
      message.includes("cannot perform")
    ) {
      return errorResponse(message, 403);
    }

    if (
      message.includes("Invalid status transition") ||
      message.includes("status changed")
    ) {
      return errorResponse(message, 409);
    }

    console.error(
      "Failed to update emergency request status",
      error,
    );
    return errorResponse(message, 500);
  }
}
