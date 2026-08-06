import { NextRequest } from "next/server";
import { roleService, createRoleSchema } from "@/modules/roles";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

export async function GET() {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    const roles = await roleService.listRoles();
    return jsonResponse(roles);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch roles";
    return errorResponse(message, 500);
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = createRoleSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const role = await roleService.createRole(parsed.data);
    return jsonResponse(role, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create role";
    return errorResponse(message, 500);
  }
}