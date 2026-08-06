import { redirect } from "next/navigation";
import { errorResponse } from "@/lib/http";
import type { SessionUser } from "./session";
import { getCurrentUser } from "./session";
import { hasPermission, hasRole } from "./permissions";
import type { SupportedRole } from "./constants";

export async function requirePermission(permission: string): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!hasPermission(user, permission)) {
    redirect("/dashboard?error=forbidden");
  }

  return user;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(
  roles: SupportedRole | SupportedRole[],
): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!hasRole(user, roles)) {
    redirect("/dashboard?error=forbidden");
  }

  return user;
}

export async function requireApiPermission(
  permission: string,
): Promise<SessionUser | Response> {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  if (!hasPermission(user, permission)) {
    return errorResponse("Forbidden", 403);
  }

  return user;
}

export async function requireApiAuth(): Promise<SessionUser | Response> {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  return user;
}

export async function requireApiRole(
  roles: SupportedRole | SupportedRole[],
): Promise<SessionUser | Response> {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  if (!hasRole(user, roles)) {
    return errorResponse("Forbidden", 403);
  }

  return user;
}

export function isErrorResponse(
  result: SessionUser | Response,
): result is Response {
  return result instanceof Response;
}
