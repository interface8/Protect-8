import { prisma } from "@/lib/prisma";

export type AppNotificationType = "NEW_MESSAGE" | "REQUEST_ASSIGNED" | "REQUEST_STARTED" | "REQUEST_COMPLETED" | "REQUEST_UPDATED";

export async function notifyUser(input: {
  recipientId: string;
  actorId?: string | null;
  requestId?: string | null;
  type: AppNotificationType;
  title: string;
  body: string;
  href: string;
}) {
  if (input.actorId && input.actorId === input.recipientId) return;
  try {
    await prisma.notification.create({ data: input });
  } catch (error) {
    console.error("Could not create notification", { type: input.type, error });
  }
}
