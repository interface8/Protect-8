import {
  getPublicLawyer,
} from "@/modules/lawyers/public-service";
import { errorResponse, jsonResponse } from "@/lib/http";

interface LawyerDetailRouteContext {
  params: {
    id: string;
  };
}

export async function GET(
  _request: Request,
  context: LawyerDetailRouteContext,
) {
  try {
    const lawyer = await getPublicLawyer(context.params.id);

    if (!lawyer) {
      return errorResponse("Lawyer not found", 404);
    }

    return jsonResponse(lawyer);
  } catch (error) {
    console.error("Failed to fetch public lawyer", error);
    return errorResponse("Failed to fetch lawyer", 500);
  }
}
