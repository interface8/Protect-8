import { NextRequest } from "next/server";
import { assistantService, assistantMessageSchema } from "@/modules/assistant";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";

export async function POST(request: NextRequest) {
  const guard = await requireApiRole(["citizen", "lawyer"]);
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = assistantMessageSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    if (parsed.data.startConversation || !parsed.data.message) {
      const init = await assistantService.startConversation(guard.id);
      return jsonResponse(init, 201);
    }

    return await assistantService.streamMessage({
      userId: guard.id,
      conversationId: parsed.data.conversationId,
      message: parsed.data.message,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    if (message === "Gemini assistant is not configured") {
      return errorResponse("Gemini assistant is not configured", 503);
    }

    if (message === "Conversation not found") {
      return errorResponse("Conversation not found", 404);
    }

    return errorResponse(message, 500);
  }
}