import {
  ASSISTANT_DISCLOSURE,
  ASSISTANT_GREETING,
  ASSISTANT_HISTORY_LIMIT,
  ASSISTANT_QUICK_REPLIES,
} from "./constants";
import * as assistantRepo from "./repository";
import { streamGeminiResponse } from "./gemini";
import type {
  AssistantCategory,
  AssistantChatResponse,
  AssistantInitResponse,
} from "./types";

function normalizeMessage(text: string) {
  return text.trim().toLowerCase();
}

function classifyCategory(message: string): AssistantCategory {
  const text = normalizeMessage(message);

  if (
    text.includes("traffic stop") ||
    text.includes("stopped by police") ||
    text.includes("roadblock") ||
    text.includes("license") ||
    text.includes("car")
  ) {
    return "traffic_stop";
  }

  if (
    text.includes("arrest") ||
    text.includes("detain") ||
    text.includes("custody") ||
    text.includes("police cell")
  ) {
    return "police_arrest";
  }

  if (
    text.includes("efcc") ||
    text.includes("invitation") ||
    text.includes("agency") ||
    text.includes("summons")
  ) {
    return "efcc_invitation";
  }

  if (
    text.includes("land") ||
    text.includes("boundary") ||
    text.includes("survey") ||
    text.includes("property")
  ) {
    return "land_dispute";
  }

  if (
    text.includes("abuse") ||
    text.includes("violence") ||
    text.includes("hurt") ||
    text.includes("threat") ||
    text.includes("danger") ||
    text.includes("domestic")
  ) {
    return "domestic_violence";
  }

  if (
    text.includes("salary") ||
    text.includes("dismiss") ||
    text.includes("fired") ||
    text.includes("suspended") ||
    text.includes("workplace") ||
    text.includes("employment")
  ) {
    return "employment_matter";
  }

  return "something_else";
}

function shouldEscalate(message: string, category: AssistantCategory) {
  const text = normalizeMessage(message);

  const urgentTerms = [
    "i am in danger",
    "i'm in danger",
    "emergency",
    "weapon",
    "gun",
    "knife",
    "beaten",
    "attack",
    "threatening me",
    "immediate danger",
    "hurt right now",
  ];

  const categoryTriggers =
    category === "domestic_violence" ||
    category === "police_arrest" ||
    category === "efcc_invitation";

  return categoryTriggers && urgentTerms.some((term) => text.includes(term));
}

function buildPrompt(options: {
  category: AssistantCategory;
  userMessage: string;
  history: Array<{ role: string; content: string }>;
}) {
  const historyText = options.history
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n");

  return `
You are a legal information assistant for a Nigerian legal aid platform.
You are not a lawyer and you must not claim to provide legal advice.
Be practical, calm, and brief.
Do not repeat the disclosure because the application will prepend it.
If the user seems to be in immediate danger, explain that they should use emergency help and that an emergency request will be created.

Situation category: ${options.category}

Conversation history:
${historyText || "No previous conversation."}

Current user message:
${options.userMessage}

Reply with:
- short, clear guidance
- 1 follow-up question if helpful
- concrete next steps
- no legal jargon unless explained
`.trim();
}

function createInitResponse(conversationId: string): AssistantInitResponse {
  return {
    conversationId,
    message: ASSISTANT_GREETING,
    disclosure: ASSISTANT_DISCLOSURE,
    quickReplies: [...ASSISTANT_QUICK_REPLIES],
    category: "something_else",
  };
}

function createEscalationPayload(options: {
  conversationId: string;
  category: AssistantCategory;
  message: string;
}): AssistantChatResponse {
  return {
    conversationId: options.conversationId,
    category: options.category,
    disclosure: ASSISTANT_DISCLOSURE,
    escalation: true,
    handoff: {
      target: "emergency-requests",
      reason:
        "The assistant detected an urgent situation that should be escalated immediately.",
      urgency: "high",
      draft: {
        category: options.category,
        userMessage: options.message,
        summary: options.message,
      },
    },
  };
}

function createSseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}

function encodeEvent(event: string, data: unknown) {
  const payload = JSON.stringify(data);
  return `event: ${event}\ndata: ${payload}\n\n`;
}

