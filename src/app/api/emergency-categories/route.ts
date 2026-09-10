import { jsonResponse, errorResponse } from "@/lib/http";
import { listActiveCategories } from "@/modules/emergency/service";

export async function GET() {
  try {
    return jsonResponse(await listActiveCategories());
  } catch (error) {
    console.error("Failed to fetch emergency categories", error);
    return errorResponse("Failed to fetch emergency categories", 500);
  }
}
