import { NextRequest } from "next/server";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import {
  articleService,
  createArticleSchema,
  updateArticleSchema,
} from "@/modules/articles";
import { errorResponse, jsonResponse } from "@/lib/http";
import { auditService } from "@/modules/audit";

export async function POST(request: NextRequest) {
  const guard = await requireApiRole(["admin"]);
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = createArticleSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const article = await articleService.createArticle(parsed.data, guard.id);
    await auditService.logAuditEvent({
      actorId: guard.id,
      action: "article.created",
      target: `article:${article.id}`,
      metadata: {
        articleId: article.id,
        category: article.category,
        readTimeMinutes: article.readTimeMinutes,
      },
    });
    return jsonResponse(article, 201);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message === "Article slug already exists"
    ) {
      return errorResponse("Article slug already exists", 409);
    }

    const message =
      error instanceof Error ? error.message : "Failed to create article";
    return errorResponse(message, 500);
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireApiRole(["admin"]);
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const { id, ...payload } = body ?? {};

    if (!id) {
      return errorResponse("Article id is required", 400);
    }

    const parsed = updateArticleSchema.safeParse(payload);

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const article = await articleService.updateArticle(
      id,
      parsed.data,
      guard.id,
    );
    await auditService.logAuditEvent({
      actorId: guard.id,
      action: "article.updated",
      target: `article:${article.id}`,
      metadata: {
        articleId: article.id,
        updatedFields: Object.keys(parsed.data),
      },
    });
    return jsonResponse(article);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Article not found") {
      return errorResponse("Article not found", 404);
    }

    const message =
      error instanceof Error ? error.message : "Failed to update article";
    return errorResponse(message, 500);
  }
}
