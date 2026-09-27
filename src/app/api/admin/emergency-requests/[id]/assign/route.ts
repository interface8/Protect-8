import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { auditService } from "@/modules/audit";
import { errorResponse, jsonResponse } from "@/lib/http";

const schema = z.object({ lawyerProfileId: z.string().min(1) });
interface RouteContext { params: { id: string } }

export async function POST(request: NextRequest, { params }: RouteContext) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  try {
    const lawyer = await prisma.lawyerProfile.findUnique({
      where: { id: parsed.data.lawyerProfileId },
      select: { id: true, userId: true, verificationStatus: true, isMatchable: true, availabilityStatus: true, user: { select: { name: true } } },
    });
    if (!lawyer || lawyer.verificationStatus !== "APPROVED" || !lawyer.isMatchable || lawyer.availabilityStatus !== "AVAILABLE") {
      return errorResponse("Choose an approved lawyer who is currently available", 400);
    }
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.emergencyRequest.updateMany({
        where: { id: params.id, status: "REQUESTED", assignedToId: null },
        data: { assignedToId: lawyer.userId, status: "MATCHED" },
      });
      if (result.count !== 1) throw new Error("This request is no longer awaiting assignment");
      await tx.emergencyRequestStatusHistory.create({ data: { requestId: params.id, fromStatus: "REQUESTED", toStatus: "MATCHED", actorId: guard.id, actorType: "USER" } });
      await tx.emergencyActionLog.create({ data: { requestId: params.id, actionType: "MATCHING", status: "SUCCEEDED", metadata: { lawyerId: lawyer.userId, lawyerProfileId: lawyer.id, assignedByAdmin: true } } });
      return tx.emergencyRequest.findUniqueOrThrow({ where: { id: params.id }, include: { emergencyCategory: { select: { id: true, key: true, label: true } }, user: { select: { id: true, name: true, email: true } }, assignedTo: { select: { id: true, name: true, email: true } } } });
    });
    await auditService.logAuditEvent({ actorId: guard.id, action: "emergency_request.assigned", target: `emergency_request:${params.id}`, metadata: { lawyerProfileId: lawyer.id, lawyerName: lawyer.user.name } });
    return jsonResponse(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "This request is no longer awaiting assignment") return errorResponse(error.message, 409);
    if ((error as { code?: string }).code === "P2025") return errorResponse("Emergency request not found", 404);
    console.error("Failed to assign emergency request", error);
    return errorResponse("Failed to assign emergency request", 500);
  }
}
