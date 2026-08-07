import { NextRequest } from "next/server";
import { userService, updateMeProfileSchema} from "@/modules/users";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

export async function GET() {
  const guard = await requireApiRole(["citizen", "lawyer"]);
  if (isErrorResponse(guard)) return guard;

  try {
    const user = await userService.getUserById(guard.id);
    return jsonResponse(user);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "User not found") {
      return errorResponse("User not found", 404);
    }
    const message = error instanceof Error ? error.message : "Failed to fetch profile";
    return errorResponse(message, 500);
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireApiRole(["citizen", "lawyer"]);
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = updateMeProfileSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const user = await userService.updateUser(guard.id, parsed.data);
    return jsonResponse(user);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "User not found") {
      return errorResponse("User not found", 404);
    }
    if (error instanceof Error && error.message === "Email or phone already in use") {
      return errorResponse("Email or phone already in use", 409);
    }
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return errorResponse(message, 500);
  }
}