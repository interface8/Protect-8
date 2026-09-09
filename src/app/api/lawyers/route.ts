import { NextRequest } from "next/server";
import {
  publicLawyerQuerySchema,
} from "@/modules/lawyers";
import {
  listPublicLawyers,
} from "@/modules/lawyers/public-service";
import { errorResponse, jsonResponse } from "@/lib/http";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(
    request.nextUrl.searchParams.entries(),
  );
  const parsed = publicLawyerQuerySchema.safeParse(params);

  if (!parsed.success) {
    return Response.json(
      {
        message: "Invalid lawyer query",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    return jsonResponse(await listPublicLawyers(parsed.data));
  } catch (error) {
    console.error("Failed to list public lawyers", error);
    return errorResponse("Failed to fetch lawyers", 500);
  }
}
