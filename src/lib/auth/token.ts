import { SignJWT, jwtVerify } from "jose";
import {
  ACCESS_TOKEN_TTL,
  AUTH_AUDIENCE,
  AUTH_ISSUER,
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
