import { NextRequest } from "next/server";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { articleService, flagArticleSchema } from "@/modules/articles";
import { errorResponse, jsonResponse } from "@/lib/http";
import { auditService } from "@/modules/audit";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const guard = await requireApiRole(["admin"]);
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = flagArticleSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const article = await articleService.flagArticle(id, guard.id, parsed.data);
    await auditService.logAuditEvent({
      actorId: guard.id,
      action: parsed.data.isFlagged ? "article.flagged" : "article.unflagged",
      target: `article:${id}`,
      metadata: {
        articleId: id,
        isFlagged: parsed.data.isFlagged,
        flagReason: parsed.data.flagReason ?? null,
      },
    });
    return jsonResponse(article);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Article not found") {
      return errorResponse("Article not found", 404);
    }

    const message =
      error instanceof Error ? error.message : "Failed to update article flag";
    return errorResponse(message, 500);
  }
}
