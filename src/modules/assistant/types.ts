export type AssistantCategory =
  | "traffic_stop"
  | "police_arrest"
  | "efcc_invitation"
  | "land_dispute"
  | "domestic_violence"
  | "employment_matter"
  | "something_else";

export type AssistantConversationStatus = "ACTIVE" | "ESCALATED" | "CLOSED";
export type AssistantMessageRole = "user" | "assistant";

export interface AssistantQuickReply {
  id: string;
  label: string;
  message: string;
  category: AssistantCategory;
}

export interface AssistantInitResponse {
  conversationId: string;
  message: string;
  disclosure: string;
  quickReplies: AssistantQuickReply[];
  category: AssistantCategory;
}

export interface AssistantMessageRequest {
  conversationId?: string;
  message?: string;
  startConversation?: boolean;
}

export interface AssistantChatResponse {
  conversationId: string;
  category: AssistantCategory;
  disclosure: string;
  escalation: boolean;
  handoff?: {
    target: "emergency-requests";
    reason: string;
    urgency: "high";
    draft: {
      category: AssistantCategory;
      userMessage: string;
      summary: string;
    };
  };
}

export interface AssistantConversationDto {
  id: string;
  userId: string;
  category: AssistantCategory | null;
  status: AssistantConversationStatus;
  lastMessageAt: Date | null;
  escalatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssistantMessageDto {
  id: string;
  conversationId: string;
  role: AssistantMessageRole;
  content: string;
  category: AssistantCategory | null;
  disclosure: string | null;
  isEscalation: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}