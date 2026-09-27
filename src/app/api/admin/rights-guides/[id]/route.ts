import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { auditService } from "@/modules/audit";
import { errorResponse, jsonResponse } from "@/lib/http";

const guideUpdateSchema = z.object({
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  title: z.string().trim().min(2).max(200).optional(),
  iconKey: z.string().trim().min(1).max(100).optional(),
  shortDescription: z.string().trim().min(5).max(500).optional(),
  body: z.string().trim().min(20).optional(),
  order: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, { message: "Provide at least one field to update" });

interface RouteContext { params: { id: string } }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;
  const parsed = guideUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  try {
    const guide = await prisma.rightsGuide.update({ where: { id: params.id }, data: parsed.data });
    await auditService.logAuditEvent({ actorId: guard.id, action: "rights_guide.updated", target: `rights_guide:${guide.id}`, metadata: { updatedFields: Object.keys(parsed.data) } });
    return jsonResponse(guide);
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") return errorResponse("Rights guide not found", 404);
    if (error instanceof Error && error.message.includes("Unique constraint")) return errorResponse("Guide slug already exists", 409);
    return errorResponse("Failed to update rights guide", 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;
  try {
    const guide = await prisma.rightsGuide.update({ where: { id: params.id }, data: { isActive: false } });
    await auditService.logAuditEvent({ actorId: guard.id, action: "rights_guide.deactivated", target: `rights_guide:${guide.id}`, metadata: { slug: guide.slug } });
    return jsonResponse({ message: "Rights guide deactivated", guide });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") return errorResponse("Rights guide not found", 404);
    return errorResponse("Failed to deactivate rights guide", 500);
  }
}
