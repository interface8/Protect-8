import { listActiveCategories } from "@/modules/emergency/service";
import { errorResponse, jsonResponse } from "@/lib/http";

export async function GET() {
  try {
    const categories = await listActiveCategories();
    return jsonResponse({ data: categories });
  } catch (error) {
    console.error("Failed to list emergency categories", error);
    return errorResponse("Failed to fetch emergency categories", 500);
  }
}