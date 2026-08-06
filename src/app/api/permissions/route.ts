import { NextRequest } from "next/server";
import { permissionService, createPermissionSchema } from "@/modules/permissions";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

export async function GET() {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    const permissions = await permissionService.listPermissions();
    return jsonResponse(permissions);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch permissions";
    return errorResponse(message, 500);
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = createPermissionSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const permission = await permissionService.createPermission(parsed.data);
    return jsonResponse(permission, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create permission";
    return errorResponse(message, 500);
  }
}