import { NextRequest } from "next/server";
import { requestService, updateRequestSchema } from "@/modules/requests";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { auditService } from "@/modules/audit";
import { notifyUser } from "@/lib/notifications";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const guard = await requireApiRole(["citizen", "lawyer", "admin"]);
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  try {
    const request = await requestService.getRequestById(id);

    if (
      guard.role !== "admin" &&
      request.citizenId !== guard.id &&
      request.lawyerId !== guard.id
    ) {
      return errorResponse("Forbidden", 403);
    }

    return jsonResponse(request);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Request not found") {
      return errorResponse("Request not found", 404);
    }

    const message =
      error instanceof Error ? error.message : "Failed to fetch request";
    return errorResponse(message, 500);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const guard = await requireApiRole(["citizen", "admin"]);
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  try {
    const existing = await requestService.getRequestById(id);

    if (guard.role !== "admin") {
      if (existing.citizenId !== guard.id) {
        return errorResponse("Forbidden", 403);
      }

      if (existing.status !== "OPEN") {
        return errorResponse("Only open requests can be edited", 400);
      }
    }

    const body = await request.json();
    const parsed = updateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const updated = await requestService.updateRequest(
      id,
      guard.role === "admin"
        ? parsed.data
        : {
            category: parsed.data.category,
            title: parsed.data.title,
            description: parsed.data.description,
          },
    );
    if (parsed.data.status && parsed.data.status !== existing.status) {
      const recipients = [existing.citizenId, existing.lawyerId].filter((recipientId): recipientId is string => Boolean(recipientId) && recipientId !== guard.id);
      await Promise.all(recipients.map((recipientId) => notifyUser({ recipientId, actorId: guard.id, requestId: id, type: "REQUEST_UPDATED", title: "Enquiry status updated", body: `“${existing.title}” is now ${parsed.data.status!.toLowerCase().replaceAll("_", " ")}.`, href: recipientId === existing.citizenId ? "/my-requests" : "/lawyer/enquiries" })));
    }
    if (guard.role === "admin") {
      await auditService.logAuditEvent({ actorId: guard.id, action: "request.updated", target: `request:${id}`, metadata: { updatedFields: Object.keys(parsed.data) } });
    }

    return jsonResponse(updated);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Request not found") {
      return errorResponse("Request not found", 404);
    }

    const message =
      error instanceof Error ? error.message : "Failed to update request";
    return errorResponse(message, 500);
  }
}
