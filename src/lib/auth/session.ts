import { createHash, randomBytes, randomInt } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  ACCESS_TOKEN_TTL,
  AUTH_AUDIENCE,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  AUTH_ISSUER,
  MFA_CODE_LENGTH,
  REFRESH_COOKIE_NAME,
  type SupportedRole,
} from "./constants";

export interface AccessTokenPayload {
  sub: string;
  email?: string | null;
  phone?: string | null;
  role: SupportedRole;
  iat?: number;
  exp?: number;
}

export interface SessionUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  name: string;
  role: SupportedRole;
  roles: SupportedRole[];
  permissions: string[];
  isActive: boolean;
}

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET not set");
  }

  return new TextEncoder().encode(secret);
}

export async function signAccessToken(
  payload: Omit<AccessTokenPayload, "iat" | "exp">,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(AUTH_ISSUER)
    .setAudience(AUTH_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(getSecret());
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: AUTH_ISSUER,
      audience: AUTH_AUDIENCE,
    });

    return payload as unknown as AccessTokenPayload;
  } catch {
    return null;
  }
}

export const signJwt = signAccessToken;
export const verifyJwt = verifyAccessToken;

export function generateRefreshToken() {
  const token = randomBytes(48).toString("base64url");
  return {
    token,
    tokenHash: hashToken(token),
  };
}

export function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function generateMfaCode() {
  return String(randomInt(0, 10 ** MFA_CODE_LENGTH)).padStart(MFA_CODE_LENGTH, "0");
}

export function hashMfaCode(code: string) {
  return hashToken(code);
}

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = await getToken();
  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.isActive) return null;

  const role = user.role.name as SupportedRole;
  const permissions = Array.from(
    new Set(
      user.role.permissions.map(
        (rp) => `${rp.permission.resource}.${rp.permission.action}`,
      ),
    ),
  );

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    role,
    roles: [role],
    permissions,
    isActive: user.isActive,
  };
}
