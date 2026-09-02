import { NextRequest } from "next/server";
import { rightsGuideService, rightsGuideListQuerySchema } from "@/modules/rights-guides";
import { jsonResponse, errorResponse } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = rightsGuideListQuerySchema.safeParse({
      search: searchParams.get("search") ?? undefined,
    });

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const guides = await rightsGuideService.listRightsGuides(parsed.data);
    return jsonResponse({ data: guides });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch rights guides";
    return errorResponse(message, 500);
  }
}