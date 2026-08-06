export const AUTH_COOKIE_NAME = "protect8_access_token";
export const REFRESH_COOKIE_NAME = "protect8_refresh_token";

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 15,
};

export const AUTH_ISSUER = "protect8";
export const AUTH_AUDIENCE = "protect8-web";

export const ACCESS_TOKEN_TTL = "15m";
export const REFRESH_TOKEN_TTL_DAYS = 30;

export const MFA_CODE_TTL_MINUTES = 5;
export const MFA_MAX_ATTEMPTS = 5;
export const MFA_CODE_LENGTH = 6;

export const PASSWORD_MIN_LENGTH = 8;

export const SUPPORTED_ROLES = ["citizen", "lawyer", "admin"] as const;
export type SupportedRole = (typeof SUPPORTED_ROLES)[number];

export const AUTH_PROVIDERS = ["google", "apple"] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export const MFA_PURPOSES = ["login", "payment", "document_access"] as const;
export type MfaPurpose = (typeof MFA_PURPOSES)[number];

export const MFA_CHANNELS = ["email", "sms"] as const;
export type MfaChannel = (typeof MFA_CHANNELS)[number];

export const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];
export const PROTECTED_ROUTE_PREFIX = "/dashboard";
