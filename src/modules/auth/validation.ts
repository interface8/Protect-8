import { z } from "zod";
import {
  AUTH_PROVIDERS,
  MFA_CHANNELS,
  MFA_PURPOSES,
  PASSWORD_MIN_LENGTH,
  SUPPORTED_ROLES,
} from "@/lib/auth/constants";

const roleSchema = z.enum(SUPPORTED_ROLES);
const providerSchema = z.enum(AUTH_PROVIDERS);
const purposeSchema = z.enum(MFA_PURPOSES);
const channelSchema = z.enum(MFA_CHANNELS);

const emailSchema = z.string().email("Invalid email address");
const phoneSchema = z
  .string()
  .min(7, "Phone number is too short")
  .max(20, "Phone number is too long");
const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
const oauthTokenSchema = z.string().min(10, "OAuth token is required");

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    password: passwordSchema.optional(),
    oauthToken: oauthTokenSchema.optional(),
    provider: providerSchema.optional(),
    role: roleSchema,
  })
  .refine((data) => data.email || data.phone, {
    message: "Provide either email or phone",
    path: ["email"],
  })
  .refine((data) => !(data.email && data.phone), {
    message: "Use either email or phone, not both",
    path: ["phone"],
  })
  .refine((data) => data.password || data.oauthToken, {
    message: "Provide either password or OAuth token",
    path: ["password"],
  })
  .refine((data) => !(data.password && data.oauthToken), {
    message: "Use either password or OAuth token, not both",
    path: ["oauthToken"],
  })
  .refine((data) => (data.oauthToken ? !!data.provider : true), {
    message: "Provider is required for OAuth sign-in",
    path: ["provider"],
  });

export const loginSchema = z
  .object({
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    password: z.string().optional(),
    oauthToken: z.string().optional(),
    provider: providerSchema.optional(),
  })
  .refine((data) => data.email || data.phone || data.oauthToken, {
    message: "Provide email, phone, or OAuth token",
    path: ["email"],
  })
  .refine((data) => !(data.email && data.phone), {
    message: "Use either email or phone, not both",
    path: ["phone"],
  })
  .refine((data) => (data.oauthToken ? !!data.provider : true), {
    message: "Provider is required for OAuth login",
    path: ["provider"],
  })
  .refine((data) => (data.oauthToken ? !data.password : !!data.password), {
    message: "Password is required for email or phone login",
    path: ["password"],
  });

export const refreshSchema = z.object({
  refreshToken: z.string().min(20, "Refresh token is required"),
});

export const sendMfaSchema = z
  .object({
    purpose: purposeSchema,
    channel: channelSchema,
    userId: z.string().optional(),
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.purpose === "login") {
        return !!data.email || !!data.phone;
      }

      return !!data.userId;
    },
    {
      message:
        "Login MFA requires email or phone. Sensitive-action MFA requires userId.",
      path: ["userId"],
    },
  )
  .refine((data) => !(data.email && data.phone), {
    message: "Use either email or phone, not both",
    path: ["phone"],
  })
  .refine((data) => {
    if (data.purpose === "login") {
      return !data.userId;
    }

    return true;
  }, {
    message: "Do not send userId for login MFA",
    path: ["userId"],
  });

export const verifyMfaSchema = z.object({
  challengeId: z.string().min(1, "Challenge id is required"),
  code: z.string().min(4, "Code is required"),
});