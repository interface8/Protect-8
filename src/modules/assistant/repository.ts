import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  AssistantCategory,
  AssistantConversationDto,
  AssistantMessageDto,
  AssistantMessageRole,
} from "./types";

type ConversationRecord = {
  id: string;
  userId: string;
  category: string | null;
  status: "ACTIVE" | "ESCALATED" | "CLOSED";
  lastMessageAt: Date | null;
  escalatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type MessageRecord = {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  category: string | null;
  disclosure: string | null;
  isEscalation: boolean;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

function toConversationDto(
  conversation: ConversationRecord,
): AssistantConversationDto {
  return {
    id: conversation.id,
    userId: conversation.userId,
    category: conversation.category as AssistantCategory | null,
    status: conversation.status,
    lastMessageAt: conversation.lastMessageAt,
    escalatedAt: conversation.escalatedAt,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

function toMessageDto(message: MessageRecord): AssistantMessageDto {
  return {
    id: message.id,
    conversationId: message.conversationId,
    role: message.role as AssistantMessageRole,
    content: message.content,
    category: message.category as AssistantCategory | null,
    disclosure: message.disclosure,
    isEscalation: message.isEscalation,
    metadata: (message.metadata as Record<string, unknown> | null) ?? null,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

export async function createConversation(userId: string) {
  const conversation = await prisma.assistantConversation.create({
    data: {
      userId,
      status: "ACTIVE",
    },
  });

  return toConversationDto(conversation as ConversationRecord);
}

export async function findConversationById(
  conversationId: string,
  userId: string,
) {
  const conversation = await prisma.assistantConversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  });

  return conversation ? toConversationDto(conversation as ConversationRecord) : null;
}

export async function updateConversation(
  conversationId: string,
  data: Prisma.AssistantConversationUpdateInput,
) {
  const conversation = await prisma.assistantConversation.update({
    where: { id: conversationId },
    data,
  });

  return toConversationDto(conversation as ConversationRecord);
}

export async function addMessage(input: {
  conversationId: string;
  role: AssistantMessageRole;
  content: string;
  category?: AssistantCategory | null;
  disclosure?: string | null;
  isEscalation?: boolean;
  metadata?: Record<string, unknown> | null;
}) {
  const message = await prisma.assistantMessage.create({
    data: {
      conversationId: input.conversationId,
      role: input.role,
      content: input.content,
      category: input.category ?? null,
      disclosure: input.disclosure ?? null,
      isEscalation: input.isEscalation ?? false,
      metadata: input.metadata
        ? (input.metadata as Prisma.InputJsonValue)
        : undefined,
    },
  });

  return toMessageDto(message as MessageRecord);
}

export async function listConversationMessages(conversationId: string) {
  const messages = await prisma.assistantMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

    return messages.map((message: MessageRecord) =>
    toMessageDto(message),
  );
}

export async function getConversationContext(conversationId: string) {
  return prisma.assistantConversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function markConversationEscalated(conversationId: string) {
  const conversation = await prisma.assistantConversation.update({
    where: { id: conversationId },
    data: {
      status: "ESCALATED",
      escalatedAt: new Date(),
      lastMessageAt: new Date(),
    },
  });

  return toConversationDto(conversation as ConversationRecord);
}

export async function touchConversation(
  conversationId: string,
  category?: AssistantCategory | null,
) {
  const conversation = await prisma.assistantConversation.update({
    where: { id: conversationId },
    data: {
      category: category ?? undefined,
      lastMessageAt: new Date(),
    },
  });

  return toConversationDto(conversation as ConversationRecord);
}