import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { auditService } from "@/modules/audit";
import { errorResponse, jsonResponse } from "@/lib/http";

const guideSchema = z.object({
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(2).max(200),
  iconKey: z.string().trim().min(1).max(100),
  shortDescription: z.string().trim().min(5).max(500),
  body: z.string().trim().min(20),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().optional().default(true),
});

export async function GET(request: NextRequest) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;
  const search = request.nextUrl.searchParams.get("search")?.trim();
  const guides = await prisma.rightsGuide.findMany({
    where: search ? { OR: [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
      { shortDescription: { contains: search, mode: "insensitive" } },
    ] } : undefined,
    orderBy: [{ order: "asc" }, { title: "asc" }],
  });
  return jsonResponse({ data: guides });
}

export async function POST(request: NextRequest) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;
  const parsed = guideSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  try {
    const guide = await prisma.rightsGuide.create({ data: parsed.data });
    await auditService.logAuditEvent({ actorId: guard.id, action: "rights_guide.created", target: `rights_guide:${guide.id}`, metadata: { slug: guide.slug } });
    return jsonResponse(guide, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) return errorResponse("Guide slug already exists", 409);
    return errorResponse("Failed to create rights guide", 500);
  }
}
