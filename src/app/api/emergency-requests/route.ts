import { NextRequest } from "next/server";
import {
  createEmergencyRequestSchema,
} from "@/modules/emergency";
import {
  createEmergencyRequest,
} from "@/modules/emergency/service";
import { isErrorResponse, requireApiRole } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;
  try {
    const statusParam = request.nextUrl.searchParams.get("status");
    const statusSchema = z.enum(["REQUESTED", "MATCHED", "ACCEPTED", "REJECTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional();
    const parsedStatus = statusSchema.safeParse(statusParam || undefined);
    if (!parsedStatus.success) return errorResponse("Invalid emergency request status", 400);
    const data = await prisma.emergencyRequest.findMany({
      where: parsedStatus.data ? { status: parsedStatus.data } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        emergencyCategory: { select: { id: true, key: true, label: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
    return jsonResponse({ data });
  } catch (error) {
    console.error("Failed to list emergency requests", error);
    return errorResponse("Failed to fetch emergency requests", 500);
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireApiRole("citizen");
  if (isErrorResponse(guard)) return guard;

  try {
    const parsed = createEmergencyRequestSchema.safeParse(
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

    const emergencyRequest = await createEmergencyRequest(
      guard.id,
      parsed.data,
    );

    return jsonResponse(emergencyRequest, 201);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Active emergency category not found"
    ) {
      return errorResponse(error.message, 404);
    }

    console.error("Failed to create emergency request", error);
    return errorResponse("Failed to create emergency request", 500);
  }
}
