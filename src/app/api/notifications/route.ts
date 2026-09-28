import { prisma } from "@/lib/prisma";
import { errorResponse, jsonResponse } from "@/lib/http";
import { isErrorResponse, requireApiRole } from "@/lib/auth";
import { z } from "zod";

const readSchema = z.object({ id: z.string().optional(), all: z.boolean().optional() }).refine((value) => Boolean(value.id) !== Boolean(value.all), "Choose one notification or all notifications");

export async function GET() {
  const user = await requireApiRole(["citizen"]);
  if (isErrorResponse(user)) return user;
  try {
    const [data, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where: { recipientId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
      prisma.notification.count({ where: { recipientId: user.id, readAt: null } }),
    ]);
    return jsonResponse({ data, unreadCount });
  } catch (error) {
    if (isMissingNotificationsTable(error)) return errorResponse("Notifications are not installed yet. Apply the notifications migration.", 503);
    console.error("Unable to load notifications", error);
    return errorResponse("Could not load notifications", 500);
  }
}

export async function PATCH(request: Request) {
  const user = await requireApiRole(["citizen"]);
  if (isErrorResponse(user)) return user;
  const parsed = readSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse("Choose a notification to mark as read", 400);
  try {
    await prisma.notification.updateMany({
      where: { recipientId: user.id, readAt: null, ...(parsed.data.id ? { id: parsed.data.id } : {}) },
      data: { readAt: new Date() },
    });
    return jsonResponse({ success: true });
  } catch (error) {
    if (isMissingNotificationsTable(error)) return errorResponse("Notifications are not installed yet. Apply the notifications migration.", 503);
    console.error("Unable to mark notifications read", error);
    return errorResponse("Could not update notifications", 500);
  }
}

function isMissingNotificationsTable(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2021";
}
