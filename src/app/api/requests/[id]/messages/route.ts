import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isErrorResponse, requireApiRole } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { notifyUser } from "@/lib/notifications";

type RouteContext = { params: { id: string } };
const messageSchema = z.object({ content: z.string().trim().min(1).max(5000) });

async function getParticipatingRequest(id: string, userId: string) {
  const request = await prisma.request.findUnique({
    where: { id },
    select: {
      id: true,
      citizenId: true,
      lawyerId: true,
      status: true,
      title: true,
      citizen: { select: { id: true, name: true } },
      lawyer: { select: { id: true, name: true } },
    },
  });
  if (!request) return { response: errorResponse("Request not found", 404) };
  if (request.citizenId !== userId && request.lawyerId !== userId) {
    return { response: errorResponse("You are not a participant in this conversation", 403) };
  }
  if (!request.lawyerId) return { response: errorResponse("This enquiry has not been assigned to a lawyer yet", 409) };
  return { request };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const guard = await requireApiRole(["citizen", "lawyer"]);
  if (isErrorResponse(guard)) return guard;
  const access = await getParticipatingRequest(params.id, guard.id);
  if (access.response) return access.response;

  try {
    if (!prisma.requestMessage || typeof prisma.requestMessage.findMany !== "function") {
      return errorResponse("Chat is not initialized in this running server. Regenerate the Prisma client and restart the app.", 503);
    }
    const messages = await prisma.requestMessage.findMany({
      where: { requestId: params.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { sender: { select: { id: true, name: true } } },
    });
    return jsonResponse({ data: messages.reverse(), request: access.request });
  } catch (error) {
    console.error("Unable to load request chat messages", error);
    if (isMissingChatTable(error)) return errorResponse("Chat storage is not installed yet. Apply the request messages migration, then restart the app.", 503);
    return errorResponse("Could not load messages. Please try again.", 500);
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const guard = await requireApiRole(["citizen", "lawyer"]);
  if (isErrorResponse(guard)) return guard;
  const access = await getParticipatingRequest(params.id, guard.id);
  if (access.response) return access.response;
  if (access.request.status === "COMPLETED" || access.request.status === "CANCELLED") {
    return errorResponse("This conversation is closed", 409);
  }

  const parsed = messageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ message: "Message must contain 1 to 5000 characters", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    if (!prisma.requestMessage || typeof prisma.requestMessage.create !== "function") {
      return errorResponse("Chat is not initialized in this running server. Regenerate the Prisma client and restart the app.", 503);
    }
    const [message] = await prisma.$transaction([
      prisma.requestMessage.create({
        data: { requestId: params.id, senderId: guard.id, content: parsed.data.content },
        include: { sender: { select: { id: true, name: true } } },
      }),
      prisma.request.update({ where: { id: params.id }, data: { updatedAt: new Date() } }),
    ]);
    const recipientId = access.request.citizenId === guard.id ? access.request.lawyerId : access.request.citizenId;
    if (recipientId) await notifyUser({ recipientId, actorId: guard.id, requestId: params.id, type: "NEW_MESSAGE", title: `New message from ${guard.name}`, body: `A new message is waiting in your conversation about “${access.request.title}”.`, href: `/requests/${params.id}/chat` });
    return jsonResponse(message, 201);
  } catch (error) {
    console.error("Unable to send request chat message", error);
    if (isMissingChatTable(error)) return errorResponse("Chat storage is not installed yet. Apply the request messages migration, then restart the app.", 503);
    return errorResponse("Could not send message. Please try again.", 500);
  }
}

function isMissingChatTable(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2021";
}
