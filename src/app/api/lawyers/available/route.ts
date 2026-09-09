import { NextRequest } from "next/server";
import {
  availableLawyerQuerySchema,
} from "@/modules/lawyers";
import {
  listAvailableLawyers,
} from "@/modules/lawyers/public-service";
import { errorResponse, jsonResponse } from "@/lib/http";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(
    request.nextUrl.searchParams.entries(),
  );
  const parsed = availableLawyerQuerySchema.safeParse(params);

  if (!parsed.success) {
    return Response.json(
      {
        message: "Invalid available lawyer query",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    return jsonResponse(
      await listAvailableLawyers(parsed.data.limit),
    );
  } catch (error) {
    console.error("Failed to list available lawyers", error);
    return errorResponse(
      "Failed to fetch available lawyers",
      500,
    );
  }
}
