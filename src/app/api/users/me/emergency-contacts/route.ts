import { NextRequest } from "next/server";
import {
  userService,
  createEmergencyContactSchema,
} from "@/modules/users";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

export async function GET() {
  const guard = await requireApiRole(["citizen", "lawyer"]);
  if (isErrorResponse(guard)) return guard;

  try {
    const contacts = await userService.listEmergencyContacts(guard.id);
    return jsonResponse({ data: contacts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch emergency contacts";
    return errorResponse(message, 500);
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireApiRole(["citizen", "lawyer"]);
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = createEmergencyContactSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const contact = await userService.addEmergencyContact(guard.id, parsed.data);

    return jsonResponse(
      {
        message: "Emergency contact added",
        contact,
      },
      201,
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "User not found") {
      return errorResponse("User not found", 404);
    }

    const message = error instanceof Error ? error.message : "Failed to add emergency contact";
    return errorResponse(message, 500);
  }
}