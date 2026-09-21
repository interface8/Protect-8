import { NextRequest } from "next/server";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";
import { userService, userFiltersSchema, updateUserSchema } from "@/modules/users";
import { auditService } from "@/modules/audit";

export async function GET(request: NextRequest) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const user = await userService.getUserById(id);
      return jsonResponse(user);
    }

    const parsed = userFiltersSchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      isActive: searchParams.get("isActive") ?? undefined,
      roleId: searchParams.get("roleId") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const result = await userService.listUsers(parsed.data);
    return jsonResponse(result);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "User not found") {
      return errorResponse("User not found", 404);
    }

    const message = error instanceof Error ? error.message : "Failed to fetch users";
    return errorResponse(message, 500);
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const { id, ...payload } = body ?? {};

    if (!id) {
      return errorResponse("User id is required", 400);
    }

    const parsed = updateUserSchema.safeParse(payload);

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const before = await userService.getUserById(id);
    const updated = await userService.updateUser(id, parsed.data);

    const changedIsActive =
      parsed.data.isActive !== undefined && parsed.data.isActive !== before.isActive;

    if (changedIsActive) {
      await auditService.logAuditEvent({
        actorId: guard.id,
        action: parsed.data.isActive ? "admin.user.reactivated" : "admin.user.suspended",
        target: `user:${id}`,
        metadata: {
          userId: id,
          previousIsActive: before.isActive,
          nextIsActive: parsed.data.isActive,
        },
      });
    } else {
      await auditService.logAuditEvent({
        actorId: guard.id,
        action: "admin.user.updated",
        target: `user:${id}`,
        metadata: {
          userId: id,
          updatedFields: Object.keys(parsed.data),
        },
      });
    }

    return jsonResponse(updated);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "User not found") {
      return errorResponse("User not found", 404);
    }

    if (error instanceof Error && error.message === "Role not found") {
      return errorResponse("Role not found", 404);
    }

    if (error instanceof Error && error.message === "Email or phone already in use") {
      return errorResponse("Email or phone already in use", 409);
    }

    const message = error instanceof Error ? error.message : "Failed to update user";
    return errorResponse(message, 500);
  }
}