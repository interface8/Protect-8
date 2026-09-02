import { articleService } from "@/modules/articles";
import { errorResponse, jsonResponse } from "@/lib/http";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;

  try {
    const article = await articleService.getArticleBySlug(slug);
    return jsonResponse(article);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Article not found") {
      return errorResponse("Article not found", 404);
    }

    const message = error instanceof Error ? error.message : "Failed to fetch article";
    return errorResponse(message, 500);
  }
}