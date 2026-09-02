import { NextRequest } from "next/server";
import { articleService, articleListQuerySchema } from "@/modules/articles";
import { jsonResponse, errorResponse } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const parsed = articleListQuerySchema.safeParse({
      search: request.nextUrl.searchParams.get("search") ?? undefined,
      category: request.nextUrl.searchParams.get("category") ?? undefined,
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

    const articles = await articleService.listArticles(parsed.data);
    return jsonResponse({ data: articles });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch articles";
    return errorResponse(message, 500);
  }
}