import { rightsGuideService } from "@/modules/rights-guides";
import { jsonResponse, errorResponse } from "@/lib/http";

interface RouteParams {
  params: { slug: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const guide = await rightsGuideService.getRightsGuideBySlug(params.slug);
    return jsonResponse(guide);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch rights guide";

    if (message === "Rights guide not found") {
      return errorResponse("Rights guide not found", 404);
    }

    return errorResponse(message, 500);
  }
}