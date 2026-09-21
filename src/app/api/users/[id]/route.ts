import { NextRequest } from "next/server";
import { userService, updateUserSchema } from "@/modules/users";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    const user = await userService.getUserById(params.id);
    return jsonResponse(user);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "User not found") {
      return errorResponse("User not found", 404);
    }
    const message = error instanceof Error ? error.message : "Failed to fetch user";
    return errorResponse(message, 500);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const user = await userService.updateUser(params.id, parsed.data);
    return jsonResponse(user);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "User not found") {
      return errorResponse("User not found", 404);
    }
    if (error instanceof Error && error.message === "Role not found") {
      return errorResponse("Role not found", 400);
    }
    if (error instanceof Error && error.message === "Email or phone already in use") {
      return errorResponse("Email or phone already in use", 409);
    }
    const message = error instanceof Error ? error.message : "Failed to update user";
    return errorResponse(message, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    await userService.deleteUser(params.id);
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "User not found") {
      return errorResponse("User not found", 404);
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return errorResponse(message, 500);
  }
}