import { NextRequest, NextResponse } from "next/server";
import { authService, sendMfaSchema } from "@/modules/auth";
import {
  consumeMfaRateLimits,
  getRequestIp,
  MFA_RATE_LIMIT_WINDOW_MS,
  MFA_SEND_CONTACT_LIMIT,
  MFA_SEND_IP_LIMIT,
} from "@/lib/auth/rate-limit";

function buildSendContactKey(input: {
  email?: string | null;
  phone?: string | null;
  userId?: string | null;
  purpose: string;
}) {
  if (input.email) {
    return `mfa:send:email:${input.email.trim().toLowerCase()}:${input.purpose}`;
  }

  if (input.phone) {
    return `mfa:send:phone:${input.phone.trim()}:${input.purpose}`;
  }

  return `mfa:send:user:${input.userId?.trim() ?? "unknown"}:${input.purpose}`;
}

function rateLimitedResponse(resetAt: Date) {
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((resetAt.getTime() - Date.now()) / 1000),
  );

  return NextResponse.json(
    {
      message: "Too many requests. Please try again later.",
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = sendMfaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const ip = getRequestIp(request);

    const rateLimit = await consumeMfaRateLimits([
      {
        key: `mfa:send:ip:${ip}:${parsed.data.purpose}`,
        action: "send",
        limit: MFA_SEND_IP_LIMIT,
        windowMs: MFA_RATE_LIMIT_WINDOW_MS,
      },
      {
        key: buildSendContactKey(parsed.data),
        action: "send",
        limit: MFA_SEND_CONTACT_LIMIT,
        windowMs: MFA_RATE_LIMIT_WINDOW_MS,
      },
    ]);

    if (!rateLimit.allowed) {
      return rateLimitedResponse(rateLimit.resetAt);
    }

    const result = await authService.sendMfa(parsed.data);

    return NextResponse.json(
      {
        message: "MFA code sent",
        challengeId: result.challengeId,
        expiresAt: result.expiresAt,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = message === "User not found" ? 404 : 500;

    return NextResponse.json({ message }, { status });
  }
}