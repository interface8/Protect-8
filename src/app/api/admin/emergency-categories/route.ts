import { NextRequest } from "next/server";
import {
  createEmergencyCategorySchema,
} from "@/modules/emergency";
import {
  createCategory,
} from "@/modules/emergency/service";
import { isErrorResponse, requireApiRole } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";

export async function POST(request: NextRequest) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    const parsed = createEmergencyCategorySchema.safeParse(
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

    const category = await createCategory(parsed.data);
    return jsonResponse(category, 201);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return errorResponse("Emergency category key already exists", 409);
    }

    console.error("Failed to create emergency category", error);
    return errorResponse("Failed to create emergency category", 500);
  }
}
