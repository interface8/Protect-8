import type { SessionUser } from "./session";

export function hasPermission(
  user: SessionUser | null,
  permission: string,
): boolean {
  if (!user) return false;
  return user.permissions.includes(permission);
}

export function hasAllPermissions(
  user: SessionUser | null,
  permissions: string[],
): boolean {
  if (!user) return false;
  return permissions.every((p) => user.permissions.includes(p));
}

export function hasAnyPermission(
  user: SessionUser | null,
  permissions: string[],
): boolean {
  if (!user) return false;
  return permissions.some((p) => user.permissions.includes(p));
}

export function hasRole(
  user: SessionUser | null,
  role: string | string[],
): boolean {
  if (!user) return false;
  const allowed = Array.isArray(role) ? role : [role];
  return allowed.includes(user.role) || allowed.some((item) => user.roles.includes(item as SessionUser["role"]));
}