export async function startConversation(userId: string) {
  const conversation = await assistantRepo.createConversation(userId);
  return createInitResponse(conversation.id);
}

export async function streamMessage(input: {
  userId: string;
  conversationId?: string;
  message: string;
}) {
  const conversation =
    input.conversationId
      ? await assistantRepo.findConversationById(input.conversationId, input.userId)
      : await assistantRepo.createConversation(input.userId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const currentConversation = input.conversationId
    ? conversation
    : await assistantRepo.findConversationById(conversation.id, input.userId);

  if (!currentConversation) {
    throw new Error("Conversation not found");
  }

  await assistantRepo.addMessage({
    conversationId: currentConversation.id,
    role: "user",
    content: input.message,
  });

  const category = classifyCategory(input.message);
  await assistantRepo.touchConversation(currentConversation.id, category);

  const escalationNeeded = shouldEscalate(input.message, category);

  if (escalationNeeded) {
    const payload = createEscalationPayload({
      conversationId: currentConversation.id,
      category,
      message: input.message,
    });

    await assistantRepo.addMessage({
      conversationId: currentConversation.id,
      role: "assistant",
      content:
        "This looks urgent. I'm escalating this into the emergency request flow now.",
      category,
      disclosure: ASSISTANT_DISCLOSURE,
      isEscalation: true,
      metadata: payload as unknown as Record<string, unknown>,
    });

    await assistantRepo.markConversationEscalated(currentConversation.id);

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            encodeEvent("meta", {
              conversationId: currentConversation.id,
              category,
              disclosure: ASSISTANT_DISCLOSURE,
              escalation: true,
            }),
          ),
        );
        controller.enqueue(
          new TextEncoder().encode(
            encodeEvent("chunk", {
              text: `${ASSISTANT_DISCLOSURE}\n\nThis looks urgent. I’m escalating this into the emergency request flow now.`,
            }),
          ),
        );
        controller.enqueue(
          new TextEncoder().encode(
            encodeEvent("handoff", payload),
          ),
        );
        controller.enqueue(new TextEncoder().encode(encodeEvent("done", { ok: true })));
        controller.close();
      },
    });

    return new Response(stream, { headers: createSseHeaders() });
  }

  const conversationContext = await assistantRepo.getConversationContext(
    currentConversation.id,
  );

  const history = (conversationContext?.messages ?? []).slice(
    -ASSISTANT_HISTORY_LIMIT,
  );

  const prompt = buildPrompt({
    category,
    userMessage: input.message,
     history: history.map((message: { role: string; content: string }) => ({
      role: message.role,
      content: message.content,
    })),
  });

  let finalText = "";

  const modelStream = await streamGeminiResponse(prompt);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      controller.enqueue(
        encoder.encode(
          encodeEvent("meta", {
            conversationId: currentConversation.id,
            category,
            disclosure: ASSISTANT_DISCLOSURE,
            escalation: false,
            quickReplies: ASSISTANT_QUICK_REPLIES,
          }),
        ),
      );

      controller.enqueue(
        encoder.encode(
          encodeEvent("chunk", {
            text: `${ASSISTANT_DISCLOSURE}\n\n`,
          }),
        ),
      );

      try {
        for await (const chunk of modelStream) {
          const text = chunk.text ?? "";
          if (!text) continue;

          finalText += text;
          controller.enqueue(encoder.encode(encodeEvent("chunk", { text })));
        }

        await assistantRepo.addMessage({
          conversationId: currentConversation.id,
          role: "assistant",
          content: finalText.trim(),
          category,
          disclosure: ASSISTANT_DISCLOSURE,
          isEscalation: false,
          metadata: {
            provider: "gemini",
          },
        });

        controller.enqueue(
          encoder.encode(
            encodeEvent("done", {
              ok: true,
              conversationId: currentConversation.id,
              category,
            }),
          ),
        );
        controller.close();
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            encodeEvent("error", {
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to generate assistant response",
            }),
          ),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: createSseHeaders() });
}

export const assistantService = {
  startConversation,
  streamMessage,
};