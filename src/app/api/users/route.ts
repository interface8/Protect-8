import { NextRequest } from "next/server";
import { userService, createUserSchema, userFiltersSchema } from "@/modules/users";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

export async function GET(request: NextRequest) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    const { searchParams } = new URL(request.url);
    const filters = userFiltersSchema.parse(Object.fromEntries(searchParams));
    const result = await userService.listUsers(filters);
    return jsonResponse(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    return errorResponse(message, 500);
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const user = await userService.createUser(parsed.data);
    return jsonResponse(user, 201);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Email or phone already in use") {
      return errorResponse("Email or phone already in use", 409);
    }
    if (error instanceof Error && error.message === "Role not found") {
      return errorResponse("Role not found", 400);
    }
    const message = error instanceof Error ? error.message : "Failed to create user";
    return errorResponse(message, 500);
  }
}