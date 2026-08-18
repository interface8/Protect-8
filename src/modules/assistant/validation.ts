import { z } from "zod";

export const assistantMessageSchema = z.object({
  conversationId: z.string().trim().optional(),
  message: z.string().trim().min(1).max(4000).optional(),
  startConversation: z.boolean().optional(),
});