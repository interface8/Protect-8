import { NextRequest } from "next/server";
import { permissionService, updatePermissionSchema } from "@/modules/permissions";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    const permission = await permissionService.getPermissionById(params.id);
    return jsonResponse(permission);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Permission not found") {
      return errorResponse("Permission not found", 404);
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return errorResponse(message, 500);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = updatePermissionSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const permission = await permissionService.updatePermission(params.id, parsed.data);
    return jsonResponse(permission);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Permission not found") {
      return errorResponse("Permission not found", 404);
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return errorResponse(message, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    await permissionService.deletePermission(params.id);
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Permission not found") {
      return errorResponse("Permission not found", 404);
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return errorResponse(message, 500);
  }
}