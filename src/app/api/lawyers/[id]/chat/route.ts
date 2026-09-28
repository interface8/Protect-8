import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isErrorResponse, requireApiRole } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { requestService } from "@/modules/requests";

type RouteContext = { params: { id: string } };
const chatSchema = z.object({ category: z.string().trim().min(2).max(120).optional() });

export async function POST(request: Request, { params }: RouteContext) {
  const guard = await requireApiRole("citizen");
  if (isErrorResponse(guard)) return guard;

  const parsed = chatSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ message: "Invalid enquiry category", errors: parsed.error.flatten().fieldErrors }, { status: 400 });

  try {
    const profile = await prisma.lawyerProfile.findUnique({ where: { id: params.id } });
    if (!profile || profile.verificationStatus !== "APPROVED" || !profile.isMatchable) {
      return errorResponse("This lawyer is not currently accepting enquiries", 409);
    }

    const existing = await prisma.request.findFirst({
      where: { citizenId: guard.id, lawyerId: profile.userId, status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] } },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });
    if (existing) return jsonResponse({ requestId: existing.id, existing: true });

    const created = await requestService.createRequest({
      citizenId: guard.id,
      lawyerProfileId: profile.id,
      category: parsed.data.category ?? "General consultation",
      title: "Chat enquiry",
      description: "Started from the lawyer profile chat.",
    });
    return jsonResponse({ requestId: created.id, existing: false }, 201);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Could not start a chat", 500);
  }
}
